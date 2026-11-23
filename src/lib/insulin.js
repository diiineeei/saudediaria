import { API_BASE, getDateFromRecord, todayKey } from "./glucose";

const PRESCRIPTION_URL = `${API_BASE}/api/prescricao/mary`;
const INSULIN_URL = `${API_BASE}/api/insulina/mary`;

// Momentos de aplicação (as chaves são as mesmas da API).
export const INSULIN_MOMENTS = [
    { key: "antes_cafe", label: "Antes do café", short: "Café", icon: "☕", meal: "café da manhã" },
    { key: "antes_almoco", label: "Antes do almoço", short: "Almoço", icon: "🍽️", meal: "almoço" },
    { key: "antes_jantar", label: "Antes do jantar", short: "Jantar", icon: "🌙", meal: "jantar" },
    { key: "22h", label: "Às 22h", short: "22h", icon: "🛏️", meal: null },
];
export const INSULIN_MOMENT_BY_KEY = Object.fromEntries(INSULIN_MOMENTS.map((m) => [m.key, m]));

/** Momento provável pelo horário atual (só pré-seleciona; ela pode trocar). */
export const momentForNow = (date = new Date()) => {
    const mins = date.getHours() * 60 + date.getMinutes();
    if (mins >= 4 * 60 && mins < 10 * 60 + 30) return "antes_cafe";
    if (mins >= 10 * 60 + 30 && mins < 16 * 60) return "antes_almoco";
    if (mins >= 16 * 60 && mins < 21 * 60) return "antes_jantar";
    return "22h";
};

const fmtUnits = (n) => (Number.isInteger(n) ? String(n) : String(n).replace(".", ","));
export const formatUnits = (n) => `${fmtUnits(n)} ${n === 1 ? "unidade" : "unidades"}`;

/**
 * Calcula as doses da receita para um momento.
 * - basal: dose fixa do momento (ou null se a receita não tiver)
 * - rapida: { status: "ok", units, range } quando a glicemia cai numa faixa da receita;
 *           { status: "below" | "above", min, max } fora da tabela (a receita não indica dose);
 *           { status: "missing" } sem glicemia; null se a receita não tiver rápida nesse momento.
 */
export function calculateDoses(prescription, moment, glucose) {
    if (!prescription) return { basal: null, rapida: null };
    const basalDose = prescription.basal?.doses?.find((d) => d.moment === moment);
    const scale = [...(prescription.rapida?.scales?.[moment] || [])].sort((a, b) => a.min - b.min);

    let rapida = null;
    if (scale.length) {
        const g = Number(glucose);
        if (glucose === "" || glucose === null || glucose === undefined || !Number.isFinite(g) || g <= 0) {
            rapida = { status: "missing" };
        } else {
            const range = scale.find((f) => g >= f.min && g <= f.max);
            const min = scale[0].min;
            const max = scale[scale.length - 1].max;
            if (range) rapida = { status: "ok", units: range.units, range };
            else if (g < min) rapida = { status: "below", min, max };
            else if (g > max) rapida = { status: "above", min, max };
            else rapida = { status: "gap", min, max }; // valor entre faixas (ex.: decimal)
        }
    }

    return { basal: basalDose ? basalDose.units : null, rapida, scale };
}

const apiError = async (response, fallback) => {
    const text = await response.text().catch(() => "");
    if (response.status === 404 && /page not found/i.test(text)) {
        return new Error("A insulina ainda não está disponível: falta publicar a atualização da API.");
    }
    try {
        return new Error(JSON.parse(text).error || fallback);
    } catch {
        return new Error(text || fallback);
    }
};

/** Receita salva no banco, ou null se ainda não houver. */
export async function fetchPrescription() {
    const response = await fetch(PRESCRIPTION_URL);
    if (response.status === 404) {
        const text = await response.clone().text().catch(() => "");
        if (/page not found/i.test(text)) throw await apiError(response, "");
        return null;
    }
    if (!response.ok) throw await apiError(response, "Não foi possível carregar a receita.");
    return response.json();
}

export async function savePrescription(prescription) {
    const response = await fetch(PRESCRIPTION_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prescription),
    });
    if (!response.ok) throw await apiError(response, "Não foi possível salvar a receita.");
    return response.json();
}

export async function fetchApplications() {
    const response = await fetch(`${INSULIN_URL}/list`);
    if (!response.ok) throw await apiError(response, "Não foi possível carregar as aplicações.");
    const json = await response.json();
    return Array.isArray(json) ? json : [];
}

export async function createApplication(data) {
    const response = await fetch(INSULIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw await apiError(response, "Não foi possível registrar a aplicação.");
    return response.json();
}

export async function updateApplication(id, data) {
    const response = await fetch(`${INSULIN_URL}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw await apiError(response, "Não foi possível salvar.");
    return response.json();
}

export async function deleteApplication(id) {
    const response = await fetch(`${INSULIN_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Não foi possível excluir.");
}

export const todayApplications = (apps) => apps.filter((a) => getDateFromRecord(a) === todayKey());
