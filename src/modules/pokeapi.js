/**
 * PokeAPI Module
 * Handles fetching Pokemon data from PokéAPI, including egg groups
 */

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

class PokeAPI {
    constructor() {
        this.cache = this.loadCache();
    }

    /**
     * Load cache from localStorage
     */
    loadCache() {
        try {
            const cached = localStorage.getItem('pokeapi_cache');
            if (cached) {
                const data = JSON.parse(cached);
                // Check if cache is still valid
                if (Date.now() - data.timestamp < CACHE_DURATION) {
                    return data.cache || {};
                }
            }
        } catch (error) {
            console.error('Error loading PokeAPI cache:', error);
        }
        return {};
    }

    /**
     * Save cache to localStorage
     */
    saveCache() {
        try {
            localStorage.setItem('pokeapi_cache', JSON.stringify({
                timestamp: Date.now(),
                cache: this.cache
            }));
        } catch (error) {
            console.error('Error saving PokeAPI cache:', error);
        }
    }

    /**
     * Fetch Pokemon species data
     * @param {string|number} nameOrId - Pokemon name or ID
     * @returns {Promise<Object>} Pokemon species data
     */
    async getPokemonSpecies(nameOrId) {
        const key = `species_${nameOrId.toString().toLowerCase()}`;

        // Check cache first
        if (this.cache[key]) {
            return this.cache[key];
        }

        try {
            const response = await fetch(`${POKEAPI_BASE_URL}/pokemon-species/${nameOrId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch Pokemon species: ${response.statusText}`);
            }

            const data = await response.json();
            this.cache[key] = data;
            this.saveCache();

            return data;
        } catch (error) {
            console.error('Error fetching Pokemon species:', error);
            throw error;
        }
    }

    /**
     * Get egg groups for a Pokemon
     * @param {string|number} nameOrId - Pokemon name or ID
     * @returns {Promise<Array<string>>} Array of egg group names
     */
    async getEggGroups(nameOrId) {
        try {
            const species = await this.getPokemonSpecies(nameOrId);

            const eggGroups = species.egg_groups.map(group => group.name);
            return eggGroups;
        } catch (error) {
            console.error('Error getting egg groups:', error);
            return [];
        }
    }

    /**
     * Check if two Pokemon can breed together based on egg groups
     * @param {string|number} pokemon1 - First Pokemon name or ID
     * @param {string|number} pokemon2 - Second Pokemon name or ID
     * @returns {Promise<boolean>} True if they can breed
     */
    async canBreedTogether(pokemon1, pokemon2) {
        try {
            const eggGroups1 = await this.getEggGroups(pokemon1);
            const eggGroups2 = await this.getEggGroups(pokemon2);

            // Cannot breed if either is in "Ditto" or "Undiscovered" group
            // (Except Ditto can breed with almost anything)
            if (eggGroups1.includes('ditto') && !eggGroups2.includes('undiscovered')) {
                return true;
            }
            if (eggGroups2.includes('ditto') && !eggGroups1.includes('undiscovered')) {
                return true;
            }

            // Check for undiscovered (cannot breed)
            if (eggGroups1.includes('undiscovered') || eggGroups2.includes('undiscovered')) {
                return false;
            }

            // Check if they share at least one egg group
            const canBreed = eggGroups1.some(group => eggGroups2.includes(group));
            return canBreed;
        } catch (error) {
            console.error('Error checking breeding compatibility:', error);
            return false;
        }
    }

    /**
     * Get detailed Pokemon info including name, egg groups, and gender ratio
     * @param {string|number} nameOrId - Pokemon name or ID
     * @returns {Promise<Object>} Pokemon breeding info
     */
    async getPokemonBreedingInfo(nameOrId) {
        try {
            const species = await this.getPokemonSpecies(nameOrId);
            const eggGroups = species.egg_groups.map(group => group.name);

            // Gender rate: -1 = genderless, 0 = always male, 8 = always female
            // Otherwise: rate/8 = chance of female
            const genderRate = species.gender_rate;
            let gender = 'both';
            if (genderRate === -1) gender = 'genderless';
            else if (genderRate === 0) gender = 'male-only';
            else if (genderRate === 8) gender = 'female-only';

            return {
                name: species.name,
                id: species.id,
                eggGroups: eggGroups,
                genderRate: genderRate,
                gender: gender,
                hatchCounter: species.hatch_counter || 0
            };
        } catch (error) {
            console.error('Error getting Pokemon breeding info:', error);
            return null;
        }
    }

    /**
     * Clear the cache
     */
    clearCache() {
        this.cache = {};
        localStorage.removeItem('pokeapi_cache');
    }
}

// Create singleton instance
const pokeAPI = new PokeAPI();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pokeAPI;
}
