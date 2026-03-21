/* 
This file is for page specific logic (reading/modifying DOM). This
will contain our core logic for extracting text (detecting scams).
*/

function extractText() {
    const text = document.body.innerText;
    console.log(text);
    return text;
}

function setupMutationObserver(callback) {
    let last_url = location.href;

    const observer = new MutationObserver(() => {
        if (location.href !== last_url) {
            last_url = location.href;
            callback();
        }
    });

    observer.observe(document, { childList: true, subtree: true });
    return observer;
}

function handleMessage(message, sender, sendResponse) {
    if (message.action === 'scan') {
        const text = extractText();
        sendResponse({ success: true, text: text });
    }
    return true;
}

function init() {
    console.log("Content Script Loaded");
    extractText();
    setupMutationObserver(extractText);

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener(handleMessage);
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractText, setupMutationObserver, init, handleMessage };
} else {
    init();
}
