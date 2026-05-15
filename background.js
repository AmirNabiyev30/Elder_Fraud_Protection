const SCAN_COMMAND = "scan-current-page";
const SCAN_ENDPOINT = "http://127.0.0.1:8000/api/scan";

function notifyScanResult(title, message) {
    if (!chrome.notifications?.create) {
        console.log(`${title}: ${message}`);
        return;
    }

    chrome.notifications.create({
        type: "basic",
        iconUrl: "icons/icon-favicon.png",
        title,
        message
    });
}

function queryActiveTab() {
    return new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            resolve(tabs[0]);
        });
    });
}

function executeContentScript(tabId) {
    return new Promise((resolve, reject) => {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"]
        }, () => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve();
        });
    });
}

function requestPageText(tabId) {
    return new Promise((resolve, reject) => {
        chrome.tabs.sendMessage(tabId, { action: "extractText" }, (response) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
                return;
            }

            resolve(response);
        });
    });
}

async function getPageText(tabId) {
    try {
        const response = await requestPageText(tabId);
        return response?.text || "";
    } catch (error) {
        await executeContentScript(tabId);
        const response = await requestPageText(tabId);
        return response?.text || "";
    }
}

async function scanText(text) {
    const response = await fetch(SCAN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    return response.json();
}

async function scanCurrentPage() {
    const tab = await queryActiveTab();

    if (!tab?.id) {
        notifyScanResult("Scan unavailable", "No active page was found.");
        return;
    }

    try {
        const text = await getPageText(tab.id);

        if (!text.trim()) {
            notifyScanResult("Scan unavailable", "No page text was found to scan.");
            return;
        }

        notifyScanResult("Scanning page", "Checking the current page for fraud indicators...");

        const data = await scanText(text);

        if (data.error) {
            notifyScanResult("Scan failed", data.error);
            return;
        }

        notifyScanResult("Scan complete", `${data.pred_label} (${data.pred_score}% confidence)`);
    } catch (error) {
        notifyScanResult("Scan failed", "Could not scan this page. Make sure the backend is running.");
    }
}

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension Installed");
});

chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
    });
});

chrome.commands?.onCommand?.addListener((command) => {
    if (command === SCAN_COMMAND) {
        scanCurrentPage();
    }
});

if (typeof module !== "undefined" && module.exports) {
    module.exports = { scanCurrentPage };
}
