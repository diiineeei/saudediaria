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
    // Dados simulados: substitua por fetch da sua API
    const allData = [
        {
            id: 1,
            date: "2025-06-10",
            time: "08:00",
            systolic: 120,
            diastolic: 80,
            pulse: 70,
            glucose: 95,
        },
        {
            id: 2,
            date: "2025-06-11",
            time: "08:15",
            systolic: 125,
            diastolic: 82,
            pulse: 72,
            glucose: 98,
        },
        {
            id: 3,
            date: "2025-06-12",
            time: "08:30",
            systolic: 118,
            diastolic: 78,
            pulse: 68,
            glucose: 90,
        },
        // Adicione mais dados aqui...
    ];

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [filteredData, setFilteredData] = useState(allData);
    const [isDark, setIsDark] = useState(false);

    // Detecta se está no tema escuro
    useEffect(() => {
        // Função para verificar se tem a classe 'dark'
        const checkDark = () => {
            setIsDark(document.documentElement.classList.contains("dark"));
        };

        // Inicializa o estado
        checkDark();

        // Cria observer para observar atributos da tag <html>
        const observer = new MutationObserver(() => {
            checkDark();
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

        // Cleanup
        return () => observer.disconnect();
    }, []);


    // Filtrar dados por intervalo de datas
    useEffect(() => {
        if (!startDate && !endDate) {
            setFilteredData(allData);
            return;
        }

        const filtered = allData.filter((entry) => {
            const entryDate = new Date(entry.date);
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && end) {
                return entryDate >= start && entryDate <= end;
            } else if (start) {
                return entryDate >= start;
            } else if (end) {
                return entryDate <= end;
            }
            return true;
        });

        setFilteredData(filtered);
    }, [startDate, endDate]);

    // Ordena para gráfico e tabela
    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
            const dateTimeA = new Date(a.date + "T" + a.time);
            const dateTimeB = new Date(b.date + "T" + b.time);
            return dateTimeA - dateTimeB;
        });
    }, [filteredData]);

    return (
        <div className="min-h-screen bg-google-gray-light dark:bg-google-gray-dark p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-6 text-google-gray-dark dark:text-google-gray-light">
                Histórico de Medições
            </h1>

            <section className="mb-6 flex flex-col sm:flex-row gap-4 w-full max-w-4xl justify-center">
                <label className="flex flex-col text-google-gray-dark dark:text-gray-200">
                    Data Início
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-2 rounded border border-gray-500 bg-white dark:bg-gray-700 text-google-gray-dark dark:text-gray-200"
                    />
                </label>
                <label className="flex flex-col text-google-gray-dark dark:text-gray-200">
                    Data Fim
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-2 rounded border border-gray-500 bg-white dark:bg-gray-700 text-google-gray-dark dark:text-gray-200"
                    />
                </label>
            </section>

            <section className="w-full max-w-4xl overflow-x-auto mb-10">
                <table className="w-full border-collapse border border-gray-600">
                    <thead className="bg-google-gray-light dark:bg-gray-700">
                    <tr>
                        <th className="border border-gray-600 px-3 py-2 text-left text-gray-900 dark:text-gray-200">
                            Data
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-left text-gray-900 dark:text-gray-200">
                            Horário
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-right text-gray-900 dark:text-gray-200">
                            Sistólica
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-right text-gray-900 dark:text-gray-200">
                            Diastólica
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-right text-gray-900 dark:text-gray-200">
                            Pulso
                        </th>
                        <th className="border border-gray-600 px-3 py-2 text-right text-gray-900 dark:text-gray-200">
                            Glicemia
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedData.length === 0 && (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-center py-4 text-gray-600 dark:text-gray-400"
                            >
                                Nenhum dado encontrado para o intervalo selecionado.
                            </td>
                        </tr>
                    )}
                    {sortedData.map(
                        ({ id, date, time, systolic, diastolic, pulse, glucose }) => (
                            <tr
                                key={id}
                                className="odd:bg-white even:bg-google-gray-light dark:odd:bg-gray-700 dark:even:bg-google-gray-dark"
                            >
                                <td className="border border-gray-600 px-3 py-2">{date}</td>
                                <td className="border border-gray-600 px-3 py-2">{time}</td>
                                <td className="border border-gray-600 px-3 py-2 text-right">
                                    {systolic}
                                </td>
                                <td className="border border-gray-600 px-3 py-2 text-right">
                                    {diastolic}
                                </td>
                                <td className="border border-gray-600 px-3 py-2 text-right">
                                    {pulse}
                                </td>
                                <td className="border border-gray-600 px-3 py-2 text-right">
                                    {glucose}
                                </td>
                            </tr>
                        )
                    )}
                    </tbody>
                </table>
            </section>

            <section className="w-full max-w-5xl h-96 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={sortedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDark ? "#555" : "#ccc"}
                        />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: isDark ? "#fff" : "#333", fontWeight: 'bold' }}
                            stroke={isDark ? "#fff" : "#333"}
                        />
                        <YAxis
                            tick={{ fill: isDark ? "#fff" : "#333", fontWeight: 'bold' }}
                            stroke={isDark ? "#fff" : "#333"}
                        />
                        <Legend
                            wrapperStyle={{ color: isDark ? "#fff" : "#333", fontWeight: 'bold' }}
                            verticalAlign="top"
                            height={36}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: isDark ? "#222" : "#fff",
                                borderColor: isDark ? "#555" : "#ccc",
                                color: isDark ? "#fff" : "#333",
                                fontWeight: 'bold'
                            }}
                        />


                        <Line
                            type="monotone"
                            dataKey="systolic"
                            name="Sistólica"
                            stroke="#ea4335"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="diastolic"
                            name="Diastólica"
                            stroke="#1a73e8"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="glucose"
                            name="Glicemia"
                            stroke="#34a853"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="pulse"
                            name="Pulso"
                            stroke="#fbbc04"
                            strokeWidth={2}
                            dot={{ r: 4 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </section>
        </div>
    );
}
