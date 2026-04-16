export function stringToColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);
  const hue = (hash * 137) % 360;
  const saturation = 75;
  const lightness = 55;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}