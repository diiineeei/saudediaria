const RANGE_OPTIONS = [
    { days: 7, label: "7 dias" },
    { days: 14, label: "14 dias" },
    { days: 30, label: "30 dias" },
    { days: 90, label: "90 dias" },
    { days: 0, label: "Tudo" },
];

export default function PeriodRangeChips({ value, onChange }) {
    return (
        <div className="flex w-full gap-1.5" role="radiogroup" aria-label="Período">
            {RANGE_OPTIONS.map((o) => {
                const selected = value === o.days;
                return (
                    <button
                        key={o.days}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => onChange(o.days)}
                        className={`min-h-[40px] flex-1 whitespace-nowrap rounded-full border-2 px-1 text-sm font-semibold transition active:scale-95 ${
                            selected
                                ? "border-google-blue bg-google-blue text-white dark:border-google-blue-light dark:bg-google-blue-light"
                                : "border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
