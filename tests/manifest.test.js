const fs = require('fs');
const path = require('path');

const manifestPath = path.join(__dirname, '..', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

describe('manifest.json structure', () => {
    test('should be valid JSON with required fields', () => {
        expect(manifest).toBeDefined();
        expect(manifest.name).toBeDefined();
        expect(manifest.version).toBeDefined();
        expect(manifest.manifest_version).toBeDefined();
    });

    test('should use manifest version 3', () => {
        expect(manifest.manifest_version).toBe(3);
    });

    test('should have a non-empty extension name', () => {
        expect(manifest.name.length).toBeGreaterThan(0);
    });

    test('should have content_scripts targeting all URLs', () => {
        expect(manifest.content_scripts).toBeDefined();
        expect(manifest.content_scripts[0].matches).toContain('<all_urls>');
    });

    test('should reference content.js in content_scripts', () => {
        const scripts = manifest.content_scripts[0].js;
        expect(scripts).toContain('content.js');
    });

    test('should have a background service worker', () => {
        expect(manifest.background).toBeDefined();
        expect(manifest.background.service_worker).toBe('background.js');
    });

    test('should declare required permissions', () => {
        expect(manifest.permissions).toContain('activeTab');
        expect(manifest.permissions).toContain('scripting');
    });

    test('should have a default popup defined', () => {
        expect(manifest.action).toBeDefined();
        expect(manifest.action.default_popup).toBe('popup/popup.html');
    });

    test('should reference all content script files that exist', () => {
        const contentScripts = manifest.content_scripts[0].js;
        contentScripts.forEach(file => {
            const filePath = path.join(__dirname, '..', file);
            expect(fs.existsSync(filePath)).toBe(true);
        });
    });

    test('should reference an existing background service worker file', () => {
        const swPath = path.join(__dirname, '..', manifest.background.service_worker);
        expect(fs.existsSync(swPath)).toBe(true);
    });
});
