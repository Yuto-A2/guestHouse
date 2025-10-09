
export function formatDateCanada(dateString: string, tz: string = "America/Toronto") {
  const src = new Date(dateString);
  const y = src.getUTCFullYear();
  const m = src.getUTCMonth() + 1;
  const d = src.getUTCDate();

  const localNoon = new Date(y, m - 1, d, 12, 0, 0, 0);

  return localNoon.toLocaleDateString("ja-JP", {
    timeZone: tz,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}
