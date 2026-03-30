console.log("Popup")

const autoScanToggle = document.getElementById('autoScanToggle');
const statusDot = document.querySelector('.status-dot');
const mainBtn = document.getElementById('scanButton');

autoScanToggle.addEventListener('change', () => {
  if (autoScanToggle.checked) {
    statusDot.style.background = '#C9C9C9';
  } else {
    statusDot.style.background = '#27a065';
  }
});

mainBtn.addEventListener("click", () => {
  const container = document.getElementById('results-container');
  const resultsText = document.getElementById('results-text');

  container.style.display = 'block';
  resultsText.textContent = 'Scanning...';

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;

    chrome.scripting.executeScript(
      { target: { tabId }, files: ['content.js'] },
      () => {
        chrome.tabs.sendMessage(tabId, { action: 'extractText' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            resultsText.textContent = 'Error: ' + (chrome.runtime.lastError?.message || 'No response');
            return;
          }
          resultsText.textContent = response.text.trim().slice(0, 1000);
        });
      }
    );
  });
});