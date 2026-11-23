import { greeting } from "../lib/greeting";

export default function WelcomeScreen({ onClose, leaving }) {
    return (
        <div
            role="dialog"
            aria-label="Boas-vindas"
            onClick={onClose}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-google-blue to-indigo-600 px-8 text-center text-white transition-opacity duration-500 ${
                leaving ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
        >
            <img
                src="/mary.jpg"
                alt="Mary"
                className="h-32 w-32 rounded-full object-cover shadow-2xl ring-4 ring-white/80 motion-safe:animate-[welcome-pop_0.6s_ease-out]"
            />
            <div className="motion-safe:animate-[welcome-up_0.7s_ease-out]">
                <p className="text-sm font-semibold uppercase tracking-widest text-white/70">{greeting()}</p>
                <p className="mt-3 text-3xl font-bold leading-tight">Vamos furar esse dedinho lindo e anotar tudo 🩸💙</p>
            </div>
            <p className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] text-xs text-white/60">toque para continuar</p>
        </div>
    );
}
