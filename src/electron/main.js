const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 800,
        icon: path.join(__dirname, '../../img/logo.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    // Load the index.html file
    mainWindow.loadFile(path.join(__dirname, '../../index.html'));

    // Open DevTools in development mode
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// Initialize app
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

// IPC handlers for OCR and file operations
ipcMain.handle('select-screenshots', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'bmp', 'webp'] }
        ],
        title: 'Select Pokemon Screenshots'
    });

    if (!result.canceled) {
        return result.filePaths;
    }
    return [];
});

// Handle save pokemon data
ipcMain.handle('save-pokemon-data', async (event, pokemonData) => {
    const fs = require('fs');
    const dataPath = path.join(app.getPath('userData'), 'owned-pokemon.json');

    try {
        fs.writeFileSync(dataPath, JSON.stringify(pokemonData, null, 2));
        return { success: true };
    } catch (error) {
        console.error('Error saving pokemon data:', error);
        return { success: false, error: error.message };
    }
});

// Handle load pokemon data
ipcMain.handle('load-pokemon-data', async () => {
    const fs = require('fs');
    const dataPath = path.join(app.getPath('userData'), 'owned-pokemon.json');

    try {
        if (fs.existsSync(dataPath)) {
            const data = fs.readFileSync(dataPath, 'utf8');
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error('Error loading pokemon data:', error);
        return [];
    }
});

console.log('PokeMMO Breeding Calculator - Electron App Started');
