const { initPopup } = require('../popup/popup');

describe('popup initPopup', () => {
  test('updates status dot background on toggle change', () => {
    document.body.innerHTML = `
      <input id="autoScanToggle" type="checkbox" />
      <div class="status-dot"></div>
    `;

    const { autoScanToggle, statusDot } = initPopup(document);

    autoScanToggle.checked = true;
    autoScanToggle.dispatchEvent(new Event('change'));
    expect(statusDot.style.background).toBe('rgb(201, 201, 201)');

    autoScanToggle.checked = false;
    autoScanToggle.dispatchEvent(new Event('change'));
    expect(statusDot.style.background).toBe('rgb(39, 160, 101)');
  });

  test('handles missing elements without throwing', () => {
    document.body.innerHTML = `<div class="status-dot"></div>`;
    expect(() => initPopup(document)).not.toThrow();
  });
});

