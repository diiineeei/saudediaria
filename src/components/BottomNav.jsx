const ITEMS = [
    { id: "glicemia", label: "Glicemia", icon: "🩸" },
    { id: "dieta", label: "Dieta", icon: "🍽️" },
];

/** Barra de navegação inferior, fácil de alcançar com o polegar. */
export default function BottomNav({ tab, onChange }) {
    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-gray-700 dark:bg-gray-900/95"
            aria-label="Navegação principal"
        >
            <div className="mx-auto grid h-16 max-w-xl grid-cols-2">
                {ITEMS.map((item) => {
                    const active = tab === item.id;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onChange(item.id)}
                            aria-current={active ? "page" : undefined}
                            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition ${
                                active ? "text-google-blue dark:text-google-blue-light" : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            <span className={`text-2xl leading-none transition ${active ? "scale-110" : "opacity-70 grayscale"}`} aria-hidden="true">
                                {item.icon}
                            </span>
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
