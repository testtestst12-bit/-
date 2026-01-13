/**
 * Simulation Builder - Stat System
 * Core stat management with min/max bounds and modifiers
 * @module Stat
 */

import {
    toNumber,
    toNonNegativeInt,
    toString,
    isNonEmptyString,
    sanitizeId,
    generateId,
    clamp,
    SafeMath,
    isPlainObject,
    deepClone
} from './Utils.js';

import { StatModifier, ModifierCollection, ModifierType } from './StatModifier.js';

/**
 * Stat display modes
 * @readonly
 * @enum {string}
 */
export const StatDisplayMode = Object.freeze({
    VALUE: 'value',       // Just the number
    FRACTION: 'fraction', // current/max
    PERCENT: 'percent',   // percentage
    BAR: 'bar',           // visual bar
    HIDDEN: 'hidden'      // not displayed
});

/**
 * Validates display mode
 * @param {string} mode - Mode to validate
 * @returns {string} Valid display mode
 */
export function validateDisplayMode(mode) {
    const validModes = Object.values(StatDisplayMode);
    if (validModes.includes(mode)) {
        return mode;
    }
    return StatDisplayMode.VALUE;
}

/**
 * Represents a single stat with bounds, modifiers, and display options
 * @class
 */
export class Stat {
    /**
     * Creates a new Stat
     * @param {object} config - Stat configuration
     * @param {string} config.id - Unique identifier
     * @param {string} config.name - Display name
     * @param {number} [config.baseValue=0] - Base value before modifiers
     * @param {number} [config.currentValue] - Current value (defaults to baseValue)
     * @param {number} [config.minValue=0] - Minimum allowed value
     * @param {number} [config.maxValue=100] - Maximum allowed value
     * @param {string} [config.displayMode='value'] - How to display the stat
     * @param {string} [config.color='#4a90d9'] - Display color
     * @param {string} [config.icon=''] - Icon identifier
     * @param {string} [config.category=''] - Stat category for grouping
     * @param {boolean} [config.showInUI=true] - Whether to show in status UI
     */
    constructor(config = {}) {
        // Core identification
        this.id = isNonEmptyString(config.id) ? sanitizeId(config.id) : generateId('stat');
        this.name = toString(config.name, 'Unnamed Stat');

        // Value bounds - validate order
        let minVal = toNumber(config.minValue, 0);
        let maxVal = toNumber(config.maxValue, 100);
        if (minVal > maxVal) {
            console.warn(`[SimBuilder] Stat ${this.id}: min (${minVal}) > max (${maxVal}), swapping`);
            [minVal, maxVal] = [maxVal, minVal];
        }
        this.minValue = minVal;
        this.maxValue = maxVal;

        // Values
        this.baseValue = clamp(toNumber(config.baseValue, this.maxValue), this.minValue, this.maxValue);
        this._currentValue = typeof config.currentValue === 'number'
            ? clamp(toNumber(config.currentValue, this.baseValue), this.minValue, this.maxValue)
            : this.baseValue;

        // Display settings
        this.displayMode = validateDisplayMode(config.displayMode);
        this.color = toString(config.color, '#4a90d9');
        this.icon = toString(config.icon, '');
        this.category = toString(config.category, '');
        this.showInUI = config.showInUI !== false;

        // Modifier collection
        this.modifiers = new ModifierCollection(this.id);

        // Change tracking
        this._lastChange = 0;
        this._changeHistory = [];
        this._maxHistoryLength = 10;
    }

    /**
     * Gets the current value (after modifiers and clamping)
     * @returns {number} Current value
     */
    get currentValue() {
        return this._currentValue;
    }

    /**
     * Sets the current value with validation and clamping
     * @param {number} value - New value
     */
    set currentValue(value) {
        const oldValue = this._currentValue;
        const newValue = clamp(toNumber(value, this._currentValue), this.minValue, this.maxValue);
        
        if (oldValue !== newValue) {
            this._currentValue = newValue;
            this._recordChange(oldValue, newValue);
        }
    }

    /**
     * Gets the final value after applying all modifiers
     * @returns {number} Final modified value
     */
    get finalValue() {
        const modified = this.modifiers.applyAll(this._currentValue);
        return clamp(modified, this.minValue, this.maxValue);
    }

    /**
     * Gets the percentage of current value relative to max
     * @returns {number} Percentage (0-100)
     */
    get percentage() {
        if (this.maxValue === this.minValue) {
            return 100;
        }
        return SafeMath.percentage(this._currentValue - this.minValue, this.maxValue - this.minValue);
    }

    /**
     * Checks if stat is at minimum
     * @returns {boolean} True if at min
     */
    get isAtMin() {
        return this._currentValue <= this.minValue;
    }

    /**
     * Checks if stat is at maximum
     * @returns {boolean} True if at max
     */
    get isAtMax() {
        return this._currentValue >= this.maxValue;
    }

    /**
     * Records a value change in history
     * @param {number} oldValue - Previous value
     * @param {number} newValue - New value
     * @private
     */
    _recordChange(oldValue, newValue) {
        this._lastChange = SafeMath.subtract(newValue, oldValue);
        this._changeHistory.push({
            timestamp: Date.now(),
            oldValue,
            newValue,
            change: this._lastChange
        });

        // Trim history
        while (this._changeHistory.length > this._maxHistoryLength) {
            this._changeHistory.shift();
        }
    }

    /**
     * Gets the last change amount
     * @returns {number} Last change value
     */
    get lastChange() {
        return this._lastChange;
    }

    /**
     * Gets change history
     * @returns {Array} Change history array
     */
    get changeHistory() {
        return [...this._changeHistory];
    }

    /**
     * Modifies the current value by a delta
     * @param {number} delta - Amount to change
     * @returns {object} Result with oldValue, newValue, actualChange
     */
    modify(delta) {
        const oldValue = this._currentValue;
        const targetValue = SafeMath.add(oldValue, toNumber(delta, 0));
        this.currentValue = targetValue;
        
        return {
            oldValue,
            newValue: this._currentValue,
            actualChange: SafeMath.subtract(this._currentValue, oldValue),
            requestedChange: toNumber(delta, 0),
            wasClamped: this._currentValue !== targetValue
        };
    }

    /**
     * Sets value to a specific amount
     * @param {number} value - New value
     * @returns {object} Result with oldValue, newValue
     */
    set(value) {
        const oldValue = this._currentValue;
        this.currentValue = value;
        return {
            oldValue,
            newValue: this._currentValue
        };
    }

    /**
     * Resets current value to base value
     * @returns {object} Result with oldValue, newValue
     */
    reset() {
        return this.set(this.baseValue);
    }

    /**
     * Sets value to maximum
     * @returns {object} Result with oldValue, newValue
     */
    fill() {
        return this.set(this.maxValue);
    }

    /**
     * Sets value to minimum
     * @returns {object} Result with oldValue, newValue
     */
    empty() {
        return this.set(this.minValue);
    }

    /**
     * Adds a modifier to this stat
     * @param {StatModifier|object} modifier - Modifier to add
     * @returns {StatModifier|null} Added modifier
     */
    addModifier(modifier) {
        return this.modifiers.add(modifier);
    }

    /**
     * Removes a modifier by ID
     * @param {string} modifierId - Modifier ID
     * @returns {boolean} True if removed
     */
    removeModifier(modifierId) {
        return this.modifiers.remove(modifierId);
    }

    /**
     * Clears all modifiers
     */
    clearModifiers() {
        this.modifiers.clear();
    }

    /**
     * Updates bounds with validation
     * @param {number} [min] - New minimum
     * @param {number} [max] - New maximum
     */
    setBounds(min, max) {
        let newMin = min !== undefined ? toNumber(min, this.minValue) : this.minValue;
        let newMax = max !== undefined ? toNumber(max, this.maxValue) : this.maxValue;

        if (newMin > newMax) {
            console.warn(`[SimBuilder] Stat ${this.id}: new min (${newMin}) > max (${newMax}), swapping`);
            [newMin, newMax] = [newMax, newMin];
        }

        this.minValue = newMin;
        this.maxValue = newMax;

        // Re-clamp current value
        this.currentValue = this._currentValue;
    }

    /**
     * Gets formatted display string based on displayMode
     * @returns {string} Formatted stat string
     */
    getDisplayString() {
        switch (this.displayMode) {
            case StatDisplayMode.VALUE:
                return `${Math.round(this.finalValue)}`;
            case StatDisplayMode.FRACTION:
                return `${Math.round(this.finalValue)}/${Math.round(this.maxValue)}`;
            case StatDisplayMode.PERCENT:
                return `${Math.round(this.percentage)}%`;
            case StatDisplayMode.HIDDEN:
                return '';
            case StatDisplayMode.BAR:
            default:
                return `${Math.round(this.finalValue)}/${Math.round(this.maxValue)}`;
        }
    }

    /**
     * Ticks all modifiers (for turn-based duration)
     * @returns {string[]} IDs of expired modifiers
     */
    tick() {
        return this.modifiers.tick();
    }

    /**
     * Serializes stat to plain object
     * @returns {object} Serialized stat
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            baseValue: this.baseValue,
            currentValue: this._currentValue,
            minValue: this.minValue,
            maxValue: this.maxValue,
            displayMode: this.displayMode,
            color: this.color,
            icon: this.icon,
            category: this.category,
            showInUI: this.showInUI,
            modifiers: this.modifiers.toJSON()
        };
    }

    /**
     * Creates stat from plain object
     * @param {object} data - Serialized stat data
     * @returns {Stat} New stat instance
     */
    static fromJSON(data) {
        if (!isPlainObject(data)) {
            console.warn('[SimBuilder] Stat.fromJSON: invalid data');
            return new Stat({});
        }

        const stat = new Stat({
            id: data.id,
            name: data.name,
            baseValue: data.baseValue,
            currentValue: data.currentValue,
            minValue: data.minValue,
            maxValue: data.maxValue,
            displayMode: data.displayMode,
            color: data.color,
            icon: data.icon,
            category: data.category,
            showInUI: data.showInUI
        });

        // Restore modifiers
        if (data.modifiers) {
            stat.modifiers = ModifierCollection.fromJSON(data.modifiers);
        }

        return stat;
    }

    /**
     * Creates a copy of this stat
     * @returns {Stat} Cloned stat
     */
    clone() {
        return Stat.fromJSON(this.toJSON());
    }
}

/**
 * Manages a collection of stats
 * @class
 */
export class StatManager {
    constructor() {
        /** @type {Map<string, Stat>} */
        this.stats = new Map();
        /** @type {Function[]} */
        this._changeListeners = [];
    }

    /**
     * Adds a stat to the manager
     * @param {Stat|object} stat - Stat to add
     * @returns {Stat} Added stat
     */
    add(stat) {
        const s = stat instanceof Stat ? stat : new Stat(stat);
        
        if (this.stats.has(s.id)) {
            console.warn(`[SimBuilder] Stat ${s.id} already exists, replacing`);
        }
        
        this.stats.set(s.id, s);
        return s;
    }

    /**
     * Removes a stat by ID
     * @param {string} statId - Stat ID to remove
     * @returns {boolean} True if removed
     */
    remove(statId) {
        return this.stats.delete(sanitizeId(statId));
    }

    /**
     * Gets a stat by ID
     * @param {string} statId - Stat ID
     * @returns {Stat|undefined} Stat if found
     */
    get(statId) {
        return this.stats.get(sanitizeId(statId));
    }

    /**
     * Checks if a stat exists
     * @param {string} statId - Stat ID
     * @returns {boolean} True if exists
     */
    has(statId) {
        return this.stats.has(sanitizeId(statId));
    }

    /**
     * Gets all stats
     * @returns {Stat[]} Array of all stats
     */
    getAll() {
        return Array.from(this.stats.values());
    }

    /**
     * Gets stats by category
     * @param {string} category - Category to filter
     * @returns {Stat[]} Stats in category
     */
    getByCategory(category) {
        const cat = toString(category, '');
        return this.getAll().filter(s => s.category === cat);
    }

    /**
     * Gets stats that should show in UI
     * @returns {Stat[]} Visible stats
     */
    getVisible() {
        return this.getAll().filter(s => s.showInUI && s.displayMode !== StatDisplayMode.HIDDEN);
    }

    /**
     * Modifies a stat by ID
     * @param {string} statId - Stat ID
     * @param {number} delta - Amount to change
     * @returns {object|null} Modification result or null if stat not found
     */
    modify(statId, delta) {
        const stat = this.get(statId);
        if (!stat) {
            console.warn(`[SimBuilder] Stat not found: ${statId}`);
            return null;
        }
        const result = stat.modify(delta);
        this._notifyChange(stat, result);
        return result;
    }

    /**
     * Sets a stat value by ID
     * @param {string} statId - Stat ID
     * @param {number} value - New value
     * @returns {object|null} Result or null if stat not found
     */
    set(statId, value) {
        const stat = this.get(statId);
        if (!stat) {
            console.warn(`[SimBuilder] Stat not found: ${statId}`);
            return null;
        }
        const result = stat.set(value);
        this._notifyChange(stat, result);
        return result;
    }

    /**
     * Adds a modifier to a stat
     * @param {string} statId - Stat ID
     * @param {StatModifier|object} modifier - Modifier to add
     * @returns {StatModifier|null} Added modifier or null
     */
    addModifier(statId, modifier) {
        const stat = this.get(statId);
        if (!stat) {
            console.warn(`[SimBuilder] Cannot add modifier, stat not found: ${statId}`);
            return null;
        }
        return stat.addModifier(modifier);
    }

    /**
     * Removes a modifier from a stat
     * @param {string} statId - Stat ID
     * @param {string} modifierId - Modifier ID
     * @returns {boolean} True if removed
     */
    removeModifier(statId, modifierId) {
        const stat = this.get(statId);
        if (!stat) {
            return false;
        }
        return stat.removeModifier(modifierId);
    }

    /**
     * Ticks all stats (decrements modifier durations)
     * @returns {object} Map of statId to expired modifier IDs
     */
    tick() {
        const expired = {};
        for (const [id, stat] of this.stats) {
            const removed = stat.tick();
            if (removed.length > 0) {
                expired[id] = removed;
            }
        }
        return expired;
    }

    /**
     * Resets all stats to base values
     */
    resetAll() {
        for (const stat of this.stats.values()) {
            stat.reset();
        }
    }

    /**
     * Clears all stats
     */
    clear() {
        this.stats.clear();
    }

    /**
     * Gets stat count
     * @returns {number} Number of stats
     */
    get size() {
        return this.stats.size;
    }

    /**
     * Registers a change listener
     * @param {Function} listener - Callback function(stat, changeResult)
     * @returns {Function} Unsubscribe function
     */
    onChange(listener) {
        if (typeof listener !== 'function') {
            console.warn('[SimBuilder] onChange: listener must be a function');
            return () => {};
        }
        this._changeListeners.push(listener);
        return () => {
            const index = this._changeListeners.indexOf(listener);
            if (index > -1) {
                this._changeListeners.splice(index, 1);
            }
        };
    }

    /**
     * Notifies listeners of a change
     * @param {Stat} stat - Changed stat
     * @param {object} result - Change result
     * @private
     */
    _notifyChange(stat, result) {
        for (const listener of this._changeListeners) {
            try {
                listener(stat, result);
            } catch (e) {
                console.error('[SimBuilder] Error in change listener:', e);
            }
        }
    }

    /**
     * Serializes all stats to plain object
     * @returns {object} Serialized stats
     */
    toJSON() {
        return {
            stats: this.getAll().map(s => s.toJSON())
        };
    }

    /**
     * Loads stats from plain object
     * @param {object} data - Serialized stats data
     * @returns {StatManager} This instance
     */
    fromJSON(data) {
        this.clear();
        if (isPlainObject(data) && Array.isArray(data.stats)) {
            for (const statData of data.stats) {
                const stat = Stat.fromJSON(statData);
                this.stats.set(stat.id, stat);
            }
        }
        return this;
    }

    /**
     * Creates a StatManager from JSON data
     * @param {object} data - Serialized data
     * @returns {StatManager} New manager instance
     */
    static fromJSON(data) {
        const manager = new StatManager();
        return manager.fromJSON(data);
    }
}

export default { Stat, StatManager, StatDisplayMode, validateDisplayMode };
