export const GRID_SIZE = 16;

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function snap(value, step = GRID_SIZE) {
  return Math.round(value / step) * step;
}

export function snapPoint(point, step = GRID_SIZE) {
  return {
    x: snap(point.x, step),
    y: snap(point.y, step),
  };
}

export function screenToWorld(clientX, clientY, rect, pan, zoom) {
  return {
    x: (clientX - rect.left - pan.x) / zoom,
    y: (clientY - rect.top - pan.y) / zoom,
  };
}

export function getObjectBounds(object) {
  if (object.type === "arrow") {
    const minX = Math.min(object.x, object.x2);
    const minY = Math.min(object.y, object.y2);
    const maxX = Math.max(object.x, object.x2);
    const maxY = Math.max(object.y, object.y2);

    return {
      x: minX,
      y: minY,
      width: maxX - minX || 1,
      height: maxY - minY || 1,
    };
  }

  return {
    x: object.x,
    y: object.y,
    width: object.width,
    height: object.height,
  };
}

export function translateObject(object, dx, dy, shouldSnap = false) {
  const nextDx = shouldSnap ? snap(dx) : dx;
  const nextDy = shouldSnap ? snap(dy) : dy;

  if (object.type === "arrow") {
    return {
      ...object,
      x: object.x + nextDx,
      y: object.y + nextDy,
      x2: object.x2 + nextDx,
      y2: object.y2 + nextDy,
    };
  }

  return {
    ...object,
    x: object.x + nextDx,
    y: object.y + nextDy,
  };
}
