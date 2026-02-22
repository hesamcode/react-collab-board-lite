import Button from "../../components/ui/Button";
import Tooltip from "../../components/ui/Tooltip";
import { TOOL_OPTIONS } from "./objects";

const TOOL_ICONS = {
  select: "◻",
  note: "🗒",
  rect: "▭",
  arrow: "➜",
};

function ToolButton({ active, label, icon, onClick }) {
  return (
    <Tooltip label={label}>
      <Button
        size="icon"
        variant={active ? "solid" : "subtle"}
        onClick={onClick}
        aria-label={label}
      >
        <span aria-hidden="true">{icon}</span>
      </Button>
    </Tooltip>
  );
}

export default function Toolbar({
  mobile,
  tool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom,
  snapToGrid,
  onToggleSnap,
  onOpenProperties,
  selectedCount,
}) {
  if (mobile) {
    return (
      <div className="grid grid-cols-5 gap-2 border-t border-slate-300 bg-surface-light p-3 dark:border-slate-700 dark:bg-surface-dark">
        <ToolButton
          active={tool === "select"}
          label="Select tool"
          icon={TOOL_ICONS.select}
          onClick={() => onToolChange("select")}
        />
        <ToolButton
          active={tool === "note"}
          label="Add sticky note"
          icon={TOOL_ICONS.note}
          onClick={() => onToolChange("note")}
        />
        <ToolButton
          active={tool === "rect"}
          label="Add rectangle"
          icon={TOOL_ICONS.rect}
          onClick={() => onToolChange("rect")}
        />
        <ToolButton
          active={tool === "arrow"}
          label="Add arrow"
          icon={TOOL_ICONS.arrow}
          onClick={() => onToolChange("arrow")}
        />
        <Button
          size="icon"
          variant="subtle"
          onClick={onOpenProperties}
          aria-label="Open properties"
        >
          ⚙
        </Button>

        <Button
          size="icon"
          variant="subtle"
          onClick={onUndo}
          disabled={!canUndo}
          aria-label="Undo"
        >
          ↶
        </Button>
        <Button
          size="icon"
          variant="subtle"
          onClick={onRedo}
          disabled={!canRedo}
          aria-label="Redo"
        >
          ↷
        </Button>
        <Button
          size="icon"
          variant="subtle"
          onClick={onZoomOut}
          aria-label="Zoom out"
        >
          −
        </Button>
        <Button
          size="icon"
          variant="subtle"
          onClick={onZoomIn}
          aria-label="Zoom in"
        >
          +
        </Button>
        <Button
          size="icon"
          variant={snapToGrid ? "solid" : "subtle"}
          onClick={onToggleSnap}
          aria-label="Toggle snap to grid"
        >
          ⌗
        </Button>

        <div className="col-span-5 flex items-center justify-between rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700">
          <span>{Math.round(zoom * 100)}% zoom</span>
          <span>{selectedCount} selected</span>
          <Button size="sm" variant="ghost" onClick={onZoomReset} aria-label="Reset zoom">
            Reset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-300 bg-surface-light p-3 shadow-sm dark:border-slate-700 dark:bg-surface-dark">
      <div className="flex flex-wrap items-center gap-2">
        {TOOL_OPTIONS.map((item) => (
          <Button
            key={item.id}
            variant={tool === item.id ? "solid" : "subtle"}
            onClick={() => onToolChange(item.id)}
            aria-label={`Switch to ${item.label.toLowerCase()} tool`}
          >
            <span aria-hidden="true">{TOOL_ICONS[item.id]}</span>
            {item.label}
          </Button>
        ))}
        <Button
          variant={snapToGrid ? "solid" : "subtle"}
          onClick={onToggleSnap}
          aria-label="Toggle snap to grid"
        >
          Snap
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="subtle" onClick={onUndo} disabled={!canUndo} aria-label="Undo">
          Undo
        </Button>
        <Button variant="subtle" onClick={onRedo} disabled={!canRedo} aria-label="Redo">
          Redo
        </Button>
        <Button size="icon" variant="subtle" onClick={onZoomOut} aria-label="Zoom out">
          −
        </Button>
        <span className="w-20 text-center text-sm font-semibold">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="subtle" onClick={onZoomIn} aria-label="Zoom in">
          +
        </Button>
        <Button variant="ghost" onClick={onZoomReset} aria-label="Reset zoom to 100%">
          Reset
        </Button>
      </div>
    </div>
  );
}
