const { registerBackgroundHandlers } = require('../background');

function createMockChrome() {
  const listeners = {
    onInstalled: null,
    onClicked: null,
  };

  const chrome = {
    runtime: {
      onInstalled: {
        addListener: (fn) => {
          listeners.onInstalled = fn;
        },
      },
    },
    action: {
      onClicked: {
        addListener: (fn) => {
          listeners.onClicked = fn;
        },
      },
    },
    scripting: {
      executeScript: jest.fn(),
    },
  };

  return { chrome, listeners };
}

describe('background integration: onClicked -> chrome.scripting.executeScript', () => {
  test('injects content.js into the active tab', () => {
    const { chrome, listeners } = createMockChrome();
    registerBackgroundHandlers(chrome);

    expect(typeof listeners.onClicked).toBe('function');

    listeners.onClicked({ id: 123 });

    expect(chrome.scripting.executeScript).toHaveBeenCalledWith({
      target: { tabId: 123 },
      files: ['content.js'],
    });
  });

  test('throws a clear error when tab.id is missing', () => {
    const { chrome, listeners } = createMockChrome();
    registerBackgroundHandlers(chrome);

    expect(() => listeners.onClicked({})).toThrow('Expected tab.id to be a number');
  });
});

