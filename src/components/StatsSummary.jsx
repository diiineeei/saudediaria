import { PERIODS, RANGE_HIGH, RANGE_LOW, computeStats } from "../lib/glucose";

/** Cartões de resumo + média por momento. */
export default function StatsSummary({ records }) {
    const stats = computeStats(records);
    if (!stats) return null;

    const byPeriod = PERIODS.map((p) => {
        const vals = records.filter((r) => r.period === p.key).map((r) => Number(r.glucose)).filter(Number.isFinite);
        return { ...p, avg: vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null, n: vals.length };
    }).filter((p) => p.n);

    const cards = [
        { label: "Média", value: stats.avg, unit: "mg/dL" },
        { label: `Entre ${RANGE_LOW}–${RANGE_HIGH}`, value: `${stats.inRangePct}%` },
        { label: "Medições", value: stats.count },
        { label: "Mínima", value: stats.min, unit: "mg/dL" },
        { label: "Máxima", value: stats.max, unit: "mg/dL" },
        { label: `<${RANGE_LOW} / >${RANGE_HIGH}`, value: `${stats.low} / ${stats.high}` },
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-2xl border border-gray-200 bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-800">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{c.label}</p>
                        <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                            {c.value}
                            {c.unit && <span className="ml-0.5 text-[10px] font-medium text-gray-400">{c.unit}</span>}
                        </p>
                    </div>
                ))}
            </div>

            {byPeriod.length > 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Média por momento</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {byPeriod.map((p) => (
                            <div key={p.key} className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">
                                    <span aria-hidden="true">{p.icon}</span> {p.short}
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">{p.avg}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
