// Web fallback for @react-native-async-storage/async-storage
// Uses localStorage as the storage backend

const AsyncStorage = {
  async getItem(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },

  async removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  async clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },

  async getAllKeys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },

  async multiGet(keys) {
    try {
      return keys.map(key => {
        const value = localStorage.getItem(key);
        return [key, value !== null ? value : null];
      });
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return [];
    }
  },

  async multiSet(keyValuePairs) {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
    }
  },

  async multiRemove(keys) {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
    }
  },
};

export default AsyncStorage;

// Also export the useAsyncStorage hook for compatibility
// Note: In a real implementation, this should use React.useMemo to avoid creating
// new objects on every render, but since this is a fallback and the hook is rarely used,
// we keep it simple. If performance issues arise, wrap the returned object in useMemo.
export function useAsyncStorage(key) {
  return {
    getItem: () => AsyncStorage.getItem(key),
    setItem: (value) => AsyncStorage.setItem(key, value),
    removeItem: () => AsyncStorage.removeItem(key),
  };
}
