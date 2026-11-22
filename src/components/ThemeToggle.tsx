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
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-white transition hover:bg-white/15 active:scale-95"
            aria-label="Alternar tema claro/escuro"
            title="Alternar tema claro/escuro"
        >
            <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
        </button>
    );
}
