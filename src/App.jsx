import { useEffect, useState } from "react";
import GlucoseMary from "./pages/GlucoseMary";
import ThemeToggle from "./components/ThemeToggle";

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia, Mary! ☀️";
    if (h < 18) return "Boa tarde, Mary! 🌷";
    return "Boa noite, Mary! ✨";
};

function WelcomeScreen({ onClose, leaving }) {
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
                <p className="mt-3 text-3xl font-bold leading-tight">
                    Vamos furar esse dedinho lindo e anotar tudo 🩸💙
                </p>
            </div>
            <p className="absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] text-xs text-white/60">
                toque para continuar
            </p>
        </div>
    );
}

export default function App() {
    // Mensagem de boas-vindas toda vez que o app é aberto; some sozinha ou com um toque.
    const [welcome, setWelcome] = useState("show"); // show | leaving | gone

    useEffect(() => {
        if (welcome === "show") {
            const id = setTimeout(() => setWelcome("leaving"), 2500);
            return () => clearTimeout(id);
        }
        if (welcome === "leaving") {
            const id = setTimeout(() => setWelcome("gone"), 500);
            return () => clearTimeout(id);
        }
        return undefined;
    }, [welcome]);

    return (
        <>
            {welcome !== "gone" && (
                <WelcomeScreen leaving={welcome === "leaving"} onClose={() => setWelcome("leaving")} />
            )}
            <header className="sticky top-0 z-50 bg-google-blue pt-[env(safe-area-inset-top)] shadow-md dark:bg-google-blue-dark">
                <div className="mx-auto flex h-16 w-full max-w-xl items-center gap-3 px-4">
                    <img
                        src="/mary.jpg"
                        alt="Mary"
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/80"
                    />
                    <div className="min-w-0 flex-1 leading-tight">
                        <h1 className="truncate text-base font-bold text-white">{greeting()}</h1>
                        <p className="text-xs text-white/75">Glicemia da Mary</p>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            <main className="min-h-screen bg-google-gray-light pb-[env(safe-area-inset-bottom)] dark:bg-google-gray-dark">
                <GlucoseMary />
            </main>
        </>
    );
}
