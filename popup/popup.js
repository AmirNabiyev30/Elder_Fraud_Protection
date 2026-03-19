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
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractText' }, (response) => {
          if (chrome.runtime.lastError || !response) return;
          let results = document.getElementById('results');
          if (!results) {
              results = document.createElement('p');
              results.id = 'results';
              results.style = 'font-size:11px; max-height:200px; overflow-y:auto; white-space:pre-wrap; padding:8px;';
              document.querySelector('.popup-container').appendChild(results);
          }
          results.textContent = response.text.trim().slice(0, 1000);
      });
  });
});

