import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Spinner from "./Spinner";
import PrescriptionSheet from "./PrescriptionSheet";
import ApplicationSheet from "./ApplicationSheet";
import { formatDateBR, getCurrentTime, getDateFromRecord, recordId, todayKey } from "../lib/glucose";
import {
    INSULIN_MOMENTS,
    INSULIN_MOMENT_BY_KEY,
    calculateDoses,
    createApplication,
    fetchApplications,
    formatUnits,
    momentForNow,
    todayApplications,
} from "../lib/insulin";

/** Uma dose (rápida ou basal) com ajuste de unidades e botão para registrar. */
function DoseCard({ title, subtitle, suggestion, applied, onRegister, tone = "blue", manual = false, children }) {
    const [units, setUnits] = useState(suggestion ?? "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => setUnits(suggestion ?? ""), [suggestion]);

    const register = async () => {
        const n = Number(units);
        if (!Number.isFinite(n) || n <= 0) return setError("Informe as unidades.");
        setBusy(true);
        setError("");
        try {
            await onRegister(n);
        } catch (e) {
            setError(e.message);
        } finally {
            setBusy(false);
        }
    };

    const step = (d) => setUnits((u) => Math.max(0, Math.min(100, (Number(u) || 0) + d)));
    const changed = suggestion != null && Number(units) !== suggestion;
    const ring = tone === "blue" ? "border-google-blue/30 dark:border-google-blue-light/30" : "border-violet-400/40";

    return (
        <div className={`rounded-2xl border-2 ${ring} bg-white p-4 dark:bg-gray-900`}>
            <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{title}</p>
                    {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>
                {applied && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                        ✓ {applied}
                    </span>
                )}
            </div>

            {children}

            {(suggestion != null || manual) && (
                <>
                    {manual && suggestion == null && (
                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Se a equipe médica orientou uma dose, registre aqui:</p>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => step(-1)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:scale-95 dark:bg-gray-800 dark:text-gray-200"
                            aria-label="Menos uma unidade"
                        >
                            −
                        </button>
                        <div className="flex-1 text-center">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={units}
                                onChange={(e) => setUnits(e.target.value === "" ? "" : Number(e.target.value))}
                                aria-label="Unidades aplicadas"
                                className="w-full bg-transparent text-center text-4xl font-bold text-gray-900 outline-none dark:text-white"
                            />
                            <p className="-mt-1 text-xs text-gray-500 dark:text-gray-400">
                                unidades {changed && <span className="font-semibold text-amber-600 dark:text-amber-400">(receita: {suggestion})</span>}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => step(1)}
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-2xl font-bold text-gray-700 active:scale-95 dark:bg-gray-800 dark:text-gray-200"
                            aria-label="Mais uma unidade"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={register}
                        disabled={busy}
                        className="mt-3 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-google-blue text-base font-bold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
                    >
                        {busy && <Spinner className="h-4 w-4" />} Registrar aplicação
                    </button>
                    {error && (
                        <p className="mt-2 text-center text-sm font-semibold text-rose-600 dark:text-rose-400" role="alert">
                            {error}
                        </p>
                    )}
                </>
            )}
        </div>
    );
}

/**
 * Calculadora de insulina conforme a receita cadastrada, com registro do que foi aplicado.
 * `glucoseRecords`: medições (para sugerir o dextro do momento); `prefill`: última glicemia registrada agora.
 */
export default function InsulinCalculator({ glucoseRecords, prefill, prescriptionState }) {
    const { prescription, setPrescription, loading, error: prescriptionError } = prescriptionState;
    const [moment, setMoment] = useState(momentForNow);
    const [glucose, setGlucose] = useState("");
    const [glucoseSource, setGlucoseSource] = useState("");
    const [apps, setApps] = useState([]);
    const [appsError, setAppsError] = useState("");
    const [toast, setToast] = useState("");
    const [prescriptionOpen, setPrescriptionOpen] = useState(false);
    const [editingApp, setEditingApp] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const cardRef = useRef(null);

    const loadApps = useCallback(async () => {
        try {
            setApps(await fetchApplications());
            setAppsError("");
        } catch (e) {
            setAppsError(e.message);
        }
    }, []);

    useEffect(() => {
        loadApps();
    }, [loadApps]);

    // Sugere o dextro do momento: a glicemia de hoje registrada para esse momento.
    useEffect(() => {
        const match = glucoseRecords
            .filter((r) => getDateFromRecord(r) === todayKey() && r.period === moment)
            .sort((a, b) => (b.time || "").localeCompare(a.time || ""))[0];
        setGlucose(match ? String(match.glucose) : "");
        setGlucoseSource(match ? `medição das ${match.time}` : "");
    }, [moment, glucoseRecords]);

    // Glicemia registrada agora num momento "antes de": leva para a calculadora.
    useEffect(() => {
        if (!prefill || !INSULIN_MOMENT_BY_KEY[prefill.period]) return;
        setMoment(prefill.period);
        setGlucose(String(prefill.glucose));
        setGlucoseSource("medição registrada agora");
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, [prefill]);

    useEffect(() => {
        if (!toast) return undefined;
        const id = setTimeout(() => setToast(""), 3500);
        return () => clearTimeout(id);
    }, [toast]);

    const doses = useMemo(() => calculateDoses(prescription, moment, glucose), [prescription, moment, glucose]);
    const today = useMemo(() => todayApplications(apps), [apps]);
    const appliedToday = (kind) => {
        const a = today.filter((x) => x.kind === kind && x.moment === moment).sort((x, y) => y.time.localeCompare(x.time))[0];
        return a ? `${formatUnits(a.units)} às ${a.time}` : "";
    };

    const register = async (kind, units, extra = {}) => {
        const saved = await createApplication({
            kind,
            name: kind === "rapida" ? prescription?.rapida?.name : prescription?.basal?.name,
            units,
            moment,
            time: getCurrentTime(),
            ...extra,
        });
        setApps((list) => [saved, ...list]);
        setToast(`${formatUnits(units)} de ${saved.name || "insulina"} registradas ✓`);
        if (navigator.vibrate) navigator.vibrate(30);
    };

    const m = INSULIN_MOMENT_BY_KEY[moment];
    const rapidaName = prescription?.rapida?.name || "Insulina rápida";
    const basalName = prescription?.basal?.name || "Insulina basal";
    const minutes = prescription?.rapida?.minutesBefore;

    const grouped = useMemo(() => {
        const out = [];
        for (const a of showAll ? apps : today) {
            const d = getDateFromRecord(a);
            const last = out[out.length - 1];
            if (!last || last.date !== d) out.push({ date: d, items: [a] });
            else last.items.push(a);
        }
        return out;
    }, [apps, today, showAll]);

    return (
        <section ref={cardRef} className="mb-6 scroll-mt-20 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    <span aria-hidden="true">💉</span> Insulina
                </h2>
                {prescription && (
                    <button
                        type="button"
                        onClick={() => setPrescriptionOpen(true)}
                        className="min-h-[40px] rounded-xl px-3 text-sm font-semibold text-google-blue hover:bg-google-blue/10 dark:text-google-blue-light"
                    >
                        Ver receita
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-8 text-google-blue">
                    <Spinner className="h-7 w-7" />
                </div>
            ) : prescriptionError ? (
                <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">{prescriptionError}</p>
            ) : !prescription ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-5 text-center dark:border-gray-600">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">A receita de insulina ainda não foi cadastrada.</p>
                    <button
                        type="button"
                        onClick={() => setPrescriptionOpen(true)}
                        className="mt-3 min-h-[48px] rounded-xl bg-google-blue px-5 text-sm font-bold text-white"
                    >
                        Cadastrar receita
                    </button>
                </div>
            ) : (
                <>
                    {/* Momento */}
                    <div className="mb-4 grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Momento da aplicação">
                        {INSULIN_MOMENTS.map((x) => {
                            const selected = moment === x.key;
                            return (
                                <button
                                    key={x.key}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    onClick={() => setMoment(x.key)}
                                    className={`flex min-h-[60px] flex-col items-center justify-center rounded-2xl border-2 text-xs font-bold transition active:scale-95 ${
                                        selected
                                            ? "border-google-blue bg-google-blue text-white dark:border-google-blue-light dark:bg-google-blue-light"
                                            : "border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                                    }`}
                                >
                                    <span className="text-xl leading-none" aria-hidden="true">
                                        {x.icon}
                                    </span>
                                    <span className="mt-1">{x.short}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="space-y-3">
                        {/* Insulina rápida, pela glicemia */}
                        {doses.rapida && (
                            <DoseCard
                                title={rapidaName}
                                subtitle={minutes ? `Aplicar ${minutes} min antes do ${m.meal}` : `Antes do ${m.meal}`}
                                suggestion={doses.rapida.status === "ok" ? doses.rapida.units : null}
                                applied={appliedToday("rapida")}
                                manual={["below", "above", "gap"].includes(doses.rapida.status)}
                                onRegister={(units) =>
                                    register("rapida", units, {
                                        glucose: Number(glucose) || undefined,
                                        suggested: doses.rapida.status === "ok" ? doses.rapida.units : undefined,
                                    })
                                }
                            >
                                <label className="flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800">
                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Glicemia agora</span>
                                    <input
                                        type="number"
                                        inputMode="numeric"
                                        value={glucose}
                                        onChange={(e) => {
                                            setGlucose(e.target.value.replace(/[^\d]/g, "").slice(0, 3));
                                            setGlucoseSource("");
                                        }}
                                        placeholder="000"
                                        aria-label="Glicemia agora (mg/dL)"
                                        className="w-20 flex-1 bg-transparent text-right text-2xl font-bold text-gray-900 outline-none placeholder-gray-300 dark:text-white dark:placeholder-gray-600"
                                    />
                                    <span className="text-xs font-semibold text-gray-400">mg/dL</span>
                                </label>
                                {glucoseSource && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">↳ {glucoseSource}</p>}

                                {doses.rapida.status === "missing" && (
                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Informe a glicemia para ver a dose da receita.</p>
                                )}
                                {doses.rapida.status === "ok" && (
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                                        Pela receita, glicemia de <strong>{doses.rapida.range.min} a {doses.rapida.range.max}</strong> →{" "}
                                        <strong>{formatUnits(doses.rapida.units)}</strong>
                                    </p>
                                )}
                                {["below", "above", "gap"].includes(doses.rapida.status) && (
                                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200" role="alert">
                                        <p className="font-bold">
                                            {doses.rapida.status === "below"
                                                ? `⚠️ Abaixo de ${doses.rapida.min} mg/dL`
                                                : doses.rapida.status === "above"
                                                  ? `⚠️ Acima de ${doses.rapida.max} mg/dL`
                                                  : "⚠️ Valor fora das faixas da receita"}
                                        </p>
                                        <p className="mt-1">
                                            A receita não indica dose de {rapidaName} para esse valor. Não use a calculadora: siga a orientação da equipe médica.
                                        </p>
                                    </div>
                                )}

                                {/* Tabela da receita para o momento */}
                                <div className="mt-3 grid grid-cols-4 gap-1 text-center text-[11px]">
                                    {doses.scale.map((f) => {
                                        const active = doses.rapida.status === "ok" && doses.rapida.range === f;
                                        return (
                                            <div
                                                key={`${f.min}-${f.max}`}
                                                className={`rounded-lg px-1 py-1.5 ${
                                                    active
                                                        ? "bg-google-blue font-bold text-white dark:bg-google-blue-light"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                                }`}
                                            >
                                                <div>
                                                    {f.min}–{f.max}
                                                </div>
                                                <div className="font-bold">{f.units} un</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </DoseCard>
                        )}

                        {/* Insulina basal, dose fixa */}
                        {doses.basal != null ? (
                            <DoseCard
                                title={basalName}
                                subtitle={`Dose fixa ${m.key === "22h" ? "às 22h" : m.label.toLowerCase()}`}
                                suggestion={doses.basal}
                                applied={appliedToday("basal")}
                                tone="violet"
                                onRegister={(units) => register("basal", units, { suggested: doses.basal })}
                            />
                        ) : (
                            <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                Sem {basalName} {m.key === "22h" ? "às 22h" : m.label.toLowerCase()} na receita.
                            </p>
                        )}
                    </div>

                    {toast && (
                        <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" role="status">
                            {toast}
                        </p>
                    )}

                    <p className="mt-4 text-[11px] leading-snug text-gray-400 dark:text-gray-500">
                        A sugestão segue a receita cadastrada
                        {prescription.issuedAt ? ` em ${formatDateBR(prescription.issuedAt)}` : ""}. Confira sempre antes de aplicar e, na dúvida, fale com a equipe médica.
                    </p>
                </>
            )}

            {/* Aplicações */}
            {prescription && (
                <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{showAll ? "Todas as aplicações" : "Aplicações de hoje"}</p>
                        {apps.length > today.length || showAll ? (
                            <button type="button" onClick={() => setShowAll((s) => !s)} className="min-h-[36px] px-2 text-xs font-semibold text-google-blue dark:text-google-blue-light">
                                {showAll ? "Só hoje" : "Ver todas"}
                            </button>
                        ) : null}
                    </div>
                    {appsError && <p className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-300">{appsError}</p>}
                    {grouped.length === 0 ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Nenhuma aplicação registrada hoje.</p>
                    ) : (
                        grouped.map((g) => (
                            <div key={g.date} className="mb-2">
                                {showAll && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">{formatDateBR(g.date)}</p>}
                                <ul className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                                    {g.items.map((a) => (
                                        <li key={recordId(a)}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingApp(a)}
                                                className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-700/50"
                                                aria-label={`Editar aplicação de ${a.time}`}
                                            >
                                                <span className="w-11 shrink-0 font-mono text-sm font-semibold text-gray-500">{a.time}</span>
                                                <span className="min-w-0 flex-1 truncate text-sm text-gray-700 dark:text-gray-200">
                                                    {a.name || (a.kind === "rapida" ? "Rápida" : "Basal")} · {INSULIN_MOMENT_BY_KEY[a.moment]?.short}
                                                    {a.glucose ? <span className="text-gray-400"> · dextro {a.glucose}</span> : null}
                                                </span>
                                                <span className={`shrink-0 rounded-lg px-2 py-0.5 text-sm font-bold ${a.kind === "rapida" ? "bg-google-blue/10 text-google-blue dark:text-google-blue-light" : "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"}`}>
                                                    {a.units} un
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            )}

            {prescriptionOpen && (
                <PrescriptionSheet prescription={prescription} onClose={() => setPrescriptionOpen(false)} onSaved={(p) => setPrescription(p)} />
            )}
            {editingApp && (
                <ApplicationSheet
                    key={recordId(editingApp)}
                    application={editingApp}
                    onClose={() => setEditingApp(null)}
                    onSaved={(u) => {
                        setApps((list) => list.map((a) => (recordId(a) === recordId(u) ? u : a)));
                        setEditingApp(null);
                    }}
                    onDeleted={(id) => {
                        setApps((list) => list.filter((a) => recordId(a) !== id));
                        setEditingApp(null);
                    }}
                />
            )}
        </section>
    );
}
