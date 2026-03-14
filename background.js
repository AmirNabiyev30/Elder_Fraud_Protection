/* 
Service worker: This file is for central orchestration and network
calls. 
*/

chrome.runtime.onInstalled.addListener( () => 
    {
    console.log("Extension Installed");
    }
);

// Inject and run content script on active tab to scrape all text from DOM

chrome.action.onClicked.addListener( (tab) => 
{
    // Inject content script into active tab 
    chrome.scripting.executeScript({
        target:{tabId:tab.id},
        files:["content.js"]
    });
})