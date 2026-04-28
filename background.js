/* 
Service worker: This file is for central orchestration and network
calls. 
*/

function registerBackgroundHandlers(chromeApi) {
    chromeApi.runtime.onInstalled.addListener(() => {
        console.log("Extension Installed");
    });

    // Inject and run content script on active tab to scrape all text from DOM
    chromeApi.action.onClicked.addListener((tab) => {
        if (!tab || typeof tab.id !== 'number') {
            throw new Error('Expected tab.id to be a number');
        }

        // Inject content script into active tab
        chromeApi.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    });
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { registerBackgroundHandlers };
} else {
    registerBackgroundHandlers(chrome);
}