const { extractText, setupMutationObserver, init } = require('../content');

describe('extractText', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    test('should return the text content of the page body', () => {
        document.body.innerText = 'Hello World';
        const result = extractText();
        expect(result).toBe('Hello World');
    });

    test('should log the extracted text to console', () => {
        document.body.innerText = 'Test content';
        extractText();
        expect(console.log).toHaveBeenCalledWith('Test content');
    });

    test('should handle empty body text', () => {
        document.body.innerText = '';
        const result = extractText();
        expect(result).toBe('');
    });

    test('should handle body with special characters', () => {
        document.body.innerText = '<script>alert("xss")</script>';
        const result = extractText();
        expect(result).toBe('<script>alert("xss")</script>');
    });

    test('should handle multiline text', () => {
        document.body.innerText = 'Line 1\nLine 2\nLine 3';
        const result = extractText();
        expect(result).toContain('Line 1');
        expect(result).toContain('Line 2');
        expect(result).toContain('Line 3');
    });
});

describe('setupMutationObserver', () => {
    test('should return a MutationObserver instance', () => {
        const callback = jest.fn();
        const observer = setupMutationObserver(callback);
        expect(observer).toBeDefined();
        expect(typeof observer.disconnect).toBe('function');
        observer.disconnect();
    });

    test('should call observe on the document', () => {
        const callback = jest.fn();
        const observeSpy = jest.spyOn(MutationObserver.prototype, 'observe');
        const observer = setupMutationObserver(callback);
        expect(observeSpy).toHaveBeenCalledWith(document, {
            childList: true,
            subtree: true
        });
        observeSpy.mockRestore();
        observer.disconnect();
    });

    test('should accept a callback function', () => {
        const callback = jest.fn();
        const observer = setupMutationObserver(callback);
        expect(observer).toBeDefined();
        observer.disconnect();
    });
});

describe('init', () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        console.log.mockRestore();
    });

    test('should log "Content Script Loaded"', () => {
        document.body.innerText = '';
        init();
        expect(console.log).toHaveBeenCalledWith('Content Script Loaded');
    });

    test('should call extractText on initialization', () => {
        document.body.innerText = 'Init test';
        init();
        expect(console.log).toHaveBeenCalledWith('Init test');
    });
});

describe('module exports', () => {
    test('should export extractText as a function', () => {
        expect(typeof extractText).toBe('function');
    });

    test('should export setupMutationObserver as a function', () => {
        expect(typeof setupMutationObserver).toBe('function');
    });

    test('should export init as a function', () => {
        expect(typeof init).toBe('function');
    });
});
