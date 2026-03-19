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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'extractText') {
        sendResponse({ text: extractText() });
    }
    return true;
});


function init() {
    console.log("Content Script Loaded");
    extractText();
    setupMutationObserver(extractText);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractText, setupMutationObserver, init };
} else {
    init();
}