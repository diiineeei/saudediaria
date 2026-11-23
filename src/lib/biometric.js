// Entrar com Face ID (iPhone/iPad/Mac) ou digital/rosto (Android) usando WebAuthn.
// As chaves ficam no próprio aparelho; aqui guardamos só os IDs das chaves deste aparelho.
// Não há servidor validando a assinatura: é uma trava de conforto, como a senha.

const KEY = "glicemia-mary-biometric";

const toB64Url = (buf) =>
    btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const fromB64Url = (s) => {
    const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
    return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
};
const randomBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

const load = () => {
    try {
        const data = JSON.parse(localStorage.getItem(KEY) || "{}");
        return { credentialIds: Array.isArray(data.credentialIds) ? data.credentialIds : [], dismissed: !!data.dismissed };
    } catch {
        return { credentialIds: [], dismissed: false };
    }
};
const save = (data) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
        /* sem armazenamento */
    }
};

const isApple = () => /iPhone|iPad|iPod|Macintosh/i.test(navigator.userAgent);

/** Nome amigável do método neste aparelho. */
export const biometricLabel = () => (isApple() ? "Face ID" : "digital");

export async function isBiometricSupported() {
    try {
        if (!window.isSecureContext || !window.PublicKeyCredential) return false;
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch {
        return false;
    }
}

export const hasBiometric = () => load().credentialIds.length > 0;
export const wasBiometricOfferDismissed = () => load().dismissed;
export const dismissBiometricOffer = () => save({ ...load(), dismissed: true });

const friendlyError = (err) => {
    if (err?.name === "NotAllowedError") return "Cancelado ou não reconhecido. Tente de novo.";
    if (err?.name === "InvalidStateError") return "Este aparelho já está cadastrado.";
    if (err?.name === "SecurityError") return "O navegador bloqueou: o app precisa estar em HTTPS.";
    return err?.message || "Não foi possível usar a biometria.";
};

/** Cadastra a digital/Face ID deste aparelho. */
export async function registerBiometric() {
    try {
        const current = load();
        const credential = await navigator.credentials.create({
            publicKey: {
                challenge: randomBytes(32),
                rp: { name: "Glicemia da Mary", id: window.location.hostname },
                user: { id: randomBytes(16), name: "mary", displayName: "Mary" },
                pubKeyCredParams: [
                    { type: "public-key", alg: -7 },
                    { type: "public-key", alg: -257 },
                ],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required",
                    residentKey: "preferred",
                },
                excludeCredentials: current.credentialIds.map((id) => ({ type: "public-key", id: fromB64Url(id) })),
                timeout: 60_000,
                attestation: "none",
            },
        });
        if (!credential) throw new Error("Cadastro cancelado.");
        save({ credentialIds: [...current.credentialIds, toB64Url(credential.rawId)], dismissed: false });
    } catch (err) {
        throw new Error(friendlyError(err));
    }
}

/** Pede a digital/Face ID. Resolve se o aparelho confirmou que é a Mary. */
export async function verifyBiometric() {
    const { credentialIds } = load();
    if (!credentialIds.length) throw new Error("Biometria não cadastrada neste aparelho.");
    try {
        const assertion = await navigator.credentials.get({
            publicKey: {
                challenge: randomBytes(32),
                rpId: window.location.hostname,
                allowCredentials: credentialIds.map((id) => ({
                    type: "public-key",
                    id: fromB64Url(id),
                    transports: ["internal", "hybrid"],
                })),
                userVerification: "required",
                timeout: 60_000,
            },
        });
        if (!assertion || !credentialIds.includes(toB64Url(assertion.rawId))) throw new Error("Chave não reconhecida.");
        // Byte 32 = flags; bit 2 (0x04) = usuário verificado (biometria/PIN).
        const flags = new Uint8Array(assertion.response.authenticatorData)[32];
        if (!(flags & 0x04)) throw new Error("O aparelho não confirmou a biometria.");
    } catch (err) {
        throw new Error(friendlyError(err));
    }
}

export const removeBiometric = () => save({ credentialIds: [], dismissed: true });
