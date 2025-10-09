export function formatDateCanada(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    timeZone: "America/Toronto",
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}