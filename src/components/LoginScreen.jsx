import { useEffect, useRef, useState } from "react";

// Senha simples, só para dar um toque de privacidade. Não é segurança de verdade:
// ela fica no código do app, que é público.
const PASSWORD = "amordaminhavida";
const normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, "");

const HEARTS = Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i * 1.3) % 9,
    duration: 9 + ((i * 7) % 6),
    size: 12 + ((i * 5) % 14),
    emoji: ["💙", "🤍", "💜", "✨"][i % 4],
}));

export default function LoginScreen({ onSuccess }) {
    const [value, setValue] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [shake, setShake] = useState(false);
    const [entering, setEntering] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        const id = setTimeout(() => inputRef.current?.focus(), 600);
        return () => clearTimeout(id);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (normalize(value) === PASSWORD) {
            setError("");
            setEntering(true);
            if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
            setTimeout(onSuccess, 650);
            return;
        }
        setError(value ? "Hmm, não é essa… tenta de novo 💙" : "Digite a senha 💙");
        setShake(true);
        if (navigator.vibrate) navigator.vibrate(120);
        setTimeout(() => setShake(false), 500);
    };

    return (
        <div
            className={`fixed inset-0 z-[110] overflow-hidden bg-gradient-to-br from-[#1a73e8] via-[#5b4bdb] to-[#c026d3] text-white transition-opacity duration-700 ${
                entering ? "opacity-0" : "opacity-100"
            }`}
        >
            {/* Luzes suaves de fundo */}
            <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-sky-300/40 blur-3xl motion-safe:animate-[blob_14s_ease-in-out_infinite]" />
            <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-pink-400/40 blur-3xl motion-safe:animate-[blob_18s_ease-in-out_infinite_reverse]" />
            <div className="pointer-events-none absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-violet-300/30 blur-3xl motion-safe:animate-[blob_16s_ease-in-out_infinite]" />

            {/* Coraçõezinhos subindo */}
            <div className="pointer-events-none absolute inset-0 motion-reduce:hidden" aria-hidden="true">
                {HEARTS.map((h, i) => (
                    <span
                        key={i}
                        className="absolute bottom-[-40px] animate-[float-up_linear_infinite] opacity-0"
                        style={{
                            left: `${h.left}%`,
                            fontSize: h.size,
                            animationDuration: `${h.duration}s`,
                            animationDelay: `${h.delay}s`,
                        }}
                    >
                        {h.emoji}
                    </span>
                ))}
            </div>

            <div className="relative mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-[calc(2rem+env(safe-area-inset-top))]">
                {/* Foto */}
                <div className="relative mb-7 motion-safe:animate-[welcome-pop_0.7s_ease-out]">
                    <div className="absolute -inset-3 rounded-full bg-white/30 blur-xl motion-safe:animate-[glow_3s_ease-in-out_infinite]" />
                    <div className="relative rounded-full bg-gradient-to-tr from-white via-pink-200 to-sky-200 p-1 shadow-2xl">
                        <img src="/mary.jpg" alt="Mary" className="h-36 w-36 rounded-full object-cover ring-4 ring-white/70" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl shadow-lg motion-safe:animate-[heartbeat_1.6s_ease-in-out_infinite]">
                        💙
                    </span>
                </div>

                <div className="mb-8 text-center motion-safe:animate-[welcome-up_0.8s_ease-out]">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Bem-vinda</p>
                    <h1 className="mt-1 font-serif text-5xl font-bold italic tracking-tight drop-shadow-sm">Mary</h1>
                    <p className="mt-3 text-base text-white/85">O cantinho para cuidar de você com carinho</p>
                </div>

                <form onSubmit={submit} className={`w-full motion-safe:animate-[welcome-up_1s_ease-out] ${shake ? "animate-[shake_0.45s_ease-in-out]" : ""}`}>
                    <label htmlFor="password" className="sr-only">
                        Senha
                    </label>
                    <div className="relative">
                        <span className="pointer-events-none absolute left-5 top-1/2 z-10 -translate-y-1/2 text-lg" aria-hidden="true">
                            🔒
                        </span>
                        <input
                            id="password"
                            ref={inputRef}
                            type={show ? "text" : "password"}
                            value={value}
                            onChange={(e) => {
                                setValue(e.target.value);
                                if (error) setError("");
                            }}
                            autoComplete="current-password"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            enterKeyHint="go"
                            placeholder="Senha"
                            className={`h-16 w-full rounded-2xl border-2 bg-white/15 pl-14 pr-16 text-lg font-semibold text-white placeholder-white/60 shadow-inner outline-none backdrop-blur-md transition focus:bg-white/25 ${
                                error ? "border-pink-200" : "border-white/30 focus:border-white/80"
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow((s) => !s)}
                            className="absolute right-2 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-xl text-xl text-white/80 hover:bg-white/10"
                            aria-label={show ? "Esconder senha" : "Mostrar senha"}
                        >
                            {show ? "🙈" : "👁️"}
                        </button>
                    </div>

                    <p className="mt-2 h-5 text-center text-sm font-semibold text-pink-100" role="alert">
                        {error}
                    </p>

                    <button
                        type="submit"
                        className="mt-3 flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-white text-lg font-bold text-[#3b4fd8] shadow-xl shadow-indigo-900/30 transition hover:bg-white/95 active:scale-[0.98]"
                    >
                        Entrar <span aria-hidden="true">→</span>
                    </button>
                </form>

                <p className="mt-10 text-center text-xs text-white/60">feito com muito amor 💙</p>
            </div>
        </div>
    );
}
