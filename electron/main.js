const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;

// Em produção, o banco de dados precisa estar em um local gravável (AppData)
const userDataPath = app.getPath('userData');
const dbSource = path.join(process.resourcesPath, 'prisma/dev.db');
const dbDest = path.join(userDataPath, 'dev.db');

// Configura variáveis de ambiente para o Next.js/Prisma saberem onde está o banco
process.env.DATABASE_URL = `file:${dbDest}`;

function setupDatabase() {
    if (app.isPackaged) {
        try {
            // Se o banco não existe no AppData, copia do resources
            if (!fs.existsSync(dbDest)) {
                if (fs.existsSync(dbSource)) {
                    fs.copyFileSync(dbSource, dbDest);
                    console.log('Database copied to', dbDest);
                } else {
                    // Se não tiver DB pré-existente, o Prisma deve criar via migration (difícil em prod sem binário)
                    // Ideal: empacotar um db vazio inicializado.
                    console.log('No source database found to copy.');
                }
            }
        } catch (error) {
            console.error('Database setup failed:', error);
        }
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: "Finance",
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        autoHideMenuBar: true,
    });

    const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000';
    mainWindow.loadURL(startUrl);

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', () => {
    setupDatabase();

    // Inicia o servidor Next.js se estiver empacotado
    if (app.isPackaged) {
        const nextServer = spawn(path.join(process.resourcesPath, 'node_modules', '.bin', 'next'), ['start'], {
            cwd: __dirname,
            env: { ...process.env, PORT: 3000 }
        });

        // Aguarda um pouco para garantir que o server subiu (approach simples)
        setTimeout(createWindow, 3000);
    } else {
        createWindow();
    }
});

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
