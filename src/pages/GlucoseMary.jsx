import { useEffect, useMemo, useState } from "react";

export default function GlucoseMary() {
    const [glucose, setGlucose] = useState("");
    const [time, setTime] = useState("");
    const [isManualTime, setIsManualTime] = useState(false);
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [records, setRecords] = useState([]);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState("");
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://saudediaria-990926851328.southamerica-east1.run.app";
    const apiEndpoint = `${apiBase}/api/glicemia/mary`;
    const listEndpoint = `${apiBase}/api/glicemia/mary/list`;

    const getCurrentTime = () => new Date().toTimeString().substring(0, 5);

    useEffect(() => {
        const updateCurrentTime = () => {
            if (!isManualTime) {
                setTime(getCurrentTime());
            }
        };
        updateCurrentTime();
        const intervalId = setInterval(updateCurrentTime, 60_000);
        return () => clearInterval(intervalId);
    }, [isManualTime]);

    const sortedRecords = useMemo(() => {
        return [...records].sort((a, b) => {
            const dateA = a.date || a.createdAt || "";
            const dateB = b.date || b.createdAt || "";
            const timeA = a.time || "";
            const timeB = b.time || "";
            const dateTimeA = new Date(`${dateA}T${timeA || "00:00"}`);
            const dateTimeB = new Date(`${dateB}T${timeB || "00:00"}`);
            return dateTimeB - dateTimeA;
        });
    }, [records]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isLoading) return;

        if (!glucose || !time) {
            setStatus("⚠️ Informe a glicemia e o horário.");
            return;
        }

        setIsLoading(true);
        setStatus("");

        const payload = {
            glucose: Number(glucose),
            time,
        };

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Erro ao enviar os dados.");
            }

            setStatus("✅ Glicemia registrada com sucesso!");
            setGlucose("");
            setTime(getCurrentTime());
            setIsManualTime(false);

            // Atualiza os registros após adicionar novo
            fetchRecords();
        } catch (error) {
            setStatus(error.message || "❌ Erro ao enviar os dados.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRecords = async () => {
        if (isLoadingRecords) return;

        setIsLoadingRecords(true);
        setRecordsError("");

        try {
            const response = await fetch(listEndpoint);

            if (!response.ok) {
                const errorText = await response.text().catch(() => "");
                throw new Error(errorText || "Erro ao consultar registros.");
            }

            const json = await response.json();
            if (!Array.isArray(json)) {
                throw new Error("Formato inesperado recebido da API.");
            }

            setRecords(json);
            setVisibleCount(10);
        } catch (error) {
            setRecordsError(error.message || "❌ Erro ao consultar registros.");
        } finally {
            setIsLoadingRecords(false);
        }
    };

    const handleLoadMore = () => {
        if (!records.length) {
            fetchRecords().catch(() => {});
            return;
        }

        setVisibleCount((current) => current + 10);
    };

    const displayedRecords = useMemo(() => {
        return sortedRecords.slice(0, visibleCount);
    }, [sortedRecords, visibleCount]);

    const getDateFromRecord = (item) => item?.date || item?.createdAt?.split("T")[0] || "";
    const getTimeFromRecord = (item) => item?.time || item?.createdAt?.substring(11, 16) || "-";
    const formatDate = (dateStr) => {
        if (!dateStr) return "Data não informada";
        const parts = dateStr.split("-");
        if (parts.length === 3) {
            const [y, m, d] = parts;
            return `${d}/${m}/${y}`;
        }
        return dateStr;
    };

    const groupedByDay = useMemo(() => {
        const groups = [];
        for (const item of displayedRecords) {
            const dateKey = getDateFromRecord(item) || "Data não informada";
            const last = groups[groups.length - 1];
            if (!last || last.date !== dateKey) {
                groups.push({ date: dateKey, items: [item] });
            } else {
                last.items.push(item);
            }
        }
        return groups;
    }, [displayedRecords]);

    return (
        <div className="min-h-screen bg-google-gray-light dark:bg-google-gray-dark p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-google-blue dark:text-google-blue-light mb-2">
                        🩺 Glicemia Mary
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                        Registre e acompanhe as medições de glicemia
                    </p>
                </div>

                {/* Formulário de Registro */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-6"
                >
                    <div className="flex items-center mb-6">
                        <span className="text-3xl mr-3">🩸</span>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                            Nova Medição
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    💉 Glicemia (mg/dL)
                                </span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={glucose}
                                    onChange={(event) => setGlucose(event.target.value)}
                                    className="w-full p-3 border-2 border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-lg font-semibold"
                                    placeholder="Ex.: 110"
                                    min="0"
                                    step="1"
                                    required
                                />
                            </label>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                            <label className="block">
                                <span className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    🕐 Horário
                                </span>
                                <input
                                    type="time"
                                    value={time}
                                    onFocus={() => setIsManualTime(true)}
                                    onChange={(event) => {
                                        setTime(event.target.value);
                                        setIsManualTime(true);
                                    }}
                                    className="w-full p-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg font-semibold"
                                    required
                                />
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full ${
                            isLoading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-google-blue hover:bg-google-blue-light hover:shadow-lg"
                        } text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Enviando...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">✅</span>
                                Registrar Glicemia
                            </>
                        )}
                    </button>

                    {status && (
                        <div className={`mt-4 p-4 rounded-xl text-center font-semibold ${
                            status.includes("✅")
                                ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                                : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                        }`}>
                            {status}
                        </div>
                    )}
                </form>

                {/* Histórico de Registros */}
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <span className="text-3xl mr-3">📋</span>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                                Histórico
                            </h2>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-semibold">
                            {records.length} registros
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleLoadMore}
                        disabled={isLoadingRecords}
                        className={`w-full mb-6 ${
                            isLoadingRecords
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-google-green hover:bg-green-600 hover:shadow-lg"
                        } text-white py-3 px-6 rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center`}
                    >
                        {isLoadingRecords ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Carregando...
                            </>
                        ) : (
                            <>
                                <span className="mr-2">📊</span>
                                {records.length ? "Mostrar mais 10 registros" : "Carregar Registros"}
                            </>
                        )}
                    </button>

                    {recordsError && (
                        <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-xl border border-red-300 dark:border-red-700 text-center font-semibold">
                            {recordsError}
                        </div>
                    )}

                    {groupedByDay.length > 0 ? (
                        <div className="space-y-4">
                            {groupedByDay.map((group) => (
                                <div
                                    key={group.date}
                                    className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    <div className="px-4 py-3 bg-gradient-to-r from-google-blue/10 to-google-blue-light/10 dark:from-google-blue-dark/30 dark:to-google-blue/30 border-b border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center">
                                            <span className="text-lg mr-2">📅</span>
                                            <span className="font-bold text-gray-800 dark:text-gray-200">
                                                {formatDate(group.date)}
                                            </span>
                                            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                                                {group.items.length} {group.items.length === 1 ? 'medição' : 'medições'}
                                            </span>
                                        </div>
                                    </div>
                                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {group.items.map((item, index) => (
                                            <li
                                                key={item.id || item._id || `${getDateFromRecord(item)}-${getTimeFromRecord(item)}-${index}`}
                                                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                            >
                                                <div className="flex items-center">
                                                    <span className="text-2xl mr-3">🕐</span>
                                                    <span className="font-mono text-lg font-semibold text-gray-700 dark:text-gray-300">
                                                        {getTimeFromRecord(item)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                                                        Glicemia:
                                                    </span>
                                                    <span className="text-2xl font-bold text-google-green">
                                                        {item.glucose ?? "-"}
                                                    </span>
                                                    <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                                        mg/dL
                                                    </span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isLoadingRecords && records.length === 0 && (
                            <div className="text-center py-12">
                                <span className="text-6xl mb-4 block">📭</span>
                                <p className="text-gray-500 dark:text-gray-400 font-semibold">
                                    Nenhum registro encontrado
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                    Clique no botão acima para carregar
                                </p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
