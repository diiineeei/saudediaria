import { useEffect, useMemo, useRef, useState } from "react";
import { PERIOD_BY_KEY, RANGE_HIGH, RANGE_LOW, classify, getMetas, formatDateBR, getDateFromRecord, getTimeFromRecord } from "../lib/glucose";

const HEIGHT = 240;
const PAD = { top: 14, right: 34, bottom: 26, left: 34 };
const DAY = 86_400_000;

const toTime = (r) => new Date(`${getDateFromRecord(r)}T${getTimeFromRecord(r) === "--:--" ? "12:00" : getTimeFromRecord(r)}`).getTime();
const dayStart = (key) => new Date(`${key}T00:00`).getTime();

// Cores validadas (CVD e contraste, claro e escuro): série no azul do slot 1; pontos fora da faixa usam as cores de status (sempre com rótulo no balão).
const DOT_CLASS = {
    ok: "fill-[#2a78d6] dark:fill-[#3987e5]",
    low: "fill-[#c98500]",
    high: "fill-[#d03b3b]",
};

/**
 * Glicemia ao longo do tempo, com a faixa 70–180 destacada.
 * `records` já filtrados; `from`/`to` (AAAA-MM-DD) definem o eixo X.
 */
export default function GlucoseChart({ records, from, to, onModeChange }) {
    const wrapRef = useRef(null);
    const [width, setWidth] = useState(340);
    const [hover, setHover] = useState(null);

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return undefined;
        const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, Math.round(entry.contentRect.width))));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const points = useMemo(
        () =>
            records
                .map((r) => ({ r, t: toTime(r), v: Number(r.glucose) }))
                .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v))
                .sort((a, b) => a.t - b.t),
        [records],
    );

    const x0 = dayStart(from);
    const x1 = dayStart(to) + DAY;
    const values = points.map((p) => p.v);
    const yMin = Math.min(50, Math.floor((Math.min(...values, 999) - 10) / 50) * 50);
    const yMax = Math.max(250, Math.ceil((Math.max(...values, 0) + 10) / 50) * 50);

    // Faixa verde: 70 até a meta de 1h após (com receita) ou 180 (sem receita).
    const metas = getMetas();
    const bandTop = metas ? metas.pos : RANGE_HIGH;
    const limitLines = metas ? [RANGE_LOW, metas.pre, metas.pos] : [RANGE_LOW, RANGE_HIGH];

    const innerW = width - PAD.left - PAD.right;
    const innerH = HEIGHT - PAD.top - PAD.bottom;
    const sx = (t) => PAD.left + ((t - x0) / (x1 - x0)) * innerW;
    const sy = (v) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * innerH;

    const yTicks = [];
    for (let v = yMin; v <= yMax; v += 50) yTicks.push(v);

    const days = Math.round((x1 - x0) / DAY);
    const stepDays = days <= 7 ? 1 : days <= 14 ? 2 : days <= 31 ? 7 : 15;
    const xTicks = [];
    for (let t = x0; t < x1; t += stepDays * DAY) xTicks.push(t);

    // Com várias medições por dia (antes/depois das refeições), ligar tudo vira zigue-zague:
    // nesse caso mostramos os pontos e uma linha com a média de cada dia.
    const dailyMode = points.length > 1 && points.length / Math.max(1, new Set(points.map((p) => getDateFromRecord(p.r))).size) > 1.5;
    const linePoints = dailyMode
        ? [...points.reduce((m, p) => {
              const k = getDateFromRecord(p.r);
              const e = m.get(k) || { sum: 0, n: 0 };
              m.set(k, { sum: e.sum + p.v, n: e.n + 1 });
              return m;
          }, new Map())].map(([k, e]) => ({ t: dayStart(k) + DAY / 2, v: e.sum / e.n }))
        : points;
    const path = linePoints.map((p, i) => `${i ? "L" : "M"}${sx(p.t).toFixed(1)},${sy(p.v).toFixed(1)}`).join("");

    useEffect(() => {
        onModeChange?.(dailyMode);
    }, [dailyMode, onModeChange]);

    const onMove = (e) => {
        if (!points.length) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const px = e.clientX - rect.left;
        let best = null;
        for (const p of points) {
            const d = Math.abs(sx(p.t) - px);
            if (!best || d < best.d) best = { d, p };
        }
        setHover(best?.p || null);
    };

    const hx = hover ? sx(hover.t) : 0;
    const hy = hover ? sy(hover.v) : 0;
    const tone = hover ? classify(hover.v, hover.r.period) : null;
    const period = hover ? PERIOD_BY_KEY[hover.r.period] : null;

    return (
        <div ref={wrapRef} className="relative w-full select-none">
            <svg
                width={width}
                height={HEIGHT}
                role="img"
                aria-label={`Gráfico da glicemia de ${formatDateBR(from)} a ${formatDateBR(to)}, ${points.length} medições`}
                className="block touch-pan-y"
                onPointerMove={onMove}
                onPointerDown={onMove}
                onPointerLeave={() => setHover(null)}
            >
                {/* Faixa alvo 70–180 */}
                <rect
                    x={PAD.left}
                    y={sy(bandTop)}
                    width={innerW}
                    height={sy(RANGE_LOW) - sy(bandTop)}
                    className="fill-emerald-500/10 dark:fill-emerald-400/10"
                />

                {/* Grade e eixo Y */}
                {yTicks.map((v) => (
                    <g key={v}>
                        <line x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)} className="stroke-gray-200 dark:stroke-gray-700" strokeWidth="1" />
                        <text x={PAD.left - 6} y={sy(v)} dy="0.32em" textAnchor="end" className="fill-gray-500 text-[10px] tabular-nums dark:fill-gray-400">
                            {v}
                        </text>
                    </g>
                ))}

                {/* Limites da faixa, rotulados à direita */}
                {limitLines.map((v) => (
                    <g key={`lim-${v}`}>
                        <line x1={PAD.left} x2={width - PAD.right} y1={sy(v)} y2={sy(v)} className="stroke-emerald-600/40 dark:stroke-emerald-400/40" strokeWidth="1" />
                        <text x={width - PAD.right + 4} y={sy(v)} dy="0.32em" className="fill-emerald-700 text-[10px] font-semibold tabular-nums dark:fill-emerald-300">
                            {v}
                        </text>
                    </g>
                ))}

                {/* Eixo X */}
                {xTicks.map((t) => (
                    <text
                        key={t}
                        x={sx(t + DAY / 2)}
                        y={HEIGHT - 8}
                        textAnchor="middle"
                        className="fill-gray-500 text-[10px] tabular-nums dark:fill-gray-400"
                    >
                        {new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                    </text>
                ))}

                {/* Linha da série */}
                {linePoints.length > 1 && (
                    <path d={path} fill="none" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" className="stroke-[#2a78d6] dark:stroke-[#3987e5]" />
                )}

                {/* Mira */}
                {hover && (
                    <line x1={hx} x2={hx} y1={Math.min(hy, PAD.top + 70)} y2={HEIGHT - PAD.bottom} className="stroke-gray-400 dark:stroke-gray-500" strokeWidth="1" />
                )}

                {/* Pontos com anel da cor do fundo */}
                {points.map((p) => {
                    const t = classify(p.v, p.r.period).tone;
                    const active = hover === p;
                    return (
                        <circle
                            key={`${p.t}-${p.v}-${p.r._id || ""}`}
                            cx={sx(p.t)}
                            cy={sy(p.v)}
                            r={active ? 6 : t === "ok" ? (dailyMode ? 3 : 3.5) : 4.5}
                            strokeWidth="2"
                            className={`${dailyMode && t === "ok" && !active ? "fill-[#2a78d6]/45 dark:fill-[#3987e5]/50" : DOT_CLASS[t] || DOT_CLASS.ok} stroke-white dark:stroke-gray-800`}
                        />
                    );
                })}

                {!points.length && (
                    <text x={width / 2} y={HEIGHT / 2} textAnchor="middle" className="fill-gray-400 text-sm">
                        Sem medições neste filtro
                    </text>
                )}
            </svg>

            {hover && (
                <div
                    className="pointer-events-none absolute z-10 min-w-[128px] rounded-xl border border-gray-200 bg-white px-3 py-2 text-left shadow-lg dark:border-gray-600 dark:bg-gray-900"
                    style={{
                        left: Math.min(Math.max(hx - 64, 0), width - 140),
                        top: -8,
                    }}
                >
                    <p className="text-lg font-bold leading-tight text-gray-900 dark:text-white">
                        {hover.v} <span className="text-xs font-medium text-gray-500">mg/dL</span>
                    </p>
                    {tone.tone !== "ok" && (
                        <p className={`text-xs font-bold ${tone.tone === "high" ? "text-rose-700 dark:text-rose-300" : "text-amber-700 dark:text-amber-300"}`}>
                            {tone.tone === "high" ? "▲" : "▼"} {tone.label}
                        </p>
                    )}
                    <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-300">
                        {formatDateBR(getDateFromRecord(hover.r)).slice(0, 5)} · {getTimeFromRecord(hover.r)}
                    </p>
                    {period && <p className="text-xs text-gray-500 dark:text-gray-400">{period.label}</p>}
                </div>
            )}
        </div>
    );
}
