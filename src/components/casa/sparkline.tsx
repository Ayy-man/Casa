export function Sparkline({
  values,
  w = 120,
  h = 32,
  color = "#1A1A1A",
}: {
  values: number[];
  w?: number;
  h?: number;
  color?: string;
}) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = Math.max(max - min, 1);
  const step = w / Math.max(values.length - 1, 1);
  const pts = values
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(1)}`
    )
    .join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline fill="none" stroke={color} strokeWidth="1.4" points={pts} />
    </svg>
  );
}
