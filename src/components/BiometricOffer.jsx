import { useState } from "react";
import Spinner from "./Spinner";
import BiometricIcon from "./BiometricIcon";
import { biometricLabel, dismissBiometricOffer, registerBiometric } from "../lib/biometric";

/** Depois de entrar com a senha: oferece ativar Face ID / digital neste aparelho. */
export default function BiometricOffer({ onDone }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const label = biometricLabel();

    const enable = async () => {
        setBusy(true);
        setError("");
        try {
            await registerBiometric();
            onDone(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    const skip = () => {
        dismissBiometricOffer();
        onDone(false);
    };

    return (
        <div className="fixed inset-0 z-[105] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a73e8] via-[#5b4bdb] to-[#c026d3] px-6 text-center text-white">
            <div className="flex w-full max-w-sm flex-col items-center motion-safe:animate-[welcome-up_0.6s_ease-out]">
                <div className="relative mb-8">
                    <div className="absolute -inset-4 rounded-full bg-white/25 blur-xl motion-safe:animate-[glow_3s_ease-in-out_infinite]" />
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/40 backdrop-blur">
                        <BiometricIcon className="h-14 w-14" />
                    </div>
                </div>
                <h1 className="text-3xl font-bold leading-tight">Entrar com {label}?</h1>
                <p className="mt-3 text-base text-white/85">
                    Da próxima vez é só usar {label === "Face ID" ? "o Face ID" : "a digital"} neste aparelho, sem digitar a senha.
                    Por segurança, a entrada vale por 1 dia.
                </p>

                <button
                    type="button"
                    onClick={enable}
                    disabled={busy}
                    className="mt-8 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-[#3b4fd8] shadow-xl shadow-indigo-900/30 transition active:scale-[0.98] disabled:opacity-80"
                >
                    {busy ? <Spinner className="h-6 w-6" /> : <BiometricIcon className="h-6 w-6" />}
                    Ativar {label}
                </button>
                <p className="mt-3 h-5 text-sm font-semibold text-pink-100" role="alert">
                    {error}
                </p>
                <button type="button" onClick={skip} className="mt-2 min-h-[44px] rounded-xl px-4 text-sm font-semibold text-white/80 hover:underline">
                    Agora não
                </button>
            </div>
        </div>
    );
}
