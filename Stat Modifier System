/**
 * Simulation Builder - Stat Modifier System
 * Handles temporary and permanent stat modifications
 * @module StatModifier
 */

import { 
    toNumber, 
    toNonNegativeInt, 
    toPositiveInt, 
    toString, 
    isNonEmptyString,
    sanitizeId,
    generateId,
    deepClone,
    SafeMath
} from './Utils.js';

/**
 * Modifier operation types
 * @readonly
 * @enum {string}
 */
export const ModifierType = Object.freeze({
    ADD: 'add',           // Adds to base value
    MULTIPLY: 'multiply', // Multiplies base value
    OVERRIDE: 'override'  // Completely replaces value
});

/**
 * Validates modifier type
 * @param {string} type - Type to validate
 * @returns {string} Valid modifier type
 */
export function validateModifierType(type) {
    const validTypes = Object.values(ModifierType);
    if (validTypes.includes(type)) {
        return type;
    }
    console.warn(`[SimBuilder] Invalid modifier type: ${type}, defaulting to 'add'`);
    return ModifierType.ADD;
}

/**
 * Represents a single stat modifier
 * @class
 */
export class StatModifier {
    /**
     * Creates a new StatModifier
     * @param {object} config - Modifier configuration
     * @param {string} config.id - Unique identifier
     * @param {string} config.name - Display name
     * @param {string} config.statId - Target stat ID
     * @param {string} config.type - Modifier type (add/multiply/override)
     * @param {number} config.value - Modifier value
     * @param {number} [config.duration=-1] - Duration in turns (-1 = permanent)
     * @param {number} [config.maxStacks=1] - Maximum stack count
     * @param {string} [config.source=''] - Source of the modifier
     */
    constructor(config = {}) {
        // Validate and assign properties
        this.id = isNonEmptyString(config.id) ? sanitizeId(config.id) : generateId('mod');
        this.name = toString(config.name, 'Unnamed Modifier');
        this.statId = isNonEmptyString(config.statId) ? sanitizeId(config.statId) : '';
        this.type = validateModifierType(config.type);
        this.value = toNumber(config.value, 0);
        this.duration = toNumber(config.duration, -1); // -1 = permanent
        this.maxStacks = toPositiveInt(config.maxStacks, 1);
        this.currentStacks = toPositiveInt(config.currentStacks, 1);
        this.source = toString(config.source, '');
        this.createdAt = Date.now();
        this.remainingDuration = this.duration;
        
        // Validate critical fields
        if (!this.statId) {
            console.warn(`[SimBuilder] StatModifier created without statId: ${this.id}`);
        }
    }

    /**
     * Checks if modifier is still active
     * @returns {boolean} True if active
     */
    isActive() {
        // Permanent modifiers (duration = -1) are always active
        if (this.duration < 0) {
            return true;
        }
        return this.remainingDuration > 0;
    }

    /**
     * Checks if modifier is permanent
     * @returns {boolean} True if permanent
     */
    isPermanent() {
        return this.duration < 0;
    }

    /**
     * Decrements duration by one turn
     * @returns {boolean} True if still active after decrement
     */
    tick() {
        if (this.duration < 0) {
            return true; // Permanent
        }
        this.remainingDuration = Math.max(0, this.remainingDuration - 1);
        return this.remainingDuration > 0;
    }

    /**
     * Adds stacks to the modifier
     * @param {number} [count=1] - Number of stacks to add
     * @returns {number} New stack count
     */
    addStacks(count = 1) {
        const toAdd = toPositiveInt(count, 1);
        this.currentStacks = Math.min(this.currentStacks + toAdd, this.maxStacks);
        // Refresh duration on stack
        if (this.duration > 0) {
            this.remainingDuration = this.duration;
        }
        return this.currentStacks;
    }

    /**
     * Removes stacks from the modifier
     * @param {number} [count=1] - Number of stacks to remove
     * @returns {number} Remaining stack count
     */
    removeStacks(count = 1) {
        const toRemove = toPositiveInt(count, 1);
        this.currentStacks = Math.max(0, this.currentStacks - toRemove);
        return this.currentStacks;
    }

    /**
     * Calculates the effective value based on stacks
     * @returns {number} Effective modifier value
     */
    getEffectiveValue() {
        if (this.type === ModifierType.OVERRIDE) {
            // Override doesn't stack - always returns base value
            return this.value;
        }
        // For add/multiply, value scales with stacks
        return SafeMath.multiply(this.value, this.currentStacks);
    }

    /**
     * Applies modifier to a base value
     * @param {number} baseValue - Base stat value
     * @returns {number} Modified value
     */
    apply(baseValue) {
        const base = toNumber(baseValue, 0);
        const effectiveValue = this.getEffectiveValue();

        switch (this.type) {
            case ModifierType.ADD:
                return SafeMath.add(base, effectiveValue);
            case ModifierType.MULTIPLY:
                return SafeMath.multiply(base, effectiveValue);
            case ModifierType.OVERRIDE:
                return effectiveValue;
            default:
                console.warn(`[SimBuilder] Unknown modifier type: ${this.type}`);
                return base;
        }
    }

    /**
     * Serializes modifier to plain object
     * @returns {object} Serialized modifier
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            statId: this.statId,
            type: this.type,
            value: this.value,
            duration: this.duration,
            maxStacks: this.maxStacks,
            currentStacks: this.currentStacks,
            source: this.source,
            createdAt: this.createdAt,
            remainingDuration: this.remainingDuration
        };
    }

    /**
     * Creates modifier from plain object
     * @param {object} data - Serialized modifier data
     * @returns {StatModifier} New modifier instance
     */
    static fromJSON(data) {
        if (!data || typeof data !== 'object') {
            console.warn('[SimBuilder] StatModifier.fromJSON: invalid data');
            return new StatModifier({});
        }
        const modifier = new StatModifier(data);
        // Restore runtime state
        if (typeof data.remainingDuration === 'number') {
            modifier.remainingDuration = toNumber(data.remainingDuration, modifier.duration);
        }
        if (typeof data.createdAt === 'number') {
            modifier.createdAt = data.createdAt;
        }
        return modifier;
    }

    /**
     * Creates a copy of this modifier
     * @returns {StatModifier} Cloned modifier
     */
    clone() {
        return StatModifier.fromJSON(this.toJSON());
    }
}

/**
 * Manages a collection of modifiers for a stat
 * Applies modifiers in correct order: Add → Multiply → Override
 * @class
 */
export class ModifierCollection {
    /**
     * Creates a new ModifierCollection
     * @param {string} statId - Associated stat ID
     */
    constructor(statId) {
        this.statId = sanitizeId(statId);
        /** @type {Map<string, StatModifier>} */
        this.modifiers = new Map();
    }

    /**
     * Adds a modifier to the collection
     * @param {StatModifier|object} modifier - Modifier to add
     * @returns {StatModifier|null} Added modifier or null if failed
     */
    add(modifier) {
        // Convert plain object to StatModifier
        const mod = modifier instanceof StatModifier 
            ? modifier 
            : new StatModifier(modifier);

        // Ensure modifier targets this stat
        if (mod.statId && mod.statId !== this.statId) {
            console.warn(`[SimBuilder] Modifier ${mod.id} targets ${mod.statId}, not ${this.statId}`);
            return null;
        }

        // Set statId if not set
        mod.statId = this.statId;

        // Check for existing modifier with same ID
        const existing = this.modifiers.get(mod.id);
        if (existing) {
            // Stack if possible
            if (existing.currentStacks < existing.maxStacks) {
                existing.addStacks(1);
                return existing;
            } else {
                // Already at max stacks, refresh duration
                if (existing.duration > 0) {
                    existing.remainingDuration = existing.duration;
                }
                return existing;
            }
        }

        this.modifiers.set(mod.id, mod);
        return mod;
    }

    /**
     * Removes a modifier by ID
     * @param {string} modifierId - Modifier ID to remove
     * @returns {boolean} True if removed
     */
    remove(modifierId) {
        return this.modifiers.delete(sanitizeId(modifierId));
    }

    /**
     * Gets a modifier by ID
     * @param {string} modifierId - Modifier ID
     * @returns {StatModifier|undefined} Modifier if found
     */
    get(modifierId) {
        return this.modifiers.get(sanitizeId(modifierId));
    }

    /**
     * Checks if a modifier exists
     * @param {string} modifierId - Modifier ID
     * @returns {boolean} True if exists
     */
    has(modifierId) {
        return this.modifiers.has(sanitizeId(modifierId));
    }

    /**
     * Gets all active modifiers
     * @returns {StatModifier[]} Array of active modifiers
     */
    getActive() {
        return Array.from(this.modifiers.values()).filter(m => m.isActive());
    }

    /**
     * Gets modifiers by type
     * @param {string} type - Modifier type
     * @returns {StatModifier[]} Modifiers of specified type
     */
    getByType(type) {
        const validType = validateModifierType(type);
        return this.getActive().filter(m => m.type === validType);
    }

    /**
     * Applies all modifiers to a base value
     * Order: Add → Multiply → Override
     * @param {number} baseValue - Base stat value
     * @returns {number} Final modified value
     */
    applyAll(baseValue) {
        const base = toNumber(baseValue, 0);
        const active = this.getActive();

        if (active.length === 0) {
            return base;
        }

        // Separate by type
        const addMods = active.filter(m => m.type === ModifierType.ADD);
        const multiplyMods = active.filter(m => m.type === ModifierType.MULTIPLY);
        const overrideMods = active.filter(m => m.type === ModifierType.OVERRIDE);

        // Check for override first - last one wins
        if (overrideMods.length > 0) {
            // Use the most recent override
            const latestOverride = overrideMods.reduce((latest, current) => 
                current.createdAt > latest.createdAt ? current : latest
            );
            return latestOverride.getEffectiveValue();
        }

        let result = base;

        // Apply all add modifiers
        for (const mod of addMods) {
            result = SafeMath.add(result, mod.getEffectiveValue());
        }

        // Apply all multiply modifiers
        for (const mod of multiplyMods) {
            result = SafeMath.multiply(result, mod.getEffectiveValue());
        }

        return result;
    }

    /**
     * Ticks all modifiers and removes expired ones
     * @returns {string[]} IDs of removed modifiers
     */
    tick() {
        const removed = [];
        for (const [id, mod] of this.modifiers) {
            if (!mod.tick()) {
                this.modifiers.delete(id);
                removed.push(id);
            }
        }
        return removed;
    }

    /**
     * Clears all modifiers
     */
    clear() {
        this.modifiers.clear();
    }

    /**
     * Gets total modifier count
     * @returns {number} Number of modifiers
     */
    get size() {
        return this.modifiers.size;
    }

    /**
     * Gets count of active modifiers
     * @returns {number} Number of active modifiers
     */
    get activeCount() {
        return this.getActive().length;
    }

    /**
     * Serializes collection to plain object
     * @returns {object} Serialized collection
     */
    toJSON() {
        return {
            statId: this.statId,
            modifiers: Array.from(this.modifiers.values()).map(m => m.toJSON())
        };
    }

    /**
     * Creates collection from plain object
     * @param {object} data - Serialized collection data
     * @returns {ModifierCollection} New collection instance
     */
    static fromJSON(data) {
        if (!data || typeof data !== 'object') {
            console.warn('[SimBuilder] ModifierCollection.fromJSON: invalid data');
            return new ModifierCollection('unknown');
        }
        const collection = new ModifierCollection(data.statId);
        if (Array.isArray(data.modifiers)) {
            for (const modData of data.modifiers) {
                const mod = StatModifier.fromJSON(modData);
                collection.modifiers.set(mod.id, mod);
            }
        }
        return collection;
    }
}

export default { StatModifier, ModifierCollection, ModifierType, validateModifierType };
