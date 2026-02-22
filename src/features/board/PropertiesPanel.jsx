import Button from "../../components/ui/Button";
import { getObjectLabel } from "./objects";

function fieldValueOrEmpty(values, key) {
  if (!values.length) {
    return "";
  }

  const first = values[0][key];
  return values.every((item) => item[key] === first) ? first : "";
}

export default function PropertiesPanel({
  objects,
  selectedIds,
  onSelectIds,
  onPatchSelected,
  onDeleteSelection,
  onDuplicateSelection,
  mobile = false,
}) {
  const selectedSet = new Set(selectedIds);
  const selectedObjects = objects.filter((object) => selectedSet.has(object.id));
  const single = selectedObjects.length === 1 ? selectedObjects[0] : null;

  const colorValue = fieldValueOrEmpty(selectedObjects, "color") || "#fbbf24";

  const resizable = selectedObjects.filter(
    (object) => object.type === "note" || object.type === "rect",
  );
  const commonWidth = fieldValueOrEmpty(resizable, "width");
  const commonHeight = fieldValueOrEmpty(resizable, "height");

  const arrows = selectedObjects.filter((object) => object.type === "arrow");
  const commonStrokeWidth = fieldValueOrEmpty(arrows, "strokeWidth");

  const toggleSelection = (id, checked) => {
    if (checked) {
      onSelectIds([...selectedIds, id]);
      return;
    }

    onSelectIds(selectedIds.filter((current) => current !== id));
  };

  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-slate-300 bg-surface-light p-4 text-sm dark:border-slate-700 dark:bg-surface-dark">
      <header>
        <h2 className="text-base font-semibold">Properties</h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">
          {selectedObjects.length ? `${selectedObjects.length} object(s) selected` : "Select objects to edit"}
        </p>
      </header>

      {mobile && (
        <section className="space-y-2 rounded-lg border border-slate-300 p-3 dark:border-slate-700">
          <h3 className="font-semibold">Selection list</h3>
          <ul className="space-y-2">
            {objects.map((object, index) => (
              <li key={object.id}>
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-md border border-slate-200 px-2 py-1 dark:border-slate-700">
                  <span className="truncate">{getObjectLabel(object, index)}</span>
                  <input
                    type="checkbox"
                    checked={selectedSet.has(object.id)}
                    onChange={(event) => toggleSelection(object.id, event.target.checked)}
                    aria-label={`Toggle ${getObjectLabel(object, index)} in selection`}
                    className="h-4 w-4 accent-primary-500"
                  />
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-3">
        <label className="flex items-center justify-between gap-3">
          <span className="font-medium">Color</span>
          <input
            type="color"
            value={colorValue}
            onChange={(event) => onPatchSelected({ color: event.target.value })}
            disabled={!selectedObjects.length}
            aria-label="Change selected object color"
            className="h-10 w-16 cursor-pointer rounded-md border border-slate-300 bg-transparent p-1 disabled:cursor-not-allowed dark:border-slate-700"
          />
        </label>

        {single && (
          <label className="block space-y-2">
            <span className="font-medium">Text</span>
            <textarea
              value={single.text ?? ""}
              onChange={(event) => onPatchSelected({ text: event.target.value })}
              aria-label="Edit selected object text"
              rows={4}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        )}

        {resizable.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <span className="font-medium">Width</span>
              <input
                type="number"
                min={120}
                max={900}
                step={4}
                value={commonWidth}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!Number.isNaN(value)) {
                    onPatchSelected((object) => {
                      if (object.type === "arrow") {
                        return null;
                      }
                      return { width: value };
                    });
                  }
                }}
                aria-label="Change selected width"
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
            <label className="space-y-1">
              <span className="font-medium">Height</span>
              <input
                type="number"
                min={90}
                max={800}
                step={4}
                value={commonHeight}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (!Number.isNaN(value)) {
                    onPatchSelected((object) => {
                      if (object.type === "arrow") {
                        return null;
                      }
                      return { height: value };
                    });
                  }
                }}
                aria-label="Change selected height"
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          </div>
        )}

        {arrows.length > 0 && (
          <label className="space-y-1">
            <span className="font-medium">Stroke width</span>
            <input
              type="number"
              min={1}
              max={12}
              step={1}
              value={commonStrokeWidth}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isNaN(value)) {
                  onPatchSelected((object) => {
                    if (object.type !== "arrow") {
                      return null;
                    }
                    return { strokeWidth: value };
                  });
                }
              }}
              aria-label="Change arrow stroke width"
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}
      </section>

      <footer className="mt-auto flex flex-wrap items-center gap-2">
        <Button
          variant="subtle"
          onClick={onDuplicateSelection}
          disabled={!selectedObjects.length}
          aria-label="Duplicate selected objects"
        >
          Duplicate
        </Button>
        <Button
          variant="danger"
          onClick={onDeleteSelection}
          disabled={!selectedObjects.length}
          aria-label="Delete selected objects"
        >
          Delete
        </Button>
      </footer>
    </div>
  );
}
