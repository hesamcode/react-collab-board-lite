import { clamp, translateObject } from "../../lib/geometry";
import { duplicateObject } from "./objects";

export const MIN_ZOOM = 0.35;
export const MAX_ZOOM = 2.5;
const DEFAULT_HISTORY_LIMIT = 60;

function withBoardObjects(board, objects) {
  return {
    ...board,
    objects,
    lastUpdatedAt: Date.now(),
  };
}

function sanitizeSelection(selection, board) {
  const known = new Set(board.objects.map((object) => object.id));
  return [...new Set(selection)].filter((id) => known.has(id));
}

function commitBoard(state, nextBoard, nextSelection = state.selectedIds) {
  if (nextBoard === state.present) {
    return state;
  }

  const past = [...state.past, state.present];
  if (past.length > state.historyLimit) {
    past.shift();
  }

  return {
    ...state,
    past,
    present: nextBoard,
    future: [],
    selectedIds: sanitizeSelection(nextSelection, nextBoard),
  };
}

function patchObjects(board, ids, patch) {
  const idSet = new Set(ids);
  const now = Date.now();
  let changed = false;

  const nextObjects = board.objects.map((object) => {
    if (!idSet.has(object.id)) {
      return object;
    }

    const partial = typeof patch === "function" ? patch(object) : patch;
    if (!partial || typeof partial !== "object") {
      return object;
    }

    const nextObject = {
      ...object,
      ...partial,
      updatedAt: now,
    };

    const hasDiff = Object.keys(partial).some((key) => object[key] !== partial[key]);
    if (!hasDiff) {
      return object;
    }

    changed = true;
    return nextObject;
  });

  return changed ? withBoardObjects(board, nextObjects) : board;
}

export function createInitialState(board, options = {}) {
  const historyLimit = Math.max(options.historyLimit ?? DEFAULT_HISTORY_LIMIT, 20);

  return {
    past: [],
    present: board,
    future: [],
    historyLimit,
    selectedIds: [],
    tool: "select",
    zoom: 1,
    pan: { x: 0, y: 0 },
    snapToGrid: false,
    mobileSheetOpen: false,
    mobileSelectionOpen: false,
    showHint: Boolean(options.showHint),
  };
}

export function boardReducer(state, action) {
  switch (action.type) {
    case "LOAD_BOARD": {
      return {
        ...state,
        past: [],
        future: [],
        present: action.board,
        selectedIds: [],
      };
    }

    case "SET_TOOL": {
      return {
        ...state,
        tool: action.tool,
      };
    }

    case "SET_SELECTED_IDS": {
      return {
        ...state,
        selectedIds: sanitizeSelection(action.ids, state.present),
      };
    }

    case "TOGGLE_SELECTED_ID": {
      const id = action.id;
      const exists = state.selectedIds.includes(id);
      const nextSelection = exists
        ? state.selectedIds.filter((item) => item !== id)
        : [...state.selectedIds, id];

      return {
        ...state,
        selectedIds: sanitizeSelection(nextSelection, state.present),
      };
    }

    case "SET_PAN": {
      if (state.pan.x === action.pan.x && state.pan.y === action.pan.y) {
        return state;
      }

      return {
        ...state,
        pan: action.pan,
      };
    }

    case "SET_VIEWPORT": {
      const nextZoom = clamp(action.zoom, MIN_ZOOM, MAX_ZOOM);
      const nextPan = action.pan ?? state.pan;

      if (
        state.zoom === nextZoom &&
        state.pan.x === nextPan.x &&
        state.pan.y === nextPan.y
      ) {
        return state;
      }

      return {
        ...state,
        zoom: nextZoom,
        pan: nextPan,
      };
    }

    case "SET_ZOOM": {
      const nextZoom = clamp(action.zoom, MIN_ZOOM, MAX_ZOOM);
      if (nextZoom === state.zoom) {
        return state;
      }

      return {
        ...state,
        zoom: nextZoom,
      };
    }

    case "SET_SNAP_TO_GRID": {
      return {
        ...state,
        snapToGrid: Boolean(action.enabled),
      };
    }

    case "TOGGLE_SNAP_TO_GRID": {
      return {
        ...state,
        snapToGrid: !state.snapToGrid,
      };
    }

    case "SET_MOBILE_SHEET_OPEN": {
      return {
        ...state,
        mobileSheetOpen: Boolean(action.open),
      };
    }

    case "SET_MOBILE_SELECTION_OPEN": {
      return {
        ...state,
        mobileSelectionOpen: Boolean(action.open),
      };
    }

    case "DISMISS_HINT": {
      return {
        ...state,
        showHint: false,
      };
    }

    case "ADD_OBJECT": {
      if (!action.object) {
        return state;
      }

      const nextBoard = withBoardObjects(state.present, [...state.present.objects, action.object]);
      return commitBoard(state, nextBoard, [action.object.id]);
    }

    case "PATCH_OBJECTS": {
      const ids = action.ids ?? state.selectedIds;
      if (!ids.length) {
        return state;
      }

      const nextBoard = patchObjects(state.present, ids, action.patch);
      if (nextBoard === state.present) {
        return state;
      }

      return commitBoard(state, nextBoard, state.selectedIds);
    }

    case "MOVE_OBJECTS": {
      const ids = action.ids ?? state.selectedIds;
      const dx = Number(action.dx) || 0;
      const dy = Number(action.dy) || 0;

      if (!ids.length || (dx === 0 && dy === 0)) {
        return state;
      }

      const idSet = new Set(ids);
      let changed = false;

      const nextObjects = state.present.objects.map((object) => {
        if (!idSet.has(object.id)) {
          return object;
        }

        changed = true;
        return {
          ...translateObject(object, dx, dy, action.snapToGrid),
          updatedAt: Date.now(),
        };
      });

      if (!changed) {
        return state;
      }

      const nextBoard = withBoardObjects(state.present, nextObjects);
      return commitBoard(state, nextBoard, state.selectedIds);
    }

    case "RESIZE_NOTE": {
      const { id, width, height } = action;
      if (!id) {
        return state;
      }

      const nextBoard = patchObjects(state.present, [id], (object) => {
        if (object.type !== "note") {
          return null;
        }

        return {
          width,
          height,
        };
      });

      if (nextBoard === state.present) {
        return state;
      }

      return commitBoard(state, nextBoard, state.selectedIds);
    }

    case "DELETE_SELECTED": {
      if (!state.selectedIds.length) {
        return state;
      }

      const selected = new Set(state.selectedIds);
      const nextObjects = state.present.objects.filter((object) => !selected.has(object.id));
      const nextBoard = withBoardObjects(state.present, nextObjects);
      return commitBoard(state, nextBoard, []);
    }

    case "DUPLICATE_SELECTED": {
      if (!state.selectedIds.length) {
        return state;
      }

      const selected = new Set(state.selectedIds);
      const duplicated = state.present.objects
        .filter((object) => selected.has(object.id))
        .map((object) => duplicateObject(object));

      if (!duplicated.length) {
        return state;
      }

      const nextBoard = withBoardObjects(state.present, [...state.present.objects, ...duplicated]);
      return commitBoard(
        state,
        nextBoard,
        duplicated.map((object) => object.id),
      );
    }

    case "UNDO": {
      if (!state.past.length) {
        return state;
      }

      const previous = state.past[state.past.length - 1];
      const nextPast = state.past.slice(0, -1);

      return {
        ...state,
        past: nextPast,
        present: previous,
        future: [state.present, ...state.future],
        selectedIds: sanitizeSelection(state.selectedIds, previous),
      };
    }

    case "REDO": {
      if (!state.future.length) {
        return state;
      }

      const [nextPresent, ...nextFuture] = state.future;
      return {
        ...state,
        past: [...state.past, state.present],
        present: nextPresent,
        future: nextFuture,
        selectedIds: sanitizeSelection(state.selectedIds, nextPresent),
      };
    }

    default:
      return state;
  }
}
