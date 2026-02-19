const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let serverProcess;

function createWindow() {
	const win = new BrowserWindow({
		width: 1200,
		height: 800
	});

	win.loadURL('http://localhost:3000');
}

app.whenReady().then(() => {
	serverProcess = spawn(
		'node',
		[path.join(__dirname, '../app/build/index.js')],
		{
			stdio: 'inherit',
			env: {
				...process.env,
				ORIGIN: 'http://localhost:3000'
			}
		}
	);

	setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
	if (serverProcess) serverProcess.kill();
	app.quit();
});
