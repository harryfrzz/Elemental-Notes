//Electron js base code
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

function createWindow () {
  const win = new BrowserWindow({
    width: 1600,
    height: 850,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
        height: 40,
        symbolColor: '#000000',
        color: '#0c101600'
    },
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false, 
    }
  });

  win.loadFile('index.html');
  win.removeMenu(null);
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

//IpcRenderer fetching md files
ipcMain.on('fetch-files', (event) => {
  const dirPath = path.join(os.homedir(), 'Elemental Notes');
  fs.readdir(dirPath, (err, files) => {
      if (err) {
          console.error('Error reading directory:', err);
          return;
      }
      const mdFiles = files.filter(file => path.extname(file) === '.md');
      event.reply('files-list', mdFiles);
  });
});

ipcMain.on('open-file', (event, fileName) => {
  const filePath = path.join(os.homedir(), 'Elemental Notes', fileName);
  fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
          console.error('Error reading file:', err);
          return;
      }

      event.reply('file-content', data);
  });
});

ipcMain.on('delete-file', (event, fileName) => {
  const filePath = path.join(os.homedir(), 'Elemental Notes', fileName);
  fs.unlink(filePath, (err) => {
      if (err) {
          console.error('Error deleting file:', err);
          return;
      }
      event.reply('file-deleted', fileName);
  });
});

//Ipc renderer saving file dialog
ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog({
      title: 'Save Markdown File',
      defaultPath: options.defaultPath,
      filters: [
          { name: 'Markdown Files', extensions: ['md', 'txt'] }
      ]
  });
  return result;
});

//Ipc renderer opening file dialog
ipcMain.handle('show-open-dialog', async (event) => {
  const result = await dialog.showOpenDialog({
      title: 'Open Markdown File',
      filters: [
          { name: 'Markdown Files', extensions: ['md', 'txt'] }
      ],
      properties: ['openFile']
  });
  return result;
});

ipcMain.on('save-file', (event, filePath, content) => {
  fs.writeFile(filePath, content, (err) => {
      if (err) {
          event.reply('save-file-error', 'Failed to save file');
          throw err;
      }
      event.reply('save-file-success', 'File saved successfully');
  });
});
