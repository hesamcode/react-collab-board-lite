import { createId } from "../../lib/ids";

export const BOARD_VERSION = 1;

export const TOOLS = {
  SELECT: "select",
  NOTE: "note",
  RECT: "rect",
  ARROW: "arrow",
};

export const TOOL_OPTIONS = [
  { id: TOOLS.SELECT, label: "Select" },
  { id: TOOLS.NOTE, label: "Sticky" },
  { id: TOOLS.RECT, label: "Rect" },
  { id: TOOLS.ARROW, label: "Arrow" },
];

const DEFAULT_COLORS = {
  note: "#fbbf24",
  rect: "#60a5fa",
  arrow: "#f43f5e",
};

export function createObject({ type, x, y, color, text }) {
  const now = Date.now();
  const base = {
    id: createId(type),
    type,
    x,
    y,
    color: color ?? DEFAULT_COLORS[type] ?? "#fbbf24",
    createdAt: now,
    updatedAt: now,
  };

  if (type === TOOLS.NOTE) {
    return {
      ...base,
      width: 220,
      height: 160,
      text: text ?? "Add your note here",
    };
  }

  if (type === TOOLS.RECT) {
    return {
      ...base,
      width: 240,
      height: 140,
      text: text ?? "",
    };
  }

  if (type === TOOLS.ARROW) {
    return {
      ...base,
      x2: x + 180,
      y2: y + 70,
      strokeWidth: 3,
      text: text ?? "",
    };
  }

  return base;
}

export function duplicateObject(object, offset = 28) {
  const now = Date.now();
  const next = {
    ...object,
    id: createId(object.type),
    createdAt: now,
    updatedAt: now,
  };

  if (object.type === TOOLS.ARROW) {
    return {
      ...next,
      x: object.x + offset,
      y: object.y + offset,
      x2: object.x2 + offset,
      y2: object.y2 + offset,
    };
  }

  return {
    ...next,
    x: object.x + offset,
    y: object.y + offset,
  };
}

export function createDemoBoard() {
  const welcomeNote = createObject({
    type: TOOLS.NOTE,
    x: 120,
    y: 120,
    text: "Welcome to Collab Board Lite. Drag, edit, and create.",
    color: "#fbbf24",
  });

  const taskRect = createObject({
    type: TOOLS.RECT,
    x: 460,
    y: 150,
    text: "Goal\nShip the MVP",
    color: "#60a5fa",
  });

  const linkArrow = {
    ...createObject({
      type: TOOLS.ARROW,
      x: 320,
      y: 220,
      color: "#f43f5e",
    }),
    x2: 460,
    y2: 220,
  };

  return {
    version: BOARD_VERSION,
    objects: [welcomeNote, taskRect, linkArrow],
    lastUpdatedAt: Date.now(),
  };
}

export function getObjectLabel(object, index) {
  if (object.type === TOOLS.NOTE) {
    return `Note ${index + 1}`;
  }

  if (object.type === TOOLS.RECT) {
    return `Rectangle ${index + 1}`;
  }

  if (object.type === TOOLS.ARROW) {
    return `Arrow ${index + 1}`;
  }

  return `Object ${index + 1}`;
}
