import { useState } from "react";
import BottomSheet from "./BottomSheet";
import Spinner from "./Spinner";
import { formatDateBR } from "../lib/glucose";
import { INSULIN_MOMENTS, savePrescription } from "../lib/insulin";

const MEALS = INSULIN_MOMENTS.filter((m) => m.meal);

const emptyPrescription = () => ({
    basal: { name: "", doses: [] },
    rapida: { name: "", minutesBefore: 15, scales: {} },
    metas: { pre: "", pos: "" },
    doctor: "",
    issuedAt: "",
    notes: "",
});

const num = (v) => (v === "" || v === null || v === undefined ? "" : Number(v));

/** Converte a receita da API para o formulário (strings editáveis). */
const toForm = (p) => {
    const base = p || emptyPrescription();
    return {
        basalName: base.basal?.name || "",
        basal: Object.fromEntries(INSULIN_MOMENTS.map((m) => [m.key, num(base.basal?.doses?.find((d) => d.moment === m.key)?.units)])),
        rapidaName: base.rapida?.name || "",
        minutesBefore: num(base.rapida?.minutesBefore ?? 15),
        scales: Object.fromEntries(
            MEALS.map((m) => [m.key, (base.rapida?.scales?.[m.key] || []).map((f) => ({ min: num(f.min), max: num(f.max), units: num(f.units) }))]),
        ),
        pre: num(base.metas?.pre),
        pos: num(base.metas?.pos),
        doctor: base.doctor || "",
        issuedAt: base.issuedAt || "",
        notes: base.notes || "",
    };
};

const fromForm = (f) => ({
    basal: {
        name: f.basalName.trim(),
        doses: INSULIN_MOMENTS.filter((m) => f.basal[m.key] !== "" && Number(f.basal[m.key]) > 0).map((m) => ({
            moment: m.key,
            units: Number(f.basal[m.key]),
        })),
    },
    rapida: {
        name: f.rapidaName.trim(),
        minutesBefore: Number(f.minutesBefore) || 0,
        scales: Object.fromEntries(
            MEALS.map((m) => [
                m.key,
                f.scales[m.key]
                    .filter((r) => r.min !== "" && r.max !== "" && r.units !== "")
                    .map((r) => ({ min: Number(r.min), max: Number(r.max), units: Number(r.units) })),
            ]).filter(([, rows]) => rows.length),
        ),
    },
    metas: { pre: Number(f.pre) || 0, pos: Number(f.pos) || 0 },
    doctor: f.doctor.trim(),
    issuedAt: f.issuedAt,
    notes: f.notes.trim(),
});

const input =
    "min-h-[40px] w-full rounded-lg border border-gray-200 bg-gray-50 px-2 text-center text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white";

/** Mostra a receita e permite editar (quando a médica mudar as doses). */
export default function PrescriptionSheet({ prescription, onClose, onSaved }) {
    const [editing, setEditing] = useState(!prescription);
    const [form, setForm] = useState(() => toForm(prescription));
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const set = (patch) => setForm((f) => ({ ...f, ...patch }));
    const setRow = (meal, i, field, value) =>
        setForm((f) => ({
            ...f,
            scales: { ...f.scales, [meal]: f.scales[meal].map((r, j) => (j === i ? { ...r, [field]: value === "" ? "" : Number(value) } : r)) },
        }));
    const addRow = (meal) => setForm((f) => ({ ...f, scales: { ...f.scales, [meal]: [...f.scales[meal], { min: "", max: "", units: "" }] } }));
    const removeRow = (meal, i) => setForm((f) => ({ ...f, scales: { ...f.scales, [meal]: f.scales[meal].filter((_, j) => j !== i) } }));

    const save = async () => {
        setBusy(true);
        setError("");
        try {
            const saved = await savePrescription(fromForm(form));
            onSaved(saved);
            setEditing(false);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const p = prescription;

    return (
        <BottomSheet open onClose={onClose} title={editing ? "Editar receita" : "Receita de insulina"}>
            <div className="max-h-[70vh] overflow-y-auto pb-2">
                {!editing && p ? (
                    <div className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
                        {(p.doctor || p.issuedAt) && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {p.doctor}
                                {p.doctor && p.issuedAt ? " · " : ""}
                                {p.issuedAt ? `emitida em ${formatDateBR(p.issuedAt)}` : ""}
                            </p>
                        )}

                        {p.basal?.doses?.length > 0 && (
                            <div>
                                <p className="mb-1 font-bold text-gray-900 dark:text-white">{p.basal.name || "Insulina basal"}</p>
                                <ul className="space-y-1">
                                    {p.basal.doses.map((d) => (
                                        <li key={d.moment} className="flex justify-between rounded-lg bg-violet-50 px-3 py-2 dark:bg-violet-500/10">
                                            <span>{INSULIN_MOMENTS.find((m) => m.key === d.moment)?.label}</span>
                                            <strong>{d.units} unidades</strong>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {Object.keys(p.rapida?.scales || {}).length > 0 && (
                            <div>
                                <p className="mb-1 font-bold text-gray-900 dark:text-white">
                                    {p.rapida.name || "Insulina rápida"}
                                    {p.rapida.minutesBefore ? <span className="font-normal text-gray-500"> · {p.rapida.minutesBefore} min antes</span> : null}
                                </p>
                                {MEALS.filter((m) => p.rapida.scales[m.key]?.length).map((m) => (
                                    <div key={m.key} className="mb-2">
                                        <p className="mb-1 text-xs font-semibold text-gray-500">{m.label}</p>
                                        <div className="grid grid-cols-4 gap-1 text-center text-xs">
                                            {p.rapida.scales[m.key].map((f) => (
                                                <div key={`${f.min}-${f.max}`} className="rounded-lg bg-google-blue/10 px-1 py-1.5">
                                                    <div>
                                                        {f.min}–{f.max}
                                                    </div>
                                                    <div className="font-bold">{f.units} un</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {p.metas?.pre > 0 && (
                            <p>
                                <strong>Metas:</strong> antes das refeições &lt; {p.metas.pre} mg/dL · 1h após &lt; {p.metas.pos} mg/dL
                            </p>
                        )}
                        {p.notes && <p className="whitespace-pre-line rounded-lg bg-gray-50 p-3 text-xs dark:bg-gray-900">{p.notes}</p>}

                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="min-h-[48px] w-full rounded-xl border-2 border-gray-200 text-sm font-bold text-gray-800 dark:border-gray-600 dark:text-gray-100"
                        >
                            Editar receita
                        </button>
                    </div>
                ) : (
                    <div className="space-y-5 text-sm">
                        <fieldset>
                            <legend className="mb-2 font-bold text-gray-900 dark:text-white">Insulina basal (dose fixa)</legend>
                            <input className={`${input} mb-2 text-left`} placeholder="Nome (ex.: Novolin N)" value={form.basalName} onChange={(e) => set({ basalName: e.target.value })} />
                            <div className="grid grid-cols-4 gap-2">
                                {INSULIN_MOMENTS.map((m) => (
                                    <label key={m.key} className="block text-center">
                                        <span className="mb-1 block text-[11px] font-semibold text-gray-500">{m.short}</span>
                                        <input
                                            type="number"
                                            inputMode="decimal"
                                            className={input}
                                            value={form.basal[m.key]}
                                            placeholder="—"
                                            onChange={(e) => set({ basal: { ...form.basal, [m.key]: e.target.value === "" ? "" : Number(e.target.value) } })}
                                        />
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className="mb-2 font-bold text-gray-900 dark:text-white">Insulina rápida (conforme a glicemia)</legend>
                            <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
                                <input className={`${input} text-left`} placeholder="Nome (ex.: Novorapid)" value={form.rapidaName} onChange={(e) => set({ rapidaName: e.target.value })} />
                                <label className="flex items-center gap-1 text-xs text-gray-500">
                                    <input type="number" inputMode="numeric" className={`${input} w-14`} value={form.minutesBefore} onChange={(e) => set({ minutesBefore: e.target.value })} />
                                    min antes
                                </label>
                            </div>
                            {MEALS.map((m) => (
                                <div key={m.key} className="mb-3">
                                    <p className="mb-1 text-xs font-semibold text-gray-500">{m.label} — glicemia de / até → unidades</p>
                                    {form.scales[m.key].map((r, i) => (
                                        <div key={i} className="mb-1 grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-1">
                                            <input type="number" inputMode="numeric" aria-label="de" className={input} value={r.min} onChange={(e) => setRow(m.key, i, "min", e.target.value)} />
                                            <input type="number" inputMode="numeric" aria-label="até" className={input} value={r.max} onChange={(e) => setRow(m.key, i, "max", e.target.value)} />
                                            <input type="number" inputMode="decimal" aria-label="unidades" className={`${input} font-bold`} value={r.units} onChange={(e) => setRow(m.key, i, "units", e.target.value)} />
                                            <button type="button" onClick={() => removeRow(m.key, i)} className="h-10 w-10 rounded-lg text-lg text-rose-600" aria-label="Remover faixa">
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => addRow(m.key)} className="mt-1 min-h-[36px] text-xs font-semibold text-google-blue dark:text-google-blue-light">
                                        ＋ faixa
                                    </button>
                                </div>
                            ))}
                        </fieldset>

                        <fieldset>
                            <legend className="mb-2 font-bold text-gray-900 dark:text-white">Metas (mg/dL)</legend>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="block">
                                    <span className="mb-1 block text-[11px] font-semibold text-gray-500">Antes das refeições, menor que</span>
                                    <input type="number" inputMode="numeric" className={input} value={form.pre} onChange={(e) => set({ pre: e.target.value })} />
                                </label>
                                <label className="block">
                                    <span className="mb-1 block text-[11px] font-semibold text-gray-500">1h após, menor que</span>
                                    <input type="number" inputMode="numeric" className={input} value={form.pos} onChange={(e) => set({ pos: e.target.value })} />
                                </label>
                            </div>
                        </fieldset>

                        <fieldset className="space-y-2">
                            <legend className="mb-2 font-bold text-gray-900 dark:text-white">Sobre a receita</legend>
                            <input className={`${input} text-left`} placeholder="Médica / especialidade" value={form.doctor} onChange={(e) => set({ doctor: e.target.value })} />
                            <input type="date" className={`${input} text-left dark:[color-scheme:dark]`} value={form.issuedAt} onChange={(e) => set({ issuedAt: e.target.value })} />
                            <textarea
                                className="min-h-[72px] w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                                placeholder="Observações"
                                value={form.notes}
                                onChange={(e) => set({ notes: e.target.value })}
                            />
                        </fieldset>

                        {error && (
                            <p className="rounded-xl bg-rose-50 px-3 py-2 text-center text-sm font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300" role="alert">
                                {error}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={save}
                            disabled={busy}
                            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-google-blue text-base font-bold text-white disabled:opacity-60"
                        >
                            {busy && <Spinner />} Salvar receita
                        </button>
                        {p && (
                            <button type="button" onClick={() => setEditing(false)} className="min-h-[44px] w-full text-sm font-semibold text-gray-500">
                                Cancelar
                            </button>
                        )}
                    </div>
                )}
            </div>
        </BottomSheet>
    );
}
