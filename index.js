const DOMPurify = require('dompurify');
const { marked } = require('marked');

// Buttons
const tasksButton = document.getElementById('tasksButton');
const recentButton = document.getElementById('recentButton');
const settingsButton = document.getElementById('settingsButton');
const resizePill = document.getElementById('resizePill');
const menuBar = document.getElementById('menuBar');
const checkBox = document.getElementById('checkBox');
const saveTools = document.getElementById('saveTools');

// Text formatting
const boldBtn = document.getElementById('bold');
const italicsBtn = document.getElementById('italics');
const strikethrough = document.getElementById('strikethrough');
const unlist = document.getElementById('unlist');
const ordList = document.getElementById('ordList');
const heading = document.getElementById('heading');

// Insert objects
const tableBtn = document.getElementById('table');
const imageInsertBtn = document.getElementById('image');
const codeBlock = document.getElementById('code');
const blockQuote = document.getElementById('quote');

// App pages
const content = document.getElementById('markdown-content');
const mdContent = document.getElementById('markdown-content');
const htmlContent = document.getElementById('html-preview');
const recentNotes = document.getElementById('recentNotes');
const settingsPage = document.getElementById('general');
const tasksView = document.getElementById('checklist');

// Empty view
const emptyView = `
    <div id="emptyIllu">
        <img style="opacity: 0.8; margin-top: 40px;" height="90" src="res/juicy-sleeping-cat.png">
        <h3 style="font-weight: 600; font-size: 1.1em; margin-top: 80px; color:black;">
            What's on your mind? <br>Start typin!
        </h3>
    </div>`;

// Button click handlers

tasksButton.onclick = function () {
    tasksButton.style.opacity = '1';
    tasksButton.style.scale = '1';
    mdContent.style.display = 'none';
    settingsPage.style.display = 'none';
    saveTools.style.display = 'none';
    resizePill.style.display = 'none';
    htmlContent.style.display = 'none';
    recentNotes.style.display = 'none';
    recentButton.style.scale = '0.85';
    menuBar.style.display = 'none';
    settingsButton.style.opacity = '0.3';
    settingsButton.style.scale = '0.85';
    recentButton.style.opacity = '0.3';
    tasksView.style.display = 'flex';
};

recentButton.onclick = function () {
    recentButton.style.scale = '1';
    recentButton.style.opacity = '1';
    settingsButton.style.scale = '0.85';
    tasksButton.style.scale = '0.85';
    settingsPage.style.display = 'none';
    resizePill.style.display = 'none';
    saveTools.style.display = 'none';
    saveTools.style.display = 'flex';
    recentNotes.style.display = 'flex';
    menuBar.style.display = 'none';
    mdContent.style.display = 'none';
    htmlContent.style.display = 'none';
    tasksView.style.display = 'none';
    settingsButton.style.opacity = '0.3';
    tasksButton.style.opacity = '0.3';
};

settingsButton.onclick = function () {
    settingsButton.style.scale = '1';
    settingsPage.style.display = 'flex';
    menuBar.style.display = 'none';
    resizePill.style.display = 'none';
    recentNotes.style.display = 'none';
    saveTools.style.display = 'none';
    tasksView.style.display = 'none';
    htmlContent.style.display = 'none';
    recentButton.style.opacity = '0.3';
    recentButton.style.scale = '0.85';
    mdContent.style.display = 'none';
    settingsButton.style.opacity = '1';
    tasksButton.style.opacity = '0.3';
    tasksButton.style.scale = '0.85';
};

// Markdown Highlight Formatter
function formatText(wrapper) {
    const start = content.selectionStart;
    const end = content.selectionEnd;
    const selectedText = content.value.substring(start, end);
    const formattedText = `${wrapper}${selectedText}${wrapper}`;
    content.setRangeText(formattedText, start, end, 'end');
    content.focus();
}

function formatWrapperone(wrapper) {
    const start = content.selectionStart;
    const end = content.selectionEnd;
    const selectedText = content.value.substring(start, end);
    const formattedList = `${wrapper} ${selectedText}`;
    content.setRangeText(formattedList, start, end, 'end');
    content.focus();
}

function applyListFormatting(type) {
    const textarea = document.getElementById('markdown-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const lines = selectedText.split('\n');
    const formattedLines = lines.map((line, index) => {
        if (type === 'unordered') {
            return `- ${line}`;
        } else if (type === 'ordered') {
            return `${index + 1}. ${line}`;
        }
        return line;
    });
    const formattedText = formattedLines.join('\n');
    textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
}

// Event listeners for formatting buttons
boldBtn.addEventListener('click', () => formatText('**'));
italicsBtn.addEventListener('click', () => formatText('*'));
strikethrough.addEventListener('click', () => formatText('~~'));
checkBox.addEventListener('click', () => formatWrapperone('- [x] '));
unlist.addEventListener('click', () => applyListFormatting('unordered'));
ordList.addEventListener('click', () => applyListFormatting('ordered'));
heading.addEventListener('click', () => formatWrapperone('#'));
blockQuote.addEventListener('click', () => formatWrapperone('>'));
codeBlock.addEventListener('click', () => formatText('`'));
tableBtn.addEventListener('click', () => formatWrapperone(`| Column 1 | Column 2 | Column 3 |
| --------- | --------- | --------- |
| Row 1, Cell 1 | Row 1, Cell 2 | Row 1, Cell 3 |
| Row 2, Cell 1 | Row 2, Cell 2 | Row 2, Cell 3 |
| Row 3, Cell 1 | Row 3, Cell 2 | Row 3, Cell 3 |`));
imageInsertBtn.addEventListener('click', () => formatWrapperone(`![Alt text](Image URL or Image Directory)`));

// Markdown conversion functions
function convertHighlightedText(markdown) {
    return markdown.replace(/==(.+?)==/g, '<mark>$1</mark>');
}

function convertSuperScript(markdown) {
    return markdown.replace(/\^(.+?)\^/g, '<sup>$1</sup>');
}

function convertSubScript(markdown) {
    return markdown.replace(/_(.+?)_/g, '<sub>$1</sub>');
}

// Markdown Parser
content.addEventListener('input', () => {
    const markdownContent = document.getElementById('markdown-content');
    const htmlPreview = document.getElementById('html-preview');

    let htmlContent = marked.parse(markdownContent.value, { breaks: true });

    htmlContent = convertHighlightedText(htmlContent);
    htmlContent = convertSuperScript(htmlContent);
    htmlContent = convertSubScript(htmlContent);

    htmlPreview.innerHTML = DOMPurify.sanitize(htmlContent, { USE_PROFILES: { html: true } });

    if (htmlPreview.children.length === 0) {
        htmlPreview.innerHTML = emptyView;
    }
});

content.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;

        // Set textarea value to: text before caret + tab + text after caret
        this.value = this.value.substring(0, start) + '\t' + this.value.substring(end);

        // Put caret at right position again
        this.selectionStart = this.selectionEnd = start + 1;
    }
});

// Resizing functionality
let isResizing = false;

resizePill.addEventListener('mousedown', (e) => {
    isResizing = true;
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
});

function resize(e) {
    if (!isResizing) return;
    const markdownContent = document.getElementById('markdown-content');
    const htmlPreview = document.getElementById('html-preview');
    const containerWidth = markdownContent.parentElement.clientWidth;
    const newMarkdownWidth = (e.clientX / containerWidth) * 100;
    const newHtmlWidth = 100 - newMarkdownWidth;

    markdownContent.style.width = `${newMarkdownWidth}%`;
    htmlPreview.style.width = `${newHtmlWidth}%`;

    adjustOpacity(markdownContent, newMarkdownWidth);
    adjustOpacity(htmlPreview, newHtmlWidth);
}

function adjustOpacity(element, widthPercentage) {
    element.classList.add('fade');
    element.style.opacity = widthPercentage < 5 ? '0' : '1';
}

function stopResize() {
    isResizing = false;
    document.removeEventListener('mousemove', resize);
    document.removeEventListener('mouseup', stopResize);
}
