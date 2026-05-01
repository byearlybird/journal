export function moodLabel(value: number): string {
  if (value <= 14) return "Very unpleasant";
  if (value <= 29) return "Unpleasant";
  if (value <= 44) return "Somewhat unpleasant";
  if (value <= 55) return "Neutral";
  if (value <= 70) return "Somewhat pleasant";
  if (value <= 85) return "Pleasant";
  return "Very pleasant";
}
