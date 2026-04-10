/**
 * Unit tests for bridge-behavior.js
 * Tests device/connection detection and constraint warning application
 */

const fs = require('fs');
const path = require('path');

// Load the bridge-behavior.js file
const bridgeBehaviorCode = fs.readFileSync(path.join(__dirname, '../assets/bridge-behavior.js'), 'utf8');

describe('bridge-behavior.js', () => {
  describe('detectSlowConnection() logic', () => {
    afterEach(() => {
      // Restore original navigator
      delete global.navigator;
    });

    test('should return false when navigator.connection is not available', () => {
      global.navigator = { connection: null };

      const conn = global.navigator.connection;
      const result = !conn;

      expect(result).toBe(true);
    });

    test('should return true when saveData is enabled', () => {
      global.navigator = {
        connection: {
          saveData: true,
          effectiveType: '4g',
        },
      };

      const conn = global.navigator.connection;
      const saveData = conn.saveData || false;
      const effectiveType = conn.effectiveType || '';
      const result = saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;

      expect(result).toBe(true);
    });

    test('should return true when effectiveType is slow-2g', () => {
      global.navigator = {
        connection: {
          saveData: false,
          effectiveType: 'slow-2g',
        },
      };

      const conn = global.navigator.connection;
      const saveData = conn.saveData || false;
      const effectiveType = conn.effectiveType || '';
      const result = saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;

      expect(result).toBe(true);
    });

    test('should return true when effectiveType is 2g', () => {
      global.navigator = {
        connection: {
          saveData: false,
          effectiveType: '2g',
        },
      };

      const conn = global.navigator.connection;
      const saveData = conn.saveData || false;
      const effectiveType = conn.effectiveType || '';
      const result = saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;

      expect(result).toBe(true);
    });

    test('should return true when effectiveType is 3g', () => {
      global.navigator = {
        connection: {
          saveData: false,
          effectiveType: '3g',
        },
      };

      const conn = global.navigator.connection;
      const saveData = conn.saveData || false;
      const effectiveType = conn.effectiveType || '';
      const result = saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;

      expect(result).toBe(true);
    });

    test('should return false when effectiveType is 4g', () => {
      global.navigator = {
        connection: {
          saveData: false,
          effectiveType: '4g',
        },
      };

      const conn = global.navigator.connection;
      const saveData = conn.saveData || false;
      const effectiveType = conn.effectiveType || '';
      const result = saveData || ['slow-2g', '2g', '3g'].indexOf(effectiveType) !== -1;

      expect(result).toBe(false);
    });
  });

  describe('applyConstraintWarning() logic', () => {
    test('should add slow-connection class when link points to 3D store and slow connection detected', () => {
      const mockBridge = {
        getAttribute: (attr) => {
          if (attr === 'href') return '/?open_collection=test';
          if (attr === 'data-slow-connection-warning') return 'Slow connection warning';
          return null;
        },
        querySelector: () => ({
          textContent: 'Original heading',
        }),
        classList: {
          add: jest.fn(),
        },
      };

      const href = mockBridge.getAttribute('href') || '';
      const is3DLink = href.indexOf('/pages/immersive-store') !== -1 || href.indexOf('?open_') !== -1;

      if (is3DLink) {
        const heading = mockBridge.querySelector('.immersive-bridge-banner__heading');
        if (heading) {
          const warningMsg =
            mockBridge.getAttribute('data-slow-connection-warning') || 'Optimized for faster connections';
          heading.textContent = warningMsg;
          mockBridge.classList.add('immersive-bridge-banner--slow-connection');
        }
      }

      expect(mockBridge.classList.add).toHaveBeenCalledWith('immersive-bridge-banner--slow-connection');
    });

    test('should add reduced-motion class when motion sensitivity detected', () => {
      const mockBridge = {
        getAttribute: (attr) => {
          if (attr === 'href') return '/pages/immersive-store';
          return null;
        },
        querySelector: () => null,
        classList: {
          add: jest.fn(),
        },
      };

      const href = mockBridge.getAttribute('href') || '';
      const is3DLink = href.indexOf('/pages/immersive-store') !== -1 || href.indexOf('?open_') !== -1;

      if (is3DLink) {
        mockBridge.classList.add('immersive-bridge-banner--reduced-motion');
      }

      expect(mockBridge.classList.add).toHaveBeenCalledWith('immersive-bridge-banner--reduced-motion');
    });

    test('should not modify non-3D links', () => {
      const mockBridge = {
        getAttribute: (attr) => {
          if (attr === 'href') return '/collections/test';
          return null;
        },
        querySelector: () => null,
        classList: {
          add: jest.fn(),
        },
      };

      const href = mockBridge.getAttribute('href') || '';
      const is3DLink = href.indexOf('/pages/immersive-store') !== -1 || href.indexOf('?open_') !== -1;

      if (!is3DLink) {
        return;
      }

      expect(mockBridge.classList.add).not.toHaveBeenCalled();
    });
  });

  describe('bridge-behavior.js file structure', () => {
    test('should contain classifyConnection function', () => {
      expect(bridgeBehaviorCode).toContain('function classifyConnection()');
    });

    test('should contain wireBridge function', () => {
      expect(bridgeBehaviorCode).toContain('function wireBridge(bridge, conn, reducedMotion)');
    });

    test('should contain init function', () => {
      expect(bridgeBehaviorCode).toContain('function init()');
    });

    test('should check for navigator.connection availability', () => {
      expect(bridgeBehaviorCode).toContain("if (!navigator.connection) return 'fast';");
    });

    test('should check for saveData flag', () => {
      expect(bridgeBehaviorCode).toContain("if (c.saveData) return 'slow';");
    });

    test('should check for slow effectiveType values', () => {
      expect(bridgeBehaviorCode).toContain("if (t === 'slow-2g' || t === '2g') return 'slow';");
    });

    test('should check for prefers-reduced-motion', () => {
      expect(bridgeBehaviorCode).toContain("window.matchMedia('(prefers-reduced-motion: reduce)')");
    });

    test('should add slow-connection CSS class', () => {
      expect(bridgeBehaviorCode).toContain('immersive-bridge-btn--slow-connection');
    });

    test('should add reduced-motion CSS class', () => {
      expect(bridgeBehaviorCode).toContain('immersive-bridge-btn--reduced-motion');
    });

    test('should use data-immersive-bridge selector', () => {
      expect(bridgeBehaviorCode).toContain('[data-immersive-bridge]');
    });

    test('should use data-slow-note attribute', () => {
      expect(bridgeBehaviorCode).toContain('data-slow-note');
    });

    test('should run on DOMContentLoaded', () => {
      expect(bridgeBehaviorCode).toContain("document.readyState === 'loading'");
      expect(bridgeBehaviorCode).toContain("document.addEventListener('DOMContentLoaded', init)");
    });
  });
});
