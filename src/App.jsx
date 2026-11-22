import GlucoseMary from "./pages/GlucoseMary";
import ThemeToggle from "./components/ThemeToggle";

const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia, Mary! ☀️";
    if (h < 18) return "Boa tarde, Mary! 🌷";
    return "Boa noite, Mary! ✨";
};

export default function App() {
    return (
        <>
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
