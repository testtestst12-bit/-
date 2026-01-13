/**
 * Simulation Builder - State Manager
 * Manages simulation state per-chat with save/load functionality
 * @module StateManager
 */

import {
    isPlainObject,
    deepClone,
    isNonEmptyString,
    generateId,
    toString,
    safeJsonParse
} from './Utils.js';

import { StatManager } from './Stat.js';
import { StatParser, parseStatCommands, ParseResultType } from './Parser.js';

/**
 * Token mode settings
 * @readonly
 * @enum {string}
 */
export const TokenMode = Object.freeze({
    ZERO: 'zero',         // No stat info to AI
    MINIMAL: 'minimal',   // Single line summary
    FULL: 'full'          // Complete status
});

/**
 * Default extension settings
 */
export const DEFAULT_SETTINGS = Object.freeze({
    enabled: true,
    tokenMode: TokenMode.MINIMAL,
    showStatusWindow: true,
    autoApplyChanges: true,
    showChangeNotifications: true,
    parserConfig: {
        openTag: '{{',
        closeTag: '}}',
        separator: ':',
        caseSensitive: false
    }
});

/**
 * Represents the complete state of a simulation
 * @class
 */
export class SimulationState {
    /**
     * Creates a new SimulationState
     * @param {string} [id] - State ID (auto-generated if not provided)
     */
    constructor(id) {
        this.id = isNonEmptyString(id) ? id : generateId('sim');
        this.name = 'New Simulation';
        this.createdAt = Date.now();
        this.updatedAt = Date.now();
        this.turnCount = 0;

        // Core systems
        this.statManager = new StatManager();
        
        // Metadata
        this.metadata = {};
    }

    /**
     * Advances the simulation by one turn
     * @returns {object} Tick results (expired modifiers, etc.)
     */
    tick() {
        this.turnCount++;
        this.updatedAt = Date.now();
        
        const expiredModifiers = this.statManager.tick();
        
        return {
            turn: this.turnCount,
            expiredModifiers
        };
    }

    /**
     * Resets the simulation to initial state
     */
    reset() {
        this.turnCount = 0;
        this.updatedAt = Date.now();
        this.statManager.resetAll();
    }

    /**
     * Serializes state to plain object
     * @returns {object} Serialized state
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            turnCount: this.turnCount,
            statManager: this.statManager.toJSON(),
            metadata: deepClone(this.metadata)
        };
    }

    /**
     * Creates state from plain object
     * @param {object} data - Serialized state
     * @returns {SimulationState} New state instance
     */
    static fromJSON(data) {
        if (!isPlainObject(data)) {
            console.warn('[SimBuilder] SimulationState.fromJSON: invalid data');
            return new SimulationState();
        }

        const state = new SimulationState(data.id);
        state.name = toString(data.name, 'Loaded Simulation');
        state.createdAt = data.createdAt || Date.now();
        state.updatedAt = data.updatedAt || Date.now();
        state.turnCount = data.turnCount || 0;
        
        if (data.statManager) {
            state.statManager = StatManager.fromJSON(data.statManager);
        }
        
        if (isPlainObject(data.metadata)) {
            state.metadata = deepClone(data.metadata);
        }

        return state;
    }
}

/**
 * Main state manager for the extension
 * Handles per-chat state and SillyTavern integration
 * @class
 */
export class StateManager {
    /**
     * Creates a new StateManager
     */
    constructor() {
        /** @type {SimulationState|null} */
        this.currentState = null;
        
        /** @type {object} */
        this.settings = deepClone(DEFAULT_SETTINGS);
        
        /** @type {StatParser} */
        this.parser = new StatParser(this.settings.parserConfig);
        
        /** @type {Function[]} */
        this._stateChangeListeners = [];
        
        /** @type {Function[]} */
        this._statChangeListeners = [];

        /** @type {boolean} */
        this._initialized = false;
    }

    /**
     * Initializes the state manager with SillyTavern context
     * @param {object} context - SillyTavern context from getContext()
     * @returns {boolean} True if initialized successfully
     */
    initialize(context) {
        if (!context) {
            console.error('[SimBuilder] StateManager.initialize: no context provided');
            return false;
        }

        try {
            // Load settings from extension settings
            this._loadSettings(context);
            
            // Load or create state for current chat
            this._loadStateForChat(context);
            
            this._initialized = true;
            console.log('[SimBuilder] StateManager initialized');
            return true;
        } catch (error) {
            console.error('[SimBuilder] StateManager initialization failed:', error);
            return false;
        }
    }

    /**
     * Loads settings from SillyTavern extension settings
     * @param {object} context - SillyTavern context
     * @private
     */
    _loadSettings(context) {
        const { extensionSettings } = context;
        const MODULE_NAME = 'simulation_builder';

        if (!extensionSettings[MODULE_NAME]) {
            extensionSettings[MODULE_NAME] = deepClone(DEFAULT_SETTINGS);
        }

        // Merge with defaults to handle new settings
        const saved = extensionSettings[MODULE_NAME];
        this.settings = {
            ...deepClone(DEFAULT_SETTINGS),
            ...saved
        };

        // Update parser config
        if (this.settings.parserConfig) {
            this.parser.setConfig(this.settings.parserConfig);
        }
    }

    /**
     * Saves settings to SillyTavern
     * @param {object} context - SillyTavern context
     */
    saveSettings(context) {
        if (!context) {
            console.warn('[SimBuilder] saveSettings: no context');
            return;
        }

        const { extensionSettings, saveSettingsDebounced } = context;
        const MODULE_NAME = 'simulation_builder';

        extensionSettings[MODULE_NAME] = deepClone(this.settings);
        
        if (typeof saveSettingsDebounced === 'function') {
            saveSettingsDebounced();
        }
    }

    /**
     * Loads or creates state for the current chat
     * @param {object} context - SillyTavern context
     * @private
     */
    _loadStateForChat(context) {
        const { chatMetadata } = context;
        const MODULE_NAME = 'simulation_builder';

        if (chatMetadata && chatMetadata[MODULE_NAME]) {
            // Load existing state
            try {
                this.currentState = SimulationState.fromJSON(chatMetadata[MODULE_NAME]);
                console.log('[SimBuilder] Loaded existing state:', this.currentState.id);
            } catch (error) {
                console.error('[SimBuilder] Failed to load state:', error);
                this.currentState = new SimulationState();
            }
        } else {
            // Create new state
            this.currentState = new SimulationState();
            console.log('[SimBuilder] Created new state:', this.currentState.id);
        }
    }

    /**
     * Saves current state to chat metadata
     * @param {object} context - SillyTavern context
     * @returns {Promise<boolean>} True if saved successfully
     */
    async saveState(context) {
        if (!context || !this.currentState) {
            console.warn('[SimBuilder] saveState: missing context or state');
            return false;
        }

        try {
            const { chatMetadata, saveMetadata } = context;
            const MODULE_NAME = 'simulation_builder';

            this.currentState.updatedAt = Date.now();
            chatMetadata[MODULE_NAME] = this.currentState.toJSON();

            if (typeof saveMetadata === 'function') {
                await saveMetadata();
            }

            console.log('[SimBuilder] State saved');
            return true;
        } catch (error) {
            console.error('[SimBuilder] Failed to save state:', error);
            return false;
        }
    }

    /**
     * Processes AI message and applies stat changes
     * @param {string} message - AI message text
     * @returns {object} Processing result
     */
    processMessage(message) {
        if (!this.currentState) {
            return { success: false, error: 'No active state', changes: [] };
        }

        if (!this.settings.enabled) {
            return { success: true, changes: [], disabled: true };
        }

        const commands = this.parser.parseValid(message);
        const changes = [];

        for (const cmd of commands) {
            const stat = this.currentState.statManager.get(cmd.statId);
            
            if (!stat) {
                console.warn(`[SimBuilder] Stat not found: ${cmd.statId}`);
                changes.push({
                    statId: cmd.statId,
                    success: false,
                    error: 'Stat not found'
                });
                continue;
            }

            let result;
            if (cmd.type === ParseResultType.SET) {
                result = stat.set(cmd.value);
            } else {
                result = stat.modify(cmd.value);
            }

            changes.push({
                statId: cmd.statId,
                statName: stat.name,
                success: true,
                ...result,
                commandType: cmd.type
            });

            // Notify listeners
            this._notifyStatChange(stat, result);
        }

        return {
            success: true,
            changes,
            commandCount: commands.length
        };
    }

    /**
     * Gets the stat info string for AI context based on token mode
     * @returns {string} Stat info string
     */
    getAIContext() {
        if (!this.currentState || !this.settings.enabled) {
            return '';
        }

        const stats = this.currentState.statManager.getVisible();
        
        if (stats.length === 0) {
            return '';
        }

        switch (this.settings.tokenMode) {
            case TokenMode.ZERO:
                return '';

            case TokenMode.MINIMAL:
                // Single line: [HP:80 MP:50 STR:10]
                const parts = stats.map(s => `${s.name}:${Math.round(s.finalValue)}`);
                return `[${parts.join(' ')}]`;

            case TokenMode.FULL:
                // Multi-line detailed
                const lines = stats.map(s => {
                    const change = s.lastChange !== 0 
                        ? ` (${s.lastChange > 0 ? '+' : ''}${s.lastChange})` 
                        : '';
                    return `${s.name}: ${s.getDisplayString()}${change}`;
                });
                return `[Status]\n${lines.join('\n')}`;

            default:
                return '';
        }
    }

    /**
     * Advances simulation by one turn
     * @returns {object} Tick results
     */
    tick() {
        if (!this.currentState) {
            return { success: false, error: 'No active state' };
        }

        const result = this.currentState.tick();
        this._notifyStateChange('tick', result);
        return { success: true, ...result };
    }

    /**
     * Resets the current simulation
     */
    reset() {
        if (!this.currentState) {
            return;
        }

        this.currentState.reset();
        this._notifyStateChange('reset', {});
    }

    /**
     * Creates a new simulation state
     * @param {string} [name] - Simulation name
     * @returns {SimulationState} New state
     */
    createNewState(name) {
        this.currentState = new SimulationState();
        if (isNonEmptyString(name)) {
            this.currentState.name = name;
        }
        this._notifyStateChange('new', {});
        return this.currentState;
    }

    /**
     * Exports current state to JSON string
     * @returns {string} JSON string
     */
    exportState() {
        if (!this.currentState) {
            return '{}';
        }
        return JSON.stringify(this.currentState.toJSON(), null, 2);
    }

    /**
     * Imports state from JSON string
     * @param {string} jsonString - JSON state string
     * @returns {boolean} True if imported successfully
     */
    importState(jsonString) {
        const data = safeJsonParse(jsonString, null);
        if (!data) {
            console.error('[SimBuilder] Import failed: invalid JSON');
            return false;
        }

        try {
            this.currentState = SimulationState.fromJSON(data);
            this._notifyStateChange('import', {});
            return true;
        } catch (error) {
            console.error('[SimBuilder] Import failed:', error);
            return false;
        }
    }

    /**
     * Registers a state change listener
     * @param {Function} listener - Callback(eventType, data)
     * @returns {Function} Unsubscribe function
     */
    onStateChange(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }
        this._stateChangeListeners.push(listener);
        return () => {
            const idx = this._stateChangeListeners.indexOf(listener);
            if (idx > -1) this._stateChangeListeners.splice(idx, 1);
        };
    }

    /**
     * Registers a stat change listener
     * @param {Function} listener - Callback(stat, changeResult)
     * @returns {Function} Unsubscribe function
     */
    onStatChange(listener) {
        if (typeof listener !== 'function') {
            return () => {};
        }
        this._statChangeListeners.push(listener);
        return () => {
            const idx = this._statChangeListeners.indexOf(listener);
            if (idx > -1) this._statChangeListeners.splice(idx, 1);
        };
    }

    /**
     * Notifies state change listeners
     * @param {string} eventType - Event type
     * @param {object} data - Event data
     * @private
     */
    _notifyStateChange(eventType, data) {
        for (const listener of this._stateChangeListeners) {
            try {
                listener(eventType, data);
            } catch (e) {
                console.error('[SimBuilder] State change listener error:', e);
            }
        }
    }

    /**
     * Notifies stat change listeners
     * @param {object} stat - Changed stat
     * @param {object} result - Change result
     * @private
     */
    _notifyStatChange(stat, result) {
        for (const listener of this._statChangeListeners) {
            try {
                listener(stat, result);
            } catch (e) {
                console.error('[SimBuilder] Stat change listener error:', e);
            }
        }
    }

    /**
     * Checks if manager is initialized
     * @returns {boolean} True if initialized
     */
    get isInitialized() {
        return this._initialized;
    }

    /**
     * Gets current stats for UI
     * @returns {Array} Stats array
     */
    getStats() {
        if (!this.currentState) {
            return [];
        }
        return this.currentState.statManager.getAll();
    }

    /**
     * Gets visible stats for UI
     * @returns {Array} Visible stats array
     */
    getVisibleStats() {
        if (!this.currentState) {
            return [];
        }
        return this.currentState.statManager.getVisible();
    }
}

// Singleton instance
export const stateManager = new StateManager();

export default { StateManager, SimulationState, TokenMode, DEFAULT_SETTINGS, stateManager };
