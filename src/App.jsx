import GlucoseMary from "./pages/GlucoseMary";
import ThemeToggle from "./components/ThemeToggle";
import Logo from "./components/Logo";

export default function App() {
    return (
        <>
            <header className="sticky top-0 z-50 bg-google-blue pt-[env(safe-area-inset-top)] shadow-md dark:bg-google-blue-dark">
                <div className="mx-auto flex h-14 w-full max-w-xl items-center gap-3 px-4">
                    <Logo className="h-8 w-8" />
                    <div className="min-w-0 flex-1 leading-tight">
                        <h1 className="truncate text-base font-bold text-white">Glicemia Mary</h1>
                        <p className="text-xs text-white/70">Saúde Diária</p>
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
