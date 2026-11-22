import { useCallback, useEffect, useMemo, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import Spinner from "../components/Spinner";
import HistoryList from "../components/HistoryList";
import StatsSummary from "../components/StatsSummary";
import PeriodRangeChips from "../components/PeriodRangeChips";
import ExportPdfSheet from "../components/ExportPdfSheet";
import { fetchRecords, filterByDays, sortRecordsDesc } from "../lib/glucose";

/** Tela de consulta para os médicos: somente leitura, sem senha. */
export default function DoctorView() {
    const [records, setRecords] = useState([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pdfOpen, setPdfOpen] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setRecords(await fetchRecords());
        } catch (e) {
            setError(e.message || "Erro ao consultar registros.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        document.title = "Glicemia da Mary · Consulta";
        load();
    }, [load]);

    const visible = useMemo(() => sortRecordsDesc(filterByDays(records, days)), [records, days]);

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
                <div className="mx-auto w-full max-w-3xl space-y-5 px-4 pb-10 pt-5">
                    <div className="flex items-center justify-between gap-3">
                        <PeriodRangeChips value={days} onChange={setDays} />
                    </div>

                    <button
                        type="button"
                        onClick={() => setPdfOpen(true)}
                        disabled={!records.length}
                        className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-google-blue px-6 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
                    >
                        <span aria-hidden="true">📄</span> Baixar relatório em PDF
                    </button>

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
                            <StatsSummary records={visible} />
                            <section>
                                <h2 className="mb-3 px-1 text-lg font-bold text-gray-900 dark:text-gray-100">Medições</h2>
                                <HistoryList key={days} records={visible} emptyText="Nenhuma medição neste período" />
                            </section>
                        </>
                    )}
                </div>
            </main>

            <ExportPdfSheet key={`pdf-${days}`} open={pdfOpen} onClose={() => setPdfOpen(false)} records={records} initialDays={days} />
        </>
    );
}
