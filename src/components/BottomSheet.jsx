import { useEffect } from "react";

export default function BottomSheet({ open, onClose, title, children }) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-black/40 motion-safe:animate-[fade-in_0.2s_ease-out]" onClick={onClose} />
            <div className="relative w-full max-w-xl rounded-t-3xl bg-white px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl motion-safe:animate-[sheet-up_0.25s_ease-out] dark:bg-gray-800 sm:rounded-3xl">
                <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
