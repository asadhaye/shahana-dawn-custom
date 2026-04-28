/**
 * Unit Tests: Preference Manager
 * Task 16 — Requirements 5.1, 5.2, 6.1
 */
'use strict';

function makeStore(initial = {}) {
  const data = Object.assign({}, initial);
  return {
    setItem: (k, v) => {
      data[k] = String(v);
    },
    getItem: (k) => (data[k] !== undefined ? data[k] : null),
    removeItem: (k) => {
      delete data[k];
    },
    _data: data,
  };
}

function writeImmersivePreference(storage) {
  try {
    (storage || localStorage).setItem('immersive_preferred_mode', '3d');
  } catch (e) {}
}
function readImmersivePreference(storage) {
  try {
    return (storage || localStorage).getItem('immersive_preferred_mode') === '3d';
  } catch (e) {
    return false;
  }
}
function clearImmersivePreference(storage) {
  try {
    (storage || localStorage).removeItem('immersive_preferred_mode');
  } catch (e) {}
}

describe('writeImmersivePreference', () => {
  test('writes "3d" to immersive_preferred_mode', () => {
    const store = makeStore();
    writeImmersivePreference(store);
    expect(store._data['immersive_preferred_mode']).toBe('3d');
  });

  test('overwrites any existing value', () => {
    const store = makeStore({ immersive_preferred_mode: '2d' });
    writeImmersivePreference(store);
    expect(store._data['immersive_preferred_mode']).toBe('3d');
  });

  test('does not throw when storage throws', () => {
    const broken = {
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
    };
    expect(() => writeImmersivePreference(broken)).not.toThrow();
  });

  test('does not affect other keys', () => {
    const store = makeStore({ other_key: 'other_value' });
    writeImmersivePreference(store);
    expect(store._data['other_key']).toBe('other_value');
  });
});

describe('readImmersivePreference', () => {
  test('returns true when flag is "3d"', () => {
    const store = makeStore({ immersive_preferred_mode: '3d' });
    expect(readImmersivePreference(store)).toBe(true);
  });

  test('returns false when flag is not set', () => {
    const store = makeStore();
    expect(readImmersivePreference(store)).toBe(false);
  });

  test('returns false when flag is a different value', () => {
    const store = makeStore({ immersive_preferred_mode: '2d' });
    expect(readImmersivePreference(store)).toBe(false);
  });

  test('returns false when storage throws', () => {
    const broken = {
      getItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(readImmersivePreference(broken)).toBe(false);
  });

  test('returns false when flag is empty string', () => {
    const store = makeStore({ immersive_preferred_mode: '' });
    expect(readImmersivePreference(store)).toBe(false);
  });
});

describe('clearImmersivePreference', () => {
  test('removes the preference flag', () => {
    const store = makeStore({ immersive_preferred_mode: '3d' });
    clearImmersivePreference(store);
    expect(store._data['immersive_preferred_mode']).toBeUndefined();
  });

  test('readImmersivePreference returns false after clear', () => {
    const store = makeStore({ immersive_preferred_mode: '3d' });
    clearImmersivePreference(store);
    expect(readImmersivePreference(store)).toBe(false);
  });

  test('does not throw when storage throws', () => {
    const broken = {
      removeItem: () => {
        throw new Error('SecurityError');
      },
    };
    expect(() => clearImmersivePreference(broken)).not.toThrow();
  });

  test('does not affect other keys', () => {
    const store = makeStore({ immersive_preferred_mode: '3d', other: 'value' });
    clearImmersivePreference(store);
    expect(store._data['other']).toBe('value');
  });
});

describe('Preference Manager — round-trip', () => {
  test('write → read → clear → read', () => {
    const store = makeStore();
    writeImmersivePreference(store);
    expect(readImmersivePreference(store)).toBe(true);
    clearImmersivePreference(store);
    expect(readImmersivePreference(store)).toBe(false);
  });
});
