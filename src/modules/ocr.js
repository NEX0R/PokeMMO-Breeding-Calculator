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
     * EXTRACTS: Name, Gender (♂/♀), Level, ALL 6 IVs (HP/Atk/Def/SpA/SpD/Spe)
     * @param {string} text - OCR extracted text
     * @returns {Object} Parsed Pokemon data with all 6 IVs
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
            raw: text,
            extractionLog: [] // For debugging
        };

        // Normalize text for better matching
        const normalizedText = text.replace(/\s+/g, ' ').trim();
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // === EXTRACT POKEMON NAME ===
        // Try multiple patterns for Pokemon name
        const namePatterns = [
            /^([A-Z][a-z]+(?:-[A-Z][a-z]+)?)/m,  // Standard: Pikachu, Ho-Oh
            /Name[:\s]+([A-Z][a-z]+)/i,           // "Name: Pikachu"
            /Pokemon[:\s]+([A-Z][a-z]+)/i         // "Pokemon: Pikachu"
        ];

        for (const pattern of namePatterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                data.name = match[1];
                data.extractionLog.push(`Name found: ${match[1]}`);
                break;
            }
        }

        // If no name found, try first capitalized word
        if (!data.name) {
            const firstCapitalized = lines.find(line => /^[A-Z][a-z]{2,}/.test(line));
            if (firstCapitalized) {
                data.name = firstCapitalized.match(/^[A-Z][a-z]+/)[0];
                data.extractionLog.push(`Name from first line: ${data.name}`);
            }
        }

        // === EXTRACT GENDER ===
        // Check for gender symbols or text
        if (text.includes('♂') || text.includes('(M)') || /\bMale\b/i.test(text)) {
            data.gender = 'male';
            data.extractionLog.push('Gender: male');
        } else if (text.includes('♀') || text.includes('(F)') || /\bFemale\b/i.test(text)) {
            data.gender = 'female';
            data.extractionLog.push('Gender: female');
        }

        // === EXTRACT LEVEL ===
        const levelPatterns = [
            /Lv\.?\s*(\d+)/i,
            /Level[:\s]+(\d+)/i,
            /L\.?\s*(\d+)/
        ];

        for (const pattern of levelPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.level = parseInt(match[1]);
                data.extractionLog.push(`Level found: ${data.level}`);
                break;
            }
        }

        // === EXTRACT ALL 6 IVs - MULTIPLE METHODS ===

        // METHOD 1: Labeled format (most common in PokeMMO)
        // Example: "HP: 31  Attack: 25  Defense: 31"
        const ivPatterns = {
            hp: [
                /HP[:\s]+(\d{1,2})/i,
                /Health[:\s]+(\d{1,2})/i,
                /Hit Points[:\s]+(\d{1,2})/i
            ],
            attack: [
                /Attack[:\s]+(\d{1,2})/i,
                /Atk[:\s]+(\d{1,2})/i,
                /ATK[:\s]+(\d{1,2})/
            ],
            defense: [
                /Defense[:\s]+(\d{1,2})/i,
                /Def[:\s]+(\d{1,2})/i,
                /DEF[:\s]+(\d{1,2})/
            ],
            spAttack: [
                /Sp\.?\s*Attack[:\s]+(\d{1,2})/i,
                /Sp\.?\s*Atk[:\s]+(\d{1,2})/i,
                /Special Attack[:\s]+(\d{1,2})/i,
                /Sp\s*A[:\s]+(\d{1,2})/i,
                /SPATK[:\s]+(\d{1,2})/i
            ],
            spDefense: [
                /Sp\.?\s*Defense[:\s]+(\d{1,2})/i,
                /Sp\.?\s*Def[:\s]+(\d{1,2})/i,
                /Special Defense[:\s]+(\d{1,2})/i,
                /Sp\s*D[:\s]+(\d{1,2})/i,
                /SPDEF[:\s]+(\d{1,2})/i
            ],
            speed: [
                /Speed[:\s]+(\d{1,2})/i,
                /Spd[:\s]+(\d{1,2})/i,
                /SPE[:\s]+(\d{1,2})/i
            ]
        };

        for (const [stat, patterns] of Object.entries(ivPatterns)) {
            for (const pattern of patterns) {
                const match = text.match(pattern);
                if (match) {
                    const value = parseInt(match[1]);
                    // Only accept valid IV values (0-31)
                    if (value >= 0 && value <= 31) {
                        data.ivs[stat] = value;
                        data.extractionLog.push(`${stat}: ${value} (labeled)`);
                        break;
                    }
                }
            }
        }

        // METHOD 2: Slash-separated format "31/25/31/15/31/31" (HP/Atk/Def/SpA/SpD/Spe)
        const slashPatterns = [
            /(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})\s*\/\s*(\d{1,2})/,
            /IVs?[:\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})[\/\s]+(\d{1,2})/i
        ];

        for (const pattern of slashPatterns) {
            const match = normalizedText.match(pattern);
            if (match) {
                const ivValues = match.slice(1, 7).map(v => parseInt(v));
                // Validate all values are 0-31
                if (ivValues.every(v => v >= 0 && v <= 31)) {
                    // Only overwrite null values (prefer labeled IVs)
                    if (data.ivs.hp === null) data.ivs.hp = ivValues[0];
                    if (data.ivs.attack === null) data.ivs.attack = ivValues[1];
                    if (data.ivs.defense === null) data.ivs.defense = ivValues[2];
                    if (data.ivs.spAttack === null) data.ivs.spAttack = ivValues[3];
                    if (data.ivs.spDefense === null) data.ivs.spDefense = ivValues[4];
                    if (data.ivs.speed === null) data.ivs.speed = ivValues[5];

                    data.extractionLog.push(`IVs from slash format: ${ivValues.join('/')}`);
                    break;
                }
            }
        }

        // METHOD 3: Table/Grid format - look for 6 numbers in sequence that are all ≤31
        const allNumbers = normalizedText.match(/\b(\d{1,2})\b/g);
        if (allNumbers && data.ivs.hp === null) {
            const validIVs = allNumbers
                .map(n => parseInt(n))
                .filter(n => n >= 0 && n <= 31);

            // If we found exactly 6 valid IV values, assume they're in order
            if (validIVs.length >= 6) {
                const ivSequence = validIVs.slice(0, 6);
                if (data.ivs.hp === null) data.ivs.hp = ivSequence[0];
                if (data.ivs.attack === null) data.ivs.attack = ivSequence[1];
                if (data.ivs.defense === null) data.ivs.defense = ivSequence[2];
                if (data.ivs.spAttack === null) data.ivs.spAttack = ivSequence[3];
                if (data.ivs.spDefense === null) data.ivs.spDefense = ivSequence[4];
                if (data.ivs.speed === null) data.ivs.speed = ivSequence[5];

                data.extractionLog.push(`IVs from number sequence: ${ivSequence.join(', ')}`);
            }
        }

        // Log extraction results
        const extractedIVs = Object.entries(data.ivs)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}:${value}`)
            .join(', ');

        console.log('OCR Extraction Results:', {
            name: data.name,
            gender: data.gender,
            level: data.level,
            ivs: extractedIVs || 'NONE',
            ivCount: Object.values(data.ivs).filter(v => v !== null).length
        });

        if (Object.values(data.ivs).filter(v => v !== null).length < 6) {
            console.warn('⚠️ WARNING: Less than 6 IVs extracted! Check screenshot quality or OCR accuracy.');
            console.log('Raw OCR text:', text);
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
