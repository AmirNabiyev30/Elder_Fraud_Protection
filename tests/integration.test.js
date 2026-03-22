const { handleMessage, extractText } = require('../content');
const { initPopup } = require('../popup/popup');

describe('Integration: popup.js <-> content.js message passing', () => {
    let mockSendMessage;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        document.body.innerHTML = `
            <div class="popup-container">
                <button id="scanButton" class="scan-btn">Scan Page</button>
                <div class="toggle-row">
                    <input type="checkbox" id="autoScanToggle">
                </div>
            </div>
            <div class="footer">
                <div class="status-dot"></div>
            </div>
            <p>This is sample page content for fraud detection.</p>
        `;

        mockSendMessage = jest.fn();
        global.chrome = {
            tabs: {
                query: jest.fn((queryInfo, callback) => {
                    callback([{ id: 42 }]);
                }),
                sendMessage: mockSendMessage,
            },
            runtime: {
                lastError: null,
                onMessage: { addListener: jest.fn() },
            },
        };
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
        document.body.innerHTML = '';
        delete global.chrome;
    });

    test('scan button triggers message to content script which returns extracted text', () => {
        document.body.innerText = 'Sample page content for scanning';

        mockSendMessage.mockImplementation((tabId, message, callback) => {
            const sendResponse = callback;
            handleMessage(message, {}, sendResponse);
        });

        const { scanButton } = initPopup();
        scanButton.click();

        expect(global.chrome.tabs.query).toHaveBeenCalled();
        expect(mockSendMessage).toHaveBeenCalledWith(
            42,
            { action: 'scan' },
            expect.any(Function)
        );
        expect(console.log).toHaveBeenCalledWith(
            'Scan result:',
            expect.objectContaining({ success: true, text: expect.any(String) })
        );
    });

    test('content script handleMessage responds with page text on scan action', () => {
        document.body.innerText = 'Suspicious offer: You won $1,000,000!';
        const sendResponse = jest.fn();
        const result = handleMessage({ action: 'scan' }, {}, sendResponse);

        expect(result).toBe(true);
        expect(sendResponse).toHaveBeenCalledWith({
            success: true,
            text: 'Suspicious offer: You won $1,000,000!',
        });
    });

    test('content script ignores messages with unknown action', () => {
        const sendResponse = jest.fn();
        handleMessage({ action: 'unknown' }, {}, sendResponse);
        expect(sendResponse).not.toHaveBeenCalled();
    });

    test('scan button handles chrome.runtime.lastError gracefully', () => {
        global.chrome.runtime.lastError = { message: 'Could not establish connection' };
        mockSendMessage.mockImplementation((tabId, message, callback) => {
            callback(undefined);
        });

        const { scanButton } = initPopup();
        scanButton.click();

        expect(console.error).toHaveBeenCalledWith(
            'Scan failed:',
            'Could not establish connection'
        );
    });

    test('scan button handles empty tab list', () => {
        global.chrome.tabs.query.mockImplementation((queryInfo, callback) => {
            callback([]);
        });

        const { scanButton } = initPopup();
        scanButton.click();

        expect(mockSendMessage).not.toHaveBeenCalled();
    });
});
