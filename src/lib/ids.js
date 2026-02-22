let sequence = 0;

export function createId(prefix = "obj") {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  sequence += 1;
  const stamp = Date.now().toString(36);
  const suffix = sequence.toString(36).padStart(3, "0");
  return `${prefix}-${stamp}-${suffix}`;
}
