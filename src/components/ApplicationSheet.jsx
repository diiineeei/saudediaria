import { useState } from "react";
import BottomSheet from "./BottomSheet";
import Spinner from "./Spinner";
import { formatDay, getDateFromRecord, recordId } from "../lib/glucose";
import { INSULIN_MOMENTS, deleteApplication, updateApplication } from "../lib/insulin";

/** Editar ou excluir uma aplicação de insulina registrada. */
export default function ApplicationSheet({ application: a, onClose, onSaved, onDeleted }) {
    const [units, setUnits] = useState(a.units);
    const [moment, setMoment] = useState(a.moment);
    const [date, setDate] = useState(getDateFromRecord(a));
    const [time, setTime] = useState(a.time);
    const [busy, setBusy] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState("");

    const save = async () => {
        if (!(Number(units) > 0)) return setError("Informe as unidades.");
        setBusy("save");
        setError("");
        try {
            const updated = await updateApplication(recordId(a), { kind: a.kind, name: a.name, units: Number(units), moment, date, time });
            onSaved({ ...a, ...updated });
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy("");
        }
    };

    const remove = async () => {
        if (!confirmDelete) return setConfirmDelete(true);
        setBusy("delete");
        try {
            await deleteApplication(recordId(a));
            onDeleted(recordId(a));
        } catch (e) {
            setError(e.message);
            setConfirmDelete(false);
        } finally {
            setBusy("");
        }
    };

    const field =
        "min-h-[44px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]";

    return (
        <BottomSheet open onClose={onClose} title={`Editar aplicação · ${a.name || (a.kind === "rapida" ? "rápida" : "basal")}`}>
            <p className="-mt-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
                {formatDay(getDateFromRecord(a))} às {a.time}
                {a.glucose ? ` · dextro ${a.glucose}` : ""}
                {a.suggested ? ` · receita: ${a.suggested} un` : ""}
            </p>

            <label className="mb-3 block">
                <span className="mb-1 block text-xs font-semibold text-gray-500">Unidades</span>
                <input type="number" inputMode="decimal" className={`${field} text-center text-3xl`} value={units} onChange={(e) => setUnits(e.target.value)} />
            </label>

            <div className="mb-3 grid grid-cols-4 gap-1.5">
                {INSULIN_MOMENTS.map((m) => (
                    <button
                        key={m.key}
                        type="button"
                        onClick={() => setMoment(m.key)}
                        className={`min-h-[44px] rounded-xl border-2 text-xs font-bold ${
                            moment === m.key
                                ? "border-google-blue bg-google-blue text-white"
                                : "border-gray-200 text-gray-700 dark:border-gray-600 dark:text-gray-200"
                        }`}
                    >
                        {m.short}
                    </button>
                ))}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2">
                <input type="date" className={field} value={date} onChange={(e) => e.target.value && setDate(e.target.value)} aria-label="Data" />
                <input type="time" className={field} value={time} onChange={(e) => setTime(e.target.value)} aria-label="Horário" />
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
                className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-google-blue text-base font-bold text-white disabled:opacity-60"
            >
                {busy === "save" && <Spinner />} Salvar
            </button>
            <button
                type="button"
                onClick={remove}
                disabled={!!busy}
                className={`mt-2 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold ${
                    confirmDelete ? "bg-rose-600 text-white" : "text-rose-600 dark:text-rose-400"
                }`}
            >
                {busy === "delete" && <Spinner className="h-4 w-4" />}
                {confirmDelete ? "Toque de novo para excluir" : "Excluir aplicação"}
            </button>
        </BottomSheet>
    );
}
