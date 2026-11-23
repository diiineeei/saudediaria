import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import Spinner from "./Spinner";
import {
    PERIODS,
    TONE_CLASSES,
    classify,
    deleteRecord,
    formatDay,
    getDateFromRecord,
    getTimeFromRecord,
    recordId,
    suggestPeriod,
    updateRecord,
} from "../lib/glucose";

/**
 * Painel para editar ou excluir uma medição.
 * Em modo "completar" (`queue`), mostra o progresso e o botão "Pular".
 */
export default function EditRecordSheet({ record, onClose, onSaved, onDeleted, queue }) {
    const [glucose, setGlucose] = useState("");
    const [period, setPeriod] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [busy, setBusy] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!record) return;
        setGlucose(String(record.glucose ?? ""));
        setPeriod(record.period || "");
        setDate(getDateFromRecord(record));
        setTime(getTimeFromRecord(record) === "--:--" ? "" : getTimeFromRecord(record));
        setConfirmDelete(false);
        setError("");
    }, [record]);

    if (!record) return null;

    const suggestion = !record.period ? suggestPeriod(time) : "";
    const value = Number(glucose);
    const tone = classify(glucose);

    const save = async () => {
        if (!Number.isFinite(value) || value <= 0) return setError("Informe o valor da glicemia.");
        if (!time) return setError("Informe o horário.");
        setBusy("save");
        setError("");
        try {
            const updated = await updateRecord(recordId(record), { glucose: value, time, date, period });
            if (navigator.vibrate) navigator.vibrate(20);
            onSaved({ ...record, ...updated, glucose: value, time, date, period: period || undefined });
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy("");
        }
    };

    const remove = async () => {
        if (!confirmDelete) return setConfirmDelete(true);
        setBusy("delete");
        setError("");
        try {
            await deleteRecord(recordId(record));
            onDeleted(recordId(record));
        } catch (err) {
            setError(err.message);
            setConfirmDelete(false);
        } finally {
            setBusy("");
        }
    };

    const title = queue ? `Completar momento · ${queue.index} de ${queue.total}` : "Editar medição";

    return (
        <BottomSheet open onClose={onClose} title={title}>
            <p className="-mt-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                {formatDay(getDateFromRecord(record))} às {getTimeFromRecord(record)}
            </p>

            {/* Valor */}
            <div className="relative mb-4">
                <input
                    type="number"
                    inputMode="numeric"
                    value={glucose}
                    onChange={(e) => setGlucose(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
                    aria-label="Glicemia em mg/dL"
                    className="w-full rounded-2xl border-2 border-gray-200 bg-gray-50 py-3 pl-4 pr-20 text-center text-4xl font-bold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">mg/dL</span>
                {tone.label && (
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASSES[tone.tone]}`}>
                        {tone.label}
                    </span>
                )}
            </div>

            {/* Momento */}
            <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Momento</span>
                {suggestion && !period && <span className="text-xs text-google-blue dark:text-google-blue-light">✨ sugerido pelo horário</span>}
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Momento da medição">
                {PERIODS.map((p) => {
                    const selected = period === p.key;
                    const suggested = !period && suggestion === p.key;
                    return (
                        <button
                            key={p.key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => setPeriod(selected ? "" : p.key)}
                            className={`relative flex min-h-[48px] items-center gap-2 rounded-2xl border-2 px-3 text-left text-sm font-semibold transition active:scale-[0.97] ${
                                selected
                                    ? "border-google-blue bg-google-blue text-white dark:border-google-blue-light dark:bg-google-blue-light"
                                    : suggested
                                      ? "border-dashed border-google-blue bg-google-blue/5 text-gray-800 dark:border-google-blue-light dark:bg-google-blue-light/10 dark:text-gray-100"
                                      : "border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                            }`}
                        >
                            <span className="text-lg leading-none" aria-hidden="true">
                                {p.icon}
                            </span>
                            <span className="leading-tight">{p.label}</span>
                            {suggested && <span className="absolute -right-1 -top-1.5 text-sm" aria-label="sugerido">✨</span>}
                        </button>
                    );
                })}
            </div>

            {/* Data e horário */}
            <div className="mb-4 grid grid-cols-2 gap-2">
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">Data</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => e.target.value && setDate(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]"
                    />
                </label>
                <label className="block">
                    <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">Horário</span>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]"
                    />
                </label>
            </div>

            {error && (
                <p className="mb-3 rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" role="alert">
                    {error}
                </p>
            )}

            <button
                type="button"
                onClick={save}
                disabled={!!busy}
                className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-google-blue text-lg font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
            >
                {busy === "save" && <Spinner />} {queue && queue.index < queue.total ? "Salvar e ir para a próxima" : "Salvar"}
            </button>

            <div className="mt-2 grid grid-cols-2 gap-2">
                {queue ? (
                    <button
                        type="button"
                        onClick={queue.onSkip}
                        disabled={!!busy}
                        className="min-h-[48px] rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        Pular
                    </button>
                ) : (
                    <span />
                )}
                <button
                    type="button"
                    onClick={remove}
                    disabled={!!busy}
                    className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl text-sm font-bold transition ${
                        confirmDelete
                            ? "bg-rose-600 text-white"
                            : "text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                    }`}
                >
                    {busy === "delete" && <Spinner className="h-4 w-4" />}
                    {confirmDelete ? "Toque de novo para excluir" : "Excluir medição"}
                </button>
            </div>
        </BottomSheet>
    );
}
