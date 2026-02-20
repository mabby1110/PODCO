const { app, BrowserWindow, Menu } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800,
		icon: path.join(__dirname, 'assets', 'icon.ico'),
		autoHideMenuBar: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			devTools: false
		}
	});

	Menu.setApplicationMenu(null);
	win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
	const serverPath = app.isPackaged
		? path.join(process.resourcesPath, 'app/build/index.js')
		: path.join(__dirname, '../app/build/index.js');

	serverProcess = spawn('node', [serverPath], {
		stdio: 'inherit',
		env: {
			...process.env,
			ORIGIN: 'http://localhost:3000'
		}
	});

	setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
	if (serverProcess) serverProcess.kill();
	app.quit();
});
