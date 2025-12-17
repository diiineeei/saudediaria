import { useState } from "react";

export default function HealthTracker() {
    const [pressureSys, setPressureSys] = useState("");
    const [pressureDia, setPressureDia] = useState("");
    const [pressurePulse, setPressurePulse] = useState("");
    const [glucose, setGlucose] = useState("");
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "https://saudediaria-990926851328.southamerica-east1.run.app";
    const API_ENDPOINT = `${API_BASE}/api/registro`;

    const handleSubmit = async () => {
        if (isLoading) return; // previne cliques múltiplos

        setIsLoading(true);
        setStatus("");

        const data = { pressureSys, pressureDia, pressurePulse, glucose, date, time };

        try {
            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setStatus("✅ Dados enviados com sucesso!");
                setPressureSys("");
                setPressureDia("");
                setPressurePulse("");
                setGlucose("");
            } else {
                setStatus("⚠️ Erro ao enviar os dados.");
            }
        } catch (error) {
            setStatus("❌ Erro de conexão com o servidor.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-google-gray-light dark:bg-google-gray-dark p-4 py-8">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-2xl mx-auto border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-google-blue dark:text-google-blue-light mb-2">
                        📋 Nova Medição
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
                        Registre suas medições de saúde diárias
                    </p>
                </div>

                {/* Card de Pressão Arterial */}
                <div className="mb-6 p-4 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">❤️</span>
                        <span className="block font-bold text-gray-800 dark:text-gray-200 text-lg">
                            Pressão Arterial
                        </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 md:gap-3">
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-semibold">
                                Sistólica
                            </label>
                            <input
                                type="number"
                                value={pressureSys}
                                onChange={(e) => setPressureSys(e.target.value)}
                                placeholder="120"
                                className="w-full p-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-semibold">
                                Diastólica
                            </label>
                            <input
                                type="number"
                                value={pressureDia}
                                onChange={(e) => setPressureDia(e.target.value)}
                                placeholder="80"
                                className="w-full p-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-semibold">
                                Pulso
                            </label>
                            <input
                                type="number"
                                value={pressurePulse}
                                onChange={(e) => setPressurePulse(e.target.value)}
                                placeholder="70"
                                className="w-full p-3 border-2 border-red-300 dark:border-red-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Card de Glicemia */}
                <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">🩸</span>
                        <span className="block font-bold text-gray-800 dark:text-gray-200 text-lg">
                            Glicemia (mg/dL)
                        </span>
                    </div>
                    <input
                        type="number"
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value)}
                        placeholder="100"
                        className="w-full p-3 border-2 border-green-300 dark:border-green-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                </div>

                {/* Card de Data e Horário */}
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-3">
                        <span className="text-2xl mr-2">📅</span>
                        <span className="block font-bold text-gray-800 dark:text-gray-200 text-lg">
                            Data e Horário
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-semibold">
                                Data
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full p-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block font-semibold">
                                Horário
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full p-3 border-2 border-blue-300 dark:border-blue-700 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
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
                            Enviar Medição
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
            </div>
        </div>
    );
}
