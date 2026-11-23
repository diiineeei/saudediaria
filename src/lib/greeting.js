export const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia, Mary! ☀️";
    if (h < 18) return "Boa tarde, Mary! 🌷";
    return "Boa noite, Mary! ✨";
};
