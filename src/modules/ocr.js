/**
 * OCR Module using Tesseract.js
 * Handles screenshot processing and Pokemon IV extraction
 */

// Tesseract will be loaded via CDN in the HTML
// This module provides wrapper functions for Pokemon-specific OCR

class PokemonOCR {
    constructor() {
        this.worker = null;
        this.isInitialized = false;
    }

    /**
     * Initialize Tesseract worker
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Create a Tesseract worker
            this.worker = await Tesseract.createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            });

            this.isInitialized = true;
            console.log('Tesseract OCR initialized');
        } catch (error) {
            console.error('Error initializing OCR:', error);
            throw error;
        }
    }

    /**
     * Process a single screenshot to extract Pokemon data
     * @param {string|File} image - Image file path or File object
     * @returns {Promise<Object>} Extracted Pokemon data
     */
    async processPokemonScreenshot(image) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const { data: { text } } = await this.worker.recognize(image);

            // Parse the OCR text to extract Pokemon data
            const pokemonData = this.parsePokemonData(text);

            return pokemonData;
        } catch (error) {
            console.error('Error processing screenshot:', error);
            return null;
        }
    }

    /**
     * Process multiple screenshots in parallel
     * @param {Array<string|File>} images - Array of image paths or File objects
     * @param {Function} progressCallback - Callback for progress updates
     * @returns {Promise<Array<Object>>} Array of extracted Pokemon data
     */
    async processMultipleScreenshots(images, progressCallback = null) {
        const results = [];

        for (let i = 0; i < images.length; i++) {
            try {
                const pokemonData = await this.processPokemonScreenshot(images[i]);
                if (pokemonData) {
                    results.push(pokemonData);
                }

                if (progressCallback) {
                    progressCallback({
                        current: i + 1,
                        total: images.length,
                        percentage: Math.round(((i + 1) / images.length) * 100)
                    });
                }
            } catch (error) {
                console.error(`Error processing image ${i + 1}:`, error);
            }
        }

        return results;
    }

    /**
     * Parse OCR text to extract Pokemon IV data
     * @param {string} text - OCR extracted text
     * @returns {Object} Parsed Pokemon data
     */
    parsePokemonData(text) {
        const data = {
            name: null,
            gender: null,
            level: null,
            ivs: {
                hp: null,
                attack: null,
                defense: null,
                spAttack: null,
                spDefense: null,
                speed: null
            },
            nature: null, // To be set manually
            raw: text
        };

        // Common patterns in PokeMMO screenshots
        const lines = text.split('\n').map(line => line.trim());

        // Try to extract Pokemon name (usually at the top)
        const nameMatch = lines.find(line => /^[A-Z][a-z]+/.test(line));
        if (nameMatch) {
            data.name = nameMatch.match(/^[A-Z][a-z]+/)[0];
        }

        // Extract gender (♂ or ♀)
        if (text.includes('♂') || text.toLowerCase().includes('male')) {
            data.gender = 'male';
        } else if (text.includes('♀') || text.toLowerCase().includes('female')) {
            data.gender = 'female';
        }

        // Extract level
        const levelMatch = text.match(/Lv\.?\s*(\d+)/i) || text.match(/Level\s*(\d+)/i);
        if (levelMatch) {
            data.level = parseInt(levelMatch[1]);
        }

        // Extract IVs - looking for patterns like "HP: 31" or "31/31/31/31/31/31"
        const ivPatterns = {
            hp: /HP[:\s]+(\d+)/i,
            attack: /(?:Attack|Atk)[:\s]+(\d+)/i,
            defense: /(?:Defense|Def)[:\s]+(\d+)/i,
            spAttack: /(?:Sp\.?\s*(?:Attack|Atk)|Special Attack)[:\s]+(\d+)/i,
            spDefense: /(?:Sp\.?\s*(?:Defense|Def)|Special Defense)[:\s]+(\d+)/i,
            speed: /(?:Speed|Spd)[:\s]+(\d+)/i
        };

        for (const [stat, pattern] of Object.entries(ivPatterns)) {
            const match = text.match(pattern);
            if (match) {
                const value = parseInt(match[1]);
                // Only accept valid IV values (0-31)
                if (value >= 0 && value <= 31) {
                    data.ivs[stat] = value;
                }
            }
        }

        // Alternative: try to find IV format like "31/25/31/15/31/31"
        const ivStringMatch = text.match(/(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})/);
        if (ivStringMatch) {
            const ivValues = ivStringMatch.slice(1, 7).map(v => parseInt(v));
            if (ivValues.every(v => v >= 0 && v <= 31)) {
                [data.ivs.hp, data.ivs.attack, data.ivs.defense,
                 data.ivs.spAttack, data.ivs.spDefense, data.ivs.speed] = ivValues;
            }
        }

        return data;
    }

    /**
     * Get count of perfect IVs (31s)
     * @param {Object} ivs - IV object
     * @returns {number} Count of 31 IVs
     */
    getPerfectIVCount(ivs) {
        return Object.values(ivs).filter(iv => iv === 31).length;
    }

    /**
     * Get which stats have perfect IVs
     * @param {Object} ivs - IV object
     * @returns {Array<string>} Array of stat names with 31 IVs
     */
    getPerfectStats(ivs) {
        const perfectStats = [];
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
                perfectStats.push(statNames[key]);
            }
        }

        return perfectStats;
    }

    /**
     * Terminate the worker
     */
    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isInitialized = false;
        }
    }
}

// Create singleton instance
const pokemonOCR = new PokemonOCR();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = pokemonOCR;
}
