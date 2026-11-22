import { useMemo, useState } from "react";
import { PERIOD_BY_KEY, TONE_CLASSES, classify, formatDay, getDateFromRecord, getTimeFromRecord } from "../lib/glucose";

const PAGE_SIZE = 10;

/** Lista de medições agrupadas por dia. `records` já deve vir ordenado (mais recente primeiro). */
export default function HistoryList({ records, emptyText = "Nenhuma medição registrada ainda" }) {
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const groups = useMemo(() => {
        const out = [];
        for (const item of records.slice(0, visibleCount)) {
            const key = getDateFromRecord(item);
            const last = out[out.length - 1];
            if (!last || last.date !== key) out.push({ date: key, items: [item] });
            else last.items.push(item);
        }
        return out;
    }, [records, visibleCount]);

    if (!groups.length) {
        return (
            <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center dark:border-gray-700">
                <p className="text-4xl" aria-hidden="true">📭</p>
                <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">{emptyText}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {groups.map((group) => (
                <div key={group.date || "sem-data"}>
                    <div className="mb-2 flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        <span>{formatDay(group.date)}</span>
                        <span>
                            {group.items.length} {group.items.length === 1 ? "medição" : "medições"}
                        </span>
                    </div>
                    <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                        {group.items.map((item, index) => {
                            const tone = classify(item.glucose);
                            const p = PERIOD_BY_KEY[item.period];
                            return (
                                <li
                                    key={item.id || item._id || `${group.date}-${getTimeFromRecord(item)}-${index}`}
                                    className="flex items-center gap-3 px-4 py-3"
                                >
                                    <div className="w-12 shrink-0 font-mono text-sm font-semibold text-gray-500 dark:text-gray-400">
                                        {getTimeFromRecord(item)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        {p ? (
                                            <span className="inline-flex items-center gap-1 truncate rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                                <span aria-hidden="true">{p.icon}</span>
                                                {p.short}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">—</span>
                                        )}
                                    </div>
                                    <div className={`shrink-0 rounded-xl px-3 py-1 text-right ${TONE_CLASSES[tone.tone]}`}>
                                        <span className="text-lg font-bold">{item.glucose ?? "-"}</span>
                                        <span className="ml-1 text-[11px] font-medium opacity-80">mg/dL</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}

            {records.length > visibleCount && (
                <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="min-h-[48px] w-full rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-google-blue/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                >
                    Mostrar mais
                </button>
            )}
        </div>
    );
}
