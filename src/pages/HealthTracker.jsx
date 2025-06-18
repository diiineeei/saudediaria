import { useState } from "react";

export default function HealthTracker() {
    const [pressureSys, setPressureSys] = useState("");
    const [pressureDia, setPressureDia] = useState("");
    const [pressurePulse, setPressurePulse] = useState("");
    const [glucose, setGlucose] = useState("");
    const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
    const [time, setTime] = useState(new Date().toTimeString().substring(0, 5));
    const [status, setStatus] = useState("");
    const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const API_ENDPOINT = `${API_BASE}/api/registro`;

    const handleSubmit = async () => {
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
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-google-gray-light dark:bg-google-gray-dark p-4">
            <div className="bg-white dark:bg-google-gray-mid p-6 rounded-2xl shadow-xl w-full max-w-md mx-auto">
                <h1 className="text-2xl font-bold mb-4 text-center text-google-gray-dark dark:text-google-gray-light">
                    Saúde Diária
                </h1>

                <div className="mb-3">
          <span className="block font-semibold text-google-gray-dark dark:text-google-gray-light mb-1">
            Pressão arterial (Sistólica / Diastólica / Pulso)
          </span>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={pressureSys}
                            onChange={(e) => setPressureSys(e.target.value)}
                            placeholder="Sistólica"
                            className="w-1/3 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                        />
                        <input
                            type="number"
                            value={pressureDia}
                            onChange={(e) => setPressureDia(e.target.value)}
                            placeholder="Diastólica"
                            className="w-1/3 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                        />
                        <input
                            type="number"
                            value={pressurePulse}
                            onChange={(e) => setPressurePulse(e.target.value)}
                            placeholder="Pulso"
                            className="w-1/3 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                        />
                    </div>
                </div>

                <label className="block mb-3">
          <span className="font-semibold text-google-gray-dark dark:text-google-gray-light">
            Glicemia (mg/dL)
          </span>
                    <input
                        type="number"
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value)}
                        className="w-full mt-1 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                    />
                </label>

                <label className="block mb-3">
          <span className="font-semibold text-google-gray-dark dark:text-google-gray-light">
            Data
          </span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full mt-1 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                    />
                </label>

                <label className="block mb-4">
          <span className="font-semibold text-google-gray-dark dark:text-google-gray-light">
            Horário
          </span>
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full mt-1 p-2 border rounded bg-white dark:bg-google-gray-dark text-google-gray-dark dark:text-google-gray-light"
                    />
                </label>

                <button
                    onClick={handleSubmit}
                    className="w-full bg-google-blue hover:bg-google-blue-light text-white py-2 rounded transition"
                >
                    Enviar
                </button>

                {status && (
                    <p className="mt-4 text-center text-sm text-google-gray-dark dark:text-google-gray-light">
                        {status}
                    </p>
                )}
            </div>
        </div>
    );
}
