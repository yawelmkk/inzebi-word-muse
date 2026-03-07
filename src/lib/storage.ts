export const readStorageJson = <T>(
  storageType: "local" | "session",
  key: string,
  fallback: T
): T => {
  if (typeof window === "undefined") return fallback;

  try {
    const storage = storageType === "local" ? window.localStorage : window.sessionStorage;
    const rawValue = storage.getItem(key);

    if (!rawValue) return fallback;

    try {
      return JSON.parse(rawValue) as T;
    } catch {
      storage.removeItem(key);
      return fallback;
    }
  } catch {
    return fallback;
  }
};

export const writeStorageJson = (
  storageType: "local" | "session",
  key: string,
  value: unknown
): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const storage = storageType === "local" ? window.localStorage : window.sessionStorage;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
