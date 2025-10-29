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
        // Define horário inicial
        updateCurrentTime();
        // Atualiza a cada minuto, exceto quando o usuário editou manualmente
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
        <div className="min-h-screen flex items-center justify-center bg-google-gray-light dark:bg-google-gray-dark p-4">
            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-google-gray-mid p-6 rounded-2xl shadow-xl w-full max-w-md mx-auto"
            >
                <h1 className="text-2xl font-bold mb-6 text-center text-google-gray-dark dark:text-google-gray-light">
                    Registrar Glicemia
                </h1>

                <label className="block mb-4">
                    <span className="font-semibold text-google-gray-dark dark:text-google-gray-light">
                        Glicemia (mg/dL)
                    </span>
                    <input
                        type="number"
                        inputMode="numeric"
                        value={glucose}
                        onChange={(event) => setGlucose(event.target.value)}
                        className="w-full mt-1 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                        placeholder="Ex.: 110"
                        min="0"
                        step="1"
                        required
                    />
                </label>

                <label className="block mb-6">
                    <span className="font-semibold text-google-gray-dark dark:text-google-gray-light">
                        Horário
                    </span>
                    <input
                        type="time"
                        value={time}
                        onFocus={() => setIsManualTime(true)}
                        onChange={(event) => {
                            setTime(event.target.value);
                            setIsManualTime(true);
                        }}
                        className="w-full mt-1 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                        required
                    />
                </label>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full ${
                        isLoading
                            ? "bg-google-blue-light cursor-not-allowed"
                            : "bg-google-blue hover:bg-google-blue-light"
                    } text-white py-2 rounded transition`}
                >
                    {isLoading ? "Enviando..." : "Registrar"}
                </button>

                {status && (
                    <p className="mt-4 text-center text-sm text-google-gray-dark dark:text-google-gray-light">
                        {status}
                    </p>
                )}

                <hr className="my-6 border-google-gray-light dark:border-google-gray-dark" />

                <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingRecords}
                    className={`w-full mb-4 ${
                        isLoadingRecords
                            ? "bg-google-green-light cursor-not-allowed"
                            : "bg-google-green hover:bg-green-600"
                    } text-white py-2 rounded transition`}
                >
                    {isLoadingRecords
                        ? "Carregando registros..."
                        : records.length
                            ? "Mostrar mais 10 registros"
                            : "Consultar últimos registros"}
                </button>

                {recordsError && (
                    <p className="mb-4 text-center text-sm text-red-600 dark:text-red-400">
                        {recordsError}
                    </p>
                )}

                {groupedByDay.length > 0 && (
                    <div className="space-y-3 text-sm text-google-gray-dark dark:text-google-gray-light">
                        {groupedByDay.map((group) => (
                            <div
                                key={group.date}
                                className="rounded border border-google-gray-light dark:border-google-gray-dark overflow-hidden"
                            >
                                <div className="px-3 py-2 bg-google-gray-light dark:bg-google-gray-dark font-semibold">
                                    {formatDate(group.date)}
                                </div>
                                <ul className="divide-y divide-google-gray-light dark:divide-google-gray-dark">
                                    {group.items.map((item, index) => (
                                        <li
                                            key={item.id || item._id || `${getDateFromRecord(item)}-${getTimeFromRecord(item)}-${index}`}
                                            className="flex items-center justify-between px-3 py-2 bg-white dark:bg-google-gray-mid"
                                        >
                                            <span className="tabular-nums">{getTimeFromRecord(item)}</span>
                                            <span>
                                                <span className="opacity-80 mr-1">Glicemia:</span>
                                                <span className="font-semibold">{item.glucose ?? "-"}</span>
                                                <span className="ml-1 opacity-60">mg/dL</span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </form>
        </div>
    );
}
