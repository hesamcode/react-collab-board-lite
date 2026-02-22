import { useMemo, useRef, useState } from "react";
import { clamp, getObjectBounds, screenToWorld, snap, snapPoint } from "../../lib/geometry";

const MIN_NOTE_WIDTH = 140;
const MIN_NOTE_HEIGHT = 100;

function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Canvas({
  objects,
  selectedIds,
  tool,
  zoom,
  pan,
  snapToGrid,
  onSetPan,
  onSetViewport,
  onSelectIds,
  onToggleSelectedId,
  onAddObject,
  onMoveObjects,
  onResizeNote,
  onPatchObjects,
}) {
  const viewportRef = useRef(null);
  const interactionRef = useRef(null);

  const [dragPreview, setDragPreview] = useState(null);
  const [resizePreview, setResizePreview] = useState(null);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toWorld = (clientX, clientY) => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }

    return screenToWorld(clientX, clientY, rect, pan, zoom);
  };

  const updatePanFromEvent = (event, interaction) => {
    const dx = event.clientX - interaction.startClient.x;
    const dy = event.clientY - interaction.startClient.y;
    onSetPan({
      x: interaction.startPan.x + dx,
      y: interaction.startPan.y + dy,
    });
  };

  const commitInteraction = () => {
    const interaction = interactionRef.current;
    if (!interaction) {
      return;
    }

    if (interaction.type === "drag" && dragPreview) {
      onMoveObjects(interaction.ids, dragPreview.dx, dragPreview.dy);
    }

    if (interaction.type === "resize" && resizePreview) {
      onResizeNote(interaction.id, resizePreview.width, resizePreview.height);
    }

    interactionRef.current = null;
    setDragPreview(null);
    setResizePreview(null);
  };

  const handlePointerMove = (event) => {
    const interaction = interactionRef.current;
    if (!interaction) {
      return;
    }

    if (interaction.type === "pan") {
      updatePanFromEvent(event, interaction);
      return;
    }

    if (interaction.type === "drag") {
      const world = toWorld(event.clientX, event.clientY);
      let dx = world.x - interaction.startWorld.x;
      let dy = world.y - interaction.startWorld.y;

      if (snapToGrid) {
        dx = snap(dx);
        dy = snap(dy);
      }

      setDragPreview({ ids: interaction.ids, dx, dy });
      return;
    }

    if (interaction.type === "resize") {
      const world = toWorld(event.clientX, event.clientY);
      let nextWidth = clamp(
        interaction.startSize.width + (world.x - interaction.startWorld.x),
        MIN_NOTE_WIDTH,
        960,
      );
      let nextHeight = clamp(
        interaction.startSize.height + (world.y - interaction.startWorld.y),
        MIN_NOTE_HEIGHT,
        720,
      );

      if (snapToGrid) {
        nextWidth = snap(nextWidth);
        nextHeight = snap(nextHeight);
      }

      setResizePreview({ id: interaction.id, width: nextWidth, height: nextHeight });
    }
  };

  const handlePointerUp = () => {
    commitInteraction();
  };

  const handleCanvasPointerDown = (event) => {
    if (event.button !== 0) {
      return;
    }

    const worldPoint = toWorld(event.clientX, event.clientY);

    if (tool !== "select") {
      onAddObject(tool, snapToGrid ? snapPoint(worldPoint) : worldPoint);
      return;
    }

    onSelectIds([]);

    interactionRef.current = {
      type: "pan",
      startClient: { x: event.clientX, y: event.clientY },
      startPan: pan,
    };

    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const handleObjectPointerDown = (event, object) => {
    if (event.button !== 0) {
      return;
    }

    if (tool !== "select") {
      return;
    }

    event.stopPropagation();

    const isDesktopShiftToggle =
      event.shiftKey && typeof window !== "undefined" && window.innerWidth >= 768;

    if (isDesktopShiftToggle) {
      onToggleSelectedId(object.id);
      return;
    }

    const isAlreadySelected = selectedSet.has(object.id);
    const dragIds = isAlreadySelected ? selectedIds : [object.id];
    onSelectIds(dragIds);

    if (event.target.closest('[data-no-drag="true"]')) {
      return;
    }

    interactionRef.current = {
      type: "drag",
      ids: dragIds,
      startWorld: toWorld(event.clientX, event.clientY),
    };

    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const startResize = (event, object) => {
    event.stopPropagation();
    interactionRef.current = {
      type: "resize",
      id: object.id,
      startWorld: toWorld(event.clientX, event.clientY),
      startSize: {
        width: object.width,
        height: object.height,
      },
    };

    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const handleWheel = (event) => {
    event.preventDefault();

    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    const delta = event.deltaY > 0 ? 0.92 : 1.08;
    const nextZoom = clamp(zoom * delta, 0.35, 2.5);

    const nextPan = {
      x: cursorX - worldX * nextZoom,
      y: cursorY - worldY * nextZoom,
    };

    onSetViewport(nextZoom, nextPan);
  };

  const withPreview = (object) => {
    let nextObject = object;

    if (dragPreview && dragPreview.ids.includes(object.id)) {
      if (object.type === "arrow") {
        nextObject = {
          ...nextObject,
          x: object.x + dragPreview.dx,
          y: object.y + dragPreview.dy,
          x2: object.x2 + dragPreview.dx,
          y2: object.y2 + dragPreview.dy,
        };
      } else {
        nextObject = {
          ...nextObject,
          x: object.x + dragPreview.dx,
          y: object.y + dragPreview.dy,
        };
      }
    }

    if (resizePreview && resizePreview.id === object.id && object.type === "note") {
      nextObject = {
        ...nextObject,
        width: resizePreview.width,
        height: resizePreview.height,
      };
    }

    return nextObject;
  };

  const renderObject = (object) => {
    const projected = withPreview(object);
    const selected = selectedSet.has(object.id);

    if (projected.type === "arrow") {
      const bounds = getObjectBounds(projected);
      const padding = 12;
      const left = bounds.x - padding;
      const top = bounds.y - padding;
      const width = Math.max(bounds.width + padding * 2, 24);
      const height = Math.max(bounds.height + padding * 2, 24);

      return (
        <div
          key={projected.id}
          role="button"
          tabIndex={0}
          aria-label="Arrow object"
          onPointerDown={(event) => handleObjectPointerDown(event, projected)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              onSelectIds([projected.id]);
            }
          }}
          style={{ left, top, width, height }}
          className={joinClasses(
            "absolute rounded-md",
            selected && "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent",
          )}
        >
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <marker
                id={`arrow-head-${projected.id}`}
                markerWidth="10"
                markerHeight="8"
                refX="8"
                refY="4"
                orient="auto"
              >
                <path d="M0,0 L0,8 L8,4 z" fill={projected.color} />
              </marker>
            </defs>
            <line
              x1={projected.x - left}
              y1={projected.y - top}
              x2={projected.x2 - left}
              y2={projected.y2 - top}
              stroke={projected.color}
              strokeWidth={projected.strokeWidth ?? 3}
              markerEnd={`url(#arrow-head-${projected.id})`}
            />
          </svg>
        </div>
      );
    }

    if (projected.type === "rect") {
      return (
        <div
          key={projected.id}
          role="button"
          tabIndex={0}
          aria-label="Rectangle object"
          onPointerDown={(event) => handleObjectPointerDown(event, projected)}
          style={{
            left: projected.x,
            top: projected.y,
            width: projected.width,
            height: projected.height,
            backgroundColor: `${projected.color}40`,
            borderColor: projected.color,
          }}
          className={joinClasses(
            "absolute overflow-hidden rounded-md border-2 shadow-sm",
            selected && "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent",
          )}
        >
          <div className="h-full p-3 text-sm text-slate-900 dark:text-slate-100">
            <p className="whitespace-pre-wrap">{projected.text || "Rectangle"}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        key={projected.id}
        role="button"
        tabIndex={0}
        aria-label="Sticky note object"
        onPointerDown={(event) => handleObjectPointerDown(event, projected)}
        style={{
          left: projected.x,
          top: projected.y,
          width: projected.width,
          height: projected.height,
          backgroundColor: `${projected.color}cc`,
        }}
        className={joinClasses(
          "absolute overflow-hidden rounded-md border border-amber-300 shadow-md",
          selected && "ring-2 ring-primary-500 ring-offset-2 ring-offset-transparent",
        )}
      >
        <div
          data-no-drag="false"
          className="h-6 w-full cursor-grab border-b border-black/10 bg-black/5"
          aria-hidden="true"
        />
        <textarea
          data-no-drag="true"
          value={projected.text ?? ""}
          onChange={(event) => onPatchObjects([projected.id], { text: event.target.value })}
          aria-label="Edit sticky note text"
          className="h-[calc(100%-1.5rem)] w-full resize-none bg-transparent px-2 py-1 text-sm text-slate-900 outline-none placeholder:text-slate-700"
        />
        {selected && (
          <button
            type="button"
            data-no-drag="true"
            onPointerDown={(event) => startResize(event, projected)}
            className="absolute bottom-1 right-1 h-4 w-4 cursor-se-resize rounded-sm border border-slate-700 bg-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Resize sticky note"
          />
        )}
      </div>
    );
  };

  return (
    <div
      ref={viewportRef}
      className="relative h-full min-h-[56vh] w-full overflow-hidden rounded-xl border border-slate-300 bg-surface-light touch-none dark:border-slate-700 dark:bg-surface-dark"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      aria-label="Collaboration board canvas"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(148,163,184,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.2) 1px, transparent 1px)",
          backgroundSize: `${16 * zoom}px ${16 * zoom}px`,
          backgroundPosition: `${pan.x % (16 * zoom)}px ${pan.y % (16 * zoom)}px`,
          opacity: snapToGrid ? 0.7 : 0.25,
        }}
      />

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: 3600,
          height: 2400,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {objects.map((object) => renderObject(object))}
      </div>
    </div>
  );
}
