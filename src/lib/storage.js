const STORAGE_KEY = "collab-board-lite:board";
const STORAGE_VERSION = 1;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isValidBoard(candidate) {
  return (
    candidate &&
    typeof candidate === "object" &&
    candidate.version === 1 &&
    Array.isArray(candidate.objects)
  );
}

export function loadBoard(seedFactory) {
  if (!canUseStorage()) {
    return { board: seedFactory(), isFirstRun: true };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        parsed.storageVersion === STORAGE_VERSION &&
        isValidBoard(parsed.data)
      ) {
        return { board: parsed.data, isFirstRun: false };
      }
    }
  } catch {
    // Fallback to demo seed when stored data is malformed.
  }

  const seededBoard = seedFactory();
  saveBoard(seededBoard);
  return { board: seededBoard, isFirstRun: true };
}

export function saveBoard(board) {
  if (!canUseStorage() || !isValidBoard(board)) {
    return;
  }

  const payload = {
    storageVersion: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    data: board,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearBoard() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
