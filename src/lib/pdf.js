import {
    PERIODS,
    RANGE_HIGH,
    RANGE_LOW,
    classify,
    computeStats,
    filterByDays,
    filterByRange,
    formatDateBR,
    getDateFromRecord,
    getTimeFromRecord,
    startKeyForDays,
    todayKey,
} from "./glucose";

const BLUE = [26, 115, 232];
const INK = [32, 33, 36];
const MUTED = [95, 99, 104];
const TONE_TEXT = { low: [180, 83, 9], high: [190, 18, 60], ok: [6, 95, 70] };
const TONE_FILL = { low: [254, 243, 199], high: [255, 228, 230], ok: null };

const OTHER = "outros";
const COLUMNS = [...PERIODS.map((p) => ({ key: p.key, label: p.short })), { key: OTHER, label: "Outros horários" }];

const fmt = (n) => String(n).replace(".", ",");

/**
 * Gera o PDF do diário de glicemia.
 * @param {Array} records registros da API
 * @param {{ days?: number, from?: string, to?: string }} options últimos N dias, ou intervalo AAAA-MM-DD (vazio = tudo)
 * @returns {Promise<{ blob: Blob, fileName: string }>}
 */
export async function buildGlucosePdf(records, { days, from, to } = {}) {
    const [{ jsPDF }, { autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);

    const selected = (from && to ? filterByRange(records, from, to) : filterByDays(records, days)).filter((r) => getDateFromRecord(r));
    const stats = computeStats(selected);
    const dates = [...new Set(selected.map(getDateFromRecord))].sort();
    const startKey = from || (days ? startKeyForDays(days) : dates[0] || todayKey());
    const endKey = to || todayKey();

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;

    // Cabeçalho
    doc.setFillColor(...BLUE);
    doc.rect(0, 0, pageW, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Diário de glicemia", margin, 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Paciente: Mary", margin, 22);
    doc.text(`Período: ${formatDateBR(startKey)} a ${formatDateBR(endKey)}`, pageW - margin, 14, { align: "right" });
    doc.text(
        `Gerado em ${new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}`,
        pageW - margin,
        22,
        { align: "right" },
    );

    let y = 40;

    // Resumo
    if (stats) {
        const boxes = [
            ["Medições", String(stats.count)],
            ["Média", `${stats.avg} mg/dL`],
            ["Mínima", `${stats.min} mg/dL`],
            ["Máxima", `${stats.max} mg/dL`],
            [`Entre ${RANGE_LOW} e ${RANGE_HIGH}`, `${stats.inRangePct}%`],
            [`Abaixo de ${RANGE_LOW}`, String(stats.low)],
            [`Acima de ${RANGE_HIGH}`, String(stats.high)],
        ];
        const gap = 2.5;
        const boxW = (pageW - margin * 2 - gap * (boxes.length - 1)) / boxes.length;
        boxes.forEach(([label, value], i) => {
            const x = margin + i * (boxW + gap);
            doc.setFillColor(241, 243, 244);
            doc.roundedRect(x, y, boxW, 17, 2, 2, "F");
            doc.setTextColor(...MUTED);
            doc.setFontSize(7.5);
            doc.text(label, x + boxW / 2, y + 6, { align: "center" });
            doc.setTextColor(...INK);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            doc.text(value, x + boxW / 2, y + 13, { align: "center" });
            doc.setFont("helvetica", "normal");
        });
        y += 25;
    }

    // Tabela dia × momento
    const byDay = new Map(dates.map((d) => [d, Object.fromEntries(COLUMNS.map((c) => [c.key, []]))]));
    for (const r of selected) {
        const col = PERIODS.some((p) => p.key === r.period) ? r.period : OTHER;
        byDay.get(getDateFromRecord(r))[col].push(r);
    }
    for (const cols of byDay.values()) {
        for (const list of Object.values(cols)) list.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }

    const cellText = (list, col) =>
        list.map((r) => (col === OTHER ? `${fmt(r.glucose)} (${getTimeFromRecord(r)})` : `${fmt(r.glucose)}`)).join("\n");
    const worstTone = (list) => {
        const tones = list.map((r) => classify(r.glucose).tone);
        if (tones.includes("high")) return "high";
        if (tones.includes("low")) return "low";
        return tones.length ? "ok" : null;
    };

    const body = dates.map((d) => {
        const cols = byDay.get(d);
        const weekday = new Date(`${d}T12:00`).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
        return [
            `${formatDateBR(d).slice(0, 5)} ${weekday}`,
            ...COLUMNS.map((c) => ({ content: cellText(cols[c.key], c.key), tone: worstTone(cols[c.key]) })),
        ];
    });

    const avgRow = [
        "Média",
        ...COLUMNS.map((c) => {
            const vals = selected
                .filter((r) => (c.key === OTHER ? !PERIODS.some((p) => p.key === r.period) : r.period === c.key))
                .map((r) => Number(r.glucose))
                .filter(Number.isFinite);
            return vals.length ? String(Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)) : "–";
        }),
    ];

    doc.setTextColor(...INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Medições por dia e momento (mg/dL)", margin, y);
    y += 3;

    autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin, bottom: 18 },
        head: [["Dia", ...COLUMNS.map((c) => c.label)]],
        body: body.length ? body : [["Sem medições no período", ...COLUMNS.map(() => "")]],
        foot: body.length ? [avgRow] : undefined,
        theme: "grid",
        styles: { font: "helvetica", fontSize: 9, halign: "center", valign: "middle", cellPadding: 2, lineColor: [218, 220, 224], lineWidth: 0.2, textColor: INK },
        headStyles: { fillColor: BLUE, textColor: 255, fontStyle: "bold", fontSize: 8 },
        footStyles: { fillColor: [232, 240, 254], textColor: INK, fontStyle: "bold" },
        columnStyles: { 0: { halign: "left", fontStyle: "bold", cellWidth: 22 }, [COLUMNS.length]: { cellWidth: 30 } },
        alternateRowStyles: { fillColor: [250, 250, 251] },
        didParseCell: (data) => {
            if (data.section !== "body") return;
            const tone = data.cell.raw?.tone;
            if (tone && TONE_TEXT[tone]) {
                data.cell.styles.textColor = TONE_TEXT[tone];
                data.cell.styles.fontStyle = tone === "ok" ? "normal" : "bold";
                if (TONE_FILL[tone]) data.cell.styles.fillColor = TONE_FILL[tone];
            }
        },
    });

    // Legenda
    let ly = doc.lastAutoTable.finalY + 7;
    if (ly > doc.internal.pageSize.getHeight() - 25) {
        doc.addPage();
        ly = 20;
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const legend = [
        [TONE_FILL.low, TONE_TEXT.low, `Abaixo de ${RANGE_LOW} mg/dL`],
        [TONE_FILL.high, TONE_TEXT.high, `Acima de ${RANGE_HIGH} mg/dL`],
    ];
    let lx = margin;
    for (const [fill, text, label] of legend) {
        doc.setFillColor(...fill);
        doc.setDrawColor(...text);
        doc.roundedRect(lx, ly - 3.2, 5, 4, 0.8, 0.8, "FD");
        doc.text(label, lx + 7, ly);
        lx += 50;
    }
    doc.text("Faixas usadas apenas como referência visual.", lx, ly);

    // Rodapé com número da página
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        const h = doc.internal.pageSize.getHeight();
        doc.text("Glicemia da Mary", margin, h - 8);
        doc.text(`Página ${i} de ${pages}`, pageW - margin, h - 8, { align: "right" });
    }

    return { blob: doc.output("blob"), fileName: `glicemia-mary-${endKey}.pdf` };
}

/** Abre o menu de compartilhar do celular com o PDF; se não der, baixa o arquivo. */
export async function shareOrDownloadPdf({ blob, fileName }, { preferShare = true } = {}) {
    const file = new File([blob], fileName, { type: "application/pdf" });
    if (preferShare && navigator.canShare?.({ files: [file] })) {
        try {
            await navigator.share({ files: [file], title: "Glicemia da Mary" });
            return "shared";
        } catch (err) {
            if (err?.name === "AbortError") return "cancelled";
        }
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return "downloaded";
}
