<p align="center">
  <img src="img/Logo HQ.png" />
</p>

<p align="center">
<a href="https://unovamata.github.io/PokeMMO-Breeding-Calculator/"><img src="https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white" alt="Github Pages" style="max-width: 100%;"></a>
<a href="https://discord.com/invite/QYtFgfactF"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white" alt="Discord" style="max-width: 100%;"></a>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000" alt="JavaScript" style="max-width: 100%;">
<img src="https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white" alt="HTML" style="max-width: 100%;">
<img src="https://img.shields.io/badge/CSS-1572B6?logo=css3&logoColor=fff" alt="CSS" style="max-width: 100%;">
<a href="https://buymeacoffee.com/unovamata" rel="nofollow"><img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?&logo=buy-me-a-coffee&logoColor=black" alt="language" data-canonical-src="https://img.shields.io/badge/language-C%23-239120" style="max-width: 100%;"></a>
<a href="#-license"><img src="https://camo.githubusercontent.com/e068aab9ad54f8abd594ba95159ea67f28d35e0a55fca906278ad5d1be6c4c99/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f667265655f666f725f6e6f6e5f636f6d6d65726369616c5f7573652d627269676874677265656e" alt="Free" data-canonical-src="https://img.shields.io/badge/free_for_non_commercial_use-brightgreen" style="max-width: 100%;"></a>
</p>

# PokéMMO Breeding Calculator

**[The PokéMMO Breeding Calculator](https://unovamata.github.io/PokeMMO-Breeding-Calculator/)** is a powerful desktop and web application designed to optimize the breeding process in PokéMMO. Using advanced algorithms and OCR technology, it helps you create the perfect Pokémon while minimizing costs and maximizing efficiency.

## 🌟 Key Features

### Core Breeding Features
- **Breed Mapping:** Visual tree structure showing all breeding combinations needed for your desired Pokémon
- **Optimal Cost Allocation:** Automatically selects the cheapest breeding path based on market prices and owned Pokémon
- **Battle Point Optimization:** Smart BP usage to minimize investment while maximizing profit
- **Flexible Item Pricing:** Variable Everstone and breeding item prices based on current market
- **Toggle Breed Map Branches:** Deactivate specific breeding paths to customize your strategy
- **Zoom Controls:** Scale the breeding tree for better visualization

### 🆕 Advanced Features (v2.0)
- **📷 OCR Screenshot Import:** Upload multiple screenshots to automatically extract Pokémon IVs
  - Powered by Tesseract.js for accurate text recognition
  - Batch processing for multiple Pokémon at once
  - Manual nature selection for complete data

- **💾 Owned Pokémon Management:** Track your Pokémon collection
  - Automatic IV detection from screenshots
  - Gender and nature tracking
  - Perfect IV highlighting
  - Cost optimization using owned Pokémon (cost = 0)

- **🧬 Egg Group Validation:** Automatic breeding compatibility checking
  - Integration with PokéAPI for accurate egg group data
  - Ensures breeding pairs are compatible
  - Prevents costly mistakes

- **💻 Desktop Application:** Available as standalone .exe installer
  - Built with Electron for native desktop experience
  - Offline OCR processing for privacy
  - Local data storage for owned Pokémon
  - Faster performance than web version

<br>
<p align="center">
  <img src="https://raw.githubusercontent.com/Unovamata/PokeMMO-Breeding-Calculator/refs/heads/main/img/screenshot.png" style="max-width: 50%; max-height: 50%"  />
</p>

# Table of Contents

* [Installation](#installation)
* [How to Use](#how-to-use)
  * [Web Version](#web-version)
  * [Desktop Version](#desktop-version)
  * [Managing Owned Pokémon](#managing-owned-pokémon)
  * [Calculating Breeding Costs](#calculating-breeding-costs)
* [Development](#development)
* [Technologies Used](#technologies-used)
* [Contact](#contact)

# Installation

## Web Version
Simply navigate to **[The PokéMMO Breeding Calculator](https://unovamata.github.io/PokeMMO-Breeding-Calculator/)** and start using it immediately.

## Desktop Version

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Building from Source
```bash
# Clone the repository
git clone https://github.com/Unovamata/PokeMMO-Breeding-Calculator.git
cd PokeMMO-Breeding-Calculator

# Install dependencies
npm install

# Run in development mode
npm start

# Build installer for Windows
npm run build

# Build for other platforms
npm run build:mac    # macOS
npm run build:linux  # Linux
```

The installer will be generated in the `dist/` folder.

# How to Use

## Web Version
1. Navigate to the web app
2. Configure market prices and owned items
3. Select desired IVs
4. Click "Calculate" to see your breeding strategy

## Desktop Version
1. Download and install the .exe from releases
2. Launch the application
3. Use all web features plus:
   - Upload screenshots for OCR
   - Manage owned Pokémon offline
   - Faster performance

## Managing Owned Pokémon

### Adding Pokémon via Screenshots (Desktop Only)
1. Click the **Pokéball tab** (My Pokémon)
2. Click **"📷 Upload Screenshots"**
3. Select one or more screenshots of your Pokémon
4. Wait for OCR processing
5. Review extracted IVs and select nature for each Pokémon
6. Click **"Save All Pokémon"**

### Manual Management
- View all owned Pokémon in the "My Pokémon" tab
- Each card shows:
  - Pokémon name and gender
  - Perfect IV count (e.g., 3x31)
  - Nature
  - Perfect stats
  - Egg groups
- Delete Pokémon by clicking the **×** button

## Calculating Breeding Costs

### Step 1: Configure Market Prices
- Navigate to the **Egg tab** (Breeders Prices)
- Enter current GTL prices for 1x31 breeders (male and female)
- Set gender selection cost

### Step 2: Select Target IVs
- Go to the **Weight/Brace tab** (Stats to Breed)
- Check the IVs you want in your final Pokémon
- Enter items you already own in inventory
- **(Optional)** Enter Battle Points to use for buying braces
- Set current Everstone market price

### Step 3: Calculate
- Click the **"Calculate"** button
- View results in the **Pokéball/Money tab** (Costs):
  - Total breeding cost
  - Items to purchase
  - Battle Points to spend
  - Visual breeding tree

### Understanding the Breeding Tree
- Each node shows a breeding step
- Checkboxes let you disable specific branches
- Green highlighting shows which IV is being passed
- The algorithm automatically uses owned Pokémon when available (reducing cost to 0)

# Development

## Project Structure
```
PokeMMO-Breeding-Calculator/
├── src/
│   ├── electron/         # Electron main process
│   │   └── main.js
│   ├── modules/          # Application modules
│   │   ├── pokeapi.js   # PokéAPI integration
│   │   ├── ocr.js       # OCR with Tesseract.js
│   │   ├── pokemonStorage.js  # Pokemon data storage
│   │   └── pokemonUI.js       # UI controller
│   └── data/            # Static data files
├── index.html           # Main HTML
├── calculator.js        # Core breeding algorithm
├── utils.js            # Utility functions
├── style.css           # Styles
├── fonts/              # Custom fonts
├── img/                # Images and logos
├── stats/              # UI icons
└── package.json        # Dependencies and scripts
```

## Technologies Used
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Desktop:** Electron 28
- **OCR:** Tesseract.js 5.0
- **API:** PokéAPI (free, no key required)
- **Build:** electron-builder

## Contributing
See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

# Contact

You can contact me in Discord as ZenAkiSen or using Rhombusoft's server invite! <a href="https://discord.com/invite/QYtFgfactF"><img src="https://img.shields.io/badge/Discord-%235865F2.svg?&logo=discord&logoColor=white" alt="Discord" style="max-width: 100%;"></a>
