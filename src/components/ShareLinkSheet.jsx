import { useState } from "react";
import BottomSheet from "./BottomSheet";
import { doctorShareUrl } from "../lib/glucose";

export default function ShareLinkSheet({ open, onClose }) {
    const [copied, setCopied] = useState(false);
    const url = doctorShareUrl();
    const canShare = typeof navigator !== "undefined" && !!navigator.share;

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.getElementById("share-url");
            input?.select();
            document.execCommand?.("copy");
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const share = async () => {
        try {
            await navigator.share({
                title: "Glicemia da Mary",
                text: "Acompanhamento da glicemia da Mary:",
                url,
            });
        } catch {
            /* cancelado */
        }
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Link para os médicos">
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                Com este link os médicos veem o histórico, o resumo e podem baixar o PDF. Eles <strong>não precisam da senha</strong> e não
                conseguem registrar medições.
            </p>

            <input
                id="share-url"
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="mb-3 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
            />

            <div className="grid gap-2">
                {canShare && (
                    <button
                        type="button"
                        onClick={share}
                        className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-google-blue px-6 text-base font-bold text-white shadow-md transition active:scale-[0.98]"
                    >
                        <span aria-hidden="true">📤</span> Enviar link (WhatsApp, e-mail…)
                    </button>
                )}
                <button
                    type="button"
                    onClick={copy}
                    className={`flex min-h-[56px] items-center justify-center gap-2 rounded-2xl px-6 text-base font-bold transition active:scale-[0.98] ${
                        canShare
                            ? "border-2 border-gray-200 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                            : "bg-google-blue text-white shadow-md"
                    }`}
                >
                    {copied ? "✓ Link copiado" : <><span aria-hidden="true">🔗</span> Copiar link</>}
                </button>
            </div>
        </BottomSheet>
    );
}
