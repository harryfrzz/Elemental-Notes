const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const saveBtn = document.querySelector('.saveBtn');
const saveAsBtn = document.querySelector('.saveAsBtn'); // New save as button
const statusPill = document.getElementById('statusPill');
const statusName = document.getElementById('statusName');
const textAreaContent = document.getElementById('markdown-content');
const popup = document.getElementById('popup');
const closePopup = document.getElementById('closePopup');
const goHomeBtn = document.querySelector('.goHomeBtn'); // New go home button
const newNoteBtn = document.getElementById('newNote'); // New note button
const emptyViewFiles = `<div id="emptyIlluFiles">
                    <img style="opacity: 0.8; margin-top: 40px; user-select:none;" height="90" src="res/juicy-sleeping-cat.png">
                    <h3 style="font-weight: 600; color: black; font-size: 1.3em;
                    margin-top: 75px; user-select: none;">It looks a little empty here.<br>Add some Notes by clicking the <strong>+</strong> icon!</h3>
                </div>`;

const ELEMENTAL_NOTES_DIR = path.join(require('os').homedir(), 'Elemental Notes');
let currentFilePath = null;
let isNewNote = false;

window.onload = () => {
    if (!fs.existsSync(ELEMENTAL_NOTES_DIR)) {
        fs.mkdirSync(ELEMENTAL_NOTES_DIR);
    }
    ipcRenderer.send('fetch-files');
};

function renderMarkdown(content) {
    const htmlPreview = document.getElementById('html-preview');

    if (htmlPreview) {
        htmlPreview.innerHTML = marked(content);
        htmlPreview.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                shell.openExternal(link.href);
            });
        });
    }
}

if (textAreaContent) {
    textAreaContent.addEventListener('input', () => {
        renderMarkdown(textAreaContent.value);
    });
}

// Click actions
function statusPillDisplay(saveMssg){
    statusPill.style.opacity = '1';
    statusPill.style.display = 'flex';
    statusPill.style.animation = 'dynamicFileStatus 0.3s';
    statusName.textContent = saveMssg;
    setTimeout(removeStatusPill, 1000);
    setTimeout(removeStatusPillDisplay, 1500);
}

if (saveBtn) {
    saveBtn.addEventListener('click', async (event) => {
        const content = textAreaContent.value;
        if (currentFilePath && !isNewNote) {
            fs.writeFileSync(currentFilePath, content);
            ipcRenderer.send('save-file-success', 'File Saved');
            statusPillDisplay('File Saved');
        } else {
            const fileName = `note-${Date.now()}.md`;
            let filePath = path.join(ELEMENTAL_NOTES_DIR, fileName);
            let duplicateCount = 1;
            while (fs.existsSync(filePath)) {
                filePath = path.join(ELEMENTAL_NOTES_DIR, `note-${Date.now()} (duplicate-${duplicateCount}).md`);
                duplicateCount++;
            }
            fs.writeFileSync(filePath, content);
            currentFilePath = filePath;
            originalFileName = fileName;
            ipcRenderer.send('save-file-success', 'File Saved');
            statusPillDisplay('File Saved');
            isNewNote = false;
        }
        ipcRenderer.send('fetch-files');
    });
}

if (saveAsBtn) {
    saveAsBtn.addEventListener('click', async () => {
        const content = textAreaContent.value;

        const result = await ipcRenderer.invoke('show-save-dialog', {
            defaultPath: `note-${Date.now()}.md`
        });

        if (result.canceled || !result.filePath) return;

        fs.writeFileSync(result.filePath, content);
        currentFilePath = result.filePath;
        if(currentFilePath){
            statusPillDisplay('File Saved');
        }
        originalFileName = path.basename(result.filePath);
        ipcRenderer.send('save-file-success', 'File Saved');
    });
}

if (closePopup) {
    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });
}

// Event listener for newNoteBtn
if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => {
        textAreaContent.value = ''; // Clear the text field
        currentFilePath = null; // Reset currentFilePath
        isNewNote = true; // Set the flag to indicate a new note is being created
        editWindow(); // Open the HTML and markdown previews
    });
}

// Save file
ipcRenderer.on('save-file-success', (event, message) => {
    statusPill.style.opacity = '1';
    statusPill.style.display = 'flex';
    statusPill.style.animation = 'dynamicFileStatus 0.3s';
    statusName.textContent = 'File Saved';
    setTimeout(removeStatusPill, 2000);
    setTimeout(removeStatusPillDisplay, 2500);
});

ipcRenderer.on('save-file-error', (event, message) => {
    console.error(message);
});

// Opening File
ipcRenderer.on('file-content', (event, content) => {
    statusPill.style.opacity = '1';
    statusPill.style.display = 'flex';
    statusPill.style.animation = 'dynamicFileStatus 0.3s';
    statusName.textContent = 'File Opened';
    setTimeout(removeStatusPill, 1000);
    setTimeout(removeStatusPillDisplay, 1500);
    textAreaContent.value = content;
    renderMarkdown(content); // Render markdown
});

ipcRenderer.on('files-list', (event, files) => {
    const notesList = document.getElementById('recentNotes');
    notesList.innerHTML = '';

    files.forEach(file => {
        const filePath = path.join(ELEMENTAL_NOTES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const renderedContent = marked(content);

        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        const renderElement = document.createElement('div');
        renderElement.id = 'rendered-content';
        renderElement.innerHTML = renderedContent;
        noteElement.appendChild(renderElement);

        const deleteBtnDiv = document.createElement('div');
        deleteBtnDiv.className = 'button-container-1';

        const deleteButton = document.createElement('img');
        deleteButton.src = 'res/delete-black.png';
        deleteButton.height = '25';
        deleteButton.width = '25';
        deleteBtnDiv.appendChild(deleteButton);

        deleteButton.onclick = (e) => {
            e.stopPropagation();
            deleteFile(file, noteElement);
        };

        const exportBtnDiv = document.createElement('div');
        exportBtnDiv.className = 'button-container';

        const exportButton = document.createElement('img');
        exportButton.src = 'res/export.png';
        exportButton.height = '25';
        exportBtnDiv.appendChild(exportButton);

        exportButton.onclick = async (e) => {
            e.stopPropagation();
            const result = await ipcRenderer.invoke('show-save-dialog', {
                defaultPath: file,
                filters: [{ name: 'Markdown Files', extensions: ['md'] }]
            });

            if (result.canceled || !result.filePath) return;

            fs.writeFileSync(result.filePath, content);
        };

        noteElement.appendChild(deleteBtnDiv);
        noteElement.appendChild(exportBtnDiv);
        noteElement.onclick = () => {
            openFile(file);
            editWindow();
        };
        notesList.appendChild(noteElement);
    });

    if (notesList.children.length === 0) {
        notesList.innerHTML = emptyViewFiles;
    }
});

function editWindow(){
    const modeSelectorId = {
        recentButton: 'recentButton',
        tasksButton: 'tasksButton',
        settingButton: 'settingsButton',
        goHomeBtn: '.goHomeBtn',
        recentView: 'recentNotes',
        saveTools: 'saveTools',
        newNoteBtn: 'newNote',
        saveBtn: '.saveBtn',
        resizePill: 'resizePill',
        logoText: 'logoText',
        logoGroup: 'logo-backBtn-group',
        homeLogo: 'homeLogo'
    };

    const elementsToHide = [
        modeSelectorId.recentButton,
        modeSelectorId.tasksButton,
        modeSelectorId.settingButton,
        modeSelectorId.newNoteBtn,
        modeSelectorId.recentView
    ];

    elementsToHide.forEach(id => {
        document.getElementById(id).style.display = 'none';
    });

    document.getElementById(modeSelectorId.logoText).style.marginLeft = '0px';
    document.querySelector(modeSelectorId.goHomeBtn).style.display = 'flex';
    document.querySelector(modeSelectorId.goHomeBtn).style.gap = '20px';
    document.querySelector(modeSelectorId.goHomeBtn).style.marginBottom = '40px';
    document.getElementById(modeSelectorId.homeLogo).style.marginLeft = '30px';
    document.getElementById(modeSelectorId.homeLogo).style.display = 'block';
    document.querySelector(modeSelectorId.saveBtn).style.right = '60px';
    document.querySelector(modeSelectorId.saveBtn).style.display = 'flex';
    document.getElementById(modeSelectorId.saveTools).style.display = 'flex';
    document.getElementById(modeSelectorId.resizePill).style.display = 'block';
    textAreaContent.style.display = 'flex';
    document.getElementById('html-preview').style.display = 'block';
    document.getElementById('menuBar').style.display = 'flex';
}

// Function to delete the file
function deleteFile(fileName, noteElement) {
    ipcRenderer.send('delete-file', fileName);
    ipcRenderer.once('file-deleted', () => {
        const notesList = document.getElementById('recentNotes');
        notesList.removeChild(noteElement);
        if (notesList.children.length === 0) {
            notesList.innerHTML = emptyViewFiles;
        }
    });
}

// Function to open the file and display its content
function openFile(fileName) {
    ipcRenderer.send('open-file', fileName);
    currentFilePath = path.join(ELEMENTAL_NOTES_DIR, fileName);
    originalFileName = fileName.replace('.md', '');

    const content = fs.readFileSync(currentFilePath, 'utf-8');
    if (textAreaContent) {
        textAreaContent.value = content;
        renderMarkdown(content); // Trigger markdown rendering immediately
    }
}

// Event listener for goHomeBtn
if (goHomeBtn) {
    goHomeBtn.addEventListener('click', () => {
        currentFilePath = null; // Close the opened file
        const textAreaContent = document.getElementById('markdown-edit');
        if (textAreaContent) {
            textAreaContent.value = ''; // Clear the content from the markdown-edit field
        }
        window.location.href = 'index.html'; // Go to the index.html file
    });
}

// Pill Animation for File saving
function removeStatusPill() {
    statusPill.style.animation = 'fade-out 0.5s';
    statusPill.style.opacity = '0';
}

function removeStatusPillDisplay() {
    statusPill.style.display = 'none';
}
