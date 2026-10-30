(() => {
  "use strict";

  /* ---------- níveis ----------
     A dificuldade combina 3 fatores: quão conhecida é a palavra, quantos erros cabem e quantas dicas existem.
     Dicas são progressivas: a 1ª mostra a pista em texto, as seguintes revelam letras. */
  const LEVELS = {
    facil:   { label: "Fácil",   errors: 8, hints: 3, cost: 0, words: "palavras do dia a dia" },
    medio:   { label: "Médio",   errors: 6, hints: 2, cost: 0, words: "palavras conhecidas" },
    dificil: { label: "Difícil", errors: 5, hints: 1, cost: 1, words: "palavras raras e compostas" }
  };
  const LV_KEYS = Object.keys(LEVELS);

  /* partes do boneco por erro, em cada nível */
  const SEQ = {
    facil:   [["head"], ["body"], ["armL"], ["armR"], ["legL"], ["legR"], ["footL"], ["footR"]],
    medio:   [["head"], ["body"], ["armL"], ["armR"], ["legL"], ["legR"]],
    dificil: [["head"], ["body"], ["armL", "armR"], ["legL"], ["legR"]]
  };

  /* ---------- banco de palavras: [palavra, pista] ----------
     Regra das pistas: apontar para um GRUPO, nunca para a resposta.
     Cada pista precisa servir para pelo menos 3 palavras plausíveis da categoria
     (nada de capital, monumento, função exclusiva ou definição de dicionário). */
  const WORDS = {
    "Animais": {
      facil: [["TUCANO","Tem penas e vive em florestas tropicais"],["JABUTI","Réptil que vive em terra firme"],["PINGUIM","Vive em lugares frios"],["ZEBRA","Herbívoro da savana africana"],["POLVO","Vive no fundo do mar"],["LAGOSTA","Tem casca dura e vive no mar"]],
      medio: [["CAPIVARA","Mamífero que gosta de ficar perto da água"],["TAMANDUÁ","Mamífero encontrado no Cerrado"],["CAMALEÃO","Réptil que vive em árvores"],["PREGUIÇA","Mamífero que passa muito tempo nas árvores"],["ESCORPIÃO","Pode ser venenoso"],["HIPOPÓTAMO","Animal de grande porte da África"]],
      dificil: [["ORNITORRINCO","Mamífero nativo da Austrália"],["JOÃO-DE-BARRO","Ave comum no Brasil"],["RINOCERONTE","Herbívoro de pele grossa"],["ESCARAVELHO","Inseto de corpo duro"],["ARIRANHA","Mamífero que nada bem"]]
    },
    "Frutas": {
      facil: [["CAQUI","Fica alaranjada quando madura"],["MANGA","Fruta tropical com caroço"],["GOIABA","Tem muitas sementinhas por dentro"],["ACEROLA","Fruta pequena e vermelha"],["ABACAXI","Fruta tropical de casca grossa"],["PITANGA","Fruta nativa do Brasil"]],
      medio: [["MARACUJÁ","Tem sabor azedinho"],["MELANCIA","Fruta grande e cheia de água"],["CARAMBOLA","Fica amarela quando madura"],["TANGERINA","Fruta cítrica"],["FRAMBOESA","Frutinha comum em geleias"],["JABUTICABA","Fruta pequena de casca escura"]],
      dificil: [["FRUTA-DO-CONDE","Fruta de polpa branca e doce"],["LARANJA-LIMA","Fruta cítrica de sabor suave"],["MARACUJÁ-DOCE","Polpa cheia de sementes"],["CEREJA-DO-MATO","Nativa da Mata Atlântica"],["CUPUAÇU","Típica da Amazônia"]]
    },
    "Comidas": {
      facil: [["PASTEL","Salgado frito"],["COXINHA","Salgado de festa"],["TAPIOCA","Comum no café da manhã nordestino"],["PAMONHA","Feita com milho"],["CUSCUZ","Prato à base de milho"],["QUINDIM","Doce de festa"]],
      medio: [["FEIJOADA","Costuma vir com arroz e farofa"],["BARREADO","Cozimento bem demorado"],["BRIGADEIRO","Não falta em aniversário"],["PÉ DE MOLEQUE","Aparece em festa junina"],["GALINHADA","Prato feito com arroz"],["MOQUECA","Leva frutos do mar"]],
      dificil: [["ESCONDIDINHO","Vai ao forno"],["PÃO DE QUEIJO","Combina com café da tarde"],["BOBÓ DE CAMARÃO","Prato típico da Bahia"],["ARROZ CARRETEIRO","Prato típico do Sul"],["BAIÃO DE DOIS","Prato típico do Nordeste"],["ACARAJÉ","Salgado frito"]]
    },
    "Países": {
      facil: [["PERU","Fica na América do Sul"],["CHILE","Faz fronteira com a Argentina"],["JAPÃO","País insular da Ásia"],["EGITO","Fica na África"],["MÉXICO","Fica na América do Norte"],["GRÉCIA","Banhado pelo Mar Mediterrâneo"]],
      medio: [["PORTUGAL","País europeu de língua latina"],["MARROCOS","Fica no norte da África"],["ISLÂNDIA","País nórdico"],["TAILÂNDIA","Fica no Sudeste Asiático"],["ARGENTINA","Faz fronteira com o Brasil"],["MOÇAMBIQUE","País africano"]],
      dificil: [["CAZAQUISTÃO","Já fez parte da União Soviética"],["AFEGANISTÃO","País asiático sem saída para o mar"],["NOVA ZELÂNDIA","Fica na Oceania"],["LIECHTENSTEIN","Um dos menores países da Europa"],["MADAGASCAR","País insular"],["ARÁBIA SAUDITA","Fica no Oriente Médio"]]
    },
    "Profissões": {
      facil: [["PADEIRO","Trabalha com comida"],["PILOTO","Trabalha viajando"],["GARÇOM","Trabalha em restaurante"],["MÉDICO","Trabalha em hospital"],["PINTOR","Trabalho manual e criativo"],["JUIZ","Trabalha na área do Direito"]],
      medio: [["BOMBEIRO","Usa uniforme e atende emergências"],["TATUADOR","Trabalha com arte"],["ARQUITETA","Trabalha com construção"],["JORNALISTA","Trabalha com comunicação"],["ASTRONAUTA","Exige muito treinamento físico"],["CARTEIRO","Passa o dia andando pela rua"]],
      dificil: [["CONFEITEIRO","Trabalha em cozinha"],["SERRALHEIRO","Trabalho manual com ferramentas"],["PALEONTÓLOGO","É um tipo de cientista"],["FONOAUDIÓLOGO","Profissional da saúde"],["CARTÓGRAFO","Trabalha com geografia"],["MARCENEIRO","Trabalha numa oficina"]]
    },
    "Objetos": {
      facil: [["ABAJUR","Costuma ficar no quarto"],["TESOURA","Cabe no estojo escolar"],["ESPELHO","Comum no banheiro"],["RELÓGIO","Pode ficar pendurado na parede"],["CHAVE","Cabe no bolso"],["AGULHA","Pequeno e pontudo"]],
      medio: [["AMPULHETA","Tem relação com o tempo"],["BINÓCULO","Útil em passeios na natureza"],["TERMÔMETRO","Instrumento de medição"],["GRAMPEADOR","Fica na mesa do escritório"],["VENTILADOR","Eletrodoméstico"],["BÚSSOLA","Útil em trilhas"]],
      dificil: [["LIQUIDIFICADOR","Fica na cozinha e vai na tomada"],["CALEIDOSCÓPIO","Brinquedo antigo"],["GUARDA-CHUVA","Costuma ficar perto da porta"],["SACA-ROLHAS","Utensílio de cozinha"],["ABRIDOR DE LATAS","Fica na gaveta da cozinha"],["ESCORREDOR","Fica perto da pia"]]
    },
    "Esportes": {
      facil: [["SURFE","Praticado no mar"],["SKATE","Esporte radical"],["JUDÔ","É uma luta"],["VÔLEI","Jogado em equipe com bola"],["BOXE","Esporte de combate"],["XADREZ","Jogo de estratégia"]],
      medio: [["CAPOEIRA","Nasceu no Brasil"],["BASQUETE","Esporte de quadra"],["HANDEBOL","Esporte coletivo com bola"],["BADMINTON","Esporte de raquete"],["ATLETISMO","Esporte olímpico individual"],["ESGRIMA","Esporte olímpico de combate"]],
      dificil: [["POLO AQUÁTICO","Acontece na piscina"],["SALTO COM VARA","Prova do atletismo"],["TÊNIS DE MESA","Esporte de raquete"],["HALTEROFILISMO","Esporte de força"],["GINÁSTICA RÍTMICA","Mistura esporte e música"],["TRIATLO","Prova de resistência"]]
    },
    "Tecnologia": {
      facil: [["MOUSE","Periférico do computador"],["PIXEL","Tem a ver com imagens"],["SENHA","Ligada à segurança digital"],["TECLADO","Fica na mesa junto do computador"],["NUVEM","Termo comum quando o assunto é guardar arquivos"],["ROBÔ","Aparece muito em ficção científica"]],
      medio: [["ALGORITMO","Conceito básico de programação"],["MAINFRAME","É um tipo de computador"],["SERVIDOR","Fica num data center"],["FIREWALL","Ligado à segurança de redes"],["ROTEADOR","Equipamento de rede"],["LINGUAGEM","Todo programador usa uma"]],
      dificil: [["CRIPTOGRAFIA","Ligada à segurança da informação"],["MICROSSERVIÇO","Termo de arquitetura de software"],["TOKENIZAÇÃO","Muito usada em sistemas de pagamento"],["BANCO DE DADOS","Todo sistema grande tem um"],["COMPILADOR","Ferramenta de programação"],["INTELIGÊNCIA ARTIFICIAL","Assunto do momento na tecnologia"]]
    }
  };
  const CATS = Object.keys(WORDS);
  const ANY = "Aleatória";
  const ROWS = ["QWERTYUIOP","ASDFGHJKL","ZXCVBNM"];
  const MOUTHS = {
    calm:"M190 112 Q200 118 210 112",
    meh:"M191 114 Q200 114.5 209 114",
    scared:"M191 117 Q200 108 209 117",
    happy:"M186 109 Q200 126 214 109",
    dead:"M190 116 Q200 111 210 116"
  };
  const CLUE_EMPTY = "Use “Dar dica” para ver uma pista sobre a palavra.";
  const CLUE_NONE = "Sem pista nesta rodada: cada dica revela uma letra.";

  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
  const isLetter = c => /^[A-Z]$/.test(norm(c));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const $ = id => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- estado ---------- */
  let S = { mode: "solo", cat: ANY, level: "medio", pick: "", word: "", clue: "", guessed: [], hinted: [], wrong: [], hintsUsed: 0, status: "playing", round: 0 };
  const blank = () => ({ wins: 0, losses: 0, streak: 0, best: 0 });
  let stats = { facil: blank(), medio: blank(), dificil: blank() };
  /* jogadores do modo "Com mais alguém": só nesta sessão (sessionStorage), separados do solo.
     Rodízio: na rodada t, players[t % n] escolhe e players[(t + 1) % n] adivinha.
     Placar: quem adivinha e salva ganha 1 ponto; se for enforcado, o ponto vai para quem escolheu. */
  const MAX_P = 4, NAME_MAX = 16;
  let players = [], turn = 0, history = [];   // players: [{ name, custom, pts, hits, hangs, played }]
  const num = v => Math.max(0, v | 0);
  const mkPlayer = (name, custom, o = {}) => ({ name, custom, pts: num(o.pts), hits: num(o.hits), hangs: num(o.hangs), played: num(o.played) });
  try {
    const d = JSON.parse(sessionStorage.getItem("forca-riso-jogadores") || "null");
    if (d && Array.isArray(d.players) && d.players.length >= 2) {
      players = d.players.slice(0, MAX_P).map((p, i) => mkPlayer(String(p.name || `Jogador ${i + 1}`).slice(0, NAME_MAX), !!p.custom, p));
      turn = num(d.turn);
      if (Array.isArray(d.history)) history = d.history.filter(h => h && typeof h.word === "string");
    }
  } catch (e) {}
  const savePlayers = () => { try { sessionStorage.setItem("forca-riso-jogadores", JSON.stringify({ players, turn, history })); } catch (e) {} };
  const chooserIx = () => turn % players.length;
  const guesserIx = () => (turn + 1) % players.length;
  let pending = null;   // palavra já validada, esperando a tela de passagem (só na memória)
  const rounds = { solo: 0, duo: 0 };
  let soloSaved = null;   // rodada solo interrompida, retomada ao voltar para "Sozinho"
  let screen = "menu";
  let duoLevel = "medio";
  try {
    const v2 = JSON.parse(localStorage.getItem("forca-riso-stats-v2") || "null");
    if (v2) LV_KEYS.forEach(k => Object.assign(stats[k], v2[k] || {}));
    else { const v1 = JSON.parse(localStorage.getItem("forca-riso-stats") || "null"); if (v1) Object.assign(stats.medio, v1); }
    const prefs = JSON.parse(localStorage.getItem("forca-riso-prefs") || "{}");
    if (LEVELS[prefs.level]) S.level = prefs.level;
    if (prefs.cat === ANY || WORDS[prefs.cat]) S.cat = prefs.cat;
  } catch (e) {}
  let soloLevel = S.level;   // a dificuldade escolhida na dupla não muda a preferência do solo
  const saveStats = () => {
    try {
      if (S.mode === "duo") savePlayers();
      else localStorage.setItem("forca-riso-stats-v2", JSON.stringify(stats));
    } catch (e) {}
  };
  const savePrefs = () => { try { localStorage.setItem("forca-riso-prefs", JSON.stringify({ level: S.level, cat: S.cat })); } catch (e) {} };

  const LV = () => LEVELS[S.level];
  const MAX = () => LV().errors;
  const ST = () => stats[S.level];
  let lastPt = { x: innerWidth / 2, y: innerHeight / 2 };
  let endTimer = 0, dropAnim = null, typeTimer = 0;
  const needed = () => new Set([...S.word].map(norm).filter(c => /^[A-Z]$/.test(c)));
  const remainingLetters = () => [...needed()].filter(l => !S.guessed.includes(l));
  const livesLeft = () => MAX() - S.wrong.length;

  /* ---------- svg ---------- */
  function pair(parent, def, cls, i) {
    const g = document.createElementNS(NS, "g");
    if (cls) g.setAttribute("class", cls);
    ["ghost", "ink"].forEach(k => {
      const el = document.createElementNS(NS, def.r ? "circle" : "path");
      if (def.r) { el.setAttribute("cx", def.cx); el.setAttribute("cy", def.cy); el.setAttribute("r", def.r); }
      else el.setAttribute("d", def.d);
      el.setAttribute("pathLength", "1");
      el.setAttribute("class", k);
      if (i != null) el.style.setProperty("--i", i);
      g.appendChild(el);
    });
    parent.appendChild(g);
    return g;
  }
  [{ d: "M22 338 L198 338" }, { d: "M64 338 L64 28" }, { d: "M54 30 L210 30" }, { d: "M64 86 L120 30" }]
    .forEach((d, i) => pair($("frame"), d, null, i));
  pair($("rope"), { d: "M200 30 L200 72" });
  const PART_DEFS = {
    head:  { cx: 200, cy: 100, r: 28 },
    body:  { d: "M200 128 L200 228" },
    armL:  { d: "M200 152 Q180 170 162 198" },
    armR:  { d: "M200 152 Q220 170 238 198" },
    legL:  { d: "M200 228 Q187 262 172 302" },
    legR:  { d: "M200 228 Q213 262 228 302" },
    footL: { d: "M172 302 L156 304" },
    footR: { d: "M228 302 L244 304" }
  };
  const PARTS = {};
  let slots = [];   // [{ el, c, l }]: a letra nunca vai para atributos do DOM antes de ser revelada
  Object.entries(PART_DEFS).forEach(([k, d]) => PARTS[k] = pair($("parts"), d, "part"));

  function setParts(n) {
    const on = new Set(SEQ[S.level].slice(0, n).flat());
    Object.entries(PARTS).forEach(([k, g]) => g.classList.toggle("on", on.has(k)));
    $("face").classList.toggle("on", on.has("head"));
  }
  function setMood(m) {
    const f = $("face");
    f.classList.toggle("dead", m === "dead");
    f.classList.toggle("scared", m === "scared");
    $("mouth").setAttribute("d", MOUTHS[m]);
  }
  const moodFor = n => { const r = n / MAX(); return r <= .2 ? "calm" : r <= .55 ? "meh" : "scared"; };
  const ampFor = n => (n / MAX()) * 3.3;

  const svg = $("gallows"), swing = $("swing");
  let ampTarget = 0, amp = 0, eye = { x: 0, y: 0 }, eyeT = { x: 0, y: 0 };
  addEventListener("pointermove", e => {
    const m = svg.getScreenCTM(); if (!m) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    const dx = p.x - 200, dy = p.y - 100, len = Math.hypot(dx, dy) || 1, k = Math.min(2.6, len / 30) / len;
    eyeT = { x: dx * k, y: dy * k };
  }, { passive: true });
  function tick(t) {
    amp += (ampTarget - amp) * 0.03;
    const ang = reduced ? 0 : amp * Math.sin(t / (S.status === "lost" ? 620 : 900));
    swing.setAttribute("transform", `rotate(${ang.toFixed(3)} 200 30)`);
    eye.x += (eyeT.x - eye.x) * 0.15; eye.y += (eyeT.y - eye.y) * 0.15;
    if (S.status !== "lost") {
      const tr = `translate(${eye.x.toFixed(2)} ${eye.y.toFixed(2)})`;
      $("eyeL").setAttribute("transform", tr); $("eyeR").setAttribute("transform", tr);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- UI estática ---------- */
  const lvEl = $("levels");
  LV_KEYS.forEach(k => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "lvl"; b.dataset.level = k;
    b.innerHTML = `<span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${LEVELS[k].label}`;
    b.addEventListener("click", () => { if (S.level === k) return; S.level = soloLevel = k; savePrefs(); newGame(); });
    lvEl.appendChild(b);
  });
  function syncLevels() {
    lvEl.querySelectorAll(".lvl").forEach(b => {
      const on = b.dataset.level === S.level;
      b.setAttribute("aria-pressed", String(on));
      if (on) { $("lvlInd").style.left = b.offsetLeft + "px"; $("lvlInd").style.width = b.offsetWidth + "px"; }
    });
    const L = LV();
    $("lvlRules").innerHTML = `<b>${L.label}:</b> ${L.words} · ${L.errors} erros permitidos · ${L.hints} ${L.hints > 1 ? "dicas" : "dica"}${L.cost ? " (custa 1 tentativa)" : " grátis"}`;
    $("lvlName").textContent = L.label;
  }
  addEventListener("resize", syncLevels);
  if (document.fonts) document.fonts.ready.then(syncLevels);

  const catsEl = $("cats");
  [ANY, ...CATS].forEach(c => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.textContent = c; b.dataset.cat = c;
    b.addEventListener("click", () => { S.cat = c; savePrefs(); syncChips(); newGame(); });
    catsEl.appendChild(b);
  });
  const syncChips = () => catsEl.querySelectorAll(".chip").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.cat === S.cat)));

  const keys = {};
  ROWS.forEach(r => {
    const row = document.createElement("div"); row.className = "row";
    [...r].forEach(L => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "key"; b.textContent = L; b.id = "key-" + L;
      b.setAttribute("aria-label", "Letra " + L);
      b.addEventListener("click", () => { pointFrom(b); guess(L); });
      keys[L] = b; row.appendChild(b);
    });
    $("kb").appendChild(row);
  });

  function pointFrom(el) { const r = el.getBoundingClientRect(); lastPt = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

  /* ---------- render ---------- */
  function buildWord() {
    const w = $("word"); w.innerHTML = ""; slots = [];
    const groups = S.word.split(" ");
    const n = Math.max(...groups.map(g => g.length));
    const have = new Set(S.guessed), hinted = new Set(S.hinted);
    groups.forEach(gw => {
      const g = document.createElement("div"); g.className = "group"; g.style.setProperty("--n", n);
      [...gw].forEach(c => {
        if (!isLetter(c)) { const d = document.createElement("span"); d.className = "dash"; d.textContent = c; g.appendChild(d); return; }
        const s = document.createElement("span"); s.className = "slot";
        const t = document.createElement("span"); s.appendChild(t);
        slots.push({ el: s, c, l: norm(c) });
        if (have.has(norm(c))) { t.textContent = c; s.classList.add("reveal"); if (hinted.has(norm(c))) s.classList.add("hinted"); }
        g.appendChild(s);
      });
      w.appendChild(g);
    });
    updateWordLabel();
  }
  function updateWordLabel() {
    const have = new Set(S.guessed);
    const txt = [...S.word].map(c => !isLetter(c) ? (c === " " ? " / " : c) : (have.has(norm(c)) || S.status !== "playing" ? c : "_")).join(" ");
    $("word").setAttribute("aria-label", "Palavra: " + txt);
  }
  function updateKeys() {
    Object.entries(keys).forEach(([L, b]) => {
      const hit = S.guessed.includes(L), miss = S.wrong.includes(L);
      b.classList.toggle("hit", hit);
      b.classList.toggle("miss", miss);
      b.disabled = hit || miss || S.status !== "playing";
      b.setAttribute("aria-label", "Letra " + L + (hit ? ", acertou" : miss ? ", errou" : ""));
    });
    $("board").classList.toggle("game-over", S.status !== "playing");
  }
  function buildKnots() {
    const k = $("knots"); k.innerHTML = "";
    for (let i = 0; i < MAX(); i++) { const s = document.createElement("span"); s.className = "knot"; k.appendChild(s); }
  }
  function updateLives() {
    const left = livesLeft(), n = S.wrong.length;
    $("livesNum").textContent = left;
    $("knots").querySelectorAll(".knot").forEach((k, i) => k.classList.toggle("lost", i >= left));
    $("stageTag").textContent = S.status === "won" ? "Corda cortada" : S.status === "lost" ? "Fim de linha" : n === 0 ? "Nenhum erro" : `${n} de ${MAX()} erros`;
  }
  function updateMisses() {
    const el = $("missList"); el.innerHTML = "";
    if (!S.wrong.length) { const s = document.createElement("span"); s.className = "none"; s.textContent = "nenhuma ainda"; el.appendChild(s); return; }
    S.wrong.forEach(l => { const s = document.createElement("span"); if (l === "?") { s.className = "h"; s.textContent = "dica"; } else s.textContent = l; el.appendChild(s); });
  }

  /* ---------- dicas ---------- */
  const nextHintType = () => S.hintsUsed === 0 && S.clue ? "clue" : "letter";
  const clueShown = () => S.clue && S.hintsUsed > 0;
  function canHint() {
    const L = LV();
    if (S.status !== "playing" || S.hintsUsed >= L.hints) return false;
    if (L.cost && livesLeft() <= L.cost) return false;
    if (nextHintType() === "letter" && remainingLetters().length <= 1) return false;
    return true;
  }
  function updateHint() {
    const L = LV(), left = L.hints - S.hintsUsed;
    const p = $("pips"); p.innerHTML = "";
    for (let i = 0; i < L.hints; i++) { const d = document.createElement("i"); if (i < S.hintsUsed) d.className = "used"; p.appendChild(d); }
    let note;
    if (left <= 0) note = "acabaram";
    else if (L.cost && livesLeft() <= L.cost) note = "sem tentativas para gastar";
    else if (nextHintType() === "letter" && remainingLetters().length <= 1) note = "falta só 1 letra";
    else note = (nextHintType() === "clue" ? "mostra a pista" : "revela uma letra") + (L.cost ? " · custa 1 tentativa" : "");
    $("hintNote").textContent = note;
    const b = $("hintBtn");
    b.disabled = !canHint();
    b.setAttribute("aria-label", `Dar dica, ${left} de ${L.hints} restantes, ${note}`);
  }
  function showClue(animate) {
    clearInterval(typeTimer);
    const box = $("clue"), p = $("clueText");
    if (!clueShown()) { box.classList.remove("on"); p.textContent = S.clue ? CLUE_EMPTY : CLUE_NONE; return; }
    box.classList.add("on");
    if (!animate || reduced) { p.textContent = S.clue; return; }
    let i = 0; p.textContent = "";
    typeTimer = setInterval(() => { p.textContent = S.clue.slice(0, ++i); if (i >= S.clue.length) clearInterval(typeTimer); }, 22);
  }
  function hint() {
    if (!canHint()) return;
    const L = LV(), type = nextHintType();
    S.hintsUsed++;
    pointFrom($("hintBtn"));
    if (L.cost) {
      S.wrong.push("?");
      setParts(S.wrong.length); setMood(moodFor(S.wrong.length)); ampTarget = ampFor(S.wrong.length);
      minus();
    }
    if (type === "clue") {
      showClue(true);
      say(`Pista: ${S.clue}.${L.cost ? ` Restam ${livesLeft()} tentativas.` : ""}`);
    } else {
      const letter = pick(remainingLetters());
      S.guessed.push(letter); S.hinted.push(letter);
      reveal(letter, "hinted"); ghostLetter(letter, true);
      say(`Dica: letra ${letter} revelada.`);
    }
    updateKeys(); updateLives(); updateMisses(); updateHint(); updateWordLabel();
  }

  /* marcador do jogador: cor + forma da paleta (reconhecível também sem cor) */
  function marker(i) { const m = document.createElement("span"); m.className = "pm"; m.dataset.p = i; m.setAttribute("aria-hidden", "true"); return m; }
  function nameTag(i) {
    const t = document.createElement("span"); t.className = "pname";
    t.append(marker(i)); const n = document.createElement("span"); n.textContent = players[i].name; t.append(n);
    return t;
  }
  function renderBoard(el, highlight) {
    el.replaceChildren();
    players.forEach((p, i) => {
      const li = document.createElement("li");
      if (i === highlight) { li.className = "turn"; li.setAttribute("aria-current", "true"); }
      li.append(marker(i));
      const n = document.createElement("span"); n.className = "pb-name"; n.textContent = p.name; n.title = p.name;
      const b = document.createElement("b"); b.textContent = p.pts;
      const sr = document.createElement("span"); sr.className = "sr"; sr.textContent = `: ${p.pts} ${p.pts === 1 ? "ponto" : "pontos"}${i === highlight ? ", adivinhando agora" : ""}`;
      li.append(n, b, sr); el.append(li);
    });
  }
  function updateScores() {
    if (S.mode === "duo") { renderBoard($("pboard"), S.status === "playing" ? S.guesser : -1); renderBoard($("rboard"), -1); return; }
    const s = ST();
    $("sWins").textContent = s.wins; $("sStreak").textContent = s.streak; $("sBest").textContent = s.best;
    $("rWins").textContent = s.wins; $("rLosses").textContent = s.losses; $("rStreak").textContent = s.streak; $("rBest").textContent = s.best;
  }
  function renderAll() {
    $("catLabel").textContent = S.mode === "duo" ? `Vez de ${players[S.guesser].name}` : "Categoria";
    if (S.mode === "duo") {
      const c = $("catName"); c.replaceChildren();
      const mid = document.createElement("span"); mid.className = "vs"; mid.textContent = " tenta a palavra de ";
      c.append(nameTag(S.guesser), mid, nameTag(S.chooser));
    } else $("catName").textContent = S.pick;
    $("app").dataset.mode = S.mode;
    $("catName").classList.remove("swap"); void $("catName").offsetWidth; $("catName").classList.add("swap");
    $("round").textContent = S.round;
    buildWord(); buildKnots();
    updateKeys(); updateLives(); updateMisses(); updateHint(); updateScores(); syncChips(); syncLevels();
    showClue(false);
    setParts(S.wrong.length);
    setMood(moodFor(S.wrong.length));
    ampTarget = ampFor(S.wrong.length);
  }

  /* ---------- efeitos ---------- */
  const fx = $("fx");
  function burst(x, y, count = 10, spread = 70) {
    if (reduced) return;
    for (let i = 0; i < count; i++) {
      const d = document.createElement("span"); d.className = "dot";
      d.style.left = x + "px"; d.style.top = y + "px";
      d.style.background = i % 2 ? "var(--mint)" : "var(--violet)";
      const s = 0.5 + Math.random() * 0.9; d.style.width = d.style.height = (10 * s) + "px";
      fx.appendChild(d);
      const a = Math.random() * Math.PI * 2, r = spread * (0.4 + Math.random() * 0.8);
      d.animate([
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r - 20}px) scale(.2)`, opacity: 0 }
      ], { duration: 600 + Math.random() * 400, easing: "cubic-bezier(.2,.8,.3,1)" }).onfinish = () => d.remove();
    }
  }
  function minus() {
    if (reduced) return;
    const r = $("livesNum").getBoundingClientRect();
    const m = document.createElement("span"); m.className = "minus"; m.textContent = "−1";
    m.style.left = (r.left + r.width / 2) + "px"; m.style.top = r.top + "px";
    fx.appendChild(m);
    m.animate([{ transform: "translateY(0) scale(.6)", opacity: 0 }, { transform: "translateY(-18px) scale(1.15)", opacity: 1, offset: .3 }, { transform: "translateY(-46px) scale(1)", opacity: 0 }],
      { duration: 900, easing: "ease-out" }).onfinish = () => m.remove();
  }
  function shake(strength = 1) {
    if (reduced) return;
    $("board").animate([
      { transform: "translate(0,0)" }, { transform: `translate(${-10 * strength}px,0) rotate(${-.4 * strength}deg)` },
      { transform: `translate(${8 * strength}px,0) rotate(${.3 * strength}deg)` }, { transform: `translate(${-5 * strength}px,0)` }, { transform: "translate(0,0)" }
    ], { duration: 380, easing: "ease-out" });
  }
  function ghostLetter(L, good) {
    const g = $("ghost"); g.textContent = L;
    g.style.webkitTextStrokeColor = good ? "var(--violet)" : "var(--mint-deep)";
    if (!reduced) g.animate([{ transform: "translateY(6%) scale(.92)", opacity: 0 }, { transform: "none", opacity: .28 }], { duration: 500, easing: "cubic-bezier(.2,.9,.25,1)" });
  }
  function nudge(L) {
    const k = keys[L]; if (!k || reduced) return;
    k.animate([{ transform: "translate(3px,3px)" }, { transform: "translate(-2px,3px)" }, { transform: "translate(6px,3px)" }, { transform: "translate(3px,3px)" }], { duration: 260 });
  }
  const say = t => { $("sr").textContent = ""; setTimeout(() => $("sr").textContent = t, 30); };

  /* ---------- regras ---------- */
  function reveal(L, cls) {
    const hits = slots.filter(o => o.l === L);
    hits.forEach(({ el: s, c }, i) => {
      s.querySelector("span").textContent = c;
      s.style.setProperty("--d", i * 80 + "ms");
      s.classList.add("reveal"); if (cls) s.classList.add(cls);
      const r = s.getBoundingClientRect();
      setTimeout(() => burst(r.left + r.width / 2, r.top + r.height / 2, 8, 50), i * 80 + 120);
    });
    return hits.length;
  }

  function guess(L) {
    if (S.status !== "playing") return;
    if (S.guessed.includes(L) || S.wrong.includes(L)) { nudge(L); return; }
    const need = needed();
    if (need.has(L)) {
      S.guessed.push(L);
      const n = reveal(L);
      ghostLetter(L, true);
      say(`Letra ${L}: certo, aparece ${n} ${n > 1 ? "vezes" : "vez"}.`);
      if ([...need].every(l => S.guessed.includes(l))) win();
    } else {
      S.wrong.push(L);
      ghostLetter(L, false);
      setParts(S.wrong.length); setMood(moodFor(S.wrong.length));
      ampTarget = ampFor(S.wrong.length);
      shake(0.6 + (S.wrong.length / MAX()) * 0.6); minus();
      say(`Letra ${L}: não tem. Restam ${livesLeft()} tentativas.`);
      if (S.wrong.length >= MAX()) lose();
    }
    updateKeys(); updateLives(); updateMisses(); updateHint(); updateWordLabel();
  }

  function win() {
    S.status = "won";
    if (S.mode === "duo") endDuoRound("won");   // rodízio avança ao fim da rodada
    else { const st = ST(); st.wins++; st.streak++; st.best = Math.max(st.best, st.streak); saveStats(); }
    setParts(MAX()); $("body").classList.add("saved"); setMood("happy");
    ampTarget = 0; amp *= 0.3;
    setTimeout(() => {
      $("rope").classList.add("cut");
      if (!reduced) {
        $("snip").animate([{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none", offset: .3 }, { opacity: 0, transform: "translateY(-8px)" }], { duration: 900 });
        dropAnim = $("body").animate([
          { transform: "translateY(0)" }, { transform: "translateY(36px)", offset: .5 },
          { transform: "translateY(26px)", offset: .72 }, { transform: "translateY(36px)" }
        ], { duration: 720, fill: "forwards", easing: "cubic-bezier(.5,0,.6,1)" });
      } else $("body").style.transform = "translateY(36px)";
    }, 550);
    const w = $("word").getBoundingClientRect();
    for (let i = 0; i < 5; i++) setTimeout(() => burst(w.left + Math.random() * w.width, w.top + w.height / 2, 14, 110), 200 + i * 120);
    say(`Você salvou o boneco! A palavra era ${S.word}.`);
    endTimer = setTimeout(() => openResult("won"), 1700);
  }

  function lose() {
    S.status = "lost";
    if (S.mode === "duo") endDuoRound("lost");
    else { const st = ST(); st.losses++; st.streak = 0; saveStats(); }
    setMood("dead"); ampTarget = 7;
    $("eyeL").removeAttribute("transform"); $("eyeR").removeAttribute("transform");
    const have = new Set(S.guessed);
    let i = 0;
    slots.forEach(({ el: s, c, l }) => {
      if (have.has(l)) return;
      s.querySelector("span").textContent = c;
      s.style.setProperty("--d", (i++ * 70 + 300) + "ms");
      s.classList.add("missed");
    });
    shake(1.6);
    say(`Fim de jogo. A palavra era ${S.word}.`);
    endTimer = setTimeout(() => openResult("lost"), 1600);
  }

  function openResult(outcome) {
    const r = $("result");
    r.dataset.outcome = outcome;
    // origem do círculo dentro da viewport: com o teclado físico a tecla pode estar fora da tela no celular
    const ox = Math.min(Math.max(lastPt.x, 0), innerWidth), oy = Math.min(Math.max(lastPt.y, 0), innerHeight);
    r.style.setProperty("--ox", ox + "px"); r.style.setProperty("--oy", oy + "px");
    const duoRound = S.mode === "duo";
    r.dataset.mode = S.mode;
    const errs = S.wrong.filter(l => l !== "?").length;
    const perfect = outcome === "won" && S.wrong.length === 0 && S.hintsUsed === 0;
    $("resSwap").hidden = !duoRound;
    $("endBtn").hidden = !duoRound;
    $("resTitle").classList.toggle("named", duoRound);
    if (duoRound) {
      const g = players[S.guesser].name, c = players[S.chooser].name;
      const nextC = players[chooserIx()].name, nextG = players[guesserIx()].name;
      $("resKicker").textContent = `Rodada ${S.round} · ${LV().label} · palavra de ${c}`;
      $("resTitle").textContent = outcome === "won" ? `${g} salvou!` : `${g} ficou na forca`;
      $("resSwap").textContent = `Ponto para ${outcome === "won" ? g : c}. Agora ${nextC} escolhe e ${nextG} adivinha.`;
      $("again").textContent = `Próxima: ${nextC} escolhe ↵`;
    } else {
      $("resKicker").textContent = `${S.pick} · ${LV().label} · rodada ${S.round}`;
      $("resTitle").textContent = outcome === "won" ? (perfect ? "Perfeito!" : "Salvou!") : "Enforcado";
      $("again").textContent = "Próxima palavra ↵";
    }
    const rw = $("resWord"); rw.innerHTML = "";
    rw.append(outcome === "won" ? `${errs} ${errs === 1 ? "erro" : "erros"} · ${S.hintsUsed} ${S.hintsUsed === 1 ? "dica usada" : "dicas usadas"}` : "A palavra era");
    const st = document.createElement("strong"); st.textContent = S.word; rw.appendChild(st);
    if (S.clue) { const em = document.createElement("em"); em.textContent = S.clue; rw.appendChild(em); }
    updateScores();
    r.classList.add("open");
    $("app").setAttribute("aria-hidden", "true");
    setTimeout(() => $("again").focus({ preventScroll: true }), 400);
  }
  function closeResult() {
    $("result").classList.remove("open");
    $("app").removeAttribute("aria-hidden");
  }

  function newGame() {
    clearTimeout(endTimer);
    const cat = S.cat === ANY ? pick(CATS) : S.cat;
    const pool = WORDS[cat][S.level];
    let entry; do { entry = pick(pool); } while (entry[0] === S.word && pool.length > 1);
    S = { ...S, mode: "solo", pick: cat, word: entry[0], clue: entry[1], guessed: [], hinted: [], wrong: [], hintsUsed: 0, status: "playing", round: ++rounds.solo };
    startRound();
    say(`Nova palavra, nível ${LV().label}, categoria ${cat}.`);
  }
  function resetStage() {
    clearTimeout(endTimer);
    if (dropAnim) { dropAnim.cancel(); dropAnim = null; }
    $("body").style.transform = ""; $("body").classList.remove("saved");
    $("rope").classList.remove("cut");
  }
  function startRound() {
    resetStage();
    closeResult();
    show("game");
    renderAll();
  }

  /* ---------- telas e modos ---------- */
  function show(name) {
    screen = name;
    $("app").dataset.screen = name;
    const target = { menu: $("menuTitle"), players: $("pname-0"), setup: $("secret"), pass: $("readyBtn"), game: $("catName"), final: $("finalTitle") }[name];
    requestAnimationFrame(() => target && target.focus({ preventScroll: name === "game" }));
  }
  function leaveGame() {
    resetStage(); closeResult();
    if (S.mode === "solo" && S.status === "playing" && S.word) soloSaved = S;
    if (S.mode === "duo") {
      if (S.status === "playing" && S.word) rounds.duo = Math.max(0, rounds.duo - 1);   // rodada abandonada não conta
      S = { ...S, word: "", clue: "", guessed: [], hinted: [], wrong: [] };
    }
  }
  function dropPending() { pending = null; }
  function goMenu() {
    if (screen === "game") leaveGame();
    dropPending();
    const notes = [];
    if (soloSaved) notes.push(`Sua rodada solo (${soloSaved.pick}) está guardada.`);
    if (players.length) notes.push(`Jogadores desta sessão: ${players.map(p => p.name).join(", ")}.`);
    $("menuNote").textContent = notes.join(" ");
    show("menu");
    say("Menu. Escolha quem vai jogar.");
  }
  function playSolo() {
    if (soloSaved) { S = soloSaved; soloSaved = null; startRound(); say(`Rodada solo retomada, categoria ${S.pick}.`); }
    else { S.level = soloLevel; newGame(); }
  }
  function goSetup() {
    if (screen === "game") leaveGame();
    dropPending();
    const f = $("setupForm"); f.reset();
    clearErrors(); setPeek(false);
    seg.querySelectorAll("input").forEach(r => r.checked = r.value === duoLevel);
    const c = chooserIx(), g = guesserIx();
    $("setupKicker").textContent = `Rodada ${rounds.duo + 1} · ${players[c].name} escolhe, ${players[g].name} adivinha`;
    const t = $("setupTitle"); t.replaceChildren(nameTag(c), document.createTextNode(", escolha a palavra"));
    const lead = $("setupLead"); lead.replaceChildren();
    const no = document.createElement("strong"); no.className = "no-look"; no.append(nameTag(g), document.createTextNode(", não olhe!"));
    lead.append(no);
    if (players.length > 2) lead.append(document.createTextNode(" Os outros podem ver."));
    show("setup");
    say(`${players[c].name}, digite a palavra secreta. ${players[g].name}, não olhe.`);
  }
  function again() { if (S.mode === "duo") goSetup(); else newGame(); }

  /* placar e histórico: só rodadas terminadas entram, e só nesta sessão */
  function endDuoRound(outcome) {
    const g = players[S.guesser], c = players[S.chooser];
    g.played++; c.played++;
    if (outcome === "won") { g.pts++; g.hits++; } else { c.pts++; c.hangs++; }
    history.push({ n: S.round, word: S.word, outcome, chooser: c.name, cIx: S.chooser, guesser: g.name, gIx: S.guesser });
    turn++;
    saveStats();
  }

  /* ---------- resultado final da sessão em equipe ---------- */
  function cell(tag, content, attrs) {
    const el = document.createElement(tag);
    if (content instanceof Node) el.append(content); else el.textContent = content;
    if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }
  const listNames = a => a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} e ${a[a.length - 1]}`;
  function tagFor(name, i) {
    const t = document.createElement("span"); t.className = "pname";
    t.append(marker(i)); const n = document.createElement("span"); n.textContent = name; t.append(n); return t;
  }
  function goFinal() {
    if (screen === "game") leaveGame();
    dropPending();
    // retrato antes de zerar: a tabela usa só esta cópia
    const snap = { players: players.map((p, i) => ({ ...p, ix: i })), history: history.slice() };
    players = []; turn = 0; history = []; rounds.duo = 0;
    try { sessionStorage.removeItem("forca-riso-jogadores"); } catch (e) {}
    lastFinal = snap.players.map(p => p.custom ? p.name : "");

    const ranked = snap.players.slice().sort((a, b) => b.pts - a.pts || b.hits - a.hits || a.ix - b.ix);
    const top = ranked.length ? ranked[0].pts : 0;
    const leaders = ranked.filter(p => p.pts === top);
    const played = snap.history.length;
    let title;
    if (!played || !ranked.length) title = "Nenhuma rodada terminada";
    else if (leaders.length > 1) title = `Empate entre ${listNames(leaders.map(p => p.name))}`;
    else title = `${leaders[0].name} venceu!`;
    $("finalTitle").textContent = title;
    $("finalKicker").textContent = `Fim de jogo · ${played} ${played === 1 ? "rodada" : "rodadas"}`;

    const body = $("finalRows"); body.replaceChildren();
    ranked.forEach((p, pos) => {
      const tr = document.createElement("tr");
      const win = played && p.pts === top;
      if (win) tr.className = "lead";
      const th = cell("th", tagFor(p.name, p.ix), { scope: "row" });
      if (win) { const st = document.createElement("span"); st.className = "crown"; st.textContent = leaders.length > 1 ? " (empate)" : " (vencedor)"; th.append(st); }
      tr.append(cell("td", String(pos + 1)), th, cell("td", String(p.pts)), cell("td", String(p.hits)), cell("td", String(p.hangs)), cell("td", String(p.played)));
      body.append(tr);
    });
    const hb = $("histRows"); hb.replaceChildren();
    if (!played) {
      const tr = document.createElement("tr"); tr.append(cell("td", "Nenhuma rodada terminada.", { colspan: "5" })); hb.append(tr);
    }
    snap.history.forEach(h => {
      const tr = document.createElement("tr");
      const res = cell("td", h.outcome === "won" ? "Salvou" : "Na forca");
      res.className = h.outcome === "won" ? "res-won" : "res-lost";
      tr.append(cell("th", String(h.n), { scope: "row" }), cell("td", tagFor(h.chooser, h.cIx)), cell("td", tagFor(h.guesser, h.gIx)), cell("td", h.word), res);
      hb.append(tr);
    });
    show("final");
    say(`${title}. Resultado final de ${played} ${played === 1 ? "rodada" : "rodadas"}. O jogo em equipe foi zerado.`);
  }
  let lastFinal = null;

  /* ---------- jogadores ---------- */
  const pList = $("plist");
  const defName = i => `Jogador ${i + 1}`;
  const keyOf = n => norm(n).replace(/\s+/g, " ").trim();
  const cleanName = v => v.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
  function pValues() { return [...pList.querySelectorAll("input")].map(i => i.value); }
  function buildPlayerRows(values) {
    pList.replaceChildren();
    values.forEach((v, i) => {
      const li = document.createElement("li"); li.className = "prow";
      const lab = document.createElement("label"); lab.htmlFor = "pname-" + i; lab.append(marker(i), document.createTextNode(defName(i)));
      const inp = document.createElement("input");
      Object.assign(inp, { id: "pname-" + i, type: "text", maxLength: NAME_MAX, placeholder: defName(i), autocomplete: "off", spellcheck: false, value: v });
      inp.setAttribute("aria-describedby", "perr-" + i);
      inp.addEventListener("input", () => { if (pList.querySelector(".field-err:not(:empty)")) checkPlayers(); });
      const row = document.createElement("div"); row.className = "prow-in"; row.append(inp);
      if (i >= 2) {
        const rm = document.createElement("button"); rm.type = "button"; rm.className = "prm";
        rm.setAttribute("aria-label", `Remover ${defName(i)}`); rm.textContent = "✕";
        rm.addEventListener("click", () => {
          const vals = pValues(); vals.splice(i, 1); buildPlayerRows(vals);
          $(i - 1 >= 0 ? "pname-" + Math.min(i, vals.length - 1) : "pname-0").focus();
          say(`${defName(i)} removido. ${vals.length} jogadores.`);
        });
        row.append(rm);
      }
      const err = document.createElement("p"); err.className = "field-err"; err.id = "perr-" + i; err.setAttribute("aria-live", "assertive");
      li.append(lab, row, err); pList.append(li);
    });
    $("addPlayer").hidden = values.length >= MAX_P;
    $("pCount").textContent = `${values.length} de ${MAX_P} jogadores`;
    renderRotation(values);
  }
  function renderRotation(values) {
    const r = $("rotation"); r.replaceChildren();
    values.forEach((v, i) => {
      if (i) { const a = document.createElement("span"); a.className = "arr"; a.textContent = "→"; a.setAttribute("aria-hidden", "true"); r.append(a); }
      const t = document.createElement("span"); t.className = "pname"; t.append(marker(i));
      const n = document.createElement("span"); n.textContent = cleanName(v) || defName(i); t.append(n); r.append(t);
    });
    const a = document.createElement("span"); a.className = "arr"; a.textContent = "↺"; a.setAttribute("aria-hidden", "true"); r.append(a);
  }
  /* nomes em branco viram "Jogador N"; repetidos (sem diferenciar acento/maiúscula) são recusados */
  function checkPlayers() {
    const vals = pValues(), names = vals.map((v, i) => cleanName(v) || defName(i)), custom = vals.map(v => !!cleanName(v));
    const errs = names.map(() => "");
    names.forEach((n, i) => names.forEach((m, j) => {
      if (j <= i || keyOf(n) !== keyOf(m)) return;
      const blame = custom[j] || !custom[i] ? j : i, other = blame === j ? i : j;
      errs[blame] = `Nome repetido: igual ao de ${defName(other)}.`;
    }));
    errs.forEach((e, i) => setErr($("pname-" + i), $("perr-" + i), e));
    renderRotation(vals);
    return { names, custom, bad: errs.findIndex(Boolean) };
  }
  function goPlayers(prefill) {
    dropPending();
    buildPlayerRows(prefill || (players.length ? players.map(p => p.custom ? p.name : "") : ["", ""]));
    show("players");
    say("Quem vai jogar? Nomes são opcionais.");
  }
  function submitPlayers(e) {
    e.preventDefault();
    const { names, custom, bad } = checkPlayers();
    if (bad >= 0) { $("pname-" + bad).focus(); return; }
    const same = names.length === players.length && names.every((n, i) => keyOf(n) === keyOf(players[i].name));
    if (!same) {
      // mantém os pontos de quem continua; o rodízio recomeça do jogador 1
      const old = new Map(players.map(p => [keyOf(p.name), p]));
      players = names.map((n, i) => mkPlayer(n, custom[i], old.get(keyOf(n))));
      turn = 0;
    } else players.forEach((p, i) => { p.name = names[i]; p.custom = custom[i]; });
    savePlayers();
    goSetup();
  }
  function goPass() {
    const g = guesserIx(), c = chooserIx();
    $("passTitle").replaceChildren(document.createTextNode("Passe para "), nameTag(g));
    $("passLead").textContent = `${players[c].name}, entregue o aparelho. ${players[g].name}, toque em “Estou pronto” quando estiver com ele.`;
    show("pass");
    say(`Palavra guardada. Passe o aparelho para ${players[g].name}.`);
  }
  function ready() {
    if (!pending) { goSetup(); return; }
    const p = pending; pending = null;
    S = { ...S, mode: "duo", level: p.level, pick: "Em dupla", word: p.word, clue: p.clue, chooser: chooserIx(), guesser: guesserIx(),
          guessed: [], hinted: [], wrong: [], hintsUsed: 0, status: "playing", round: ++rounds.duo };
    startRound();
    say(`${players[S.guesser].name}, sua vez. A palavra de ${players[S.chooser].name} tem ${[...S.word].filter(isLetter).length} letras.`);
  }

  /* validação usa a mesma normalização do jogo: acento e Ç viram a letra base na hora de chutar */
  const MIN_L = 3, MAX_L = 20;
  function parseSecret(raw) {
    const v = raw.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleUpperCase("pt-BR");
    if (!v) return { err: "Digite a palavra secreta." };
    const bad = [...v].filter(c => c !== " " && c !== "-" && !isLetter(c));
    if (bad.length) return { err: bad.some(c => /\d/.test(c)) ? "Números não valem: use só letras, espaço e hífen." : "Tem símbolo que não vale: use só letras (acentos e Ç podem), espaço e hífen." };
    if (/^-|-$|[ -]{2,}/.test(v)) return { err: "Espaço e hífen precisam ficar entre letras." };
    const n = [...v].filter(isLetter).length;
    if (n < MIN_L) return { err: `Muito curta: use pelo menos ${MIN_L} letras.` };
    if (n > MAX_L) return { err: `Muito longa: no máximo ${MAX_L} letras.` };
    return { word: v };
  }
  function parseClue(raw, word) {
    const v = raw.normalize("NFC").trim().replace(/\s+/g, " ");
    if (!v) return { clue: "" };
    const core = norm(word).replace(/[^A-Z]+/g, "[^A-Z]*");
    if (word && new RegExp(`(^|[^A-Z])${core}([^A-Z]|$)`).test(norm(v))) return { err: "A pista não pode conter a própria palavra." };
    return { clue: v };
  }
  function setErr(input, el, msg) {
    el.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }
  function clearErrors() { setErr($("secret"), $("secretErr")); setErr($("clueIn"), $("clueErr")); }
  function setPeek(on) {
    $("secret").type = on ? "text" : "password";
    $("peek").setAttribute("aria-pressed", String(on));
    $("peek").querySelector(".peek-txt").textContent = on ? "Ocultar" : "Mostrar";
  }
  function startDuo(e) {
    e.preventDefault();
    const a = parseSecret($("secret").value);
    const b = parseClue($("clueIn").value, a.word || "");
    setErr($("secret"), $("secretErr"), a.err); setErr($("clueIn"), $("clueErr"), b.err);
    if (a.err) { $("secret").focus(); return; }
    if (b.err) { $("clueIn").focus(); return; }
    const lv = (seg.querySelector("input:checked") || {}).value;
    if (LEVELS[lv]) duoLevel = lv;
    pending = { word: a.word, clue: b.clue, level: duoLevel };
    $("setupForm").reset(); setPeek(false);   // a palavra sai do campo antes da passagem
    goPass();
  }
  const seg = $("seg");
  LV_KEYS.forEach(k => {
    const id = "seg-" + k, L = LEVELS[k];
    seg.insertAdjacentHTML("beforeend",
      `<input type="radio" name="lvl" id="${id}" value="${k}"><label for="${id}"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>${L.label}<small>${L.errors} erros</small></label>`);
  });

  /* ---------- eventos ---------- */
  $("newBtn").addEventListener("click", () => S.mode === "duo" ? goSetup() : newGame());
  $("again").addEventListener("click", () => { $("again").blur(); again(); });
  $("resMenu").addEventListener("click", goMenu);
  $("endBtn").addEventListener("click", goFinal);
  $("finalContinue").addEventListener("click", goMenu);
  $("finalNew").addEventListener("click", () => goPlayers(lastFinal && lastFinal.length >= 2 ? lastFinal : null));
  $("menuBtn").addEventListener("click", goMenu);
  $("modeSolo").addEventListener("click", playSolo);
  $("modeDuo").addEventListener("click", () => goPlayers());
  $("playersForm").addEventListener("submit", submitPlayers);
  $("playersBack").addEventListener("click", goMenu);
  $("addPlayer").addEventListener("click", () => {
    const vals = pValues(); if (vals.length >= MAX_P) return;
    vals.push(""); buildPlayerRows(vals); $("pname-" + (vals.length - 1)).focus();
    say(`${defName(vals.length - 1)} adicionado.`);
  });
  $("setupPlayers").addEventListener("click", () => goPlayers());
  $("readyBtn").addEventListener("click", ready);
  $("redoBtn").addEventListener("click", goSetup);
  $("setupBack").addEventListener("click", goMenu);
  $("setupForm").addEventListener("submit", startDuo);
  $("peek").addEventListener("click", () => { setPeek($("secret").type === "password"); $("secret").focus(); });
  $("secret").addEventListener("input", () => { if ($("secretErr").textContent) setErr($("secret"), $("secretErr"), parseSecret($("secret").value).err); });
  $("clueIn").addEventListener("input", () => { if ($("clueErr").textContent) setErr($("clueIn"), $("clueErr"), parseClue($("clueIn").value, parseSecret($("secret").value).word || "").err); });
  $("hintBtn").addEventListener("click", hint);
  addEventListener("keydown", e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // o teclado físico só joga na tela do jogo e nunca rouba letras de campos de texto
    if (screen !== "game" || (e.target instanceof Element && e.target.closest("input, textarea, select, [contenteditable]"))) return;
    if (S.status !== "playing") {
      if ((e.key === "Enter" || e.key === " ") && !(e.target instanceof HTMLButtonElement)) { e.preventDefault(); again(); }
      return;
    }
    if (e.key === "?") { e.preventDefault(); hint(); return; }
    if (e.key.length !== 1) return;
    const L = norm(e.key);
    if (!/^[A-Z]$/.test(L)) return;
    e.preventDefault();
    const k = keys[L];
    if (k) {
      pointFrom(k);
      if (!reduced && !k.disabled) k.animate([{ transform: "translate(3px,3px)" }, { transform: "none" }], { duration: 180, easing: "ease-out" });
    }
    guess(L);
  });

  /* ---------- boot com preservação de estado ---------- */
  // a rodada em dupla nunca entra no snapshot: a palavra secreta não sai da memória do jogo
  window.claude?.hot?.snapshot?.(() => ({ S: S.mode === "duo" ? soloSaved : (soloSaved || S) }));
  function start(data) {
    const d = data && data.S;
    if (d && LEVELS[d.level] && d.mode !== "duo") { S.level = soloLevel = d.level; S.cat = d.cat || S.cat; rounds.solo = d.round || 0; }
    if (d && d.word && d.status === "playing" && d.mode !== "duo" && Array.isArray(d.hinted)) soloSaved = { ...d, mode: "solo" };
    goMenu();
  }
  window.claude?.hot?.ready ? window.claude.hot.ready(start) : start(window.claude?.hot?.data ?? {});
})();
