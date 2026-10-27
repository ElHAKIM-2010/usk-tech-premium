function errorCode(error: unknown): unknown {
  if (typeof error !== "object" || error === null) return undefined;
  if ("code" in error) return (error as { code?: unknown }).code;
  if ("cause" in error) return errorCode((error as { cause?: unknown }).cause);
  return undefined;
}

export function isUniqueViolation(error: unknown) {
  return errorCode(error) === "23505";
}

export function isForeignKeyViolation(error: unknown) {
  return errorCode(error) === "23503";
}
