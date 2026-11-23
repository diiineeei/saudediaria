// Orientação de dieta para diabetes — Serviço de Nutrição e Dietética (23/11/2026).
// Transcrição do material entregue na alta, sem dados pessoais.

export const DIET_SOURCE = "Serviço de Nutrição e Dietética · orientação de 23/11/2026";

// Grupos de substituição: 1 porção de um alimento pode ser trocada por 1 porção de outro do mesmo grupo.
export const FOOD_GROUPS = [
    {
        id: 1,
        name: "Hortaliças",
        kcal: "< 25 kcal",
        icon: "🥬",
        free: true,
        note: "À vontade.",
        foods: [
            "Abóbora", "Abobrinha", "Agrião", "Alface", "Aspargo cozido", "Broto de feijão", "Chuchu", "Cogumelo", "Couve-flor",
            "Endívia", "Escarola", "Espinafre", "Nabo", "Pepino", "Rabanete", "Repolho", "Salsão", "Tomate",
        ].map((name) => ({ name, measure: "À vontade" })),
    },
    {
        id: 2,
        name: "Vegetais",
        kcal: "< 35 kcal",
        icon: "🥦",
        foods: [
            { name: "Alcachofra", measure: "½ unidade média", grams: 60 },
            { name: "Berinjela", measure: "7 colheres de sopa", grams: 120 },
            { name: "Beterraba", measure: "4 fatias médias", grams: 80 },
            { name: "Brócolis", measure: "4 ramos médios", grams: 120 },
            { name: "Cenoura", measure: "7 colheres de sopa", grams: 85 },
            { name: "Cogumelo shitake", measure: "3 unidades médias", grams: 55 },
            { name: "Palmito enlatado", measure: "4 unidades médias", grams: 135 },
            { name: "Pimentão", measure: "2 unidades médias", grams: 120 },
            { name: "Quiabo", measure: "5 unidades médias", grams: 100 },
            { name: "Vagem", measure: "6 colheres de sopa", grams: 95 },
        ],
    },
    {
        id: 3,
        name: "Frutas",
        kcal: "< 60 kcal",
        icon: "🍎",
        foods: [
            { name: "Abacaxi fresco", measure: "1 fatia média", grams: 100 },
            { name: "Ameixa preta seca sem calda", measure: "3 unidades médias", grams: 25 },
            { name: "Ameixa fresca", measure: "3 unidades médias", grams: 110 },
            { name: "Banana", measure: "1 unidade média", grams: 70 },
            { name: "Caqui", measure: "1 unidade pequena", grams: 85 },
            { name: "Carambola", measure: "2 unidades médias", grams: 180 },
            { name: "Cereja", measure: "12 unidades médias", grams: 82 },
            { name: "Damasco seco", measure: "4 unidades médias", grams: 28 },
            { name: "Figo", measure: "1 unidade média", grams: 60 },
            { name: "Figo seco", measure: "1 unidade média", grams: 20 },
            { name: "Goiaba", measure: "1 unidade média", grams: 90 },
            { name: "Jaca", measure: "5 bagos", grams: 60 },
            { name: "Kiwi", measure: "1 unidade média", grams: 75 },
            { name: "Laranja", measure: "1 unidade média", grams: 160 },
            { name: "Maçã", measure: "1 unidade pequena", grams: 100 },
            { name: "Maçã seca", measure: "4 fatias finas", grams: 25 },
            { name: "Mamão papaia", measure: "½ unidade média", grams: 110 },
            { name: "Manga", measure: "1 unidade média", grams: 75 },
            { name: "Melancia", measure: "1 fatia média", grams: 200 },
            { name: "Melão", measure: "1 fatia média", grams: 170 },
            { name: "Mexerica", measure: "1 unidade média", grams: 120 },
            { name: "Morango", measure: "4 unidades médias", grams: 200 },
            { name: "Nectarina", measure: "2 unidades médias", grams: 120 },
            { name: "Pera", measure: "½ unidade grande", grams: 85 },
            { name: "Pêssego", measure: "2 unidades pequenas", grams: 140 },
            { name: "Suco de laranja", measure: "½ copo americano", grams: 150 },
            { name: "Tâmara", measure: "3 unidades médias", grams: 25 },
            { name: "Uva branca", measure: "10 unidades médias", grams: 80 },
            { name: "Uva rosada", measure: "1 cacho pequeno", grams: 80 },
        ],
    },
    {
        id: 4,
        name: "Pães e substitutos",
        kcal: "80 kcal",
        icon: "🍞",
        foods: [
            { name: "Aveia", measure: "2 colheres de sopa", grams: 22 },
            { name: "Bolacha cream cracker", measure: "4 unidades", grams: 17 },
            { name: "Cereal matinal rico em fibras", measure: "3 colheres de sopa", grams: 27 },
            { name: "Cereal matinal sem açúcar", measure: "1 xícara de chá", grams: 28 },
            { name: "Granola", measure: "2 colheres de sopa", grams: 22 },
            { name: "Pão de centeio", measure: "1 fatia", grams: 32 },
            { name: "Pão de fibra de aveia", measure: "1 fatia", grams: 30 },
            { name: "Pão de fibra de trigo", measure: "1 fatia", grams: 36 },
            { name: "Pão de forma", measure: "1 fatia", grams: 25 },
            { name: "Pão de trigo integral", measure: "1 fatia", grams: 28 },
            { name: "Pão francês", measure: "½ unidade", grams: 25 },
            { name: "Pão italiano", measure: "1 fatia grossa", grams: 30 },
            { name: "Pão sírio", measure: "½ unidade grande", grams: 40 },
        ],
    },
    {
        id: 5,
        name: "Cereais",
        kcal: "80 kcal",
        icon: "🍚",
        foods: [
            { name: "Arroz branco", measure: "3 colheres de sopa", grams: 60 },
            { name: "Arroz integral", measure: "4 colheres de sopa", grams: 80 },
            { name: "Batata", measure: "1 unidade média", grams: 136 },
            { name: "Batata-doce", measure: "2 fatias pequenas", grams: 80 },
            { name: "Purê de batatas", measure: "1½ colher de sopa", grams: 75 },
            { name: "Inhame", measure: "3 colheres de sopa", grams: 66 },
            { name: "Macarrão cozido", measure: "½ prato raso", grams: 63 },
            { name: "Mandioca", measure: "2 colheres de sopa", grams: 66 },
            { name: "Mandioquinha", measure: "3 colheres de sopa", grams: 90 },
            { name: "Milho verde", measure: "1 unidade média", grams: 65 },
            { name: "Milho verde enlatado", measure: "7 colheres de sopa", grams: 98 },
        ],
    },
    {
        id: 6,
        name: "Leguminosas",
        kcal: "80 kcal",
        icon: "🫘",
        foods: [
            { name: "Ervilha enlatada", measure: "4 colheres de sopa", grams: 120 },
            { name: "Feijão branco", measure: "2 colheres de sopa", grams: 50 },
            { name: "Feijão (somente o grão)", measure: "1 concha pequena", grams: 60 },
            { name: "Grão-de-bico", measure: "2 colheres de sopa", grams: 44 },
            { name: "Lentilha", measure: "3 colheres de sopa", grams: 66 },
            { name: "Soja", measure: "4 colheres de sopa", grams: 42 },
        ],
    },
    {
        id: 7,
        name: "Carnes e ovos",
        kcal: "100 kcal",
        icon: "🍗",
        foods: [
            { name: "Atum enlatado em água", measure: "½ lata", grams: 99 },
            { name: "Atum enlatado em óleo", measure: "2 colheres de sopa", grams: 55 },
            { name: "Bacalhau", measure: "1 pedaço médio", grams: 50, avoid: true },
            { name: "Bife grelhado", measure: "1 bife pequeno", grams: 60 },
            { name: "Bisteca de porco", measure: "½ unidade média", grams: 50 },
            { name: "Camarão", measure: "3 unidades médias", grams: 100 },
            { name: "Carne de boi assada", measure: "2 fatias médias", grams: 56 },
            { name: "Carne moída", measure: "2 colheres de sopa", grams: 30 },
            { name: "Coxa de frango sem pele", measure: "1 unidade média", grams: 44 },
            { name: "Fígado", measure: "1 bife médio", grams: 85 },
            { name: "Frango, peito sem pele, assado", measure: "1 filé médio", grams: 52 },
            { name: "Frango empanado, assado", measure: "2 pedaços pequenos", grams: 50 },
            { name: "Linguiça assada", measure: "1 unidade média", grams: 40, avoid: true },
            { name: "Ovo cozido", measure: "1 unidade", grams: 50 },
            { name: "Peito de peru assado", measure: "1 pedaço médio", grams: 60 },
            { name: "Sardinha enlatada em óleo", measure: "1½ unidade média", grams: 50 },
            { name: "Sobrecoxa assada sem pele", measure: "1 unidade média", grams: 52 },
        ],
    },
    {
        id: 8,
        name: "Leites e substitutos",
        kcal: "115 kcal",
        icon: "🥛",
        foods: [
            { name: "Iogurte natural desnatado", measure: "1½ copo", grams: 280 },
            { name: "Iogurte natural integral", measure: "1 copo", grams: 200 },
            { name: "Leite desnatado", measure: "2 xícaras de chá", grams: 320 },
            { name: "Leite integral", measure: "1 xícara de chá", grams: 160, avoid: true },
            { name: "Leite em pó desnatado", measure: "4 colheres de sopa", grams: 32 },
            { name: "Leite em pó integral", measure: "3 colheres de sopa", grams: 24 },
            { name: "Queijo branco", measure: "1 fatia grossa", grams: 40 },
            { name: "Queijo cheddar", measure: "1 fatia média", grams: 30 },
            { name: "Queijo gorgonzola", measure: "2 fatias finas", grams: 30, avoid: true },
            { name: "Queijo muçarela", measure: "3 fatias médias", grams: 45, avoid: true },
            { name: "Queijo parmesão ralado", measure: "2 colheres de sopa", grams: 20, avoid: true },
            { name: "Queijo prato", measure: "3 fatias médias", grams: 30, avoid: true },
            { name: "Queijo provolone", measure: "1 fatia média", grams: 30 },
            { name: "Ricota", measure: "1 fatia grossa", grams: 50 },
        ],
    },
    {
        id: 9,
        name: "Gorduras e óleos",
        kcal: "40 kcal",
        icon: "🫒",
        foods: [
            { name: "Maionese", measure: "½ colher de sopa", grams: 7, avoid: true },
            { name: "Manteiga", measure: "1 colher de chá", grams: 5, avoid: true },
            { name: "Margarina", measure: "1 colher de chá", grams: 5 },
            { name: "Óleo de canola", measure: "1 colher de sobremesa", grams: 5 },
            { name: "Óleo de girassol", measure: "1 colher de sobremesa", grams: 5 },
            { name: "Azeite (óleo de oliva)", measure: "1 colher de sobremesa", grams: 5 },
            { name: "Óleo de soja", measure: "1 colher de sobremesa", grams: 5 },
        ],
    },
];

// Exemplo de cardápio, com os carboidratos (g) de cada item.
// insulin: lembrete de insulina rápida antes da refeição; measure: medir glicemia antes e 1h após.
export const MEALS = [
    {
        id: "desjejum",
        name: "Café da manhã",
        time: "07:30",
        icon: "☕",
        insulin: "antes_cafe",
        measure: true,
        items: [
            { food: "1 xícara de leite desnatado", group: 8, portions: 0.5, carbs: 12 },
            { food: "½ xícara de café coado amargo", carbs: 0 },
            { food: "2 fatias de pão de forma integral", group: 4, portions: 2, carbs: 22 },
            { food: "1 fatia de queijo branco", group: 8, portions: 1, carbs: 0 },
            { food: "3 sachês de adoçante", carbs: 0 },
        ],
    },
    {
        id: "colacao",
        name: "Colação",
        time: "09:30",
        icon: "🥣",
        items: [{ food: "1 pote (200 g) de iogurte desnatado", group: 8, portions: 0.75, carbs: 12 }],
    },
    {
        id: "almoco",
        name: "Almoço",
        time: "12:30",
        icon: "🍽️",
        insulin: "antes_almoco",
        measure: true,
        lunchDinner: true,
    },
    {
        id: "lanche-tarde",
        name: "Lanche da tarde",
        time: "15:00",
        icon: "🫖",
        snack: true,
    },
    {
        id: "jantar",
        name: "Jantar",
        time: "18:30",
        icon: "🌙",
        insulin: "antes_jantar",
        measure: true,
        lunchDinner: true,
    },
    {
        id: "ceia",
        name: "Ceia",
        time: "21:00",
        icon: "🍵",
        snack: true,
    },
    {
        id: "lanche-noite",
        name: "Lanche",
        time: "22:00",
        icon: "🌜",
        basalReminder: "22h",
        items: [{ food: "1 pote de iogurte light", group: 8, portions: 0.5, carbs: 8.5 }],
    },
];

const LUNCH_DINNER = [
    { food: "4 colheres de sopa de arroz integral", group: 5, portions: 1, carbs: 20 },
    { food: "1 concha de feijão (caldo e grão)", group: 6, portions: 1, carbs: 14 },
    { food: "1 filé de frango grelhado", group: 7, portions: 1, carbs: 0 },
    { food: "4 colheres de sopa de verdura refogada", group: 2, portions: 1, carbs: 4 },
    { food: "1 prato de sobremesa de folhas cruas", group: 1, free: true, carbs: 2 },
    { food: "1 copo (200 ml) de suco natural de limão ou maracujá, sem adoçar", group: 3, portions: 1, carbs: 7 },
    { food: "1 unidade de gelatina diet", carbs: 0 },
];

const SNACK = [
    { food: "1 xícara de chá de ervas", carbs: 0 },
    { food: "3 sachês de adoçante (sucralose)", carbs: 0 },
    { food: "2 unidades de torrada integral", group: 4, portions: 1, carbs: 9 },
    { food: "1 fatia de queijo branco", group: 8, portions: 1, carbs: 0 },
    { food: "1 colher de sopa de manteiga", group: 9, portions: 1, carbs: 0 },
];

for (const meal of MEALS) {
    if (meal.lunchDinner) meal.items = LUNCH_DINNER;
    if (meal.snack) meal.items = SNACK;
    meal.carbs = meal.items.reduce((s, i) => s + i.carbs, 0);
}

export const GUIDELINES = [
    { icon: "🪑", text: "Sentar-se à mesa para fazer as refeições, evitando outras atividades como ver TV ou ler." },
    {
        icon: "🌾",
        text: "Preferir alimentos ricos em fibras/integrais, como cereais, leguminosas, hortaliças e frutas de baixo índice glicêmico (por exemplo, maçã e pera), de preferência com casca ou bagaço, no lugar de sucos.",
    },
    {
        icon: "🥗",
        text: "Aumentar o consumo de vegetais folhosos, começando as refeições por eles. Aumentam a saciedade e ajudam o intestino; inclua-os sempre.",
    },
    {
        icon: "💧",
        text: "Beber no mínimo 8 copos de água por dia. Evitar tomar líquido junto com as refeições. Chás de ervas e sucos de frutas de baixo índice glicêmico (limão ou maracujá) sem açúcar podem ser consumidos diariamente.",
    },
    {
        icon: "🍗",
        text: "Retirar a gordura aparente da carne e consumir aves sem pele. Preferir carnes grelhadas, assadas ou ensopadas; trocar frituras por assados ou cozidos.",
    },
    {
        icon: "🍚",
        text: "Escolher uma fonte de carboidrato por refeição grande. Não misturar carboidratos — por exemplo, não comer arroz com batata e macarrão.",
    },
    {
        icon: "🚫",
        text: "Não consumir doces, bolos, tortas, balas, chocolates, sorvetes cremosos, compotas de frutas, doces concentrados, bolachas recheadas e do tipo wafer.",
    },
    {
        icon: "🫒",
        text: "Para temperar a salada, usar azeite e vinagre, evitando molhos cremosos à base de maionese. Preferir óleo de canola, soja, milho, girassol e azeite.",
    },
    {
        icon: "🧄",
        text: "Temperar com alho, cebola, cheiro-verde, limão, vinagre e pimenta. Usar sal e óleo em pequenas quantidades.",
    },
    { icon: "🌿", text: "Realçar o sabor com ervas e especiarias sem sal. Usar ingredientes frescos sempre que possível e evitar temperos industrializados." },
];

export const SWEETENERS = ["Sucralose", "Aspartame", "Stevia", "Acessulfame de potássio"];

export const AVOID = [
    {
        title: "Carnes gordurosas e processadas",
        items: "Bacon, embutidos e frios em geral (salsicha, mortadela, linguiça, presunto, salame, paio) e carnes processadas (bacalhau, charque, carne-seca, defumados, hambúrguer, almôndegas, quibe, nuggets).",
    },
    {
        title: "Farináceos",
        items: "Croissant, pães doces, roscas com frutas, massas com ovos, macarrão e arroz na manteiga, molho branco, pães recheados e folhados.",
    },
    {
        title: "Leites e derivados integrais",
        items: "Creme de leite, chantili, leite integral, sorvetes à base de leite, queijos amarelos (prato, parmesão, muçarela, gorgonzola).",
    },
    {
        title: "Gorduras e frituras",
        items: "Feijoada, bife à milanesa, batata frita, peixe frito, ovo frito. Evitar também manteiga, banha, gordura vegetal hidrogenada e maionese.",
    },
    { title: "Bebidas alcoólicas", items: "Não consumir: o álcool só fornece calorias, sem vitaminas e minerais." },
];

const normalize = (s) =>
    s
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .trim();

/** Busca um alimento nas trocas e na lista do que evitar. */
export function searchFood(query) {
    const q = normalize(query);
    if (q.length < 2) return { foods: [], avoid: [] };
    const foods = [];
    for (const g of FOOD_GROUPS) {
        for (const f of g.foods) if (normalize(f.name).includes(q)) foods.push({ ...f, group: g });
    }
    const avoid = AVOID.filter((a) => normalize(a.items).includes(q) || normalize(a.title).includes(q));
    return { foods, avoid };
}

/** Refeição atual/próxima pelo horário. */
export function nextMealId(date = new Date()) {
    const mins = date.getHours() * 60 + date.getMinutes();
    const toMin = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
    // "Atual" até 1h depois do horário da refeição.
    const found = MEALS.find((m) => mins <= toMin(m.time) + 60);
    return (found || MEALS[0]).id;
}

export const groupById = (id) => FOOD_GROUPS.find((g) => g.id === id);

// ---------------------------------------------------------------------------
// Opções de refeição: cada item do cardápio é trocado por outro alimento do
// MESMO grupo, na quantidade equivalente da tabela de trocas (porções × medida).
// Nenhuma opção usa alimento marcado para evitar, e cada refeição grande tem
// uma única fonte de carboidrato (grupo 5).
// Cada opção lista, na ordem dos itens da refeição, o alimento escolhido da
// tabela (null = mantém o item do cardápio).
// ---------------------------------------------------------------------------
export const MEAL_OPTIONS = {
    // leite (½ porção), café, pães (2 porções), queijo (1 porção), adoçante
    desjejum: [
        ["Iogurte natural desnatado", null, "Pão francês", "Ricota", null],
        [null, null, "Aveia", null, null],
        [null, null, "Pão de centeio", "Ricota", null],
        ["Iogurte natural desnatado", null, "Cereal matinal rico em fibras", null, null],
    ],
    // iogurte (¾ porção)
    colacao: [["Leite desnatado"], ["Leite em pó desnatado"]],
    // cereal, leguminosa, carne/ovo, vegetal, folhas, fruta/suco, gelatina diet
    almoco: [
        ["Batata-doce", "Lentilha", "Carne de boi assada", "Brócolis", null, "Laranja", null],
        ["Arroz branco", null, "Atum enlatado em água", "Vagem", null, "Maçã", null],
        ["Macarrão cozido", "Grão-de-bico", "Bife grelhado", "Cenoura", null, "Kiwi", null],
        ["Mandioquinha", "Feijão branco", "Ovo cozido", "Beterraba", null, "Morango", null],
    ],
    jantar: [
        ["Batata", "Feijão (somente o grão)", "Sobrecoxa assada sem pele", "Pimentão", null, "Pera", null],
        ["Arroz branco", "Lentilha", "Peito de peru assado", "Vagem", null, "Mexerica", null],
        ["Mandioca", null, "Camarão", "Brócolis", null, "Goiaba", null],
        ["Arroz integral", "Ervilha enlatada", "Fígado", "Cenoura", null, "Abacaxi fresco", null],
    ],
    // chá, adoçante, pães (1 porção), queijo (1 porção), gordura (1 porção)
    "lanche-tarde": [
        [null, null, "Bolacha cream cracker", "Ricota", "Margarina"],
        [null, null, "Pão de centeio", null, "Margarina"],
        [null, null, "Pão de fibra de aveia", "Ricota", "Margarina"],
    ],
    ceia: [
        [null, null, "Bolacha cream cracker", "Ricota", "Margarina"],
        [null, null, "Pão de trigo integral", null, "Margarina"],
        [null, null, "Pão de fibra de trigo", "Ricota", "Margarina"],
    ],
    // iogurte light (½ porção)
    "lanche-noite": [["Leite desnatado"], ["Iogurte natural desnatado"]],
};

const FRACTIONS = [
    [0.25, "¼"],
    [0.5, "½"],
    [0.75, "¾"],
];
const PLURAL = {
    fatia: "fatias", unidade: "unidades", colher: "colheres", "xícara": "xícaras", copo: "copos", concha: "conchas", bife: "bifes",
    "filé": "filés", "pedaço": "pedaços", ramo: "ramos", lata: "latas", prato: "pratos", cacho: "cachos", bago: "bagos",
    "média": "médias", "médio": "médios", grossa: "grossas", pequena: "pequenas", pequeno: "pequenos", grande: "grandes",
    fina: "finas", raso: "rasos",
};
const SINGULAR = Object.fromEntries(Object.entries(PLURAL).map(([s, p]) => [p, s]));

const parseQty = (token) => {
    const m = /^(\d+)?([¼½¾])?$/.exec(token);
    if (!m || (!m[1] && !m[2])) return null;
    const frac = m[2] ? FRACTIONS.find(([, f]) => f === m[2])[0] : 0;
    return Number(m[1] || 0) + frac;
};

const formatQty = (n) => {
    const q = Math.round(n * 4) / 4; // arredonda para ¼
    const whole = Math.floor(q);
    const frac = FRACTIONS.find(([v]) => Math.abs(v - (q - whole)) < 0.01)?.[1] || "";
    return `${whole || ""}${frac}` || "0";
};

/** Multiplica uma medida caseira ("½ unidade", "2 colheres de sopa") por um fator. */
export function scaleMeasure(measure, factor) {
    if (factor === 1) return measure;
    const [first, ...rest] = measure.split(" ");
    const qty = parseQty(first);
    if (qty == null) return `${formatQty(factor)} × ${measure}`;
    const value = Math.round(qty * factor * 4) / 4;
    const plural = value >= 2;
    const words = rest.map((w) => (plural ? PLURAL[w] || w : SINGULAR[w] || w));
    return `${formatQty(value)} ${words.join(" ")}`;
}

const findFood = (groupId, name) => FOOD_GROUPS.find((g) => g.id === groupId)?.foods.find((f) => f.name === name);

/**
 * Monta os itens de uma opção de refeição.
 * Opção 0 = cardápio da nutricionista; as demais trocam itens dentro do mesmo grupo.
 */
export function mealOption(meal, index) {
    if (!index) return meal.items.map((item) => ({ ...item, swapped: false }));
    const picks = MEAL_OPTIONS[meal.id]?.[index - 1] || [];
    return meal.items.map((item, i) => {
        const name = picks[i];
        if (!name || !item.group || item.free) return { ...item, swapped: false };
        const food = findFood(item.group, name);
        if (!food) return { ...item, swapped: false };
        const portions = item.portions || 1;
        return {
            ...item,
            swapped: true,
            food: name,
            quantity: scaleMeasure(food.measure, portions),
            grams: food.grams ? Math.round(food.grams * portions) : null,
            avoid: !!food.avoid,
        };
    });
}

export const optionCount = (meal) => 1 + (MEAL_OPTIONS[meal.id]?.length || 0);
