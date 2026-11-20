import { useRef, useState } from 'react';
import type {
  AlternativeRecord,
  StrategicCoordinate,
} from '../../types/venture';

interface StrategicPositioningSectionProps {
  messMindPosition: StrategicCoordinate | null;
  alternatives: AlternativeRecord[];
  onUpdateMessMindPosition: (
    pos: StrategicCoordinate,
    showFeedback?: boolean
  ) => void;
  onUpdateAlternativePosition: (
    id: string,
    pos: StrategicCoordinate,
    showFeedback?: boolean
  ) => void;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 420;
const MARGIN = { top: 28, right: 28, bottom: 52, left: 60 };
const PLOT_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;

function clampCoord(val: number): number {
  return Math.max(0, Math.min(100, Math.round(val)));
}

function toSvgX(x: number): number {
  return MARGIN.left + (x / 100) * PLOT_WIDTH;
}

function toSvgY(y: number): number {
  return MARGIN.top + ((100 - y) / 100) * PLOT_HEIGHT;
}

export function StrategicPositioningSection({
  messMindPosition,
  alternatives,
  onUpdateMessMindPosition,
  onUpdateAlternativePosition,
}: StrategicPositioningSectionProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [draggingId, setDraggingId] = useState<'messmind' | string | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<'messmind' | string>('messmind');

  // Only show alternatives that have a user-entered name
  const namedAlternatives = alternatives.filter((alt) => alt.name.trim() !== '');

  const updatePointFromClientCoords = (
    clientX: number,
    clientY: number,
    targetId: 'messmind' | string,
    isFinal = false
  ) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const svgX = ((clientX - rect.left) / rect.width) * CHART_WIDTH;
    const svgY = ((clientY - rect.top) / rect.height) * CHART_HEIGHT;

    const rawX = ((svgX - MARGIN.left) / PLOT_WIDTH) * 100;
    const rawY = 100 - ((svgY - MARGIN.top) / PLOT_HEIGHT) * 100;

    const nextPos: StrategicCoordinate = {
      x: clampCoord(rawX),
      y: clampCoord(rawY),
    };

    if (targetId === 'messmind') {
      onUpdateMessMindPosition(nextPos, isFinal);
    } else {
      onUpdateAlternativePosition(targetId, nextPos, isFinal);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId) return;
    updatePointFromClientCoords(e.clientX, e.clientY, draggingId, false);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingId) return;
    updatePointFromClientCoords(e.clientX, e.clientY, draggingId, true);
    setDraggingId(null);
  };

  const selectedAlternative =
    selectedId === 'messmind'
      ? null
      : namedAlternatives.find((alt) => alt.id === selectedId) ?? null;

  const activeCoords: StrategicCoordinate | null =
    selectedId === 'messmind'
      ? messMindPosition
      : selectedAlternative?.position ?? null;

  return (
    <section
      id="positioning-map"
      aria-labelledby="positioning-map-heading"
      className="scroll-mt-20 rounded-lg border border-slate-200 bg-white"
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <h2
              id="positioning-map-heading"
              className="font-display text-lg font-semibold text-slate-900"
            >
              04. Positioning Map (Market Battlefield)
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Two-axis map comparing Level of Digitalization (X) against
              Predictive Demand Intelligence (Y). Place MessMind and your
              researched alternatives manually on the map to evaluate
              positioning separation.
            </p>
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-emerald-800">
              Proposed Positioning:
            </span>{' '}
            Not an independently validated market position
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-slate-200 xl:grid-cols-12 xl:divide-x xl:divide-y-0">
        {/* Interactive SVG Quadrant Chart */}
        <div className="p-5 sm:p-6 xl:col-span-8">
          <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3">
            <svg
              ref={svgRef}
              viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
              className="h-auto w-full touch-none select-none"
              role="img"
              aria-label="Strategic positioning map plotting Level of Digitalization on the X-axis and Predictive Demand Intelligence on the Y-axis"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => setDraggingId(null)}
              onClick={(e) => {
                if (selectedId === 'messmind' && !messMindPosition) {
                  updatePointFromClientCoords(
                    e.clientX,
                    e.clientY,
                    'messmind',
                    true
                  );
                } else if (selectedAlternative && !selectedAlternative.position) {
                  updatePointFromClientCoords(
                    e.clientX,
                    e.clientY,
                    selectedAlternative.id,
                    true
                  );
                }
              }}
            >
              {/* Plot Area Background */}
              <rect
                x={MARGIN.left}
                y={MARGIN.top}
                width={PLOT_WIDTH}
                height={PLOT_HEIGHT}
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth={1}
              />

              {/* Highlighted Target Quadrant */}
              <rect
                x={toSvgX(50)}
                y={toSvgY(100)}
                width={PLOT_WIDTH / 2}
                height={PLOT_HEIGHT / 2}
                fill="#ECFDF5"
                opacity={0.65}
              />

              {/* Grid Lines */}
              {[25, 50, 75].map((tick) => (
                <g key={tick}>
                  <line
                    x1={toSvgX(tick)}
                    y1={MARGIN.top}
                    x2={toSvgX(tick)}
                    y2={MARGIN.top + PLOT_HEIGHT}
                    stroke={tick === 50 ? '#94A3B8' : '#E2E8F0'}
                    strokeDasharray={tick === 50 ? '4 4' : '2 4'}
                    strokeWidth={1}
                  />
                  <line
                    x1={MARGIN.left}
                    y1={toSvgY(tick)}
                    x2={MARGIN.left + PLOT_WIDTH}
                    y2={toSvgY(tick)}
                    stroke={tick === 50 ? '#94A3B8' : '#E2E8F0'}
                    strokeDasharray={tick === 50 ? '4 4' : '2 4'}
                    strokeWidth={1}
                  />
                </g>
              ))}

              {/* Quadrant Labels */}
              <text
                x={toSvgX(4)}
                y={toSvgY(94)}
                fontSize="10"
                fill="#64748B"
                fontWeight="500"
              >
                Manual / High Judgment
              </text>
              <text
                x={toSvgX(96)}
                y={toSvgY(94)}
                fontSize="10"
                fill="#065F46"
                fontWeight="600"
                textAnchor="end"
              >
                Target Position: Digital + Predictive
              </text>
              <text
                x={toSvgX(4)}
                y={toSvgY(4)}
                fontSize="10"
                fill="#64748B"
                fontWeight="500"
              >
                Paper / Reactive Workflows
              </text>
              <text
                x={toSvgX(96)}
                y={toSvgY(4)}
                fontSize="10"
                fill="#64748B"
                fontWeight="500"
                textAnchor="end"
              >
                Digitized Records / Low Forecasting
              </text>

              {/* Axis Labels */}
              <text
                x={MARGIN.left + PLOT_WIDTH / 2}
                y={CHART_HEIGHT - 12}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#0F172A"
              >
                Level of Digitalization (Low → High)
              </text>
              <text
                x={18}
                y={MARGIN.top + PLOT_HEIGHT / 2}
                textAnchor="middle"
                fontSize="12"
                fontWeight="600"
                fill="#0F172A"
                transform={`rotate(-90 18 ${MARGIN.top + PLOT_HEIGHT / 2})`}
              >
                Predictive Demand Intelligence (Low → High)
              </text>

              {/* Low / High End Markers */}
              <text
                x={MARGIN.left}
                y={MARGIN.top + PLOT_HEIGHT + 18}
                fontSize="10"
                fill="#64748B"
              >
                Low (0)
              </text>
              <text
                x={MARGIN.left + PLOT_WIDTH}
                y={MARGIN.top + PLOT_HEIGHT + 18}
                textAnchor="end"
                fontSize="10"
                fill="#64748B"
              >
                High (100)
              </text>

              {/* User-Positioned Named Alternative Points Only */}
              {namedAlternatives.map((alt, idx) => {
                if (!alt.position) return null;
                const cx = toSvgX(alt.position.x);
                const cy = toSvgY(alt.position.y);
                const isSelected = selectedId === alt.id;
                const shortName =
                  alt.name.length > 26
                    ? `${alt.name.slice(0, 24)}…`
                    : alt.name;
                const labelOnLeft = alt.position.x > 64;
                return (
                  <g
                    key={alt.id}
                    className="cursor-grab active:cursor-grabbing"
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      setSelectedId(alt.id);
                      setDraggingId(alt.id);
                    }}
                  >
                    {isSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="none"
                        stroke="#0B162C"
                        strokeWidth={1.5}
                        strokeDasharray="3 2"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={7}
                      fill={isSelected ? '#0B162C' : '#334155'}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                    <text
                      x={cx}
                      y={cy + 3.5}
                      textAnchor="middle"
                      fontSize="8.5"
                      fontWeight="700"
                      fill="#FFFFFF"
                      pointerEvents="none"
                    >
                      {idx + 1}
                    </text>
                    <text
                      x={labelOnLeft ? cx - 11 : cx + 11}
                      y={cy + 3.5}
                      textAnchor={labelOnLeft ? 'end' : 'start'}
                      fontSize="10.5"
                      fontWeight={isSelected ? '600' : '500'}
                      fill="#1E293B"
                      pointerEvents="none"
                    >
                      {shortName}
                    </text>
                  </g>
                );
              })}

              {/* MessMind Proposed Positioning Marker (when placed) */}
              {messMindPosition && (
                <g
                  className="cursor-grab active:cursor-grabbing"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setSelectedId('messmind');
                    setDraggingId('messmind');
                  }}
                >
                  {selectedId === 'messmind' && (
                    <circle
                      cx={toSvgX(messMindPosition.x)}
                      cy={toSvgY(messMindPosition.y)}
                      r={14}
                      fill="none"
                      stroke="#15803D"
                      strokeWidth={1.5}
                      strokeDasharray="3 2"
                    />
                  )}
                  <circle
                    cx={toSvgX(messMindPosition.x)}
                    cy={toSvgY(messMindPosition.y)}
                    r={9}
                    fill="#15803D"
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                  />
                  <text
                    x={
                      messMindPosition.x > 60
                        ? toSvgX(messMindPosition.x) - 13
                        : toSvgX(messMindPosition.x) + 13
                    }
                    y={toSvgY(messMindPosition.y) - 2}
                    textAnchor={messMindPosition.x > 60 ? 'end' : 'start'}
                    fontSize="11.5"
                    fontWeight="700"
                    fill="#065F46"
                    pointerEvents="none"
                  >
                    MessMind
                  </text>
                  <text
                    x={
                      messMindPosition.x > 60
                        ? toSvgX(messMindPosition.x) - 13
                        : toSvgX(messMindPosition.x) + 13
                    }
                    y={toSvgY(messMindPosition.y) + 10}
                    textAnchor={messMindPosition.x > 60 ? 'end' : 'start'}
                    fontSize="9.5"
                    fontWeight="500"
                    fill="#047857"
                    pointerEvents="none"
                  >
                    Proposed Positioning
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Position Editor & Legend Panel */}
        <div className="flex flex-col justify-between p-6 xl:col-span-4">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-900">
              Edit Plot Coordinates
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Select MessMind or a researched alternative to place or adjust its
              X/Y coordinates.
            </p>

            {/* Entity Selector List */}
            <div className="mt-4 space-y-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedId('messmind');
                  if (!messMindPosition) {
                    onUpdateMessMindPosition({ x: 50, y: 50 }, true);
                  }
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                  selectedId === 'messmind'
                    ? 'border-emerald-600 bg-emerald-50/70 font-semibold text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="truncate">MessMind (Proposed)</span>
                <span className="ml-2 shrink-0 font-mono text-[11px] tabular-nums text-emerald-800">
                  {messMindPosition
                    ? `(${messMindPosition.x}, ${messMindPosition.y})`
                    : 'Place on map'}
                </span>
              </button>

              {namedAlternatives.length === 0 ? (
                <p className="rounded-md border border-dashed border-slate-200 px-3 py-2.5 text-xs text-slate-500">
                  Enter competitor or alternative names in Section 02 to place
                  them on the map.
                </p>
              ) : (
                namedAlternatives.map((alt, idx) => (
                  <button
                    key={alt.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(alt.id);
                      if (!alt.position) {
                        onUpdateAlternativePosition(
                          alt.id,
                          { x: 50, y: 50 },
                          true
                        );
                      }
                    }}
                    className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                      selectedId === alt.id
                        ? 'border-slate-900 bg-slate-100 font-semibold text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate">
                      <span className="mr-1.5 font-mono text-[11px] tabular-nums text-slate-500">
                        {idx + 1}.
                      </span>
                      {alt.name}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-[11px] tabular-nums text-slate-500">
                      {alt.position
                        ? `(${alt.position.x}, ${alt.position.y})`
                        : 'Place on map'}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Active Coordinate Sliders */}
            {activeCoords ? (
              <div className="mt-5 space-y-4 border-t border-slate-200 pt-5">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="coord-x"
                      className="font-semibold text-slate-700"
                    >
                      Level of Digitalization (X)
                    </label>
                    <span className="font-mono font-medium tabular-nums text-slate-900">
                      {activeCoords.x} / 100
                    </span>
                  </div>
                  <input
                    id="coord-x"
                    type="range"
                    min={0}
                    max={100}
                    value={activeCoords.x}
                    onChange={(e) => {
                      const nextPos = {
                        ...activeCoords,
                        x: Number(e.target.value),
                      };
                      if (selectedId === 'messmind') {
                        onUpdateMessMindPosition(nextPos, false);
                      } else if (selectedAlternative) {
                        onUpdateAlternativePosition(
                          selectedAlternative.id,
                          nextPos,
                          false
                        );
                      }
                    }}
                    className="mt-2 w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <label
                      htmlFor="coord-y"
                      className="font-semibold text-slate-700"
                    >
                      Predictive Demand Intelligence (Y)
                    </label>
                    <span className="font-mono font-medium tabular-nums text-slate-900">
                      {activeCoords.y} / 100
                    </span>
                  </div>
                  <input
                    id="coord-y"
                    type="range"
                    min={0}
                    max={100}
                    value={activeCoords.y}
                    onChange={(e) => {
                      const nextPos = {
                        ...activeCoords,
                        y: Number(e.target.value),
                      };
                      if (selectedId === 'messmind') {
                        onUpdateMessMindPosition(nextPos, false);
                      } else if (selectedAlternative) {
                        onUpdateAlternativePosition(
                          selectedAlternative.id,
                          nextPos,
                          false
                        );
                      }
                    }}
                    className="mt-2 w-full accent-emerald-700"
                  />
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-slate-200 bg-slate-50 px-3.5 py-3 text-xs text-slate-600">
                Click{' '}
                <span className="font-semibold text-slate-800">
                  MessMind (Proposed)
                </span>{' '}
                or click directly on the map canvas to place coordinates.
              </div>
            )}
          </div>

          <p className="mt-6 border-t border-slate-100 pt-4 text-xs leading-relaxed text-slate-500">
            Note: MessMind coordinates indicate proposed strategic positioning
            and require primary field validation.
          </p>
        </div>
      </div>
    </section>
  );
}
