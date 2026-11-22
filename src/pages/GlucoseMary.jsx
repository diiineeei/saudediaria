import { useCallback, useEffect, useMemo, useState } from "react";

const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://saudediaria-990926851328.southamerica-east1.run.app";
const CREATE_ENDPOINT = `${API_BASE}/api/glicemia/mary`;
const LIST_ENDPOINT = `${API_BASE}/api/glicemia/mary/list`;
const PAGE_SIZE = 10;

// Momentos da medição (opcional). As chaves são as mesmas aceitas pela API.
const PERIODS = [
    { key: "antes_cafe", label: "Antes do café", short: "Antes café", icon: "☕" },
    { key: "pos_cafe", label: "Pós café", short: "Pós café", icon: "🥐" },
    { key: "antes_almoco", label: "Antes do almoço", short: "Antes almoço", icon: "🍽️" },
    { key: "pos_almoco", label: "Pós almoço", short: "Pós almoço", icon: "🍲" },
    { key: "antes_jantar", label: "Antes do jantar", short: "Antes jantar", icon: "🌙" },
    { key: "pos_jantar", label: "Pós jantar", short: "Pós jantar", icon: "🌜" },
];
const PERIOD_BY_KEY = Object.fromEntries(PERIODS.map((p) => [p.key, p]));

const getCurrentTime = () => new Date().toTimeString().substring(0, 5);
const getDateFromRecord = (item) => item?.date || item?.createdAt?.split("T")[0] || "";
const getTimeFromRecord = (item) => item?.time || item?.createdAt?.substring(11, 16) || "--:--";

const todayKey = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDay = (dateStr) => {
    if (!dateStr) return "Data não informada";
    const [y, m, d] = dateStr.split("-");
    if (!d) return dateStr;
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(date, today)) return "Hoje";
    if (same(date, yesterday)) return "Ontem";
    const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${d}/${m}`;
};

// Faixas gerais (70–180 mg/dL). Servem só como referência visual.
const classify = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return { label: "", tone: "neutral" };
    if (n < 70) return { label: "Baixa", tone: "low" };
    if (n > 180) return { label: "Alta", tone: "high" };
    return { label: "Normal", tone: "ok" };
};

const TONE_CLASSES = {
    low: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    high: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

const Spinner = ({ className = "h-5 w-5" }) => (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

export default function GlucoseMary() {
    const [glucose, setGlucose] = useState("");
    const [period, setPeriod] = useState("");
    const [time, setTime] = useState(getCurrentTime);
    const [isManualTime, setIsManualTime] = useState(false);
    const [status, setStatus] = useState(null); // { type: "success" | "error", text }
    const [isSaving, setIsSaving] = useState(false);

    const [records, setRecords] = useState([]);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState("");

    // Mantém o horário atualizado enquanto o usuário não escolher outro.
    useEffect(() => {
        if (isManualTime) return undefined;
        setTime(getCurrentTime());
        const id = setInterval(() => setTime(getCurrentTime()), 30_000);
        return () => clearInterval(id);
    }, [isManualTime]);

    // Some com a mensagem de sucesso depois de alguns segundos.
    useEffect(() => {
        if (status?.type !== "success") return undefined;
        const id = setTimeout(() => setStatus(null), 4000);
        return () => clearTimeout(id);
    }, [status]);

    const fetchRecords = useCallback(async () => {
        setIsLoadingRecords(true);
        setRecordsError("");
        try {
            const response = await fetch(LIST_ENDPOINT);
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Erro ao consultar registros.");
            }
            const json = await response.json();
            if (!Array.isArray(json)) throw new Error("Formato inesperado recebido da API.");
            setRecords(json);
        } catch (error) {
            setRecordsError(error.message || "Erro ao consultar registros.");
        } finally {
            setIsLoadingRecords(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const sortedRecords = useMemo(() => {
        return [...records].sort((a, b) => {
            const ta = new Date(`${getDateFromRecord(a)}T${a.time || "00:00"}`);
            const tb = new Date(`${getDateFromRecord(b)}T${b.time || "00:00"}`);
            return tb - ta;
        });
    }, [records]);

    const groupedByDay = useMemo(() => {
        const groups = [];
        for (const item of sortedRecords.slice(0, visibleCount)) {
            const dateKey = getDateFromRecord(item) || "";
            const last = groups[groups.length - 1];
            if (!last || last.date !== dateKey) groups.push({ date: dateKey, items: [item] });
            else last.items.push(item);
        }
        return groups;
    }, [sortedRecords, visibleCount]);

    const lastRecord = sortedRecords[0];
    const todayCount = useMemo(
        () => records.filter((r) => getDateFromRecord(r) === todayKey()).length,
        [records],
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSaving) return;

        const value = Number(glucose);
        if (!glucose || !Number.isFinite(value) || value <= 0) {
            setStatus({ type: "error", text: "Informe o valor da glicemia." });
            return;
        }
        if (!time) {
            setStatus({ type: "error", text: "Informe o horário." });
            return;
        }

        setIsSaving(true);
        setStatus(null);

        const payload = { glucose: value, time };
        if (period) payload.period = period;

        try {
            const response = await fetch(CREATE_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Erro ao enviar os dados.");
            }

            setStatus({ type: "success", text: `Glicemia de ${value} mg/dL registrada!` });
            setGlucose("");
            setPeriod("");
            setIsManualTime(false);
            if (navigator.vibrate) navigator.vibrate(30);
            fetchRecords();
        } catch (error) {
            setStatus({ type: "error", text: error.message || "Erro ao enviar os dados." });
        } finally {
            setIsSaving(false);
        }
    };

    const preview = classify(glucose);

    return (
        <div className="mx-auto w-full max-w-xl px-4 pb-10 pt-4 md:pt-8">
            {/* Resumo */}
            <section className="mb-4 flex items-center gap-3 rounded-3xl bg-gradient-to-br from-google-blue to-indigo-600 p-4 text-white shadow-lg">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                    🩸
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-white/70">Última medição</p>
                    {lastRecord ? (
                        <>
                            <p className="text-2xl font-bold leading-tight">
                                {lastRecord.glucose}
                                <span className="ml-1 text-sm font-medium text-white/80">mg/dL</span>
                            </p>
                            <p className="truncate text-sm text-white/80">
                                {formatDay(getDateFromRecord(lastRecord))} · {getTimeFromRecord(lastRecord)}
                                {PERIOD_BY_KEY[lastRecord.period] && ` · ${PERIOD_BY_KEY[lastRecord.period].label}`}
                            </p>
                        </>
                    ) : (
                        <p className="text-lg font-semibold">{isLoadingRecords ? "Carregando…" : "Nenhuma ainda"}</p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-3xl font-bold leading-none">{todayCount}</p>
                    <p className="text-xs text-white/70">hoje</p>
                </div>
            </section>

            {/* Formulário */}
            <form
                onSubmit={handleSubmit}
                className="mb-6 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
                <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-gray-100">Nova medição</h2>

                {/* Valor */}
                <label htmlFor="glucose" className="mb-1 block text-sm font-semibold text-gray-600 dark:text-gray-300">
                    Glicemia
                </label>
                <div className="relative mb-2">
                    <input
                        id="glucose"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        enterKeyHint="done"
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                        placeholder="000"
                        min="1"
                        max="999"
                        className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 py-4 pl-5 pr-24 text-center text-5xl font-bold tracking-tight text-gray-900 placeholder-gray-300 outline-none transition focus:border-google-blue focus:bg-white dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-600 dark:focus:border-google-blue-light"
                    />
                    <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-base font-semibold text-gray-400">
                        mg/dL
                    </span>
                </div>
                <div className="mb-5 h-6 text-center">
                    {glucose && preview.label && (
                        <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${TONE_CLASSES[preview.tone]}`}>
                            {preview.label}
                        </span>
                    )}
                </div>

                {/* Momento */}
                <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Momento</span>
                    <span className="text-xs text-gray-400">opcional</span>
                </div>
                <div className="mb-5 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Momento da medição">
                    {PERIODS.map((p) => {
                        const selected = period === p.key;
                        return (
                            <button
                                key={p.key}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                onClick={() => setPeriod(selected ? "" : p.key)}
                                className={`flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-3 py-2 text-left text-sm font-semibold transition active:scale-[0.97] ${
                                    selected
                                        ? "border-google-blue bg-google-blue text-white shadow-md dark:border-google-blue-light dark:bg-google-blue-light"
                                        : "border-gray-200 bg-white text-gray-700 hover:border-google-blue/50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                                }`}
                            >
                                <span className="text-xl leading-none" aria-hidden="true">{p.icon}</span>
                                <span className="leading-tight">{p.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Horário */}
                <div className="mb-5 flex items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3 dark:bg-gray-900">
                    <label htmlFor="time" className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                        Horário
                    </label>
                    <input
                        id="time"
                        type="time"
                        value={time}
                        onChange={(e) => {
                            setTime(e.target.value);
                            setIsManualTime(true);
                        }}
                        className="ml-auto min-h-[44px] rounded-xl border border-gray-200 bg-white px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:[color-scheme:dark]"
                    />
                    {isManualTime && (
                        <button
                            type="button"
                            onClick={() => setIsManualTime(false)}
                            className="min-h-[44px] rounded-xl px-3 text-sm font-semibold text-google-blue hover:bg-google-blue/10 dark:text-google-blue-light"
                        >
                            Agora
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-google-blue px-6 text-lg font-bold text-white shadow-md transition hover:bg-google-blue-dark active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSaving ? (
                        <>
                            <Spinner /> Salvando…
                        </>
                    ) : (
                        "Registrar"
                    )}
                </button>

                {status && (
                    <div
                        role="status"
                        className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
                            status.type === "success"
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "bg-rose-50 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300"
                        }`}
                    >
                        {status.type === "success" ? "✓ " : ""}
                        {status.text}
                    </div>
                )}
            </form>

            {/* Histórico */}
            <section>
                <div className="mb-3 flex items-center justify-between px-1">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Histórico</h2>
                    <button
                        type="button"
                        onClick={fetchRecords}
                        disabled={isLoadingRecords}
                        className="flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-google-blue hover:bg-google-blue/10 disabled:opacity-60 dark:text-google-blue-light"
                        aria-label="Atualizar histórico"
                    >
                        {isLoadingRecords ? <Spinner className="h-4 w-4" /> : <span aria-hidden="true">↻</span>}
                        Atualizar
                    </button>
                </div>

                {recordsError && (
                    <div className="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                        {recordsError}
                    </div>
                )}

                {groupedByDay.length > 0 ? (
                    <div className="space-y-4">
                        {groupedByDay.map((group) => (
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

                        {sortedRecords.length > visibleCount && (
                            <button
                                type="button"
                                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                className="min-h-[48px] w-full rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-google-blue/50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                            >
                                Mostrar mais
                            </button>
                        )}
                    </div>
                ) : (
                    !isLoadingRecords &&
                    !recordsError && (
                        <div className="rounded-2xl border border-dashed border-gray-300 py-10 text-center dark:border-gray-700">
                            <p className="text-4xl" aria-hidden="true">📭</p>
                            <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                Nenhuma medição registrada ainda
                            </p>
                        </div>
                    )
                )}
            </section>
        </div>
    );
}
