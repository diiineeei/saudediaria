import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        // Tenta recuperar do localStorage ou usa preferência do sistema
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            if (saved) return saved === "dark";
            return window.matchMedia("(prefers-color-scheme: dark)").matches;
        }
        return false;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDark]);

    return (
        <button
            onClick={() => setIsDark(!isDark)}
            className="ml-auto bg-google-blue hover:bg-google-blue-light text-white px-3 py-1 rounded transition"
            aria-label="Alternar tema claro/escuro"
            title="Alternar tema claro/escuro"
        >
            {isDark ? "☀️ Claro" : "🌙 Escuro"}
        </button>
    );
}
