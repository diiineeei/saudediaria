import { HashRouter, Routes, Route } from "react-router-dom";
import HealthTracker from "./pages/HealthTracker";
import History from "./pages/History";
import GlucoseMary from "./pages/GlucoseMary";
import ThemeToggle from "./components/ThemeToggle";
import MobileMenu from "./components/MobileMenu";
import Logo from "./components/Logo";

export default function App() {
    return (
        <HashRouter basename="/">
            <nav className="bg-google-blue dark:bg-google-blue-dark shadow-lg px-4 md:px-6 py-3 md:py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50">
                <div className="flex items-center space-x-3">
                    <Logo className="w-8 h-8 md:w-10 md:h-10" />
                    <h1 className="text-white font-bold text-lg md:text-xl">
                        Saúde Diária
                    </h1>
                </div>

                <div className="flex items-center space-x-2 md:space-x-4">
                    <MobileMenu />
                    <ThemeToggle />
                </div>
            </nav>

            <main className="pt-16 md:pt-20 bg-google-gray-light dark:bg-google-gray-dark min-h-screen">
                <Routes>
                    <Route path="/" element={<HealthTracker />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/glucose-mary" element={<GlucoseMary />} />
                </Routes>
            </main>
        </HashRouter>
    );
}
