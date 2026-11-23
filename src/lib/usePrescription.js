import { useCallback, useEffect, useState } from "react";
import { setMetas } from "./glucose";
import { fetchPrescription } from "./insulin";

/** Carrega a receita do banco e aplica as metas dela na classificação das glicemias. */
export default function usePrescription() {
    const [prescription, setPrescription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const apply = useCallback((p) => {
        setMetas(p?.metas);
        setPrescription(p);
    }, []);

    const reload = useCallback(async () => {
        setLoading(true);
        try {
            apply(await fetchPrescription());
            setError("");
        } catch (e) {
            setError(e.message || "Não foi possível carregar a receita.");
        } finally {
            setLoading(false);
        }
    }, [apply]);

    useEffect(() => {
        reload();
    }, [reload]);

    return { prescription, setPrescription: apply, loading, error, reload };
}
