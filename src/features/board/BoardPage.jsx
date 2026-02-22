import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import Sheet from "../../components/ui/Sheet";
import Toast from "../../components/ui/Toast";
import { clamp } from "../../lib/geometry";
import { createId } from "../../lib/ids";
import { loadBoard, saveBoard } from "../../lib/storage";
import Canvas from "./Canvas";
import { createDemoBoard, createObject } from "./objects";
import PropertiesPanel from "./PropertiesPanel";
import { MAX_ZOOM, MIN_ZOOM, boardReducer, createInitialState } from "./reducer";
import Toolbar from "./Toolbar";

function isEditableTarget(target) {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tag = target.tagName;
  return target.isContentEditable || tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export default function BoardPage() {
  const [{ board, firstRun }] = useState(() => {
    const load = loadBoard(createDemoBoard);
    return {
      board: load.board,
      firstRun: load.isFirstRun,
    };
  });

  const [state, dispatch] = useReducer(
    boardReducer,
    createInitialState(board, { showHint: firstRun }),
  );

  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef(new Map());
  const canvasHostRef = useRef(null);

  useEffect(() => {
    dispatch({ type: "LOAD_BOARD", board });
  }, [board]);

  useEffect(() => {
    saveBoard(state.present);
  }, [state.present]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = toastTimersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      toastTimersRef.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (message, type = "info") => {
      const id = createId("toast");
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = window.setTimeout(() => removeToast(id), 2200);
      toastTimersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const setTool = useCallback((tool) => {
    dispatch({ type: "SET_TOOL", tool });
  }, []);

  const addObjectAt = useCallback(
    (type, point) => {
      const object = createObject({ type, x: point.x, y: point.y });
      dispatch({ type: "ADD_OBJECT", object });
      pushToast(`${type === "note" ? "Sticky note" : type} added`, "success");
    },
    [pushToast],
  );

  const patchSelected = useCallback((patch) => {
    dispatch({ type: "PATCH_OBJECTS", patch });
  }, []);

  const deleteSelection = useCallback(() => {
    if (!state.selectedIds.length) {
      return;
    }

    dispatch({ type: "DELETE_SELECTED" });
    pushToast("Selection deleted", "warning");
  }, [state.selectedIds.length, pushToast]);

  const duplicateSelection = useCallback(() => {
    dispatch({ type: "DUPLICATE_SELECTED" });
    pushToast("Selection duplicated", "success");
  }, [pushToast]);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const setViewport = useCallback((zoom, pan) => {
    dispatch({ type: "SET_VIEWPORT", zoom, pan });
  }, []);

  const setPan = useCallback((pan) => {
    dispatch({ type: "SET_PAN", pan });
  }, []);

  const zoomAroundCenter = useCallback(
    (nextZoom) => {
      const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
      const rect = canvasHostRef.current?.getBoundingClientRect();
      if (!rect) {
        dispatch({ type: "SET_ZOOM", zoom: clampedZoom });
        return;
      }

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const worldX = (centerX - state.pan.x) / state.zoom;
      const worldY = (centerY - state.pan.y) / state.zoom;

      const nextPan = {
        x: centerX - worldX * clampedZoom,
        y: centerY - worldY * clampedZoom,
      };

      dispatch({ type: "SET_VIEWPORT", zoom: clampedZoom, pan: nextPan });
    },
    [state.pan.x, state.pan.y, state.zoom],
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const hasModifier = event.metaKey || event.ctrlKey;
      const editable = isEditableTarget(event.target);

      if (hasModifier && key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          dispatch({ type: "REDO" });
          return;
        }

        dispatch({ type: "UNDO" });
        return;
      }

      if (hasModifier && key === "y") {
        event.preventDefault();
        dispatch({ type: "REDO" });
        return;
      }

      if (!hasModifier && key === "n" && !editable) {
        event.preventDefault();

        const rect = canvasHostRef.current?.getBoundingClientRect();
        let x = 160;
        let y = 140;

        if (rect) {
          x = (rect.width / 2 - state.pan.x) / state.zoom;
          y = (rect.height / 2 - state.pan.y) / state.zoom;
        }

        const object = createObject({ type: "note", x, y });
        dispatch({ type: "ADD_OBJECT", object });
        pushToast("Sticky note added", "success");
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && !editable) {
        if (!state.selectedIds.length) {
          return;
        }

        event.preventDefault();
        dispatch({ type: "DELETE_SELECTED" });
        pushToast("Selection deleted", "warning");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [state.pan.x, state.pan.y, state.zoom, state.selectedIds.length, pushToast]);

  return (
    <section className="flex h-full min-h-0 flex-col gap-3 p-3 md:p-4">
      <div className="hidden md:block">
        <Toolbar
          mobile={false}
          tool={state.tool}
          onToolChange={setTool}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onZoomIn={() => zoomAroundCenter(state.zoom * 1.1)}
          onZoomOut={() => zoomAroundCenter(state.zoom * 0.9)}
          onZoomReset={() => zoomAroundCenter(1)}
          zoom={state.zoom}
          snapToGrid={state.snapToGrid}
          onToggleSnap={() => dispatch({ type: "TOGGLE_SNAP_TO_GRID" })}
          selectedCount={state.selectedIds.length}
        />
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        <div ref={canvasHostRef} className="relative flex min-h-0 flex-1">
          <Canvas
            objects={state.present.objects}
            selectedIds={state.selectedIds}
            tool={state.tool}
            zoom={state.zoom}
            pan={state.pan}
            snapToGrid={state.snapToGrid}
            onSetPan={setPan}
            onSetViewport={setViewport}
            onSelectIds={(ids) => dispatch({ type: "SET_SELECTED_IDS", ids })}
            onToggleSelectedId={(id) => dispatch({ type: "TOGGLE_SELECTED_ID", id })}
            onAddObject={addObjectAt}
            onMoveObjects={(ids, dx, dy) => dispatch({ type: "MOVE_OBJECTS", ids, dx, dy })}
            onResizeNote={(id, width, height) => dispatch({ type: "RESIZE_NOTE", id, width, height })}
            onPatchObjects={(ids, patch) => dispatch({ type: "PATCH_OBJECTS", ids, patch })}
          />

          {state.showHint && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
              <div className="pointer-events-auto max-w-sm rounded-xl border border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
                <p className="text-sm text-slate-800 dark:text-slate-100">
                  Try dragging the canvas, adding objects from the toolbar, and using <kbd>N</kbd> for a quick sticky note.
                </p>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "DISMISS_HINT" })}
                  className="mt-3 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700"
                >
                  Start editing
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="hidden w-[320px] shrink-0 md:block">
          <PropertiesPanel
            objects={state.present.objects}
            selectedIds={state.selectedIds}
            onSelectIds={(ids) => dispatch({ type: "SET_SELECTED_IDS", ids })}
            onPatchSelected={patchSelected}
            onDeleteSelection={deleteSelection}
            onDuplicateSelection={duplicateSelection}
          />
        </aside>
      </div>

      <div className="sticky bottom-0 z-30 -mx-3 md:hidden">
        <Toolbar
          mobile
          tool={state.tool}
          onToolChange={setTool}
          canUndo={state.past.length > 0}
          canRedo={state.future.length > 0}
          onUndo={undo}
          onRedo={redo}
          onZoomIn={() => zoomAroundCenter(state.zoom * 1.1)}
          onZoomOut={() => zoomAroundCenter(state.zoom * 0.9)}
          onZoomReset={() => zoomAroundCenter(1)}
          zoom={state.zoom}
          snapToGrid={state.snapToGrid}
          onToggleSnap={() => dispatch({ type: "TOGGLE_SNAP_TO_GRID" })}
          onOpenProperties={() => dispatch({ type: "SET_MOBILE_SHEET_OPEN", open: true })}
          selectedCount={state.selectedIds.length}
        />
      </div>

      <Sheet
        open={state.mobileSheetOpen}
        title="Board properties"
        onClose={() => dispatch({ type: "SET_MOBILE_SHEET_OPEN", open: false })}
      >
        <PropertiesPanel
          mobile
          objects={state.present.objects}
          selectedIds={state.selectedIds}
          onSelectIds={(ids) => dispatch({ type: "SET_SELECTED_IDS", ids })}
          onPatchSelected={patchSelected}
          onDeleteSelection={deleteSelection}
          onDuplicateSelection={duplicateSelection}
        />
      </Sheet>

      <Toast toasts={toasts} onDismiss={removeToast} />
    </section>
  );
}
