import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.hash.replace("#", "") || "/";

    const menuItems = [
        { path: "/", label: "Nova Medição", icon: "➕" },
        { path: "/history", label: "Histórico", icon: "📊" },
        { path: "/glucose-mary", label: "Glicemia Mary", icon: "🩺" },
    ];

    const isActive = (path) => currentPath === path;

    return (
        <>
            {/* Botão Hamburguer */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden p-2 text-white hover:bg-google-blue-light rounded-lg transition-colors"
                aria-label="Menu"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {isOpen ? (
                        <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                        <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                </svg>
            </button>

            {/* Menu Desktop */}
            <div className="hidden md:flex md:items-center md:space-x-4">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`px-4 py-2 rounded-lg transition-all font-semibold ${
                            isActive(item.path)
                                ? "bg-google-blue-light text-white shadow-lg"
                                : "text-white hover:bg-google-blue-light hover:shadow-md"
                        }`}
                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </div>

            {/* Menu Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-google-blue dark:bg-google-blue-dark shadow-2xl rounded-b-2xl z-40 border-t border-google-blue-light">
                    <nav className="flex flex-col p-4 space-y-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsOpen(false)}
                                className={`px-4 py-3 rounded-lg transition-all font-semibold text-left ${
                                    isActive(item.path)
                                        ? "bg-google-blue-light text-white shadow-md"
                                        : "text-white hover:bg-google-blue-light hover:shadow-sm"
                                }`}
                            >
                                <span className="mr-3 text-xl">{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Overlay para fechar menu ao clicar fora */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black bg-opacity-25 z-30"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    );
}
