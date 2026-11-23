import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";
import Spinner from "./Spinner";
import BiometricIcon from "./BiometricIcon";
import { biometricLabel, hasBiometric, isBiometricSupported, registerBiometric, removeBiometric } from "../lib/biometric";
import { refreshSessionPolicy, sessionExpiresAt } from "../lib/auth";

export default function SecuritySheet({ open, onClose, onLogout }) {
    const [supported, setSupported] = useState(null);
    const [enabled, setEnabled] = useState(hasBiometric);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState(null);
    const label = biometricLabel();

    useEffect(() => {
        if (!open) return;
        setEnabled(hasBiometric());
        setMessage(null);
        isBiometricSupported().then(setSupported);
    }, [open]);

    const enable = async () => {
        setBusy(true);
        setMessage(null);
        try {
            await registerBiometric();
            refreshSessionPolicy();
            setEnabled(true);
            setMessage({ ok: true, text: `${label} ativado neste aparelho ✓` });
        } catch (err) {
            setMessage({ ok: false, text: err.message });
        } finally {
            setBusy(false);
        }
    };

    const disable = () => {
        removeBiometric();
        refreshSessionPolicy();
        setEnabled(false);
        setMessage({ ok: true, text: `${label} desativado neste aparelho.` });
    };

    const expires = sessionExpiresAt();

    return (
        <BottomSheet open={open} onClose={onClose} title="Segurança">
            <div className="mb-4 flex items-center gap-4 rounded-2xl bg-gray-50 p-4 dark:bg-gray-900">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-google-blue/10 text-google-blue dark:text-google-blue-light"><BiometricIcon className="h-7 w-7" /></div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 dark:text-white">Entrar com {label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {supported === null
                            ? "Verificando…"
                            : !supported
                              ? "Este aparelho ou navegador não tem suporte."
                              : enabled
                                ? "Ativado neste aparelho"
                                : "Desativado neste aparelho"}
                    </p>
                </div>
            </div>

            {supported && (
                enabled ? (
                    <button
                        type="button"
                        onClick={disable}
                        className="mb-2 min-h-[52px] w-full rounded-2xl border-2 border-gray-200 bg-white text-base font-bold text-gray-800 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                        Desativar {label} neste aparelho
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={enable}
                        disabled={busy}
                        className="mb-2 flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-google-blue text-base font-bold text-white shadow-md disabled:opacity-60"
                    >
                        {busy && <Spinner />} Ativar {label} neste aparelho
                    </button>
                )
            )}

            {message && (
                <p className={`mb-2 text-center text-sm font-semibold ${message.ok ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                    {message.text}
                </p>
            )}

            <p className="mb-5 mt-2 text-sm text-gray-500 dark:text-gray-400">
                Cada aparelho (celular, tablet…) é ativado separadamente. Com {label} ativado, a entrada vale por 1 dia
                {expires ? ` (até ${new Date(expires).toLocaleString("pt-BR", { weekday: "short", hour: "2-digit", minute: "2-digit" })})` : ""}.
            </p>

            <button
                type="button"
                onClick={onLogout}
                className="min-h-[52px] w-full rounded-2xl bg-rose-50 text-base font-bold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
            >
                Sair agora
            </button>
        </BottomSheet>
    );
}
