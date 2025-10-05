import { HashRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import HealthTracker from "./pages/HealthTracker";
import History from "./pages/History";
import GlucoseMary from "./pages/GlucoseMary";
import ThemeToggle from "./components/ThemeToggle";

function NavLink({ to, children }) {
    const location = useLocation();
    // No HashRouter, location.pathname será sempre '/', a rota está no hash
    // Então vamos usar location.hash para comparar
    const currentPath = location.hash.replace("#", "") || "/";
    const isActive = currentPath === to;

    return (
        <Link
            to={to}
            className={
                `px-3 py-1 rounded transition font-semibold ` +
                (isActive ? "bg-google-blue-light text-white" : "text-white hover:bg-google-blue-light")
            }
        >
            {children}
        </Link>
    );
}

export default function App() {
    return (
        <HashRouter basename="/">
            <nav className="bg-google-blue dark:bg-google-blue-dark shadow-md px-6 py-4 flex space-x-8 items-center fixed top-0 left-0 right-0 z-50">
                <NavLink to="/">Nova Medição</NavLink>
                <NavLink to="/history">Histórico</NavLink>
                <NavLink to="/glucose-mary">Glicemia Mary</NavLink>
                <ThemeToggle />
            </nav>

            <main className="pt-20 p-4 max-w-5xl mx-auto bg-google-gray-light dark:bg-google-gray-dark min-h-screen">
                <Routes>
                    <Route path="/" element={<HealthTracker />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/glucose-mary" element={<GlucoseMary />} />
                </Routes>
            </main>
        </HashRouter>
    );
}
