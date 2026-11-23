import { useEffect, useState } from "react";
import GlucoseMary from "./pages/GlucoseMary";
import DoctorView from "./pages/DoctorView";
import ThemeToggle from "./components/ThemeToggle";
import LoginScreen from "./components/LoginScreen";
import WelcomeScreen from "./components/WelcomeScreen";
import BiometricOffer from "./components/BiometricOffer";
import SecuritySheet from "./components/SecuritySheet";
import { greeting } from "./lib/greeting";
import { isAuthenticated, logout, refreshSessionPolicy, startSession } from "./lib/auth";
import { hasBiometric, isBiometricSupported, wasBiometricOfferDismissed } from "./lib/biometric";
import { isDoctorRoute } from "./lib/glucose";

function useDoctorRoute() {
    const [doctor, setDoctor] = useState(isDoctorRoute);
    useEffect(() => {
        const onHash = () => setDoctor(isDoctorRoute());
        window.addEventListener("hashchange", onHash);
        return () => window.removeEventListener("hashchange", onHash);
    }, []);
    return doctor;
}

function MaryApp() {
    const [authed, setAuthed] = useState(isAuthenticated);
    const [offerBiometric, setOfferBiometric] = useState(false);
    const [securityOpen, setSecurityOpen] = useState(false);

    // Sessão de 1 dia: confere de novo quando o app volta para a tela.
    useEffect(() => {
        const check = () => {
            if (!isAuthenticated()) {
                setAuthed(false);
                setWelcome("show");
            }
        };
        document.addEventListener("visibilitychange", check);
        window.addEventListener("focus", check);
        const id = setInterval(check, 60_000);
        return () => {
            document.removeEventListener("visibilitychange", check);
            window.removeEventListener("focus", check);
            clearInterval(id);
        };
    }, []);
    // Mensagem de boas-vindas toda vez que o app é aberto; some sozinha ou com um toque.
    const [welcome, setWelcome] = useState("show"); // show | leaving | gone

    useEffect(() => {
        if (!authed || offerBiometric) return undefined;
        if (welcome === "show") {
            const id = setTimeout(() => setWelcome("leaving"), 2500);
            return () => clearTimeout(id);
        }
        if (welcome === "leaving") {
            const id = setTimeout(() => setWelcome("gone"), 500);
            return () => clearTimeout(id);
        }
        return undefined;
    }, [welcome, authed, offerBiometric]);

    if (!authed) {
        return (
            <LoginScreen
                onSuccess={async (method) => {
                    startSession(method);
                    if (method === "password" && !hasBiometric() && !wasBiometricOfferDismissed() && (await isBiometricSupported())) {
                        setOfferBiometric(true);
                    }
                    setWelcome("show");
                    setAuthed(true);
                }}
            />
        );
    }

    if (offerBiometric) {
        return (
            <BiometricOffer
                onDone={(enabled) => {
                    if (enabled) refreshSessionPolicy();
                    setOfferBiometric(false);
                }}
            />
        );
    }

    return (
        <>
            {welcome !== "gone" && <WelcomeScreen leaving={welcome === "leaving"} onClose={() => setWelcome("leaving")} />}

            <header className="sticky top-0 z-50 bg-google-blue pt-[env(safe-area-inset-top)] shadow-md dark:bg-google-blue-dark">
                <div className="mx-auto flex h-16 w-full max-w-xl items-center gap-3 px-4">
                    <img src="/mary.jpg" alt="Mary" className="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white/80" />
                    <div className="min-w-0 flex-1 leading-tight">
                        <h1 className="truncate text-base font-bold text-white">{greeting()}</h1>
                        <p className="text-xs text-white/75">Glicemia da Mary</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setSecurityOpen(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white transition hover:bg-white/15 active:scale-95"
                        aria-label="Segurança"
                        title="Segurança"
                    >
                        <span aria-hidden="true">🔐</span>
                    </button>
                    <ThemeToggle />
                </div>
            </header>

            <main className="min-h-screen bg-google-gray-light pb-[env(safe-area-inset-bottom)] dark:bg-google-gray-dark">
                <GlucoseMary />
            </main>

            <SecuritySheet
                open={securityOpen}
                onClose={() => setSecurityOpen(false)}
                onLogout={() => {
                    logout();
                    setSecurityOpen(false);
                    setAuthed(false);
                }}
            />
        </>
    );
}

export default function App() {
    const doctor = useDoctorRoute();
    return doctor ? <DoctorView /> : <MaryApp />;
}
