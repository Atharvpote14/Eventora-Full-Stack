"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn, formatINR } from "@/lib/utils";

const PAD_TOP = 14;
const PAD_BOTTOM = 26;
const PAD_X = 10;

function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  let factor = 1;
  if (normalized > 7.5) factor = 10;
  else if (normalized > 4) factor = 5;
  else if (normalized > 2) factor = 2.5;
  else if (normalized > 1) factor = 2;
  return factor * magnitude;
}

export function AreaChart({
  labels,
  values,
  height = 180,
  money = false,
  className,
}: {
  labels: string[];
  values: number[];
  height?: number;
  money?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const gradientId = useId();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let cancelled = false;
    const measure = () => {
      if (!cancelled) setWidth(el.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, []);

  if (values.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-paper-faint">
        No data yet
      </div>
    );
  }

  const formatValue = (v: number) => (money ? formatINR(v) : String(v));
  const max = niceMax(Math.max(...values));
  const n = values.length;
  const innerW = Math.max(0, width - PAD_X * 2);
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const step = n > 1 ? innerW / (n - 1) : 0;

  const point = (i: number) => ({
    x: PAD_X + (n > 1 ? (i / (n - 1)) * innerW : innerW / 2),
    y: PAD_TOP + (1 - values[i] / max) * innerH,
  });

  const linePath = values
    .map((_, i) => `${i === 0 ? "M" : "L"}${point(i).x.toFixed(1)},${point(i).y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${point(n - 1).x.toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} L${point(0).x.toFixed(1)},${(PAD_TOP + innerH).toFixed(1)} Z`;

  const labelEvery = Math.ceil(n / 6);
  const labelIndexes = labels
    .map((_, i) => i)
    .filter((i) => i % labelEvery === 0 || i === n - 1);

  const onMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * width;
    const index = Math.round((x - PAD_X) / (step || 1));
    setHoverIndex(Math.max(0, Math.min(n - 1, index)));
  };

  const hover = hoverIndex !== null ? point(hoverIndex) : null;

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
          className="block"
          role="img"
          aria-label="Chart"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((fraction) => (
            <line
              key={fraction}
              x1={PAD_X}
              x2={width - PAD_X}
              y1={PAD_TOP + innerH * fraction}
              y2={PAD_TOP + innerH * fraction}
              className="stroke-ink-700/70"
              strokeWidth={1}
            />
          ))}

          <path d={areaPath} fill={`url(#${gradientId})`} className="text-ember-500" />
          <path
            d={linePath}
            fill="none"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-ember-500"
          />

          {hover && (
            <line
              x1={hover.x}
              x2={hover.x}
              y1={PAD_TOP}
              y2={PAD_TOP + innerH}
              className="stroke-ink-500"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
          )}
          {hover && (
            <circle cx={hover.x} cy={hover.y} r={4} className="fill-ember-500" />
          )}

          {labelIndexes.map((i) => (
            <text
              key={i}
              x={point(i).x}
              y={height - 8}
              textAnchor="middle"
              className="fill-paper-faint"
              fontSize={10}
            >
              {labels[i]}
            </text>
          ))}

          {hover && hoverIndex !== null && (
            <g>
              <rect
                x={Math.min(Math.max(hover.x - 42, 2), Math.max(0, width - 86))}
                y={2}
                width={84}
                height={22}
                rx={4}
                className="fill-ink-700"
              />
              <text
                x={Math.min(Math.max(hover.x, 44), Math.max(44, width - 42))}
                y={17}
                textAnchor="middle"
                className="fill-paper"
                fontSize={11}
                fontWeight={600}
              >
                {formatValue(values[hoverIndex])}
              </text>
            </g>
          )}
        </svg>
      )}
    </div>
  );
}