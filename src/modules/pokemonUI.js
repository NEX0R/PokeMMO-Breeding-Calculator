/**
 * Pokemon UI Controller
 * Handles all UI interactions for Pokemon management
 */

document.addEventListener("DOMContentLoaded", function() {
    // Get UI elements
    const myPokemonTab = document.getElementById("my-pokemon-tab");
    const myPokemonContainer = document.getElementById("my-pokemon-container");
    const uploadButton = document.getElementById("upload-screenshots-btn");
    const screenshotInput = document.getElementById("screenshot-input");
    const ocrProgress = document.getElementById("ocr-progress");
    const ocrProgressText = document.getElementById("ocr-progress-text");
    const ocrProgressBar = document.getElementById("ocr-progress-bar");
    const pokemonPreviewList = document.getElementById("pokemon-preview-list");
    const pokemonCardsContainer = document.getElementById("pokemon-cards-container");
    const ownedCountSpan = document.getElementById("owned-count");

    // Pending Pokemon (awaiting nature input)
    // Exposed to window for editIV function
    window.pendingPokemon = [];

    // Tab switching logic
    myPokemonTab.addEventListener("click", function() {
        showMyPokemonTab();
    });

    function showMyPokemonTab() {
        // Hide all other tabs
        document.getElementById("gender-container").style.display = "none";
        document.getElementById("powers-container").style.display = "none";
        document.getElementById("prices-container").style.display = "none";

        // Show my pokemon tab
        myPokemonContainer.style.display = "block";

        // Update tab selection
        document.querySelectorAll(".trapezoid").forEach(t => t.classList.remove("selected"));
        myPokemonTab.classList.add("selected");

        // Load and display owned Pokemon
        refreshOwnedPokemonList();
    }

    // Upload button click
    uploadButton.addEventListener("click", function() {
        screenshotInput.click();
    });

    // Screenshot file selection
    screenshotInput.addEventListener("change", async function(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        await processScreenshots(files);

        // Reset input
        e.target.value = '';
    });

    /**
     * Process uploaded screenshots with OCR
     */
    async function processScreenshots(files) {
        // Show progress
        ocrProgress.style.display = "block";
        pokemonPreviewList.innerHTML = "";
        window.pendingPokemon = [];

        try {
            // Process images with OCR
            const results = await pokemonOCR.processMultipleScreenshots(files, (progress) => {
                ocrProgressText.textContent = `${progress.percentage}%`;
                ocrProgressBar.style.width = `${progress.percentage}%`;
            });

            // Hide progress
            ocrProgress.style.display = "none";

            // Display results for user verification
            displayPokemonPreviews(results);

        } catch (error) {
            console.error('Error processing screenshots:', error);
            alert('Error processing screenshots. Please try again.');
            ocrProgress.style.display = "none";
        }
    }

    /**
     * Display Pokemon previews with nature selection
     */
    function displayPokemonPreviews(pokemonList) {
        if (pokemonList.length === 0) {
            pokemonPreviewList.innerHTML = '<p>No Pokemon data could be extracted. Please ensure screenshots are clear.</p>';
            return;
        }

        pokemonPreviewList.innerHTML = '<h3>Review and Add Pokemon</h3><p>Please select the nature for each Pokemon:</p>';

        window.pendingPokemon = pokemonList;

        pokemonList.forEach((pokemon, index) => {
            const card = createPokemonPreviewCard(pokemon, index);
            pokemonPreviewList.appendChild(card);
        });

        // Add save all button
        const saveAllButton = document.createElement('div');
        saveAllButton.className = 'center pokemmo-button';
        saveAllButton.innerHTML = '<button id="save-all-pokemon-btn">Save All Pokemon</button>';
        pokemonPreviewList.appendChild(saveAllButton);

        document.getElementById('save-all-pokemon-btn').addEventListener('click', saveAllPendingPokemon);
    }

    /**
     * Create a preview card for a Pokemon awaiting nature input
     */
    function createPokemonPreviewCard(pokemon, index) {
        const card = document.createElement('div');
        card.className = 'pokemon-preview-card';

        const perfectIVCount = pokemonOCR.getPerfectIVCount(pokemon.ivs);
        const perfectStats = pokemonOCR.getPerfectStats(pokemon.ivs);

        // Count extracted IVs
        const extractedIVCount = Object.values(pokemon.ivs).filter(iv => iv !== null).length;
        const hasAllIVs = extractedIVCount === 6;

        // Warning if not all IVs extracted
        const warningHTML = !hasAllIVs ? `
            <div class="extraction-warning">
                ⚠️ Warning: Only ${extractedIVCount}/6 IVs extracted. You can manually edit missing values by clicking on them.
            </div>
        ` : '';

        card.innerHTML = `
            <div class="pokemon-card-header">
                <h4>${pokemon.name || 'Unknown Pokemon'} ${pokemon.gender === 'male' ? '♂' : pokemon.gender === 'female' ? '♀' : ''}</h4>
                <span class="iv-count ${!hasAllIVs ? 'incomplete' : ''}">${perfectIVCount}x31 (${extractedIVCount}/6 IVs)</span>
            </div>
            <div class="pokemon-card-body">
                ${warningHTML}
                <div class="iv-display">
                    <div class="iv-stat ${pokemon.ivs.hp === 31 ? 'perfect' : pokemon.ivs.hp === null ? 'missing' : ''}"
                         data-stat="hp" data-index="${index}" onclick="editIV(this)">
                        HP: <span class="iv-value">${pokemon.ivs.hp ?? '?'}</span>
                    </div>
                    <div class="iv-stat ${pokemon.ivs.attack === 31 ? 'perfect' : pokemon.ivs.attack === null ? 'missing' : ''}"
                         data-stat="attack" data-index="${index}" onclick="editIV(this)">
                        Atk: <span class="iv-value">${pokemon.ivs.attack ?? '?'}</span>
                    </div>
                    <div class="iv-stat ${pokemon.ivs.defense === 31 ? 'perfect' : pokemon.ivs.defense === null ? 'missing' : ''}"
                         data-stat="defense" data-index="${index}" onclick="editIV(this)">
                        Def: <span class="iv-value">${pokemon.ivs.defense ?? '?'}</span>
                    </div>
                    <div class="iv-stat ${pokemon.ivs.spAttack === 31 ? 'perfect' : pokemon.ivs.spAttack === null ? 'missing' : ''}"
                         data-stat="spAttack" data-index="${index}" onclick="editIV(this)">
                        SpA: <span class="iv-value">${pokemon.ivs.spAttack ?? '?'}</span>
                    </div>
                    <div class="iv-stat ${pokemon.ivs.spDefense === 31 ? 'perfect' : pokemon.ivs.spDefense === null ? 'missing' : ''}"
                         data-stat="spDefense" data-index="${index}" onclick="editIV(this)">
                        SpD: <span class="iv-value">${pokemon.ivs.spDefense ?? '?'}</span>
                    </div>
                    <div class="iv-stat ${pokemon.ivs.speed === 31 ? 'perfect' : pokemon.ivs.speed === null ? 'missing' : ''}"
                         data-stat="speed" data-index="${index}" onclick="editIV(this)">
                        Spe: <span class="iv-value">${pokemon.ivs.speed ?? '?'}</span>
                    </div>
                </div>
                <div class="nature-select">
                    <label>Nature:</label>
                    <select class="nature-input" data-index="${index}">
                        <option value="">-- Select Nature --</option>
                        ${getNatureOptions()}
                    </select>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Get HTML options for nature selection
     */
    function getNatureOptions() {
        const natures = [
            'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
            'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
            'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
            'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
            'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
        ];

        return natures.map(nature => `<option value="${nature}">${nature}</option>`).join('');
    }

    /**
     * Save all pending Pokemon to storage
     */
    async function saveAllPendingPokemon() {
        const natureInputs = document.querySelectorAll('.nature-input');
        let hasErrors = false;

        // Validate all natures are selected
        natureInputs.forEach(input => {
            if (!input.value) {
                input.style.borderColor = 'red';
                hasErrors = true;
            } else {
                input.style.borderColor = '';
            }
        });

        if (hasErrors) {
            alert('Please select a nature for all Pokemon');
            return;
        }

        // Add natures to pending Pokemon
        natureInputs.forEach((input, index) => {
            if (window.pendingPokemon[index]) {
                window.pendingPokemon[index].nature = input.value;
            }
        });

        // Fetch egg groups for each Pokemon
        for (const pokemon of window.pendingPokemon) {
            if (pokemon.name) {
                try {
                    const eggGroups = await pokeAPI.getEggGroups(pokemon.name.toLowerCase());
                    pokemon.eggGroups = eggGroups;
                } catch (error) {
                    console.error(`Error fetching egg groups for ${pokemon.name}:`, error);
                    pokemon.eggGroups = [];
                }
            }
        }

        // Save to storage
        pokemonStorage.addMultiplePokemon(window.pendingPokemon);

        // Clear preview
        pokemonPreviewList.innerHTML = '<p class="success">✓ Pokemon saved successfully!</p>';
        window.pendingPokemon = [];

        // Refresh owned Pokemon list
        setTimeout(() => {
            pokemonPreviewList.innerHTML = '';
            refreshOwnedPokemonList();
        }, 2000);
    }

    /**
     * Refresh the owned Pokemon list display
     */
    function refreshOwnedPokemonList() {
        const ownedPokemon = pokemonStorage.getAll();
        ownedCountSpan.textContent = ownedPokemon.length;

        pokemonCardsContainer.innerHTML = '';

        if (ownedPokemon.length === 0) {
            pokemonCardsContainer.innerHTML = '<p>No Pokemon in collection yet. Upload screenshots to get started!</p>';
            return;
        }

        ownedPokemon.forEach(pokemon => {
            const card = createOwnedPokemonCard(pokemon);
            pokemonCardsContainer.appendChild(card);
        });
    }

    /**
     * Create a card for an owned Pokemon
     */
    function createOwnedPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.className = 'owned-pokemon-card';

        const genderSymbol = pokemon.gender === 'male' ? '♂' : pokemon.gender === 'female' ? '♀' : '';

        card.innerHTML = `
            <div class="pokemon-card-header">
                <h4>${pokemon.name || 'Unknown'} ${genderSymbol}</h4>
                <span class="iv-count">${pokemon.perfectIVCount}x31</span>
                <button class="delete-btn" data-id="${pokemon.id}">×</button>
            </div>
            <div class="pokemon-card-body">
                <div class="nature-display">Nature: <strong>${pokemon.nature}</strong></div>
                <div class="perfect-stats">Perfect IVs: ${pokemon.perfectStats.join(', ') || 'None'}</div>
                <div class="egg-groups">Egg Groups: ${pokemon.eggGroups.join(', ') || 'Unknown'}</div>
            </div>
        `;

        // Delete button handler
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Delete ${pokemon.name}?`)) {
                pokemonStorage.removePokemon(pokemon.id);
                refreshOwnedPokemonList();
            }
        });

        return card;
    }

    // Initial load
    if (myPokemonContainer.style.display === 'block') {
        refreshOwnedPokemonList();
    }

    console.log('Pokemon UI Controller loaded');
});

/**
 * Global function to edit IV value manually
 * Called when user clicks on an IV stat cell
 */
function editIV(element) {
    const stat = element.dataset.stat;
    const index = parseInt(element.dataset.index);
    const valueSpan = element.querySelector('.iv-value');
    const currentValue = valueSpan.textContent === '?' ? '' : valueSpan.textContent;

    const newValue = prompt(`Enter IV value for ${stat.toUpperCase()} (0-31):`, currentValue);

    if (newValue !== null) {
        const parsedValue = parseInt(newValue);

        if (isNaN(parsedValue) || parsedValue < 0 || parsedValue > 31) {
            alert('Invalid IV value. Must be between 0 and 31.');
            return;
        }

        // Update the pending Pokemon data
        if (window.pendingPokemon && window.pendingPokemon[index]) {
            window.pendingPokemon[index].ivs[stat] = parsedValue;

            // Update the display
            valueSpan.textContent = parsedValue;

            // Update classes
            element.classList.remove('missing');
            if (parsedValue === 31) {
                element.classList.add('perfect');
            } else {
                element.classList.remove('perfect');
            }

            // Update the header IV count
            const card = element.closest('.pokemon-preview-card');
            const extractedCount = Object.values(window.pendingPokemon[index].ivs).filter(iv => iv !== null).length;
            const perfectCount = Object.values(window.pendingPokemon[index].ivs).filter(iv => iv === 31).length;

            const ivCountSpan = card.querySelector('.iv-count');
            ivCountSpan.textContent = `${perfectCount}x31 (${extractedCount}/6 IVs)`;

            if (extractedCount === 6) {
                ivCountSpan.classList.remove('incomplete');

                // Remove warning if all IVs are now filled
                const warning = card.querySelector('.extraction-warning');
                if (warning) warning.remove();
            }
        }
    }
}
