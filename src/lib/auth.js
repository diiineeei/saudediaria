import { hasBiometric } from "./biometric";

const KEY = "glicemia-mary-auth";
export const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 1 dia

const read = () => {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return null;
        if (raw === "ok") return { method: "password", expiresAt: null }; // formato antigo
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

const write = (session) => {
    try {
        if (session) localStorage.setItem(KEY, JSON.stringify(session));
        else localStorage.removeItem(KEY);
    } catch {
        /* sem armazenamento: pede para entrar de novo na próxima vez */
    }
};

/**
 * Sessão válida?
 * - Aparelho com Face ID/digital cadastrado: a sessão dura 1 dia.
 * - Aparelho sem biometria: a senha vale até sair.
 */
export const isAuthenticated = () => {
    const s = read();
    if (!s) return false;
    if (s.expiresAt) return Date.now() < s.expiresAt;
    // Sessão antiga sem validade, mas o aparelho passou a ter biometria: vale 1 dia a partir de agora.
    if (hasBiometric()) {
        write({ ...s, expiresAt: Date.now() + SESSION_TTL_MS });
    }
    return true;
};

export const startSession = (method) =>
    write({ method, startedAt: Date.now(), expiresAt: hasBiometric() ? Date.now() + SESSION_TTL_MS : null });

/** Ao ativar a biometria, a sessão atual passa a valer 1 dia. Ao desativar, volta a não expirar. */
export const refreshSessionPolicy = () => {
    const s = read();
    if (!s) return;
    write({ ...s, expiresAt: hasBiometric() ? Date.now() + SESSION_TTL_MS : null });
};

export const sessionExpiresAt = () => read()?.expiresAt || null;

export const logout = () => write(null);
