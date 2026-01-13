/**
 * Simulation Builder - Main Entry Point
 * SillyTavern Extension for building custom simulations
 * @module index
 */

// Import modules
import { stateManager, TokenMode, StateScope } from './modules/StateManager.js';
import { uiController } from './modules/UIController.js';
import { Stat, StatDisplayMode } from './modules/Stat.js';
import { StatModifier, ModifierType } from './modules/StatModifier.js';
import { StatParser, parseStatCommands } from './modules/Parser.js';
import { MODULE_NAME, withErrorBoundary } from './modules/Utils.js';

/**
 * Extension version
 */
const VERSION = '1.0.0';

/**
 * Extension display name
 */
const DISPLAY_NAME = 'Simulation Builder';

/**
 * Logs with extension prefix
 * @param {...any} args - Arguments to log
 */
function log(...args) {
    console.log(`[${DISPLAY_NAME}]`, ...args);
}

/**
 * Logs error with extension prefix
 * @param {...any} args - Arguments to log
 */
function logError(...args) {
    console.error(`[${DISPLAY_NAME}]`, ...args);
}

/**
 * Gets the SillyTavern context safely
 * @returns {object|null} Context or null
 */
function getContext() {
    try {
        if (typeof SillyTavern !== 'undefined' && SillyTavern.getContext) {
            return SillyTavern.getContext();
        }
    } catch (e) {
        logError('Failed to get context:', e);
    }
    return null;
}

/**
 * Handles incoming AI messages
 * @param {number} messageIndex - Index of the message
 */
async function onMessageReceived(messageIndex) {
    const context = getContext();
    if (!context) return;

    try {
        const chat = context.chat;
        if (!chat || !chat[messageIndex]) return;

        const message = chat[messageIndex];
        
        // Only process AI messages
        if (message.is_user) return;

        const messageText = message.mes || '';
        
        // Check if message contains stat commands
        if (!stateManager.parser.hasCommands(messageText)) {
            return;
        }

        log('Processing message with stat commands');

        // Process the message
        const result = stateManager.processMessage(messageText);

        if (result.success && result.changes.length > 0) {
            log(`Applied ${result.changes.length} stat changes`);
            
            // Save state
            await stateManager.saveState(context);
            
            // Advance turn
            stateManager.tick();
        }
    } catch (error) {
        logError('Error processing message:', error);
    }
}

/**
 * Handles chat change event
 */
async function onChatChanged() {
    const context = getContext();
    if (!context) return;

    try {
        log('Chat changed, reloading state');
        
        // Re-initialize state for new chat
        stateManager.initialize(context);
        
        // Re-render UI
        uiController.render();
    } catch (error) {
        logError('Error on chat change:', error);
    }
}

/**
 * Registers slash commands
 */
function registerSlashCommands() {
    const context = getContext();
    if (!context) return;

    try {
        // Only register if SlashCommandParser is available
        if (typeof SlashCommandParser === 'undefined') {
            log('SlashCommandParser not available, skipping command registration');
            return;
        }

        // /simstat command - show stats
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'simstat',
            callback: (args, value) => {
                const stats = stateManager.getVisibleStats();
                if (stats.length === 0) {
                    return 'No stats configured.';
                }
                return stats.map(s => `${s.name}: ${s.getDisplayString()}`).join('\n');
            },
            returns: 'Current stat values',
            helpString: 'Shows all visible simulation stats.'
        }));

        // /simset command - set stat value
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'simset',
            callback: (args, value) => {
                if (!stateManager.currentState) {
                    return 'No active simulation.';
                }

                const parts = value.split(/\s+/);
                if (parts.length < 2) {
                    return 'Usage: /simset <statId> <value>';
                }

                const statId = parts[0].toLowerCase();
                const newValue = parseFloat(parts[1]);

                if (isNaN(newValue)) {
                    return 'Invalid value.';
                }

                const stat = stateManager.currentState.statManager.get(statId);
                if (!stat) {
                    return `Stat not found: ${statId}`;
                }

                const result = stat.set(newValue);
                uiController.updateStat(stat);
                
                return `${stat.name}: ${result.oldValue} → ${result.newValue}`;
            },
            returns: 'Result of stat change',
            helpString: 'Sets a stat to a specific value. Usage: /simset hp 50'
        }));

        // /simmod command - modify stat
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'simmod',
            callback: (args, value) => {
                if (!stateManager.currentState) {
                    return 'No active simulation.';
                }

                const parts = value.split(/\s+/);
                if (parts.length < 2) {
                    return 'Usage: /simmod <statId> <delta>';
                }

                const statId = parts[0].toLowerCase();
                const delta = parseFloat(parts[1]);

                if (isNaN(delta)) {
                    return 'Invalid delta value.';
                }

                const stat = stateManager.currentState.statManager.get(statId);
                if (!stat) {
                    return `Stat not found: ${statId}`;
                }

                const result = stat.modify(delta);
                uiController.updateStat(stat);
                
                const sign = delta >= 0 ? '+' : '';
                return `${stat.name}: ${sign}${delta} (${result.oldValue} → ${result.newValue})`;
            },
            returns: 'Result of stat modification',
            helpString: 'Modifies a stat by a delta. Usage: /simmod hp -10'
        }));

        // /simreset command - reset simulation
        SlashCommandParser.addCommandObject(SlashCommand.fromProps({
            name: 'simreset',
            callback: () => {
                stateManager.reset();
                uiController.render();
                return 'Simulation reset.';
            },
            returns: 'Confirmation message',
            helpString: 'Resets all stats to their base values.'
        }));

        log('Slash commands registered');
    } catch (error) {
        logError('Failed to register slash commands:', error);
    }
}

/**
 * Creates the extension settings panel HTML
 * @returns {string} HTML string
 */
function getSettingsPanelHtml() {
    return `
        <div class="simbuilder-extension-settings">
            <div class="inline-drawer">
                <div class="inline-drawer-toggle inline-drawer-header">
                    <b>Simulation Builder</b>
                    <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
                </div>
                <div class="inline-drawer-content">
                    <div class="simbuilder-settings-row">
                        <label for="simbuilder_enabled">
                            <input type="checkbox" id="simbuilder_enabled" />
                            Enable Simulation Builder
                        </label>
                    </div>
                    <div class="simbuilder-settings-row">
                        <label for="simbuilder_token_mode">Token Mode:</label>
                        <select id="simbuilder_token_mode">
                            <option value="zero">Zero (0 tokens)</option>
                            <option value="minimal">Minimal (~30 tokens)</option>
                            <option value="full">Full (~100+ tokens)</option>
                        </select>
                    </div>
                    <div class="simbuilder-settings-row">
                        <label for="simbuilder_scope">State Scope:</label>
                        <select id="simbuilder_scope">
                            <option value="per_chat">Per Chat (Separate)</option>
                            <option value="global">Global (Shared)</option>
                        </select>
                        <small style="display:block;color:#888;margin-top:4px;">Global: Same stats in all chats. Per Chat: Different stats per chat.</small>
                    </div>
                    <div class="simbuilder-settings-row">
                        <label for="simbuilder_notifications">
                            <input type="checkbox" id="simbuilder_notifications" />
                            Show Change Notifications
                        </label>
                    </div>
                    <div class="simbuilder-settings-row">
                        <label for="simbuilder_auto_apply">
                            <input type="checkbox" id="simbuilder_auto_apply" />
                            Auto-apply AI stat commands
                        </label>
                    </div>
                    <hr />
                    <div class="simbuilder-settings-info">
                        <p>Version: ${VERSION}</p>
                        <p>Format: <code>{{stat:value}}</code></p>
                        <p>Examples:</p>
                        <ul>
                            <li><code>{{hp:-10}}</code> - Decrease HP by 10</li>
                            <li><code>{{mp:+5}}</code> - Increase MP by 5</li>
                            <li><code>{{hp:=50}}</code> - Set HP to 50</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Binds settings panel events
 */
function bindSettingsPanelEvents() {
    const context = getContext();
    if (!context) return;

    const enabledCheckbox = document.getElementById('simbuilder_enabled');
    const tokenModeSelect = document.getElementById('simbuilder_token_mode');
    const scopeSelect = document.getElementById('simbuilder_scope');
    const notificationsCheckbox = document.getElementById('simbuilder_notifications');
    const autoApplyCheckbox = document.getElementById('simbuilder_auto_apply');

    if (enabledCheckbox) {
        enabledCheckbox.checked = stateManager.settings.enabled;
        enabledCheckbox.addEventListener('change', () => {
            stateManager.settings.enabled = enabledCheckbox.checked;
            stateManager.saveSettings(context);
            uiController.updateVisibility();
        });
    }

    if (tokenModeSelect) {
        tokenModeSelect.value = stateManager.settings.tokenMode;
        tokenModeSelect.addEventListener('change', () => {
            stateManager.settings.tokenMode = tokenModeSelect.value;
            stateManager.saveSettings(context);
        });
    }

    if (scopeSelect) {
        scopeSelect.value = stateManager.settings.stateScope || 'per_chat';
        scopeSelect.addEventListener('change', () => {
            stateManager.setStateScope(scopeSelect.value);
            stateManager.saveSettings(context);
            uiController.render();
        });
    }

    if (notificationsCheckbox) {
        notificationsCheckbox.checked = stateManager.settings.showChangeNotifications;
        notificationsCheckbox.addEventListener('change', () => {
            stateManager.settings.showChangeNotifications = notificationsCheckbox.checked;
            stateManager.saveSettings(context);
        });
    }

    if (autoApplyCheckbox) {
        autoApplyCheckbox.checked = stateManager.settings.autoApplyChanges;
        autoApplyCheckbox.addEventListener('change', () => {
            stateManager.settings.autoApplyChanges = autoApplyCheckbox.checked;
            stateManager.saveSettings(context);
        });
    }
}

/**
 * Initializes the extension
 */
async function initExtension() {
    log(`Initializing v${VERSION}...`);

    const context = getContext();
    if (!context) {
        logError('No SillyTavern context available');
        return;
    }

    try {
        const { eventSource, event_types } = context;

        // Initialize state manager
        if (!stateManager.initialize(context)) {
            logError('Failed to initialize state manager');
            return;
        }

        // Find or create UI container
        // Try to find the extensions settings area first
        let uiParent = document.getElementById('extensions_settings2');
        if (!uiParent) {
            // Fallback to chat area
            uiParent = document.getElementById('chat');
        }
        if (!uiParent) {
            // Last resort - body
            uiParent = document.body;
        }

        // Initialize UI
        if (!uiController.initialize(uiParent)) {
            logError('Failed to initialize UI');
            return;
        }

        // Add settings panel to extension settings
        const settingsContainer = document.getElementById('extensions_settings');
        if (settingsContainer) {
            const settingsHtml = getSettingsPanelHtml();
            const settingsDiv = document.createElement('div');
            settingsDiv.innerHTML = settingsHtml;
            settingsContainer.appendChild(settingsDiv.firstElementChild);
            bindSettingsPanelEvents();
        }

        // Register event listeners
        if (eventSource && event_types) {
            // Listen for new AI messages
            eventSource.on(event_types.MESSAGE_RECEIVED, withErrorBoundary(
                onMessageReceived,
                undefined,
                'onMessageReceived'
            ));

            // Listen for chat changes
            eventSource.on(event_types.CHAT_CHANGED, withErrorBoundary(
                onChatChanged,
                undefined,
                'onChatChanged'
            ));

            log('Event listeners registered');
        }

        // Register slash commands
        registerSlashCommands();

        log('Initialization complete');

    } catch (error) {
        logError('Initialization failed:', error);
    }
}

// Wait for jQuery ready (SillyTavern uses jQuery)
if (typeof jQuery !== 'undefined') {
    jQuery(async () => {
        await initExtension();
    });
} else {
    // Fallback if jQuery not available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initExtension);
    } else {
        initExtension();
    }
}

// Export for potential external use
export {
    stateManager,
    uiController,
    Stat,
    StatModifier,
    StatParser,
    ModifierType,
    StatDisplayMode,
    TokenMode,
    StateScope,
    VERSION,
    DISPLAY_NAME
};
