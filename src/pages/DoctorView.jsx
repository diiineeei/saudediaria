import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import Spinner from "../components/Spinner";
import HistoryList from "../components/HistoryList";
import StatsSummary from "../components/StatsSummary";
import PeriodRangeChips from "../components/PeriodRangeChips";
import GlucoseChart from "../components/GlucoseChart";
import usePrescription from "../lib/usePrescription";
import { PERIODS, rangeTexts, fetchRecords, filterByRange, sortRecordsDesc, startKeyForDays, todayKey } from "../lib/glucose";
import { buildGlucosePdf, shareOrDownloadPdf } from "../lib/pdf";

const MAX_DAYS = 90;
const REFRESH_MS = 30_000;
const PRESETS = [
    { days: 7, label: "7 dias" },
    { days: 14, label: "14 dias" },
    { days: 30, label: "30 dias" },
    { days: 90, label: "90 dias" },
    { days: -1, label: "Escolher" },
];
const NO_PERIOD = "__sem__";


/** Tela de consulta para os médicos: somente leitura, sem senha, até 90 dias, atualiza sozinha. */
export default function DoctorView() {
    const [records, setRecords] = useState([]);
    const [preset, setPreset] = useState(30);
    const [custom, setCustom] = useState({ from: startKeyForDays(14), to: todayKey() });
    const [moment, setMoment] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatedAt, setUpdatedAt] = useState(null);
    const [pdfBusy, setPdfBusy] = useState(false);
    const [dailyMode, setDailyMode] = useState(false);
    usePrescription(); // aplica as metas da receita no gráfico e nas cores

    const load = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            setRecords(await fetchRecords());
            setUpdatedAt(new Date());
            setError("");
        } catch (e) {
            setError(e.message || "Erro ao consultar registros.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Tempo real: busca de novo a cada 30 s e quando a aba volta a ficar visível.
    useEffect(() => {
        document.title = "Glicemia da Mary · Consulta";
        load();
        const id = setInterval(() => document.visibilityState === "visible" && load(true), REFRESH_MS);
        const onVisible = () => document.visibilityState === "visible" && load(true);
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            clearInterval(id);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [load]);

    const minDate = startKeyForDays(MAX_DAYS);
    const maxDate = todayKey();
    const range = preset > 0 ? { from: startKeyForDays(preset), to: maxDate } : custom;

    const setCustomField = (field, value) => {
        if (!value) return;
        setCustom((c) => {
            let next = { ...c, [field]: value < minDate ? minDate : value > maxDate ? maxDate : value };
            if (next.from > next.to) next = field === "from" ? { ...next, to: next.from } : { ...next, from: next.to };
            return next;
        });
    };

    const visible = useMemo(() => {
        let list = filterByRange(records, range.from, range.to);
        if (moment === NO_PERIOD) list = list.filter((r) => !PERIODS.some((p) => p.key === r.period));
        else if (moment) list = list.filter((r) => r.period === moment);
        return sortRecordsDesc(list);
    }, [records, range.from, range.to, moment]);

    const downloadPdf = async () => {
        setPdfBusy(true);
        try {
            const pdf = await buildGlucosePdf(records, range);
            await shareOrDownloadPdf(pdf, { preferShare: false });
        } catch (e) {
            setError(e.message || "Não foi possível gerar o PDF.");
        } finally {
            setPdfBusy(false);
        }
    };

    const momentLabel = moment === NO_PERIOD ? "sem momento" : PERIODS.find((p) => p.key === moment)?.label.toLowerCase();

    return (
        <>
            <header className="sticky top-0 z-50 bg-google-blue pt-[env(safe-area-inset-top)] shadow-md dark:bg-google-blue-dark">
                <div className="mx-auto flex h-16 w-full max-w-3xl items-center gap-3 px-4">
                    <img src="/mary.jpg" alt="Mary" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/80" />
                    <div className="min-w-0 flex-1 leading-tight">
                        <h1 className="truncate text-base font-bold text-white">Glicemia da Mary</h1>
                        <p className="text-xs text-white/75">Consulta para profissionais de saúde</p>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="min-h-screen bg-google-gray-light pb-[env(safe-area-inset-bottom)] dark:bg-google-gray-dark">
                <div className="mx-auto w-full max-w-3xl space-y-4 px-4 pb-10 pt-4">
                    {/* Filtros: valem para tudo abaixo */}
                    <section className="space-y-3 rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                        <PeriodRangeChips value={preset} onChange={setPreset} options={PRESETS} />

                        {preset < 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    ["from", "De"],
                                    ["to", "Até"],
                                ].map(([field, label]) => (
                                    <label key={field} className="block">
                                        <span className="mb-1 block text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
                                        <input
                                            type="date"
                                            value={custom[field]}
                                            min={minDate}
                                            max={maxDate}
                                            onChange={(e) => setCustomField(field, e.target.value)}
                                            className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:[color-scheme:dark]"
                                        />
                                    </label>
                                ))}
                                <p className="col-span-2 text-xs text-gray-500 dark:text-gray-400">Histórico disponível: últimos {MAX_DAYS} dias.</p>
                            </div>
                        )}

                        <label className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Momento</span>
                            <select
                                value={moment}
                                onChange={(e) => setMoment(e.target.value)}
                                className="min-h-[44px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 text-base font-semibold text-gray-900 outline-none focus:border-google-blue dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                            >
                                <option value="">Todos os momentos</option>
                                {PERIODS.map((p) => (
                                    <option key={p.key} value={p.key}>
                                        {p.label}
                                    </option>
                                ))}
                                <option value={NO_PERIOD}>Sem momento informado</option>
                            </select>
                        </label>
                    </section>

                    {/* Status ao vivo + PDF */}
                    <div className="flex items-center justify-between gap-3 px-1">
                        <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400" aria-live="polite">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:hidden" />
                                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            </span>
                            Ao vivo
                            {updatedAt && ` · atualizado às ${updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`}
                        </p>
                        <button
                            type="button"
                            onClick={downloadPdf}
                            disabled={pdfBusy || !records.length}
                            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-google-blue px-4 text-sm font-bold text-white shadow-md transition active:scale-[0.97] disabled:opacity-50"
                        >
                            {pdfBusy ? <Spinner className="h-4 w-4" /> : <span aria-hidden="true">📄</span>} Baixar PDF
                        </button>
                    </div>

                    {error && (
                        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-800 dark:bg-rose-500/15 dark:text-rose-300">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center py-16 text-google-blue">
                            <Spinner className="h-8 w-8" />
                        </div>
                    ) : (
                        <>
                            <section className="rounded-3xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                                <h2 className="text-base font-bold text-gray-900 dark:text-white">Glicemia ao longo do tempo</h2>
                                <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">
                                    mg/dL{momentLabel ? ` · ${momentLabel}` : ""} · {rangeTexts().band} · toque num ponto para ver detalhes
                                </p>
                                <GlucoseChart records={visible} from={range.from} to={range.to} onModeChange={setDailyMode} />
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-300">
                                    {dailyMode && (
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-0.5 w-4 rounded-full bg-[#2a78d6] dark:bg-[#3987e5]" /> Média do dia
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#2a78d6] dark:bg-[#3987e5]" /> {rangeTexts().inRange}
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#c98500]" /> ▼ Abaixo de 70
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#d03b3b]" /> ▲ {rangeTexts().highShort}
                                    </span>
                                </div>
                            </section>

                            <StatsSummary records={visible} />

                            <section>
                                <h2 className="mb-3 px-1 text-lg font-bold text-gray-900 dark:text-gray-100">Medições</h2>
                                <HistoryList key={`${range.from}-${range.to}-${moment}`} records={visible} emptyText="Nenhuma medição neste filtro" />
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
