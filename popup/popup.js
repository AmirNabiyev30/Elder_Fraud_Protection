console.log("Popup")


const autoScanToggle = document.getElementById('autoScanToggle');
const statusDot = document.querySelector('.status-dot');

autoScanToggle.addEventListener('change', () => {
  if (autoScanToggle.checked) {
    statusDot.style.background = '#C9C9C9';
  } else {
    statusDot.style.background = '#27a065';
  }
});