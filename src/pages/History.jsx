import { useState, useEffect, useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";

export default function History() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isDark, setIsDark] = useState(false);
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://saudediaria-990926851328.southamerica-east1.run.app";

    useEffect(() => {
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };
        checkDark();
        const observer = new MutationObserver(() => {
            checkDark();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);

            let url = `${apiBase}/api/registros`;
            const params = new URLSearchParams();
            if (startDate) params.append("startDate", startDate);
            if (endDate) params.append("endDate", endDate);
            if ([...params].length) url += `?${params.toString()}`;

            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Erro na API: ${res.statusText}`);
                const json = await res.json();

                const mappedData = json.map(item => ({
                    id: item._id || item.id || item.date + item.time,
                    date: item.date,
                    time: item.time,
                    systolic: Number(item.pressureSys),
                    diastolic: Number(item.pressureDia),
                    pulse: Number(item.pressurePulse),
                    glucose: Number(item.glucose),
                }));

                setData(mappedData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [startDate, endDate]);

    const sortedData = useMemo(() => {
        return [...data].sort((a, b) => {
            const dateTimeA = new Date(a.date + "T" + a.time);
            const dateTimeB = new Date(b.date + "T" + b.time);
            return dateTimeA - dateTimeB;
        });
    }, [data]);

    return (
        <div className="min-h-screen bg-google-gray-light dark:bg-google-gray-dark p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-google-blue dark:text-google-blue-light mb-2">
                        📊 Histórico de Medições
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                        Visualize e analise suas medições ao longo do tempo
                    </p>
                </div>

                {/* Filtros de Data */}
                <div className="mb-6 md:mb-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <span className="text-2xl mr-2">📅</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            Filtrar Período
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Data Fim
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full p-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-google-blue focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <svg className="animate-spin h-8 w-8 text-google-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="ml-3 text-google-blue font-semibold">Carregando dados...</span>
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-xl border border-red-300 dark:border-red-700">
                        ❌ {error}
                    </div>
                )}

                {/* Gráfico */}
                <div className="mb-6 md:mb-8 bg-white dark:bg-gray-800 p-4 md:p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-4">
                        <span className="text-2xl mr-2">📈</span>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                            Gráfico de Evolução
                        </h2>
                    </div>
                    <div className="h-64 md:h-80 lg:h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sortedData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#444" : "#ddd"} />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: isDark ? "#fff" : "#333", fontSize: 12 }}
                                    stroke={isDark ? "#666" : "#999"}
                                    angle={-45}
                                    textAnchor="end"
                                    height={60}
                                />
                                <YAxis
                                    tick={{ fill: isDark ? "#fff" : "#333", fontSize: 12 }}
                                    stroke={isDark ? "#666" : "#999"}
                                />
                                <Legend
                                    wrapperStyle={{ color: isDark ? "#fff" : "#333", fontSize: 14 }}
                                    verticalAlign="top"
                                    height={36}
                                    iconType="line"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? "#1f2937" : "#fff",
                                        borderColor: isDark ? "#374151" : "#d1d5db",
                                        borderRadius: "12px",
                                        color: isDark ? "#fff" : "#333",
                                        padding: "12px",
                                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                                    }}
                                />
                                <Line type="monotone" dataKey="systolic" name="Sistólica" stroke="#ea4335" strokeWidth={3} dot={{ r: 5, fill: "#ea4335" }} />
                                <Line type="monotone" dataKey="diastolic" name="Diastólica" stroke="#1a73e8" strokeWidth={3} dot={{ r: 5, fill: "#1a73e8" }} />
                                <Line type="monotone" dataKey="glucose" name="Glicemia" stroke="#34a853" strokeWidth={3} dot={{ r: 5, fill: "#34a853" }} />
                                <Line type="monotone" dataKey="pulse" name="Pulso" stroke="#fbbc04" strokeWidth={3} dot={{ r: 5, fill: "#fbbc04" }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Tabela Responsiva */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <span className="text-2xl mr-2">📋</span>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Tabela de Dados
                            </h2>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Data</th>
                                    <th className="px-3 md:px-4 py-3 text-left text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Hora</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Sist.</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Diast.</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Pulso</th>
                                    <th className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-bold text-gray-700 dark:text-gray-200">Glic.</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {sortedData.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <div className="flex flex-col items-center">
                                                <span className="text-4xl mb-2">📭</span>
                                                <p className="font-semibold">Nenhum dado encontrado</p>
                                                <p className="text-sm">Tente ajustar os filtros de data</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {sortedData.map(({ id, date, time, systolic, diastolic, pulse, glucose }) => (
                                    <tr
                                        key={id || date + time}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                    >
                                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-800 dark:text-gray-200 font-medium">
                                            {new Date(date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-800 dark:text-gray-200">{time}</td>
                                        <td className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-red-600 dark:text-red-400">{systolic}</td>
                                        <td className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-blue-600 dark:text-blue-400">{diastolic}</td>
                                        <td className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-yellow-600 dark:text-yellow-400">{pulse}</td>
                                        <td className="px-3 md:px-4 py-3 text-right text-xs md:text-sm font-semibold text-green-600 dark:text-green-400">{glucose}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
