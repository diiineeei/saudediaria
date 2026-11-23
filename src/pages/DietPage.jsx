import { useMemo, useRef, useState } from "react";
import { AVOID, DIET_SOURCE, FOOD_GROUPS, GUIDELINES, MEALS, SWEETENERS, groupById, nextMealId, searchFood } from "../lib/diet";
import { INSULIN_MOMENT_BY_KEY } from "../lib/insulin";
import usePrescription from "../lib/usePrescription";

const TABS = [
    { id: "cardapio", label: "Cardápio" },
    { id: "trocas", label: "Trocas" },
    { id: "dicas", label: "Dicas" },
];

const fmtCarbs = (n) => `${String(n).replace(".", ",")} g`;

function GroupPill({ id, onOpen }) {
    const g = groupById(id);
    if (!g) return null;
    return (
        <button
            type="button"
            onClick={() => onOpen(id)}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-600 hover:bg-google-blue/10 hover:text-google-blue dark:bg-gray-700 dark:text-gray-300"
            aria-label={`Ver trocas do grupo ${g.name}`}
        >
            <span aria-hidden="true">{g.icon}</span> {g.name}
        </button>
    );
}

function FoodRow({ food, showGroup }) {
    return (
        <li className="flex items-start gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {food.name}
                    {food.avoid && (
                        <span className="ml-1.5 inline-block rounded-full bg-amber-100 px-1.5 py-0.5 align-middle text-[10px] font-bold text-amber-800 dark:bg-amber-500/15 dark:text-amber-300">
                            ⚠️ evitar
                        </span>
                    )}
                </p>
                {showGroup && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {food.group.icon} {food.group.name} · {food.group.kcal}
                    </p>
                )}
            </div>
            <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-google-blue dark:text-google-blue-light">{food.measure}</p>
                {food.grams ? <p className="text-[11px] text-gray-500 dark:text-gray-400">{food.grams} g</p> : null}
            </div>
        </li>
    );
}

/** Página da dieta: cardápio, trocas por grupo e orientações da nutrição. */
export default function DietPage() {
    const { prescription } = usePrescription(); // lembretes de insulina nas refeições
    const [tab, setTab] = useState("cardapio");
    const [query, setQuery] = useState("");
    const [openGroup, setOpenGroup] = useState(null);
    const groupRefs = useRef({});
    const current = useMemo(() => nextMealId(), []);
    const results = useMemo(() => searchFood(query), [query]);
    const searching = query.trim().length >= 2;

    const showGroup = (id) => {
        setQuery("");
        setTab("trocas");
        setOpenGroup(id);
        setTimeout(() => groupRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    };

    const rapida = prescription?.rapida;
    const basal = prescription?.basal;

    return (
        <div className="mx-auto w-full max-w-xl px-4 pb-28 pt-4">
            <section className="mb-4 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-5 text-white shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/75">Dieta para diabetes</p>
                <h2 className="mt-1 text-2xl font-bold">O que comer e quanto 🍽️</h2>
                <p className="mt-1 text-sm text-white/85">{DIET_SOURCE}</p>
            </section>

            {/* Busca */}
            <div className="relative mb-4">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg" aria-hidden="true">
                    🔎
                </span>
                <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Posso comer…? ex.: banana"
                    aria-label="Buscar alimento"
                    className="min-h-[52px] w-full rounded-2xl border-2 border-gray-200 bg-white pl-12 pr-4 text-base text-gray-900 outline-none placeholder-gray-400 focus:border-google-blue dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
            </div>

            {searching ? (
                <section aria-live="polite">
                    {results.foods.length > 0 && (
                        <>
                            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">Porção de 1 troca</p>
                            <ul className="mb-4 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-700 dark:bg-gray-800">
                                {results.foods.map((f) => (
                                    <FoodRow key={`${f.group.id}-${f.name}`} food={f} showGroup />
                                ))}
                            </ul>
                        </>
                    )}
                    {results.avoid.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {results.avoid.map((a) => (
                                <div key={a.title} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
                                    <p className="font-bold text-rose-800 dark:text-rose-300">🚫 Evitar · {a.title}</p>
                                    <p className="mt-0.5 text-rose-900/80 dark:text-rose-200/80">{a.items}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {!results.foods.length && !results.avoid.length && (
                        <p className="rounded-2xl border border-dashed border-gray-300 p-5 text-center text-sm text-gray-500 dark:border-gray-600 dark:text-gray-400">
                            Não está na orientação. Na dúvida, pergunte à nutricionista.
                        </p>
                    )}
                </section>
            ) : (
                <>
                    {/* Abas */}
                    <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-gray-200/70 p-1 dark:bg-gray-800" role="tablist">
                        {TABS.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                role="tab"
                                aria-selected={tab === t.id}
                                onClick={() => setTab(t.id)}
                                className={`min-h-[44px] rounded-xl text-sm font-bold transition ${
                                    tab === t.id ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {tab === "cardapio" && (
                        <div className="space-y-3">
                            <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                Exemplo de cardápio. Cada item pode ser trocado por outro do mesmo grupo — toque no grupo para ver as opções.
                            </p>
                            {MEALS.map((meal) => {
                                const isCurrent = meal.id === current;
                                const insulinMoment = meal.insulin && INSULIN_MOMENT_BY_KEY[meal.insulin];
                                const rapidaHere = rapida?.scales?.[meal.insulin]?.length;
                                const basalHere = basal?.doses?.find((d) => d.moment === (meal.insulin || meal.basalReminder));
                                return (
                                    <article
                                        key={meal.id}
                                        className={`overflow-hidden rounded-2xl border-2 bg-white dark:bg-gray-800 ${
                                            isCurrent ? "border-emerald-500 shadow-md" : "border-gray-200 dark:border-gray-700"
                                        }`}
                                    >
                                        <header className="flex items-center gap-3 px-4 pt-3">
                                            <span className="text-2xl" aria-hidden="true">
                                                {meal.icon}
                                            </span>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {meal.name}{" "}
                                                    {isCurrent && (
                                                        <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 align-middle text-[10px] font-bold uppercase text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                            agora
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{meal.time}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">{fmtCarbs(meal.carbs)}</p>
                                                <p className="text-[10px] uppercase tracking-wide text-gray-500">carboidrato</p>
                                            </div>
                                        </header>

                                        {(meal.measure || insulinMoment || basalHere) && (
                                            <div className="mx-4 mt-2 flex flex-wrap gap-1.5 text-[11px] font-semibold">
                                                {meal.measure && (
                                                    <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
                                                        🩸 medir antes e 1h depois
                                                    </span>
                                                )}
                                                {insulinMoment && rapidaHere ? (
                                                    <span className="rounded-full bg-google-blue/10 px-2 py-0.5 text-google-blue dark:text-google-blue-light">
                                                        💉 {rapida.name}
                                                        {rapida.minutesBefore ? ` ${rapida.minutesBefore} min antes` : " antes"}
                                                    </span>
                                                ) : null}
                                                {basalHere ? (
                                                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                                                        💉 {basal.name} {basalHere.units} un{meal.basalReminder ? " às 22h" : ""}
                                                    </span>
                                                ) : null}
                                            </div>
                                        )}

                                        <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-700">
                                            {meal.items.map((item) => (
                                                <li key={item.food} className="flex items-start gap-3 px-4 py-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-800 dark:text-gray-100">{item.food}</p>
                                                        {item.group && (
                                                            <div className="mt-0.5">
                                                                <GroupPill id={item.group} onOpen={showGroup} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="shrink-0 text-xs font-semibold text-gray-500 dark:text-gray-400">{fmtCarbs(item.carbs)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    {tab === "trocas" && (
                        <div className="space-y-2">
                            <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                Cada linha é <strong>1 porção</strong>. Troque por qualquer alimento do <strong>mesmo grupo</strong>, na medida indicada.
                            </p>
                            {FOOD_GROUPS.map((g) => {
                                const open = openGroup === g.id;
                                return (
                                    <section
                                        key={g.id}
                                        ref={(el) => (groupRefs.current[g.id] = el)}
                                        className="scroll-mt-20 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setOpenGroup(open ? null : g.id)}
                                            aria-expanded={open}
                                            className="flex min-h-[60px] w-full items-center gap-3 px-4 text-left"
                                        >
                                            <span className="text-2xl" aria-hidden="true">
                                                {g.icon}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block font-bold text-gray-900 dark:text-white">
                                                    Grupo {g.id} · {g.name}
                                                </span>
                                                <span className="block text-xs text-gray-500 dark:text-gray-400">
                                                    {g.free ? "À vontade" : `${g.foods.length} opções`} · {g.kcal} por porção
                                                </span>
                                            </span>
                                            <svg
                                                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden="true"
                                            >
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>
                                        {open &&
                                            (g.free ? (
                                                <div className="flex flex-wrap gap-1.5 px-4 pb-4">
                                                    {g.foods.map((f) => (
                                                        <span key={f.name} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                                                            {f.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-700 dark:border-gray-700">
                                                    {g.foods.map((f) => (
                                                        <FoodRow key={f.name} food={f} />
                                                    ))}
                                                </ul>
                                            ))}
                                    </section>
                                );
                            })}
                            <p className="px-1 pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                                ⚠️ evitar: está na tabela de trocas, mas a orientação também pede para evitar.
                            </p>
                        </div>
                    )}

                    {tab === "dicas" && (
                        <div className="space-y-4">
                            <ul className="space-y-2">
                                {GUIDELINES.map((g) => (
                                    <li key={g.text} className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                                        <span className="text-xl" aria-hidden="true">
                                            {g.icon}
                                        </span>
                                        <span>{g.text}</span>
                                    </li>
                                ))}
                            </ul>

                            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                                <h3 className="mb-2 font-bold text-emerald-900 dark:text-emerald-200">✅ Adoçantes permitidos para gestantes</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {SWEETENERS.map((s) => (
                                        <span key={s} className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-gray-900 dark:text-emerald-300">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </section>

                            <section>
                                <h3 className="mb-2 px-1 font-bold text-gray-900 dark:text-white">🚫 Evitar</h3>
                                <div className="space-y-2">
                                    {AVOID.map((a) => (
                                        <div key={a.title} className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
                                            <p className="font-bold text-rose-800 dark:text-rose-300">{a.title}</p>
                                            <p className="mt-0.5 text-rose-900/80 dark:text-rose-200/80">{a.items}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <p className="px-1 text-xs text-gray-500 dark:text-gray-400">
                                Siga um programa alimentar adequado ao seu estilo de vida, com acompanhamento da nutricionista.
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
