function initPopup() {
  console.log("Popup");

  const autoScanToggle = document.getElementById('autoScanToggle');
  const statusDot = document.querySelector('.status-dot');

  if (!autoScanToggle || !statusDot) {
    console.error("Popup: required DOM elements not found");
    return { autoScanToggle: null, statusDot: null };
  }

  autoScanToggle.addEventListener('change', () => {
    if (autoScanToggle.checked) {
      statusDot.style.background = '#C9C9C9';
    } else {
      statusDot.style.background = '#27a065';
    }
  });

  const scanButton = document.getElementById('scanButton');
  if (scanButton) {
    scanButton.addEventListener('click', () => {
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'scan' }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Scan failed:", chrome.runtime.lastError.message);
                return;
              }
              console.log("Scan result:", response);
            });
          }
        });
      }
    });
  }

  return { autoScanToggle, statusDot, scanButton };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initPopup };
} else {
  initPopup();
}