const KEY = "glicemia-mary-auth";

export const isAuthenticated = () => {
    try {
        return localStorage.getItem(KEY) === "ok";
    } catch {
        return false;
    }
};

export const rememberLogin = () => {
    try {
        localStorage.setItem(KEY, "ok");
    } catch {
        /* sem armazenamento: pede a senha de novo na próxima vez */
    }
};
