const { initPopup } = require('../popup/popup');

describe('initPopup', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});

        document.body.innerHTML = `
            <div class="popup-container">
                <button id="scanButton" class="scan-btn">Scan Page</button>
                <div class="toggle-row">
                    <label class="switch">
                        <input type="checkbox" id="autoScanToggle">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="footer">
                <div class="status-dot"></div>
                <span class="status-text">Protection active</span>
            </div>
        `;
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
        document.body.innerHTML = '';
    });

    test('should log "Popup" on initialization', () => {
        initPopup();
        expect(console.log).toHaveBeenCalledWith('Popup');
    });

    test('should return references to DOM elements', () => {
        const result = initPopup();
        expect(result.autoScanToggle).not.toBeNull();
        expect(result.statusDot).not.toBeNull();
        expect(result.scanButton).not.toBeNull();
    });

    test('should set status dot to gray when toggle is checked', () => {
        const { autoScanToggle, statusDot } = initPopup();
        autoScanToggle.checked = true;
        autoScanToggle.dispatchEvent(new Event('change'));
        expect(statusDot.style.background).toContain('201, 201, 201');
    });

    test('should set status dot to green when toggle is unchecked', () => {
        const { autoScanToggle, statusDot } = initPopup();
        autoScanToggle.checked = false;
        autoScanToggle.dispatchEvent(new Event('change'));
        expect(statusDot.style.background).toContain('39, 160, 101');
    });

    test('should toggle status dot color back and forth', () => {
        const { autoScanToggle, statusDot } = initPopup();

        autoScanToggle.checked = true;
        autoScanToggle.dispatchEvent(new Event('change'));
        expect(statusDot.style.background).toContain('201, 201, 201');

        autoScanToggle.checked = false;
        autoScanToggle.dispatchEvent(new Event('change'));
        expect(statusDot.style.background).toContain('39, 160, 101');
    });
});

describe('initPopup - error handling', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
        console.error.mockRestore();
        document.body.innerHTML = '';
    });

    test('should handle missing DOM elements gracefully', () => {
        document.body.innerHTML = '';
        const result = initPopup();
        expect(console.error).toHaveBeenCalledWith('Popup: required DOM elements not found');
        expect(result.autoScanToggle).toBeNull();
        expect(result.statusDot).toBeNull();
    });

    test('should handle missing autoScanToggle element', () => {
        document.body.innerHTML = '<div class="status-dot"></div>';
        const result = initPopup();
        expect(console.error).toHaveBeenCalledWith('Popup: required DOM elements not found');
        expect(result.autoScanToggle).toBeNull();
    });

    test('should handle missing statusDot element', () => {
        document.body.innerHTML = '<input type="checkbox" id="autoScanToggle">';
        const result = initPopup();
        expect(console.error).toHaveBeenCalledWith('Popup: required DOM elements not found');
        expect(result.statusDot).toBeNull();
    });
});
