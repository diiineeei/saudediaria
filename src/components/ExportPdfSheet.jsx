import { useMemo, useState } from "react";
import BottomSheet from "./BottomSheet";
import PeriodRangeChips from "./PeriodRangeChips";
import Spinner from "./Spinner";
import { filterByDays } from "../lib/glucose";
import { buildGlucosePdf, shareOrDownloadPdf } from "../lib/pdf";

export default function ExportPdfSheet({ open, onClose, records, initialDays = 30 }) {
    const [days, setDays] = useState(initialDays);
    const [busy, setBusy] = useState("");
    const [message, setMessage] = useState(null);
    const count = useMemo(() => filterByDays(records, days).length, [records, days]);
    const canShareFiles = typeof navigator !== "undefined" && !!navigator.canShare;

    const run = async (preferShare) => {
        setBusy(preferShare ? "share" : "download");
        setMessage(null);
        try {
            const pdf = await buildGlucosePdf(records, { days });
            const result = await shareOrDownloadPdf(pdf, { preferShare });
            if (result === "downloaded") setMessage({ ok: true, text: "PDF baixado ✓" });
            if (result === "shared") onClose();
        } catch (err) {
            setMessage({ ok: false, text: err?.message || "Não foi possível gerar o PDF." });
        } finally {
            setBusy("");
        }
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Exportar PDF para os médicos">
            <p className="mb-2 text-sm font-semibold text-gray-600 dark:text-gray-300">Período</p>
            <PeriodRangeChips value={days} onChange={setDays} />
            <p className="mb-5 mt-3 text-sm text-gray-500 dark:text-gray-400">
                {count} {count === 1 ? "medição" : "medições"} no relatório, organizadas por dia e momento, com médias e faixas.
            </p>

            <div className="grid gap-2">
                {canShareFiles && (
                    <button
                        type="button"
                        disabled={!!busy || !count}
                        onClick={() => run(true)}
                        className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-google-blue px-6 text-base font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-50"
                    >
                        {busy === "share" ? <Spinner /> : <span aria-hidden="true">📤</span>}
                        Enviar PDF (WhatsApp, e-mail…)
                    </button>
                )}
                <button
                    type="button"
                    disabled={!!busy || !count}
                    onClick={() => run(false)}
                    className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold transition active:scale-[0.98] disabled:opacity-50 ${
                        canShareFiles
                            ? "border-2 border-gray-200 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            : "bg-google-blue text-white shadow-md"
                    }`}
                >
                    {busy === "download" ? <Spinner /> : <span aria-hidden="true">⬇️</span>}
                    Baixar PDF
                </button>
            </div>

            {message && (
                <p className={`mt-3 text-center text-sm font-semibold ${message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {message.text}
                </p>
            )}
        </BottomSheet>
    );
}
