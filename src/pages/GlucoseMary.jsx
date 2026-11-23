import { useCallback, useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import HistoryList from "../components/HistoryList";
import ExportPdfSheet from "../components/ExportPdfSheet";
import ShareLinkSheet from "../components/ShareLinkSheet";
import EditRecordSheet from "../components/EditRecordSheet";
import {
    CREATE_ENDPOINT,
    PERIODS,
    PERIOD_BY_KEY,
    TONE_CLASSES,
    classify,
    fetchRecords as fetchRecordsApi,
    formatDay,
    getCurrentTime,
    getDateFromRecord,
    getTimeFromRecord,
    hasPeriod,
    recordId,
    sortRecordsDesc,
    todayKey,
} from "../lib/glucose";

export default function GlucoseMary() {
    const [glucose, setGlucose] = useState("");
    const [period, setPeriod] = useState("");
    const [time, setTime] = useState(getCurrentTime);
    const [isManualTime, setIsManualTime] = useState(false);
    const [status, setStatus] = useState(null); // { type: "success" | "error", text }
    const [isSaving, setIsSaving] = useState(false);

    const [records, setRecords] = useState([]);
    const [pdfOpen, setPdfOpen] = useState(false);
    const [linkOpen, setLinkOpen] = useState(false);
    // Edição: { id } de uma medição; no modo "completar", também a fila de ids sem momento.
    const [editing, setEditing] = useState(null); // { id, queue?: string[], skipped?: string[] }
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
            setRecords(await fetchRecordsApi());
        } catch (error) {
            setRecordsError(error.message || "Erro ao consultar registros.");
        } finally {
            setIsLoadingRecords(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const sortedRecords = useMemo(() => sortRecordsDesc(records), [records]);

    const missingPeriod = useMemo(() => sortedRecords.filter((r) => !hasPeriod(r) && recordId(r)), [sortedRecords]);
    const editingRecord = editing ? records.find((r) => recordId(r) === editing.id) : null;

    const startCompleting = () => {
        const queue = missingPeriod.map(recordId);
        if (queue.length) setEditing({ id: queue[0], queue });
    };

    const goNext = (doneId, skipped = false) => {
        if (!editing?.queue) return setEditing(null);
        const pos = editing.queue.indexOf(doneId);
        const nextId = editing.queue[pos + 1];
        if (nextId) setEditing({ ...editing, id: nextId, skipped: skipped ? [...(editing.skipped || []), doneId] : editing.skipped });
        else setEditing(null);
    };

    const onSaved = (updated) => {
        setRecords((list) => list.map((r) => (recordId(r) === recordId(updated) ? updated : r)));
        if (editing?.queue) goNext(recordId(updated));
        else setEditing(null);
    };

    const onDeleted = (id) => {
        if (editing?.queue) goNext(id);
        else setEditing(null);
        setRecords((list) => list.filter((r) => recordId(r) !== id));
    };

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

                {/* Ações para os médicos */}
                <div className="mb-4 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setPdfOpen(true)}
                        disabled={!records.length}
                        className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 transition active:scale-[0.97] disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                        <span className="text-lg" aria-hidden="true">📄</span> Exportar PDF
                    </button>
                    <button
                        type="button"
                        onClick={() => setLinkOpen(true)}
                        className="flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white px-3 text-sm font-bold text-gray-800 transition active:scale-[0.97] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    >
                        <span className="text-lg" aria-hidden="true">🔗</span> Link médicos
                    </button>
                </div>

                {recordsError && (
                    <div className="mb-3 rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                        {recordsError}
                    </div>
                )}

                {missingPeriod.length > 0 && (
                    <button
                        type="button"
                        onClick={startCompleting}
                        className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-google-blue/30 bg-google-blue/5 px-4 py-3 text-left transition active:scale-[0.99] dark:border-google-blue-light/30 dark:bg-google-blue-light/10"
                    >
                        <span className="text-2xl" aria-hidden="true">✨</span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-gray-900 dark:text-white">
                                {missingPeriod.length} {missingPeriod.length === 1 ? "medição sem momento" : "medições sem momento"}
                            </span>
                            <span className="block text-xs text-gray-600 dark:text-gray-300">Toque para completar uma por uma, com sugestão pelo horário</span>
                        </span>
                        <span className="text-sm font-bold text-google-blue dark:text-google-blue-light">Completar</span>
                    </button>
                )}

                {(!isLoadingRecords || records.length > 0) && !recordsError && (
                    <>
                        <HistoryList records={sortedRecords} onSelect={(item) => setEditing({ id: recordId(item) })} />
                        {records.length > 0 && (
                            <p className="mt-3 text-center text-xs text-gray-400 dark:text-gray-500">Toque numa medição para editar ou excluir</p>
                        )}
                    </>
                )}
            </section>

            <ExportPdfSheet open={pdfOpen} onClose={() => setPdfOpen(false)} records={records} />
            <ShareLinkSheet open={linkOpen} onClose={() => setLinkOpen(false)} />
            {editingRecord && (
                <EditRecordSheet
                    key={recordId(editingRecord)}
                    record={editingRecord}
                    onClose={() => setEditing(null)}
                    onSaved={onSaved}
                    onDeleted={onDeleted}
                    queue={
                        editing.queue
                            ? {
                                  index: editing.queue.indexOf(editing.id) + 1,
                                  total: editing.queue.length,
                                  onSkip: () => goNext(editing.id, true),
                              }
                            : undefined
                    }
                />
            )}
        </div>
    );
}
