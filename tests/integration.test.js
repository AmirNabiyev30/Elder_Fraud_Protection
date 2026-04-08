const { extractText } = require('../content');

beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Set up the popup's HTML so popup.js has the DOM elements it needs
    document.body.innerHTML = `
        <div class="popup-container">
            <div class="status-dot"></div>
            <input type="checkbox" id="autoScanToggle">
            <button id="scanButton">Scan Page</button>
        </div>
    `;
});

describe('popup and content.js message passing', () => {

    test('popup displays text returned by content.js when scan button is clicked', () => {
        // Simulate content.js responding with page text
        document.body.innerText = 'Hello from the page';
        const pageText = extractText();

        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ id: 1 }]);
        });

        chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
            if (message.action === 'extractText') {
                callback({ text: pageText });
            }
        });

        require('../popup/popup');

        document.getElementById('scanButton').click();

        const results = document.getElementById('results');
        expect(results).not.toBeNull();
        expect(results.textContent).toBe(pageText.trim().slice(0, 1000));
    });

    test('popup handles error gracefully when content.js fails to respond', () => {
        chrome.tabs.query.mockImplementation((query, callback) => {
            callback([{ id: 1 }]);
        });

        chrome.tabs.sendMessage.mockImplementation((tabId, message, callback) => {
            // Simulate a failure — no response and lastError is set
            chrome.runtime.lastError = { message: 'Could not establish connection' };
            callback(null);
            chrome.runtime.lastError = null;
        });

        require('../popup/popup');

        document.getElementById('scanButton').click();

        // Popup should not crash and results should not be rendered
        const results = document.getElementById('results');
        expect(results).toBeNull();
    });

});