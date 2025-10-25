/**
 * Pokemon Storage Module
 * Manages owned Pokemon data with localStorage and Electron file system
 */

class PokemonStorage {
    constructor() {
        this.ownedPokemon = [];
        this.load();
    }

    /**
     * Load owned Pokemon from storage
     */
    async load() {
        try {
            // Try Electron IPC first (if running in Electron)
            if (typeof require !== 'undefined') {
                try {
                    const { ipcRenderer } = require('electron');
                    const data = await ipcRenderer.invoke('load-pokemon-data');
                    if (data && Array.isArray(data)) {
                        this.ownedPokemon = data;
                        return;
                    }
                } catch (e) {
                    // Not in Electron or IPC failed, fall back to localStorage
                }
            }

            // Fall back to localStorage
            const stored = localStorage.getItem('owned_pokemon');
            if (stored) {
                this.ownedPokemon = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading Pokemon storage:', error);
            this.ownedPokemon = [];
        }
    }

    /**
     * Save owned Pokemon to storage
     */
    async save() {
        try {
            // Try Electron IPC first
            if (typeof require !== 'undefined') {
                try {
                    const { ipcRenderer } = require('electron');
                    await ipcRenderer.invoke('save-pokemon-data', this.ownedPokemon);
                    return;
                } catch (e) {
                    // Not in Electron or IPC failed, fall back to localStorage
                }
            }

            // Fall back to localStorage
            localStorage.setItem('owned_pokemon', JSON.stringify(this.ownedPokemon));
        } catch (error) {
            console.error('Error saving Pokemon storage:', error);
        }
    }

    /**
     * Add a Pokemon to the storage
     * @param {Object} pokemon - Pokemon data
     * @returns {string} ID of added Pokemon
     */
    addPokemon(pokemon) {
        const id = this.generateId();
        const pokemonWithId = {
            id: id,
            name: pokemon.name,
            gender: pokemon.gender || 'unknown',
            level: pokemon.level || 1,
            nature: pokemon.nature || null,
            ivs: pokemon.ivs || {
                hp: null,
                attack: null,
                defense: null,
                spAttack: null,
                spDefense: null,
                speed: null
            },
            eggGroups: pokemon.eggGroups || [],
            addedDate: new Date().toISOString(),
            perfectIVCount: this.countPerfectIVs(pokemon.ivs),
            perfectStats: this.getPerfectStats(pokemon.ivs)
        };

        this.ownedPokemon.push(pokemonWithId);
        this.save();

        return id;
    }

    /**
     * Add multiple Pokemon at once
     * @param {Array<Object>} pokemonList - Array of Pokemon data
     * @returns {Array<string>} Array of IDs
     */
    addMultiplePokemon(pokemonList) {
        const ids = [];
        for (const pokemon of pokemonList) {
            const id = this.addPokemon(pokemon);
            ids.push(id);
        }
        return ids;
    }

    /**
     * Remove a Pokemon by ID
     * @param {string} id - Pokemon ID
     * @returns {boolean} Success status
     */
    removePokemon(id) {
        const index = this.ownedPokemon.findIndex(p => p.id === id);
        if (index !== -1) {
            this.ownedPokemon.splice(index, 1);
            this.save();
            return true;
        }
        return false;
    }

    /**
     * Update a Pokemon's data
     * @param {string} id - Pokemon ID
     * @param {Object} updates - Updated data
     * @returns {boolean} Success status
     */
    updatePokemon(id, updates) {
        const pokemon = this.ownedPokemon.find(p => p.id === id);
        if (pokemon) {
            Object.assign(pokemon, updates);

            // Recalculate perfect IV stats if IVs were updated
            if (updates.ivs) {
                pokemon.perfectIVCount = this.countPerfectIVs(pokemon.ivs);
                pokemon.perfectStats = this.getPerfectStats(pokemon.ivs);
            }

            this.save();
            return true;
        }
        return false;
    }

    /**
     * Get all owned Pokemon
     * @returns {Array<Object>} All owned Pokemon
     */
    getAll() {
        return [...this.ownedPokemon];
    }

    /**
     * Get Pokemon by ID
     * @param {string} id - Pokemon ID
     * @returns {Object|null} Pokemon data
     */
    getById(id) {
        return this.ownedPokemon.find(p => p.id === id) || null;
    }

    /**
     * Find Pokemon with specific IV
     * @param {string} stat - Stat name (hp, attack, defense, etc.)
     * @param {string} gender - Gender filter (optional)
     * @returns {Array<Object>} Matching Pokemon
     */
    findByPerfectIV(stat, gender = null) {
        return this.ownedPokemon.filter(p => {
            const hasIV = p.ivs[stat] === 31;
            const matchesGender = !gender || p.gender === gender;
            return hasIV && matchesGender;
        });
    }

    /**
     * Find Pokemon with multiple perfect IVs
     * @param {Array<string>} stats - Array of stat names
     * @param {string} gender - Gender filter (optional)
     * @returns {Array<Object>} Matching Pokemon
     */
    findByMultiplePerfectIVs(stats, gender = null) {
        return this.ownedPokemon.filter(p => {
            const hasAllIVs = stats.every(stat => p.ivs[stat] === 31);
            const matchesGender = !gender || p.gender === gender;
            return hasAllIVs && matchesGender;
        });
    }

    /**
     * Find the cheapest Pokemon for a specific IV
     * Considers owned Pokemon (cost = 0) vs market prices
     * @param {string} stat - Stat name
     * @param {string} gender - Gender required
     * @param {number} marketPrice - Market price for this IV/gender combo
     * @returns {Object} Best option with cost
     */
    findCheapestForIV(stat, gender, marketPrice) {
        const owned = this.findByPerfectIV(stat, gender);

        if (owned.length > 0) {
            // We own one, cost is 0
            return {
                source: 'owned',
                pokemon: owned[0],
                cost: 0
            };
        }

        // Need to buy from market
        return {
            source: 'market',
            pokemon: null,
            cost: marketPrice
        };
    }

    /**
     * Clear all owned Pokemon
     */
    clearAll() {
        this.ownedPokemon = [];
        this.save();
    }

    /**
     * Get statistics about owned Pokemon
     * @returns {Object} Statistics
     */
    getStatistics() {
        const total = this.ownedPokemon.length;
        const byIVCount = {};
        const byGender = { male: 0, female: 0, unknown: 0 };

        for (const pokemon of this.ownedPokemon) {
            const count = pokemon.perfectIVCount;
            byIVCount[count] = (byIVCount[count] || 0) + 1;

            if (pokemon.gender === 'male') byGender.male++;
            else if (pokemon.gender === 'female') byGender.female++;
            else byGender.unknown++;
        }

        return {
            total,
            byIVCount,
            byGender,
            averagePerfectIVs: total > 0
                ? this.ownedPokemon.reduce((sum, p) => sum + p.perfectIVCount, 0) / total
                : 0
        };
    }

    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return `pkmn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Count perfect IVs (31s)
     * @param {Object} ivs - IV data
     * @returns {number} Count
     */
    countPerfectIVs(ivs) {
        if (!ivs) return 0;
        return Object.values(ivs).filter(iv => iv === 31).length;
    }

    /**
     * Get which stats have perfect IVs
     * @param {Object} ivs - IV data
     * @returns {Array<string>} Stat names
     */
    getPerfectStats(ivs) {
        if (!ivs) return [];

        const stats = [];
        const statNames = {
            hp: 'HP',
            attack: 'Attack',
            defense: 'Defense',
            spAttack: 'Sp. Attack',
            spDefense: 'Sp. Defense',
            speed: 'Speed'
        };

        for (const [key, value] of Object.entries(ivs)) {
            if (value === 31) {
                stats.push(statNames[key]);
            }
        }

        return stats;
    }

    /**
     * Export owned Pokemon as JSON
     * @returns {string} JSON string
     */
    exportAsJSON() {
        return JSON.stringify(this.ownedPokemon, null, 2);
    }

    /**
     * Import Pokemon from JSON
     * @param {string} jsonString - JSON data
     * @returns {number} Number of Pokemon imported
     */
    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                const count = this.addMultiplePokemon(data);
                return count.length;
            }
        } catch (error) {
            console.error('Error importing Pokemon data:', error);
        }
        return 0;
    }
}

// Create singleton instance
const pokemonStorage = new PokemonStorage();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pokemonStorage;
}
