export const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "https://saudediaria-990926851328.southamerica-east1.run.app";
export const CREATE_ENDPOINT = `${API_BASE}/api/glicemia/mary`;
export const LIST_ENDPOINT = `${API_BASE}/api/glicemia/mary/list`;

// Momentos da medição (opcional). As chaves são as mesmas aceitas pela API.
export const PERIODS = [
    { key: "antes_cafe", label: "Antes do café", short: "Antes café", icon: "☕" },
    { key: "pos_cafe", label: "Pós café", short: "Pós café", icon: "🥐" },
    { key: "antes_almoco", label: "Antes do almoço", short: "Antes almoço", icon: "🍽️" },
    { key: "pos_almoco", label: "Pós almoço", short: "Pós almoço", icon: "🍲" },
    { key: "antes_jantar", label: "Antes do jantar", short: "Antes jantar", icon: "🌙" },
    { key: "pos_jantar", label: "Pós jantar", short: "Pós jantar", icon: "🌜" },
];
export const PERIOD_BY_KEY = Object.fromEntries(PERIODS.map((p) => [p.key, p]));

// Faixas gerais (70–180 mg/dL). Servem só como referência visual.
export const RANGE_LOW = 70;
export const RANGE_HIGH = 180;

// Metas da receita médica: { pre, pos } (antes das refeições e 1h depois). Sem receita, vale 70–180.
let METAS = null;
export const setMetas = (m) => {
    METAS = m && Number(m.pre) > 0 && Number(m.pos) > 0 ? { pre: Number(m.pre), pos: Number(m.pos) } : null;
};
export const getMetas = () => METAS;

/** Limite superior para o momento: meta "antes" para antes_*, meta "1h após" para o resto. */
export const highLimit = (period) => {
    if (!METAS) return RANGE_HIGH;
    return String(period || "").startsWith("antes_") ? METAS.pre : METAS.pos;
};

export const classify = (value, period) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return { label: "", tone: "neutral" };
    if (n < RANGE_LOW) return { label: "Baixa", tone: "low" };
    if (METAS) {
        // A meta é "menor que": o próprio valor da meta já está acima.
        if (n >= highLimit(period)) return { label: "Acima da meta", tone: "high" };
        return { label: "Na meta", tone: "ok" };
    }
    if (n > RANGE_HIGH) return { label: "Alta", tone: "high" };
    return { label: "Normal", tone: "ok" };
};

/** Textos das faixas conforme houver metas da receita ou não. */
export const rangeTexts = () =>
    METAS
        ? {
              inRange: "Na meta",
              lowHigh: `<${RANGE_LOW} / acima`,
              low: `Abaixo de ${RANGE_LOW} mg/dL`,
              high: `Acima da meta (antes < ${METAS.pre}, 1h após < ${METAS.pos})`,
              highShort: "Acima da meta",
              band: `metas: antes < ${METAS.pre} · 1h após < ${METAS.pos}`,
          }
        : {
              inRange: `Entre ${RANGE_LOW}–${RANGE_HIGH}`,
              lowHigh: `<${RANGE_LOW} / >${RANGE_HIGH}`,
              low: `Abaixo de ${RANGE_LOW} mg/dL`,
              high: `Acima de ${RANGE_HIGH} mg/dL`,
              highShort: `Acima de ${RANGE_HIGH}`,
              band: `faixa de ${RANGE_LOW} a ${RANGE_HIGH}`,
          };

export const TONE_CLASSES = {
    low: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    ok: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    high: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
};

export const getCurrentTime = () => new Date().toTimeString().substring(0, 5);
export const getDateFromRecord = (item) => item?.date || item?.createdAt?.split("T")[0] || "";
export const getTimeFromRecord = (item) => item?.time || item?.createdAt?.substring(11, 16) || "--:--";

const pad = (n) => String(n).padStart(2, "0");
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayKey = () => dateKey(new Date());

/** Data (AAAA-MM-DD) de "n - 1" dias atrás: o início de uma janela de n dias contando hoje. */
export const startKeyForDays = (days) => {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1));
    return dateKey(d);
};

export const formatDateBR = (key) => {
    const [y, m, d] = (key || "").split("-");
    return d ? `${d}/${m}/${y}` : key || "";
};

export const formatDay = (key) => {
    if (!key) return "Data não informada";
    const [y, m, d] = key.split("-");
    if (!d) return key;
    if (key === todayKey()) return "Hoje";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (key === dateKey(yesterday)) return "Ontem";
    const weekday = new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", { weekday: "long" });
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${d}/${m}`;
};

const recordMoment = (r) => new Date(`${getDateFromRecord(r)}T${r.time || "00:00"}`).getTime() || 0;

/** Mais recente primeiro. */
export const sortRecordsDesc = (records) => [...records].sort((a, b) => recordMoment(b) - recordMoment(a));

/** Filtra pelos últimos `days` dias (contando hoje). `days` vazio = tudo. */
export const filterByDays = (records, days) => {
    if (!days) return records;
    const start = startKeyForDays(days);
    return records.filter((r) => getDateFromRecord(r) >= start);
};

/** Filtra pelo intervalo de datas (AAAA-MM-DD), inclusive. */
export const filterByRange = (records, from, to) =>
    records.filter((r) => {
        const d = getDateFromRecord(r);
        return d >= from && d <= to;
    });

export const computeStats = (records) => {
    const valid = records.filter((r) => Number.isFinite(Number(r.glucose)));
    const values = valid.map((r) => Number(r.glucose));
    if (!values.length) return null;
    const tones = valid.map((r) => classify(r.glucose, r.period).tone);
    const low = tones.filter((t) => t === "low").length;
    const high = tones.filter((t) => t === "high").length;
    return {
        count: values.length,
        avg: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
        min: Math.min(...values),
        max: Math.max(...values),
        low,
        high,
        inRangePct: Math.round(((values.length - low - high) / values.length) * 100),
    };
};

export async function fetchRecords() {
    const response = await fetch(LIST_ENDPOINT);
    if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(errorText || "Erro ao consultar registros.");
    }
    const json = await response.json();
    if (!Array.isArray(json)) throw new Error("Formato inesperado recebido da API.");
    return json;
}

/** Link da tela de consulta para os médicos (somente leitura, sem senha). */
export const doctorShareUrl = () => `${window.location.origin}${window.location.pathname}#/medico`;
export const isDoctorRoute = () => window.location.hash.startsWith("#/medico");

/** Sugere o momento pelo horário (HH:MM). Só uma sugestão: ela confirma tocando. */
export const suggestPeriod = (time) => {
    const [h, m] = (time || "").split(":").map(Number);
    if (!Number.isFinite(h)) return "";
    const mins = h * 60 + (m || 0);
    if (mins >= 4 * 60 && mins < 9 * 60) return "antes_cafe";
    if (mins >= 9 * 60 && mins < 11 * 60 + 30) return "pos_cafe";
    if (mins >= 11 * 60 + 30 && mins < 13 * 60) return "antes_almoco";
    if (mins >= 13 * 60 && mins < 17 * 60) return "pos_almoco";
    if (mins >= 17 * 60 && mins < 20 * 60) return "antes_jantar";
    if (mins >= 20 * 60) return "pos_jantar";
    return "";
};

export const hasPeriod = (r) => !!PERIOD_BY_KEY[r?.period];
export const recordId = (r) => r?._id || r?.id || "";

const apiError = async (response, fallback) => {
    const text = await response.text().catch(() => "");
    if (response.status === 404 && /page not found/i.test(text)) {
        return new Error("A edição ainda não está disponível: falta publicar a atualização da API.");
    }
    try {
        return new Error(JSON.parse(text).error || fallback);
    } catch {
        return new Error(text || fallback);
    }
};

/** Edita uma medição: { glucose, time, date, period } (period vazio remove o momento). */
export async function updateRecord(id, data) {
    const response = await fetch(`${CREATE_ENDPOINT}/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw await apiError(response, "Não foi possível salvar.");
    return response.json();
}

export async function deleteRecord(id) {
    const response = await fetch(`${CREATE_ENDPOINT}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) throw await apiError(response, "Não foi possível excluir.");
}
