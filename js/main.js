
(() => {
  'use strict';

  /* ==========================================================================
     1. SISTEMA DE ÁUDIO 8-BIT (WEB AUDIO API — SEM ARQUIVOS EXTERNOS)
  ========================================================================== */
  const Sound = {
    ctx: null,
    enabled: true,
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    },
    tone(freq, dur = 0.08, type = 'square', vol = 0.06, delay = 0) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + delay + dur);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(this.ctx.currentTime + delay);
        osc.stop(this.ctx.currentTime + delay + dur);
      } catch (e) {}
    },
    beep() { this.tone(660, 0.06, 'square', 0.05); },
    select() { this.tone(880, 0.07, 'square', 0.05); },
    door() {
      this.tone(320, 0.07, 'triangle', 0.07, 0);
      this.tone(480, 0.09, 'triangle', 0.07, 0.07);
    },
    hit() {
      this.tone(180, 0.09, 'sawtooth', 0.08, 0);
      this.tone(110, 0.12, 'square', 0.07, 0.06);
    },
    crit() {
      this.tone(520, 0.06, 'square', 0.08, 0);
      this.tone(780, 0.06, 'square', 0.08, 0.06);
      this.tone(1040, 0.14, 'square', 0.09, 0.12);
    },
    error() {
      this.tone(200, 0.12, 'sawtooth', 0.07, 0);
      this.tone(140, 0.16, 'sawtooth', 0.07, 0.11);
    },
    heal() {
      const notes = [523, 523, 523, 659, 784];
      notes.forEach((n, i) => this.tone(n, 0.11, 'triangle', 0.08, i * 0.11));
    },
    success() {
      const notes = [523, 659, 784, 1046];
      notes.forEach((n, i) => this.tone(n, 0.11, 'square', 0.06, i * 0.09));
    },
    fanfare() {
      const notes = [523, 659, 784, 659, 784, 1046];
      notes.forEach((n, i) => this.tone(n, 0.14, 'square', 0.07, i * 0.12));
    },

    // --- REPRODUTOR DE TRILHA CHIPTUNE 8-BIT EM LOOP (BGM) ---
    bgmMode: null,
    bgmTimer: null,
    bgmStep: 0,
    exploreMelody: [
      330, 392, 440, 494, 523, 494, 440, 392,
      330, 349, 392, 440, 392, 349, 330, 294,
      330, 392, 523, 659, 587, 523, 494, 440,
      392, 440, 494, 523, 587, 494, 523, 0
    ],
    exploreBass: [
      131, 196, 131, 196, 175, 220, 175, 220,
      147, 220, 147, 220, 196, 247, 196, 247,
      131, 196, 131, 196, 175, 220, 175, 220,
      196, 247, 196, 247, 131, 196, 131, 0
    ],
    battleMelody: [
      294, 330, 349, 392, 440, 440, 523, 440,
      392, 349, 392, 440, 349, 330, 294, 261,
      294, 294, 349, 349, 440, 440, 587, 523,
      440, 392, 349, 330, 294, 330, 294, 0
    ],
    battleBass: [
      73, 147, 73, 147, 87, 175, 87, 175,
      98, 196, 98, 196, 73, 147, 73, 147,
      73, 147, 73, 147, 87, 175, 87, 175,
      110, 220, 110, 220, 73, 147, 73, 0
    ],

    playBgmStep() {
      if (!this.enabled || !this.bgmMode) return;
      const isBattle = this.bgmMode === 'battle';
      const melody = isBattle ? this.battleMelody : this.exploreMelody;
      const bass = isBattle ? this.battleBass : this.exploreBass;
      const step = this.bgmStep % melody.length;
      const mFreq = melody[step];
      const bFreq = bass[step];
      const dur = isBattle ? 0.12 : 0.18;
      if (mFreq > 0) {
        this.tone(mFreq, dur, isBattle ? 'sawtooth' : 'square', isBattle ? 0.025 : 0.018);
      }
      if (bFreq > 0) {
        this.tone(bFreq, dur, 'triangle', 0.035);
      }
      this.bgmStep++;
    },

    setBgm(mode) {
      if (this.bgmMode === mode) return;
      this.stopBgm();
      if (!mode || !this.enabled) return;
      this.bgmMode = mode;
      this.bgmStep = 0;
      const interval = mode === 'battle' ? 140 : 210;
      this.bgmTimer = setInterval(() => this.playBgmStep(), interval);
    },

    stopBgm() {
      if (this.bgmTimer) {
        clearInterval(this.bgmTimer);
        this.bgmTimer = null;
      }
      this.bgmMode = null;
      this.bgmStep = 0;
    }
  };

  /* ==========================================================================
     SISTEMA DE PERSISTÊNCIA LOCAL (LOCALSTORAGE) COM AUTO-SAVE
  ========================================================================== */
  const Storage = {
    KEY: 'jornada_ds_v1_save',
    save() {
      try {
        const data = {
          progress: state.progress,
          contractSigned: state.contractSigned,
          introSeen: state.introSeen,
          currentMap: state.currentMap,
          player: {
            x: Math.round(state.player.x),
            y: Math.round(state.player.y),
            dir: state.player.dir,
            hp: state.player.hp,
            maxHp: state.player.maxHp
          },
          savedAt: Date.now()
        };
        localStorage.setItem(this.KEY, JSON.stringify(data));
        showSaveNotice();
        return true;
      } catch (e) {
        console.warn('Erro ao salvar no localStorage:', e);
        return false;
      }
    },
    load() {
      try {
        const raw = localStorage.getItem(this.KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!data || !data.progress) return false;

        state.progress = data.progress;
        state.contractSigned = !!data.contractSigned;
        state.introSeen = !!data.introSeen;
        if (data.currentMap && MAPS[data.currentMap]) {
          state.currentMap = data.currentMap;
        }
        if (data.player) {
          state.player.x = data.player.x ?? state.player.x;
          state.player.y = data.player.y ?? state.player.y;
          state.player.dir = data.player.dir ?? state.player.dir;
          state.player.hp = data.player.hp ?? 100;
          state.player.maxHp = data.player.maxHp ?? 100;
        }
        return true;
      } catch (e) {
        console.warn('Erro ao carregar do localStorage:', e);
        return false;
      }
    },
    hasSave() {
      try {
        return !!localStorage.getItem(this.KEY);
      } catch (e) {
        return false;
      }
    },
    clear() {
      try {
        localStorage.removeItem(this.KEY);
      } catch (e) {}
    }
  };

  function showSaveNotice() {
    const el = document.getElementById('saveToast');
    if (!el) return;
    el.classList.add('visible');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.classList.remove('visible');
    }, 1800);
  }

  /* ==========================================================================
     2. ESTADO GLOBAL DO JOGO
  ========================================================================== */
  const TILE = 32;
  const COLS = 15;
  const ROWS = 10;

  const state = {
    mode: 'title', // title | explore | dialogue | minigame | battle | contract | hof
    currentMap: 'courtyard',
    introSeen: false,
    contractSigned: false,
    player: {
      x: 7 * TILE,
      y: 7 * TILE,
      w: 22,
      h: 22,
      dir: 'up',
      frame: 0,
      stepTimer: 0,
      hp: 100,
      maxHp: 100
    },
    progress: {
      dev: { m1: false, m2: false, boss: false },
      manut: { m1: false, m2: false, boss: false },
      adm: { m1: false, m2: false, boss: false },
      redes: { m1: false, m2: false, boss: false }
    },
    keys: { up: false, down: false, left: false, right: false }
  };

  const AREA_INFO = {
    courtyard: { name: 'PÁTIO — JAIME ALENCAR', color: '#16a34a' },
    dev: { name: 'LAB. DESENVOLVIMENTO', color: '#2563eb', badge: 'Insígnia do Código', bosses: 'Falcão & Alysson Gabriel' },
    manut: { name: 'OFICINA DE MANUTENÇÃO', color: '#ea580c', badge: 'Insígnia do Hardware', bosses: 'Igor & Leôncio' },
    adm: { name: 'SALA DE ADMINISTRAÇÃO', color: '#ca8a04', badge: 'Insígnia da Gestão', bosses: 'Maryanne & Wendila' },
    redes: { name: 'CENTRAL DE REDES', color: '#7c3aed', badge: 'Insígnia da Conexão', bosses: 'Dudu & Alisson Coelho' }
  };

  /* ==========================================================================
     3. RENDERIZADOR DE SPRITES PIXEL-ART (PERSONAGENS E RETRATOS)
  ========================================================================== */
  const CHAR_PALETTES = {
    helena: { hair: '#7c2d12', cap: '#facc15', skin: '#f6d2a8', shirt: '#ec4899', pants: '#312e81', accent: '#fde047' },
    lucas: { hair: '#1e1b4b', cap: '#dc2626', skin: '#f5cfa0', shirt: '#2563eb', pants: '#1e293b', accent: '#ffffff' },
    falcao: { hair: '#0f172a', cap: '#0284c7', skin: '#e6b88a', shirt: '#0f172a', pants: '#1e3a8a', accent: '#38bdf8' },
    alysson: { hair: '#3f2718', cap: '#1d4ed8', skin: '#f0c497', shirt: '#1e40af', pants: '#0f172a', accent: '#60a5fa' },
    igor: { hair: '#1c1917', cap: '#ea580c', skin: '#e8ba8c', shirt: '#c2410c', pants: '#292524', accent: '#fdba74' },
    leoncio: { hair: '#451a03', cap: '#f97316', skin: '#d8a574', shirt: '#44403c', pants: '#1c1917', accent: '#fb923c' },
    maryanne: { hair: '#450a0a', cap: '#eab308', skin: '#f5cfa0', shirt: '#a16207', pants: '#1f2937', accent: '#fef08a' },
    wendila: { hair: '#1f2937', cap: '#ca8a04', skin: '#e0ad7e', shirt: '#854d0e', pants: '#111827', accent: '#fde047' },
    dudu: { hair: '#0f172a', cap: '#7c3aed', skin: '#e8ba8c', shirt: '#5b21b6', pants: '#0f172a', accent: '#4ade80' },
    alisson: { hair: '#27272a', cap: '#6d28d9', skin: '#f2c89c', shirt: '#312e81', pants: '#09090b', accent: '#a78bfa' },
    npc: { hair: '#334155', cap: '#0ea5e9', skin: '#f2c89c', shirt: '#0f766e', pants: '#1e293b', accent: '#99f6e4' }
  };

  function drawPixelChar(ctx, x, y, size, charKey, dir = 'down', frame = 0) {
    const p = CHAR_PALETTES[charKey] || CHAR_PALETTES.npc;
    const u = size / 16; // unidade de pixel
    ctx.save();
    ctx.translate(x, y);

    // Sombra no chão
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(3 * u, 14 * u, 10 * u, 2 * u);

    const bob = frame % 2 === 1 ? -1 * u : 0;

    // Pernas animadas
    ctx.fillStyle = p.pants;
    const legL = frame % 2 === 1 ? 12 * u : 11 * u;
    const legR = frame % 2 === 1 ? 11 * u : 12 * u;
    ctx.fillRect(4 * u, legL, 3 * u, 3 * u);
    ctx.fillRect(9 * u, legR, 3 * u, 3 * u);

    // Corpo / Camisa
    ctx.fillStyle = p.shirt;
    ctx.fillRect(3 * u, 7 * u + bob, 10 * u, 5 * u);
    // Detalhe / crachá / gravata
    ctx.fillStyle = p.accent;
    ctx.fillRect(7 * u, 8 * u + bob, 2 * u, 3 * u);

    // Braços
    ctx.fillStyle = p.skin;
    ctx.fillRect(2 * u, 8 * u + bob, 1.5 * u, 3 * u);
    ctx.fillRect(12.5 * u, 8 * u + bob, 1.5 * u, 3 * u);

    // Cabeça
    ctx.fillStyle = p.skin;
    ctx.fillRect(4 * u, 2 * u + bob, 8 * u, 5 * u);

    // Cabelo / Boné
    ctx.fillStyle = p.hair;
    ctx.fillRect(3 * u, 1 * u + bob, 10 * u, 3 * u);
    if (charKey === 'lucas') {
      // Boné clássico FireRed
      ctx.fillStyle = p.cap;
      ctx.fillRect(3 * u, 0.5 * u + bob, 10 * u, 2.5 * u);
      ctx.fillStyle = '#fff';
      ctx.fillRect(6 * u, 1.2 * u + bob, 4 * u, 1.2 * u);
    } else if (charKey === 'helena' || charKey === 'maryanne' || charKey === 'wendila') {
      // Cabelo longo lateral
      ctx.fillStyle = p.hair;
      ctx.fillRect(3 * u, 3 * u + bob, 1.6 * u, 5 * u);
      ctx.fillRect(11.4 * u, 3 * u + bob, 1.6 * u, 5 * u);
      // Tiara / laço
      ctx.fillStyle = p.cap;
      ctx.fillRect(5 * u, 1 * u + bob, 6 * u, 1 * u);
    } else {
      // Detalhe tech / viseira / faixa dos chefes
      ctx.fillStyle = p.cap;
      ctx.fillRect(4 * u, 1.5 * u + bob, 8 * u, 1.2 * u);
    }

    // Olhos (dependendo da direção)
    if (dir !== 'up') {
      ctx.fillStyle = '#0f172a';
      const eyeOffset = dir === 'left' ? -1 * u : dir === 'right' ? 1 * u : 0;
      ctx.fillRect(5.2 * u + eyeOffset, 4.3 * u + bob, 1.4 * u, 1.6 * u);
      ctx.fillRect(9.4 * u + eyeOffset, 4.3 * u + bob, 1.4 * u, 1.6 * u);
    }

    ctx.restore();
  }

  function renderPortrait(canvasId, charKey, secondKey = null) {
    const c = document.getElementById(canvasId);
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    if (secondKey) {
      drawPixelChar(ctx, 2, 6, c.height - 8, charKey, 'down', 0);
      drawPixelChar(ctx, c.width / 2 - 2, 6, c.height - 8, secondKey, 'down', 0);
    } else {
      const s = Math.min(c.width, c.height) - 6;
      drawPixelChar(ctx, (c.width - s) / 2, (c.height - s) / 2 + 2, s, charKey, 'down', 0);
    }
  }

  /* ==========================================================================
     4. DEFINIÇÃO DOS 5 MAPAS (PÁTIO + 4 ÁREAS DO CURSO)
  ========================================================================== */
  // Códigos de Tiles:
  // 0: Piso / Chão livre
  // 1: Parede / Árvore sólida
  // 2: Grama decorativa (andável)
  // 3: Mesa / Bancada / Rack sólido
  // 4: Tapete / Porta de transição
  // 5: Placa informativa (interagível)
  // 6: Tapete central do Pátio
  // 7: Balanço interativo (assento)
  // 9: Sofá de recepção / descanso (Administração)






  //POSIÇÃO DAS COISAS AQUI
  const MAPS = {
    courtyard: {
      theme: 'courtyard',
      grid: [
        [1,1,1,4,1,1,1,1,1,1,1,4,1,1,1],
        [1,2,8,0,2,8,5,8,5,8,2,0,8,2,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,8,0,0,0,0,0,0,0,0,0,0,0,8,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,2,0,0,0,0,0,0,0,0,0,0,0,2,1],
        [1,8,0,0,0,0,0,0,0,0,0,0,0,8,1],
        [1,2,8,0,2,8,8,0,8,8,2,0,8,2,1],
        [1,1,1,4,1,1,1,1,1,1,1,4,1,1,1]
      ],
      labels: [
        { text: '💻 DEV', x: 3, y: 0.6, color: '#60a5fa' },
        { text: '🔧 MANUT', x: 11, y: 0.6, color: '#fb923c' },
        { text: '📊 ADM', x: 3, y: 9.2, color: '#fde047' },
        { text: '🌐 REDES', x: 11, y: 9.2, color: '#c084fc' }
      ],
      portals: [
        { x: 3, y: 0, to: 'dev', tx: 7, ty: 8, dir: 'up' },
        { x: 11, y: 0, to: 'manut', tx: 7, ty: 8, dir: 'up' },
        { x: 3, y: 9, to: 'adm', tx: 7, ty: 8, dir: 'up' },
        { x: 11, y: 9, to: 'redes', tx: 7, ty: 8, dir: 'up' }
      ],
      entities: [
        { id: 'lucas', type: 'guide', name: 'Lucas', x: 7, y: 3, char: 'lucas' },
        { id: 'sign1', type: 'sign', x: 6, y: 1, text: 'EEEP JAIME ALENCAR DE OLIVEIRA — Curso Técnico em Desenvolvimento de Sistemas. Explore as 4 áreas!' },
        { id: 'sign2', type: 'sign', x: 8, y: 1, text: 'Norte-Oeste: Desenvolvimento | Norte-Leste: Manutenção | Sul-Oeste: Administração | Sul-Leste: Redes.' }
      ]
    },
    dev: {
      theme: 'dev',
      areaKey: 'dev',
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,3,0,0,0,0,0,0,0,0,0,3,3,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,3,0,0,0,0,0,0,0,3,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,3,0,0,0,0,0,0,0,3,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,4,1,1,1,1,1,1,1]
      ],
      labels: [{ text: 'SAÍDA PÁTIO', x: 7, y: 9.2, color: '#fff' }],
      portals: [{ x: 7, y: 9, to: 'courtyard', tx: 3, ty: 1, dir: 'down' }],
      entities: [
        { id: 'dev_m1', type: 'mission', area: 'dev', mNum: 1, name: 'Monitor de Bugs', x: 3, y: 5, char: 'npc' },
        { id: 'dev_m2', type: 'mission', area: 'dev', mNum: 2, name: 'Terminal Lógica', x: 11, y: 5, char: 'npc' },
        { id: 'dev_boss', type: 'boss', area: 'dev', name: 'Falcão & Alysson', x: 7, y: 2, char: 'falcao', char2: 'alysson' }
      ]
    },
    manut: {
      theme: 'manut',
      areaKey: 'manut',
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,3,1],
        [1,3,0,0,0,0,0,0,0,0,0,0,0,3,1],
        [1,0,0,3,3,0,0,0,0,0,3,3,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,3,0,0,0,0,0,0,0,3,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,4,1,1,1,1,1,1,1]
      ],
      labels: [{ text: 'SAÍDA PÁTIO', x: 7, y: 9.2, color: '#fff' }],
      portals: [{ x: 7, y: 9, to: 'courtyard', tx: 11, ty: 1, dir: 'down' }],
      entities: [
        { id: 'manut_m1', type: 'mission', area: 'manut', mNum: 1, name: 'Bancada PC', x: 3, y: 5, char: 'npc' },
        { id: 'manut_m2', type: 'mission', area: 'manut', mNum: 2, name: 'Estação Térmica', x: 11, y: 5, char: 'npc' },
        { id: 'manut_boss', type: 'boss', area: 'manut', name: 'Igor & Leôncio', x: 7, y: 2, char: 'igor', char2: 'leoncio' }
      ]
    },
    adm: {
      theme: 'adm',
      areaKey: 'adm',
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,3,0,0,0,3,3,3,0,0,0,3,3,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,9,0,0,0,0,0,0,0,9,0,0,1],
        [1,0,0,9,0,0,0,0,0,0,0,9,0,0,1],
        [1,0,3,3,0,0,0,0,0,0,0,3,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,4,1,1,1,1,1,1,1]
      ],
      labels: [{ text: 'SAÍDA PÁTIO', x: 7, y: 9.2, color: '#fff' }],
      portals: [{ x: 7, y: 9, to: 'courtyard', tx: 3, ty: 8, dir: 'up' }],
      entities: [
        { id: 'adm_m1', type: 'mission', area: 'adm', mNum: 1, name: 'Analista Caixa', x: 4, y: 5, char: 'npc' },
        { id: 'adm_m2', type: 'mission', area: 'adm', mNum: 2, name: 'Quadro Kanban', x: 10, y: 5, char: 'npc' },
        { id: 'adm_boss', type: 'boss', area: 'adm', name: 'Maryanne & Wendila', x: 7, y: 1, char: 'maryanne', char2: 'wendila' }
      ]
    },
    redes: {
      theme: 'redes',
      areaKey: 'redes',
      grid: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,3,3,3,0,0,0,0,0,0,0,3,3,3,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,0,0,0,0,0,0,0,0,0,3,0,1],
        [1,0,3,0,0,0,0,0,0,0,0,0,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,3,0,0,0,0,0,0,0,3,3,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,4,1,1,1,1,1,1,1]
      ],
      labels: [{ text: 'SAÍDA PÁTIO', x: 7, y: 9.2, color: '#fff' }],
      portals: [{ x: 7, y: 9, to: 'courtyard', tx: 11, ty: 8, dir: 'up' }],
      entities: [
        { id: 'redes_m1', type: 'mission', area: 'redes', mNum: 1, name: 'Rack de Cabos', x: 4, y: 5, char: 'npc' },
        { id: 'redes_m2', type: 'mission', area: 'redes', mNum: 2, name: 'Servidor Firewall', x: 10, y: 5, char: 'npc' },
        { id: 'redes_boss', type: 'boss', area: 'redes', name: 'Dudu & Alisson', x: 7, y: 2, char: 'dudu', char2: 'alisson' }
      ]
    }
  };

  /* ==========================================================================
     5. SISTEMA DE DIÁLOGOS ESTILO FIRERED
  ========================================================================== */
  const Dialogue = {
    queue: [],
    current: null,
    charIndex: 0,
    typingTimer: null,
    onComplete: null,

    start(lines, onComplete = null) {
      this.queue = [...lines];
      this.onComplete = onComplete;
      state.mode = 'dialogue';
      document.getElementById('dialogueOverlay').classList.add('active');
      this.nextLine();
    },

    nextLine() {
      if (this.typingTimer) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
        if (this.current && this.charIndex < this.current.text.length) {
          document.getElementById('dialogueText').textContent = this.current.text;
          this.charIndex = this.current.text.length;
          return;
        }
      }

      if (this.queue.length === 0) {
        document.getElementById('dialogueOverlay').classList.remove('active');
        state.mode = 'explore';
        const cb = this.onComplete;
        this.onComplete = null;
        if (cb) cb();
        return;
      }

      Sound.beep();
      this.current = this.queue.shift();
      this.charIndex = 0;
      document.getElementById('dialogueSpeaker').textContent = this.current.speaker;
      document.getElementById('dialogueText').textContent = '';
      renderPortrait('portraitCanvas', this.current.char || 'helena', this.current.char2 || null);

      this.typingTimer = setInterval(() => {
        this.charIndex++;
        document.getElementById('dialogueText').textContent = this.current.text.slice(0, this.charIndex);
        if (this.charIndex >= this.current.text.length) {
          clearInterval(this.typingTimer);
          this.typingTimer = null;
        }
      }, 18);
    }
  };

  /* ==========================================================================
     6. HUD E GUIA DO LUCAS
  ========================================================================== */
  function countBadges() {
    return ['dev', 'manut', 'adm', 'redes'].filter(k => state.progress[k].boss).length;
  }

  function updateHUD() {
    const info = AREA_INFO[state.currentMap];
    document.getElementById('hudAreaName').textContent = info.name;

    ['dev', 'manut', 'adm', 'redes'].forEach(k => {
      const el = document.getElementById('badge-' + k);
      if (state.progress[k].boss) el.classList.add('earned');
      else el.classList.remove('earned');
    });

    const earned = countBadges();
    let obj = '';
    if (earned === 4 && !state.contractSigned) {
      obj = 'Todas as 4 Insígnias! Fale com o Lucas no Pátio!';
    } else if (state.contractSigned) {
      obj = 'Parabéns! Você já é aluna de DS da Jaime Alencar!';
    } else if (state.currentMap === 'courtyard') {
      const nextArea = ['dev', 'manut', 'adm', 'redes'].find(k => !state.progress[k].boss);
      obj = `Visite ${AREA_INFO[nextArea].name} (${earned}/4 Insígnias)`;
    } else {
      const p = state.progress[state.currentMap];
      if (!p.m1 || !p.m2) {
        const done = (p.m1 ? 1 : 0) + (p.m2 ? 1 : 0);
        obj = `Conclua as 2 Missões da sala (${done}/2) para liberar os Chefes!`;
      } else if (!p.boss) {
        obj = `Missões ok! Enfrente ${AREA_INFO[state.currentMap].bosses}!`;
      } else {
        obj = 'Área concluída! Volte ao Pátio para outra área.';
      }
    }
    document.getElementById('hudObjective').textContent = obj;
  }

  function talkToHelena() {
    const earned = countBadges();
wd
    // Cena Final se conquistou as 4 insígnias
    if (earned === 4 && !state.contractSigned) {
      Sound.fanfare();
      Dialogue.start([
        { speaker: 'LUCAS', char: 'lucas', text: 'Helena!! Você conseguiu! Conquistou as 4 Insígnias da EEEP Jaime Alencar de Oliveira!' },
        { speaker: 'HELENA', char: 'helena', text: 'Lucas, eu quero muito te agradecer! Sem a sua orientação e suas dicas em cada área, eu nunca teria conseguido vencer todos os chefes.' },
        { speaker: 'HELENA', char: 'helena', text: 'Eu vim de outra escola curiosa para conhecer os cursos, e agora tenho certeza absoluta de que quero fazer Desenvolvimento de Sistemas aqui!' },
        { speaker: 'LUCAS', char: 'lucas', text: 'Que alegria ver você brilhar, Helena! Falcão, Alysson, Igor, Leôncio, Maryanne, Wendila, Dudu e Alisson já aprovaram sua entrada.' },
        { speaker: 'LUCAS', char: 'lucas', text: 'Aqui está o Contrato Oficial de Matrícula do curso. Basta assinar para oficializar seu lugar na Jaime Alencar!' }
      ], () => {
        openContractScreen();
      });
      return;
    }

    // Cura estilo Centro Pokémon + Dica contextual
    Sound.heal();
    state.player.hp = state.player.maxHp;

    if (state.contractSigned) {
      Dialogue.start([
        { speaker: 'LUCAS', char: 'lucas', text: 'Bem-vinda oficialmente ao curso de Desenvolvimento de Sistemas, Helena! Sua energia está 100% restaurada.' }
      ]);
      return;
    }

    const pending = ['dev', 'manut', 'adm', 'redes'].filter(k => !state.progress[k].boss);
    const names = pending.map(k => AREA_INFO[k].name.replace('LAB. ', '').replace('OFICINA DE ', '').replace('SALA DE ', '').replace('CENTRAL DE ', ''));

    Dialogue.start([
      { speaker: 'LUCAS', char: 'lucas', text: 'Oi, Helena! Restaurei seu HP para 100% (tipo um Centro Pokémon!).' },
      { speaker: 'LUCAS', char: 'lucas', text: `Você já tem ${earned}/4 Insígnias. Ainda faltam as áreas: ${names.join(', ')}.` },
      { speaker: 'LUCAS', char: 'lucas', text: 'Lembre-se: em cada sala, complete as 2 missões com os monitores para desbloquear a batalha contra a dupla de Chefes!' }
    ]);
  }

  /* ==========================================================================
     7. OS 8 MINI-JOGOS (2 POR ÁREA)
  ========================================================================== */
  let activeMinigameCleanup = null;

  function closeMinigame() {
    if (activeMinigameCleanup) {
      activeMinigameCleanup();
      activeMinigameCleanup = null;
    }
    document.getElementById('minigameOverlay').classList.remove('active');
    state.mode = 'explore';
    updateHUD();
  }

  function completeMission(area, mNum) {
    Sound.success();
    state.progress[area]['m' + mNum] = true;
    closeMinigame();
    Storage.save();
    const bothDone = state.progress[area].m1 && state.progress[area].m2;
    Dialogue.start([
      {
        speaker: 'HELENA',
        char: 'helena',
        text: bothDone
          ? `Mandou muito bem, Lucas! Você concluiu as 2 missões de ${AREA_INFO[area].name}! Agora os Chefes ${AREA_INFO[area].bosses} estão prontos para a batalha no fundo da sala!`
          : `Missão ${mNum} concluída com sucesso! Agora faça a outra missão desta sala para desafiar os Chefes!`
      }
    ]);
    updateHUD();
  }

  function startMinigame(area, mNum) {
    if (state.progress[area]['m' + mNum]) {
      Dialogue.start([
        { speaker: 'MONITOR', char: 'npc', text: 'Você já completou esta missão com perfeição! Pode avançar para o próximo desafio.' }
      ]);
      return;
    }

    state.mode = 'minigame';
    const overlay = document.getElementById('minigameOverlay');
    const body = document.getElementById('mgBody');
    const feedback = document.getElementById('mgFeedback');
    feedback.textContent = '';
    body.innerHTML = '';
    overlay.classList.add('active');

    if (area === 'dev' && mNum === 1) runDevM1(body, feedback);
    else if (area === 'dev' && mNum === 2) runDevM2(body, feedback);
    else if (area === 'manut' && mNum === 1) runManutM1(body, feedback);
    else if (area === 'manut' && mNum === 2) runManutM2(body, feedback);
    else if (area === 'adm' && mNum === 1) runAdmM1(body, feedback);
    else if (area === 'adm' && mNum === 2) runAdmM2(body, feedback);
    else if (area === 'redes' && mNum === 1) runRedesM1(body, feedback);
    else if (area === 'redes' && mNum === 2) runRedesM2(body, feedback);
  }

  // --- DEV MISSÃO 1: CAÇA AOS BUGS ---
  function runDevM1(body, feedback) {
    document.getElementById('mgTitle').textContent = 'DEV M1: CAÇA AOS BUGS';
    const questions = [
      {
        code: 'let nota = 8;\nif (nota = 10) {\n  console.log("Nota máxima!");\n}',
        q: 'Qual correção resolve o bug na condição do IF?',
        opts: [
          { t: 'Trocar (nota = 10) por (nota === 10)', ok: true },
          { t: 'Apagar a palavra let', ok: false },
          { t: 'Trocar console.log por print()', ok: false }
        ]
      },
      {
        code: 'function somar(a, b) {\n  let total = a + b;\n  // Faltou devolver o resultado!\n}',
        q: 'O que falta para a função retornar a soma?',
        opts: [
          { t: 'Adicionar: break total;', ok: false },
          { t: 'Adicionar: return total;', ok: true },
          { t: 'Trocar a + b por a - b', ok: false }
        ]
      },
      {
        code: 'let alunos = ["Lucas", "Helena"];\nconsole.log(alunos[2]); // undefined!',
        q: 'Por que deu undefined? Como acessar "Helena"?',
        opts: [
          { t: 'Arrays começam no índice 0, então usar alunos[1]', ok: true },
          { t: 'Usar alunos[3] para pegar o último', ok: false },
          { t: 'Colocar aspas no número 2', ok: false }
        ]
      }
    ];
    let idx = 0;

    function render() {
      document.getElementById('mgStatus').textContent = `Bug ${idx + 1}/3`;
      const item = questions[idx];
      body.innerHTML = `
        <div class="mg-instruction">${item.q}</div>
        <div class="mg-code-box">${item.code}</div>
        <div class="mg-options" id="bugOpts"></div>
      `;
      const optsEl = body.querySelector('#bugOpts');
      item.opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'mg-option-btn';
        btn.textContent = o.t;
        btn.onclick = () => {
          if (o.ok) {
            Sound.select();
            btn.classList.add('correct');
            feedback.textContent = '✓ Bug corrigido! Código compilou!';
            idx++;
            setTimeout(() => {
              feedback.textContent = '';
              if (idx >= questions.length) completeMission('dev', 1);
              else render();
            }, 650);
          } else {
            Sound.error();
            btn.classList.add('wrong');
            feedback.textContent = '✗ Ainda há erro de compilação! Tente outra correção.';
          }
        };
        optsEl.appendChild(btn);
      });
    }
    render();
  }

  // --- DEV MISSÃO 2: LÓGICA DE ALGORITMO ---
  function runDevM2(body, feedback) {
    document.getElementById('mgTitle').textContent = 'DEV M2: LÓGICA DE ALGORITMO';
    const steps = [
      '1. Ler as notas do aluno Lucas',
      '2. Calcular a média: (n1 + n2) / 2',
      '3. Verificar SE média >= 7',
      '4. Exibir "Aprovado em DS!"',
      '5. Fim do algoritmo'
    ];
    const shuffled = [steps[2], steps[0], steps[4], steps[1], steps[3]];
    let nextExpected = 0;

    function render() {
      document.getElementById('mgStatus').textContent = `Ordem ${nextExpected}/5`;
      body.innerHTML = `
        <div class="mg-instruction">Clique nos blocos na ordem lógica correta (do início ao fim):</div>
        <div class="mg-options" id="algoOpts"></div>
      `;
      const container = body.querySelector('#algoOpts');
      shuffled.forEach(text => {
        const stepIdx = steps.indexOf(text);
        const btn = document.createElement('button');
        btn.className = 'mg-option-btn';
        btn.textContent = text.replace(/^\d+\.\s/, '▶ ');
        if (stepIdx < nextExpected) {
          btn.classList.add('correct');
          btn.disabled = true;
          btn.textContent = `✓ [${stepIdx + 1}] ` + text.replace(/^\d+\.\s/, '');
        }
        btn.onclick = () => {
          if (stepIdx === nextExpected) {
            Sound.select();
            nextExpected++;
            feedback.textContent = 'Boa sequência lógica!';
            if (nextExpected === steps.length) {
              setTimeout(() => completeMission('dev', 2), 500);
            } else {
              render();
            }
          } else {
            Sound.error();
            feedback.textContent = '✗ Essa etapa vem depois! Pense na ordem lógica.';
          }
        };
        container.appendChild(btn);
      });
    }
    render();
  }

  // --- MANUTENÇÃO MISSÃO 1: MONTAGEM DE PC ---
  function runManutM1(body, feedback) {
    document.getElementById('mgTitle').textContent = 'MANUT M1: MONTAGEM DE PC';
    const parts = [
      { id: 'cpu', label: '🧠 Processador (CPU)', slot: 'Soquete LGA da Placa-Mãe' },
      { id: 'ram', label: '📏 Memória RAM DDR4', slot: 'Slot DIMM com travas' },
      { id: 'ssd', label: '💾 SSD NVMe M.2', slot: 'Conector M.2 de Armazenamento' },
      { id: 'psu', label: '⚡ Fonte ATX 500W', slot: 'Conector de Energia 24 Pinos' }
    ];
    const slotsShuffled = [parts[2], parts[0], parts[3], parts[1]];
    let selectedPart = null;
    const matched = {};

    function render() {
      const done = Object.keys(matched).length;
      document.getElementById('mgStatus').textContent = `Peças ${done}/4`;
      body.innerHTML = `
        <div class="mg-instruction">Clique em um Componente (esquerda) e depois no Slot correto (direita):</div>
        <div class="mg-grid-2">
          <div class="mg-options" id="partsCol"></div>
          <div class="mg-options" id="slotsCol"></div>
        </div>
      `;
      const pCol = body.querySelector('#partsCol');
      const sCol = body.querySelector('#slotsCol');

      parts.forEach(p => {
        const b = document.createElement('button');
        b.className = 'mg-option-btn';
        b.textContent = p.label;
        if (matched[p.id]) { b.classList.add('correct'); b.disabled = true; }
        else if (selectedPart === p.id) b.classList.add('selected');
        b.onclick = () => {
          Sound.beep();
          selectedPart = p.id;
          feedback.textContent = `Selecionado: ${p.label}. Agora escolha o slot!`;
          render();
        };
        pCol.appendChild(b);
      });

      slotsShuffled.forEach(s => {
        const b = document.createElement('button');
        b.className = 'mg-option-btn';
        b.textContent = '🔌 ' + s.slot;
        if (matched[s.id]) { b.classList.add('correct'); b.disabled = true; }
        b.onclick = () => {
          if (!selectedPart) {
            feedback.textContent = 'Primeiro selecione um componente na esquerda!';
            return;
          }
          if (selectedPart === s.id) {
            Sound.select();
            matched[s.id] = true;
            selectedPart = null;
            feedback.textContent = '✓ Encaixe perfeito!';
            if (Object.keys(matched).length === parts.length) {
              setTimeout(() => completeMission('manut', 1), 500);
            } else render();
          } else {
            Sound.error();
            feedback.textContent = '✗ Slot incompatível! Cuidado para não entortar pinos.';
          }
        };
        sCol.appendChild(b);
      });
    }
    render();
  }

  // --- MANUTENÇÃO MISSÃO 2: LIMPEZA TÉRMICA (TEMPO REAL) ---
  function runManutM2(body, feedback) {
    document.getElementById('mgTitle').textContent = 'MANUT M2: LIMPEZA TÉRMICA';
    let temp = 95;
    let timeLeft = 18;
    let cleaned = 0;
    const goal = 10;

    body.innerHTML = `
      <div class="mg-instruction">Clique rápido nos focos de poeira/calor (🔥) para baixar a temperatura abaixo de 45°C!</div>
      <div class="mg-arena" id="dustArena" style="background: radial-gradient(circle, #292524 0%, #0c0a09 100%);"></div>
    `;
    const arena = body.querySelector('#dustArena');

    function updateStatus() {
      document.getElementById('mgStatus').textContent = `🌡 ${temp}°C | ⏱ ${timeLeft}s`;
    }
    updateStatus();

    function spawnDust() {
      const spot = document.createElement('div');
      spot.className = 'dust-spot';
      spot.textContent = '🔥';
      spot.style.left = (8 + Math.random() * 80) + '%';
      spot.style.top = (8 + Math.random() * 72) + '%';
      spot.onclick = () => {
        Sound.select();
        spot.remove();
        cleaned++;
        temp = Math.max(38, temp - 6);
        updateStatus();
        feedback.textContent = `Limpeza ${cleaned}/${goal} — Temperatura: ${temp}°C`;
        if (cleaned >= goal || temp <= 44) {
          clearInterval(timer);
          clearInterval(spawner);
          completeMission('manut', 2);
        }
      };
      arena.appendChild(spot);
      setTimeout(() => { if (spot.parentNode) spot.remove(); }, 2200);
    }

    spawnDust();
    spawnDust();
    const spawner = setInterval(spawnDust, 850);
    const timer = setInterval(() => {
      timeLeft--;
      updateStatus();
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearInterval(spawner);
        Sound.error();
        feedback.textContent = 'Tempo esgotado! Reiniciando limpeza...';
        setTimeout(() => runManutM2(body, feedback), 1100);
      }
    }, 1000);

    activeMinigameCleanup = () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }

  // --- ADMINISTRAÇÃO MISSÃO 1: FLUXO DE CAIXA ---
  function runAdmM1(body, feedback) {
    document.getElementById('mgTitle').textContent = 'ADM M1: FLUXO DE CAIXA';
    let saldo = 1000;
    let idx = 0;
    const scenarios = [
      {
        q: 'Um cliente pediu um site escolar. Como definir o orçamento inicial?',
        opts: [
          { t: 'Cobrar R$ 600 com escopo claro (+R$ 400 lucro)', delta: 400, msg: 'Ótima precificação!' },
          { t: 'Fazer de graça sem contrato (-R$ 300 custo)', delta: -300, msg: 'Prejuízo no caixa!' },
          { t: 'Gastar tudo em brindes antes de vender (-R$ 400)', delta: -400, msg: 'Faltou planejamento!' }
        ]
      },
      {
        q: 'O laboratório precisa de licenças de software. Qual a melhor gestão?',
        opts: [
          { t: 'Comprar 20 licenças caras sem usar (-R$ 500)', delta: -500, msg: 'Desperdício de verba!' },
          { t: 'Usar ferramentas Open Source confiáveis (+R$ 200 economia)', delta: 200, msg: 'Decisão inteligente e sustentável!' },
          { t: 'Ignorar o orçamento (-R$ 250)', delta: -250, msg: 'Furo no fluxo de caixa!' }
        ]
      },
      {
        q: 'Sobrou caixa no projeto de TI. O que fazer para crescer?',
        opts: [
          { t: 'Criar reserva de emergência e investir em marketing (+R$ 300)', delta: 300, msg: 'Gestão exemplar!' },
          { t: 'Gastar tudo em festa sem controle (-R$ 600)', delta: -600, msg: 'O caixa zerou!' },
          { t: 'Deixar contas atrasarem com multa (-R$ 350)', delta: -350, msg: 'Juros corroeram o lucro!' }
        ]
      }
    ];

    function render() {
      document.getElementById('mgStatus').textContent = `💰 R$ ${saldo} | Cenário ${idx + 1}/3`;
      const s = scenarios[idx];
      body.innerHTML = `
        <div class="mg-instruction">Mantenha o saldo acima de R$ 1.200 até o final! ${s.q}</div>
        <div class="mg-options" id="admOpts"></div>
      `;
      const opts = body.querySelector('#admOpts');
      s.opts.forEach(o => {
        const b = document.createElement('button');
        b.className = 'mg-option-btn';
        b.textContent = o.t;
        b.onclick = () => {
          saldo += o.delta;
          if (o.delta > 0) Sound.select(); else Sound.error();
          feedback.textContent = `${o.msg} (Saldo: R$ ${saldo})`;
          idx++;
          setTimeout(() => {
            if (idx >= scenarios.length) {
              if (saldo >= 1200) completeMission('adm', 1);
              else {
                feedback.textContent = `Saldo final R$ ${saldo} ficou abaixo de R$ 1.200! Vamos replanejar.`;
                setTimeout(() => runAdmM1(body, feedback), 1300);
              }
            } else render();
          }, 700);
        };
        opts.appendChild(b);
      });
    }
    render();
  }

  // --- ADMINISTRAÇÃO MISSÃO 2: QUADRO KANBAN ---
  function runAdmM2(body, feedback) {
    document.getElementById('mgTitle').textContent = 'ADM M2: QUADRO KANBAN';
    const tasks = [
      { t: '🔥 Servidor caiu na hora da apresentação!', col: 'urgente' },
      { t: '📅 Definir metas do próximo semestre', col: 'planejar' },
      { t: '✅ Relatório de notas já assinado e entregue', col: 'concluido' },
      { t: '🚨 Corrigir bug de login antes da prova', col: 'urgente' },
      { t: '🗺️ Pesquisar novas tecnologias para o curso', col: 'planejar' },
      { t: '🏁 Backup semanal finalizado com sucesso', col: 'concluido' }
    ];
    let idx = 0;
    let hits = 0;

    function render() {
      document.getElementById('mgStatus').textContent = `Acertos ${hits}/5 | Card ${idx + 1}/6`;
      const card = tasks[idx];
      body.innerHTML = `
        <div class="mg-instruction">Classifique a tarefa na coluna correta do Kanban:</div>
        <div class="mg-code-box" style="text-align:center; font-size:15px; color:#fef08a;">${card.t}</div>
        <div class="mg-grid-3">
          <button class="btn-pixel red" data-col="urgente" style="padding:10px 6px; font-size:8px;">URGENTE / FAZER AGORA</button>
          <button class="btn-pixel blue" data-col="planejar" style="padding:10px 6px; font-size:8px;">PLANEJAR / BACKLOG</button>
          <button class="btn-pixel green" data-col="concluido" style="padding:10px 6px; font-size:8px;">CONCLUÍDO / ENTREGUE</button>
        </div>
      `;
      body.querySelectorAll('button[data-col]').forEach(btn => {
        btn.onclick = () => {
          if (btn.dataset.col === card.col) {
            Sound.select();
            hits++;
            feedback.textContent = '✓ Card organizado na coluna certa!';
          } else {
            Sound.error();
            feedback.textContent = '✗ Essa tarefa pertencia a outra coluna!';
          }
          idx++;
          setTimeout(() => {
            if (idx >= tasks.length) {
              if (hits >= 5) completeMission('adm', 2);
              else {
                feedback.textContent = `Você acertou ${hits}/6 (precisa de 5). Reorganizando quadro...`;
                setTimeout(() => runAdmM2(body, feedback), 1200);
              }
            } else render();
          }, 550);
        };
      });
    }
    render();
  }

  // --- REDES MISSÃO 1: PADRÃO DE CABOS RJ45 ---
  function runRedesM1(body, feedback) {
    document.getElementById('mgTitle').textContent = 'REDES M1: CRIMPAGEM DE CABOS';
    const order = [
      { id: 'verde', label: '🟢 Par Verde (Pino 1)', color: '#22c55e' },
      { id: 'laranja', label: '🟠 Par Laranja (Pino 2)', color: '#f97316' },
      { id: 'azul', label: '🔵 Par Azul (Pino 3)', color: '#3b82f6' },
      { id: 'marrom', label: '🟤 Par Marrom (Pino 4)', color: '#92400e' }
    ];
    const shuffled = [order[2], order[0], order[3], order[1]];
    let step = 0;

    function render() {
      document.getElementById('mgStatus').textContent = `Cabo ${step}/4`;
      body.innerHTML = `
        <div class="mg-instruction">Conecte os cabos na ordem T568A simplificada: <strong>Verde → Laranja → Azul → Marrom</strong></div>
        <div class="mg-grid-2" id="cableBtns"></div>
      `;
      const box = body.querySelector('#cableBtns');
      shuffled.forEach(c => {
        const cIdx = order.findIndex(o => o.id === c.id);
        const btn = document.createElement('button');
        btn.className = 'mg-option-btn';
        btn.style.borderLeft = `8px solid ${c.color}`;
        btn.textContent = c.label;
        if (cIdx < step) {
          btn.classList.add('correct');
          btn.disabled = true;
          btn.textContent = '✓ CONECTADO: ' + c.label;
        }
        btn.onclick = () => {
          if (cIdx === step) {
            Sound.select();
            step++;
            feedback.textContent = '✓ Sinal de rede subindo!';
            if (step === order.length) setTimeout(() => completeMission('redes', 1), 500);
            else render();
          } else {
            Sound.error();
            feedback.textContent = '✗ Ordem incorreta! Siga: Verde → Laranja → Azul → Marrom.';
          }
        };
        box.appendChild(btn);
      });
    }
    render();
  }

  // --- REDES MISSÃO 2: FIREWALL EM AÇÃO (TEMPO REAL) ---
  function runRedesM2(body, feedback) {
    document.getElementById('mgTitle').textContent = 'REDES M2: FIREWALL EM AÇÃO';
    let blocked = 0;
    let leaks = 0;
    const goal = 6;
    const packets = [];

    body.innerHTML = `
      <div class="mg-instruction">CLIQUE nos pacotes VERMELHOS (Malware) para bloquear! Deixe os VERDES (HTTP) passarem!</div>
      <div class="mg-arena" id="fwArena">
        <div style="position:absolute; right:4px; top:4px; bottom:4px; width:24px; background:rgba(56,189,248,0.2); border-left:2px dashed #38bdf8; display:flex; align-items:center; justify-content:center; font-size:14px;">🖥️</div>
      </div>
    `;
    const arena = body.querySelector('#fwArena');

    function updateStatus() {
      document.getElementById('mgStatus').textContent = `🛡️ ${blocked}/${goal} | ⚠️ Vazamentos: ${leaks}/3`;
    }
    updateStatus();

    function spawnPacket() {
      const isVirus = Math.random() < 0.62;
      const el = document.createElement('div');
      el.className = 'packet-item ' + (isVirus ? 'packet-virus' : 'packet-safe');
      el.textContent = isVirus ? '☠️ MALWARE' : '🔒 HTTP OK';
      const y = 12 + Math.random() * 125;
      el.style.top = y + 'px';
      el.style.left = '-10px';

      const pkt = { el, x: -10, speed: 1.8 + Math.random() * 1.4, isVirus, alive: true };
      el.onclick = () => {
        if (!pkt.alive) return;
        pkt.alive = false;
        el.remove();
        if (pkt.isVirus) {
          Sound.select();
          blocked++;
          feedback.textContent = '🛡️ Malware bloqueado pelo Firewall!';
          updateStatus();
          if (blocked >= goal) {
            cleanup();
            completeMission('redes', 2);
          }
        } else {
          Sound.error();
          feedback.textContent = '⚠️ Oops! Você bloqueou um pacote seguro HTTP!';
        }
      };
      arena.appendChild(el);
      packets.push(pkt);
    }

    const spawner = setInterval(spawnPacket, 950);
    const mover = setInterval(() => {
      const maxW = arena.clientWidth - 36;
      packets.forEach(p => {
        if (!p.alive) return;
        p.x += p.speed;
        p.el.style.left = p.x + 'px';
        if (p.x >= maxW) {
          p.alive = false;
          p.el.remove();
          if (p.isVirus) {
            Sound.error();
            leaks++;
            feedback.textContent = '🚨 Um vírus invadiu o servidor!';
            updateStatus();
            if (leaks >= 3) {
              cleanup();
              feedback.textContent = 'Muitos vírus passaram! Reiniciando Firewall...';
              setTimeout(() => runRedesM2(body, feedback), 1100);
            }
          }
        }
      });
    }, 30);

    function cleanup() {
      clearInterval(spawner);
      clearInterval(mover);
    }
    activeMinigameCleanup = cleanup;
    spawnPacket();
  }

  /* ==========================================================================
     8. SISTEMA DE BATALHA POKÉMON FIRERED + 4 MECÂNICAS ESPECIAIS ÚNICAS
  ========================================================================== */
  const BOSS_DATA = {
    dev: {
      name: 'FALCÃO & ALYSSON',
      char1: 'falcao',
      char2: 'alysson',
      theme: 'theme-dev',
      maxHp: 145,
      intro: [
        { speaker: 'FALCÃO & ALYSSON', char: 'falcao', char2: 'alysson', text: 'Então você é Lucas Ferreira da Escola Johnson! Vamos testar sua lógica no Laboratório de Desenvolvimento!' },
        { speaker: 'HELENA', char: 'helena', text: 'Dica: Fique atento à COMPILAÇÃO CRÍTICA! Quando usar "Compilar Golpe", acerte a zona verde. Se eles lançarem um Bug, use "Debugar"!' }
      ],
      winText: 'Excelente código, Lucas! Você merece a Insígnia do Código!'
    },
    manut: {
      name: 'IGOR & LEÔNCIO',
      char1: 'igor',
      char2: 'leoncio',
      theme: 'theme-manut',
      maxHp: 150,
      intro: [
        { speaker: 'IGOR & LEÔNCIO', char: 'igor', char2: 'leoncio', text: 'Bem-vindo à Oficina de Manutenção! Aqui só sobrevive quem aguenta o calor do hardware!' },
        { speaker: 'HELENA', char: 'helena', text: 'Dica: Controle o TERMÔMETRO (°C)! Ataques fortes aquecem muito. Não deixe passar de 85°C — use "Pasta Térmica" para resfriar e soltar Overclock Seguro!' }
      ],
      winText: 'Montagem limpa e temperatura controlada! Tome a Insígnia do Hardware!'
    },
    adm: {
      name: 'MARYANNE & WENDILA',
      char1: 'maryanne',
      char2: 'wendila',
      theme: 'theme-adm',
      maxHp: 145,
      intro: [
        { speaker: 'MARYANNE & WENDILA', char: 'maryanne', char2: 'wendila', text: 'Sem boa gestão, nenhum sistema para de pé! Vamos testar sua estratégia financeira, Lucas!' },
        { speaker: 'HELENA', char: 'helena', text: 'Dica: Observe o MERCADO e seu ORÇAMENTO (R$)! Invista quando o mercado estiver em ALTA para acumular verba e usar o "ROI Máximo"!' }
      ],
      winText: 'Gestão brilhante e saldo positivo! A Insígnia da Gestão é sua!'
    },
    redes: {
      name: 'DUDU & ALISSON',
      char1: 'dudu',
      char2: 'alisson',
      theme: 'theme-redes',
      maxHp: 155,
      intro: [
        { speaker: 'DUDU & ALISSON', char: 'dudu', char2: 'alisson', text: 'Chegou na Central de Redes! Nosso Firewall é impenetrável e o ping vai subir!' },
        { speaker: 'HELENA', char: 'helena', text: 'Dica: Use "Port Scan" para derrubar o FIREWALL deles e "Estabilizar Rota" se o PING ficar alto. Com Firewall OFF e Ping baixo, use "Conexão Fibra"!' }
      ],
      winText: 'Conexão estabelecida sem perda de pacotes! Receba a Insígnia da Conexão!'
    }
  };

  const Battle = {
    area: null,
    bossHp: 140,
    bossMaxHp: 140,
    busy: false,
    // Estados das 4 mecânicas especiais:
    buggedMoveIdx: -1,      // Dev
    atkBoost: 0,            // Dev
    temp: 40,               // Manut
    budget: 1000,           // Adm
    market: 'ESTÁVEL',      // Adm (ALTA | ESTÁVEL | CRISE)
    shieldTurn: false,      // Adm
    firewall: true,         // Redes
    fwDownTurns: 0,         // Redes
    ping: 24,               // Redes
    qteTimer: null,
    qtePos: 0,
    qteDir: 1,
    qteResolve: null,

    start(area) {
      const data = BOSS_DATA[area];
      this.area = area;
      this.bossHp = data.maxHp;
      this.bossMaxHp = data.maxHp;
      state.player.hp = state.player.maxHp; // Começa batalha restaurado
      this.busy = false;

      // Reset mecânicas
      this.buggedMoveIdx = -1;
      this.atkBoost = 0;
      this.temp = 42;
      this.budget = 1000;
      this.market = 'ALTA';
      this.shieldTurn = false;
      this.firewall = true;
      this.fwDownTurns = 0;
      this.ping = 25;

      state.mode = 'battle';
      const overlay = document.getElementById('battleOverlay');
      const arena = document.getElementById('battleArena');
      arena.className = 'battle-arena ' + data.theme;
      document.getElementById('bossNameLabel').textContent = data.name;

      // Render sprites na batalha
      renderPortrait('bossSpriteCanvas', data.char1, data.char2);
      renderPortrait('playerSpriteCanvas', 'helena');

      overlay.classList.add('active');
      this.updateUI();
      this.setLog(`${data.name} desafiaram Helena!`);
      this.renderMoves();
    },

    setLog(msg) {
      document.getElementById('battleLog').textContent = msg;
    },

    updateHPBar(barId, textId, hp, maxHp) {
      const pct = Math.max(0, Math.min(100, (hp / maxHp) * 100));
      const bar = document.getElementById(barId);
      bar.style.width = pct + '%';
      bar.style.backgroundColor = pct > 50 ? 'var(--hp-green)' : pct > 22 ? 'var(--hp-yellow)' : 'var(--hp-red)';
      document.getElementById(textId).textContent = `${Math.max(0, Math.round(hp))} / ${maxHp}`;
    },

    updateUI() {
      this.updateHPBar('bossHpBar', 'bossHpText', this.bossHp, this.bossMaxHp);
      this.updateHPBar('playerHpBar', 'playerHpText', state.player.hp, state.player.maxHp);

      const mTitle = document.getElementById('mechanicTitle');
      const mVal = document.getElementById('mechanicValue');

      if (this.area === 'dev') {
        mTitle.textContent = '💻 COMPILAÇÃO CRÍTICA & DEBUG';
        mVal.textContent = this.buggedMoveIdx >= 0 ? '🐛 BUG ATIVO!' : `✨ CÓDIGO LIMPO (+${this.atkBoost} ATK)`;
        mVal.style.color = this.buggedMoveIdx >= 0 ? '#f87171' : '#4ade80';
      } else if (this.area === 'manut') {
        mTitle.textContent = '🌡️ TERMÔMETRO DE OVERCLOCK';
        mVal.textContent = `${this.temp}°C ${this.temp >= 85 ? '🔥 SUPERAQUECIDO!' : this.temp <= 60 ? '❄️ IDEAL' : '⚠️ MORNO'}`;
        mVal.style.color = this.temp >= 85 ? '#f87171' : this.temp <= 60 ? '#38bdf8' : '#fde047';
      } else if (this.area === 'adm') {
        mTitle.textContent = '📊 MERCADO & ORÇAMENTO';
        mVal.textContent = `💰 R$ ${this.budget} | MERCADO: ${this.market}`;
        mVal.style.color = this.market === 'ALTA' ? '#4ade80' : this.market === 'CRISE' ? '#f87171' : '#fde047';
      } else if (this.area === 'redes') {
        mTitle.textContent = '🌐 FIREWALL & LATÊNCIA';
        mVal.textContent = `🛡️ FW: ${this.firewall ? 'ATIVO' : 'CAÍDO'} | 📡 PING: ${this.ping}ms`;
        mVal.style.color = this.firewall || this.ping > 180 ? '#f87171' : '#4ade80';
      }
    },

    getMoves() {
      if (this.area === 'dev') {
        return [
          { name: 'CÓDIGO LIMPO', meta: 'Dano seguro (20)', fn: () => this.devCleanCode() },
          { name: 'COMPILAR GOLPE', meta: 'QTE Crítico 2x!', fn: () => this.devCompileQTE() },
          { name: 'DEBUGAR', meta: 'Limpa Bug +22 HP', fn: () => this.devDebug() },
          { name: 'REFATORAR', meta: '+8 ATK e 12 Dano', fn: () => this.devRefactor() }
        ];
      }
      if (this.area === 'manut') {
        return [
          { name: 'CHAVE PHILLIPS', meta: '18 Dano (+8°C)', fn: () => this.manutAttack(18, 8, 'Chave Phillips') },
          { name: 'OVERCLOCK TURBO', meta: '40+ Dano (+28°C)', fn: () => this.manutOverclock() },
          { name: 'PASTA TÉRMICA', meta: '-35°C e +22 HP', fn: () => this.manutCooler() },
          { name: 'JATO DE AR', meta: '16 Dano (-15°C)', fn: () => this.manutAttack(16, -15, 'Jato de Ar') }
        ];
      }
      if (this.area === 'adm') {
        return [
          { name: 'PITCH RÁPIDO', meta: 'R$0 | 14 Dano +R$150', fn: () => this.admPitch() },
          { name: 'ROI MÁXIMO', meta: 'Custa R$400 | 45+ Dano', fn: () => this.admROI() },
          { name: 'INVESTIR', meta: 'R$100 -> Lucro +15 HP', fn: () => this.admInvest() },
          { name: 'CONTINGÊNCIA', meta: 'R$150 | +28 HP +Escudo', fn: () => this.admContingency() }
        ];
      }
      return [
        { name: 'CONEXÃO FIBRA', meta: '48 Dano (FW OFF!)', fn: () => this.redesFibra() },
        { name: 'PORT SCAN', meta: 'Derruba FW +14 Dano', fn: () => this.redesPortScan() },
        { name: 'ESTABILIZAR ROTA', meta: 'Ping 20ms +22 HP', fn: () => this.redesStabilize() },
        { name: 'PACOTE ICMP', meta: '18 Dano (Fura FW)', fn: () => this.redesICMP() }
      ];
    },

    renderMoves() {
      const grid = document.getElementById('battleMovesGrid');
      grid.innerHTML = '';
      const moves = this.getMoves();
      moves.forEach((m, idx) => {
        const btn = document.createElement('button');
        const isBugged = this.area === 'dev' && this.buggedMoveIdx === idx;
        btn.className = 'move-btn' + (isBugged ? ' corrupted' : '');
        btn.disabled = this.busy;
        btn.innerHTML = `<div class="move-name">${isBugged ? '🐛 BUGADO' : m.name}</div><div class="move-meta">${isBugged ? 'Use DEBUGAR!' : m.meta}</div>`;
        btn.onclick = () => {
          if (this.busy) return;
          if (isBugged) {
            Sound.error();
            this.setLog('Este golpe está corrompido por um Bug! Use DEBUGAR para corrigir!');
            return;
          }
          m.fn();
        };
        grid.appendChild(btn);
      });
    },

    shake(canvasId) {
      const el = document.getElementById(canvasId);
      el.classList.remove('shake-hit');
      void el.offsetWidth;
      el.classList.add('shake-hit');
    },

    damageBoss(dmg, msg, isCrit = false) {
      if (isCrit) Sound.crit(); else Sound.hit();
      this.bossHp = Math.max(0, this.bossHp - dmg);
      this.shake('bossSpriteCanvas');
      this.setLog(msg);
      this.updateUI();
      this.finishPlayerTurn();
    },

    // --- AÇÕES DEV ---
    devCleanCode() {
      this.busy = true;
      this.renderMoves();
      const dmg = 20 + this.atkBoost;
      this.damageBoss(dmg, `Lucas usou Código Limpo! Causou ${dmg} de dano!`);
    },
    devRefactor() {
      this.busy = true;
      this.renderMoves();
      this.atkBoost = Math.min(18, this.atkBoost + 6);
      this.damageBoss(12 + this.atkBoost, `Lucas refatorou o código! Ataque subiu e causou ${12 + this.atkBoost} de dano!`);
    },
    devDebug() {
      this.busy = true;
      this.renderMoves();
      Sound.heal();
      this.buggedMoveIdx = -1;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
      this.setLog('Lucas usou Debugar! Bugs removidos e recuperou +22 HP!');
      this.updateUI();
      this.finishPlayerTurn();
    },
    devCompileQTE() {
      this.busy = true;
      this.renderMoves();
      const qte = document.getElementById('qteOverlay');
      const cursor = document.getElementById('qteCursor');
      qte.classList.add('active');
      this.qtePos = 0;
      this.qteDir = 1;

      this.qteTimer = setInterval(() => {
        this.qtePos += this.qteDir * 3.8;
        if (this.qtePos >= 96) { this.qtePos = 96; this.qteDir = -1; }
        if (this.qtePos <= 0) { this.qtePos = 0; this.qteDir = 1; }
        cursor.style.left = this.qtePos + '%';
      }, 22);

      this.qteResolve = () => {
        clearInterval(this.qteTimer);
        this.qteTimer = null;
        this.qteResolve = null;
        qte.classList.remove('active');

        let dmg = 10;
        let msg = '';
        let crit = false;
        if (this.qtePos >= 40 && this.qtePos <= 60) {
          dmg = 42 + this.atkBoost;
          crit = true;
          msg = `⚡ COMPILAÇÃO PERFEITA! Crítico de ${dmg} de dano!`;
        } else if (this.qtePos >= 24 && this.qtePos <= 76) {
          dmg = 24 + this.atkBoost;
          msg = `Compilou com alertas! Causou ${dmg} de dano!`;
        } else {
          dmg = 10;
          msg = `Erro de Sintaxe! O golpe causou apenas ${dmg} de dano.`;
        }
        this.damageBoss(dmg, msg, crit);
      };
    },

    // --- AÇÕES MANUTENÇÃO ---
    manutAttack(baseDmg, tempDelta, name) {
      this.busy = true;
      this.renderMoves();
      this.temp = Math.max(30, Math.min(100, this.temp + tempDelta));
      let dmg = baseDmg;
      if (this.temp >= 85 && Math.random() < 0.35) {
        Sound.error();
        this.setLog(`Superaquecimento (${this.temp}°C)! Lucas perdeu precisão e errou ${name}!`);
        this.updateUI();
        this.finishPlayerTurn();
        return;
      }
      this.damageBoss(dmg, `Lucas usou ${name}! ${dmg} de dano (Temp: ${this.temp}°C).`);
    },
    manutOverclock() {
      this.busy = true;
      this.renderMoves();
      const safeBonus = this.temp <= 62 ? 12 : 0;
      this.temp = Math.min(100, this.temp + 28);
      const dmg = 38 + safeBonus;
      this.damageBoss(
        dmg,
        safeBonus > 0
          ? `❄️ OVERCLOCK SEGURO! Dano massivo de ${dmg}! (Temp subiu para ${this.temp}°C)`
          : `Lucas usou Overclock Turbo! ${dmg} de dano! (Temp: ${this.temp}°C)`,
        safeBonus > 0
      );
    },
    manutCooler() {
      this.busy = true;
      this.renderMoves();
      Sound.heal();
      this.temp = Math.max(32, this.temp - 35);
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
      this.setLog(`Pasta Térmica aplicada! Temperatura caiu para ${this.temp}°C e +22 HP!`);
      this.updateUI();
      this.finishPlayerTurn();
    },

    // --- AÇÕES ADMINISTRAÇÃO ---
    admPitch() {
      this.busy = true;
      this.renderMoves();
      this.budget += 150;
      this.damageBoss(15, 'Lucas fez um Pitch Rápido! Causou 15 de dano e ganhou +R$ 150!');
    },
    admROI() {
      if (this.budget < 400) {
        Sound.error();
        this.setLog('Verba insuficiente (precisa de R$ 400)! Use Pitch Rápido ou Investir.');
        return;
      }
      this.busy = true;
      this.renderMoves();
      this.budget -= 400;
      const bonus = this.market === 'ALTA' ? 14 : 0;
      const dmg = 42 + bonus;
      this.damageBoss(
        dmg,
        bonus > 0 ? `📈 ROI MÁXIMO EM ALTA! Dano incrível de ${dmg}!` : `Lucas disparou ROI Máximo! Causou ${dmg} de dano!`,
        bonus > 0
      );
    },
    admInvest() {
      if (this.budget < 100) {
        Sound.error();
        this.setLog('Sem verba para investir (precisa de R$ 100)! Use Pitch Rápido.');
        return;
      }
      this.busy = true;
      this.renderMoves();
      Sound.select();
      const gain = this.market === 'ALTA' ? 450 : this.market === 'ESTÁVEL' ? 300 : 220;
      this.budget = this.budget - 100 + gain;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 15);
      this.setLog(`Investimento no mercado (${this.market}) rendeu +R$ ${gain - 100} e +15 HP!`);
      this.updateUI();
      this.finishPlayerTurn();
    },
    admContingency() {
      if (this.budget < 150) {
        Sound.error();
        this.setLog('Precisa de R$ 150 para o plano de Contingência!');
        return;
      }
      this.busy = true;
      this.renderMoves();
      Sound.heal();
      this.budget -= 150;
      this.shieldTurn = true;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 28);
      this.setLog('Plano de Contingência ativo! +28 HP e proteção contra o próximo turno!');
      this.updateUI();
      this.finishPlayerTurn();
    },

    // --- AÇÕES REDES ---
    redesFibra() {
      this.busy = true;
      this.renderMoves();
      if (this.ping > 180 && Math.random() < 0.5) {
        Sound.error();
        this.setLog(`📡 PING ALTO (${this.ping}ms)! Pacote perdido! Use Estabilizar Rota!`);
        this.finishPlayerTurn();
        return;
      }
      if (this.firewall) {
        this.damageBoss(10, '🛡️ Firewall bloqueou quase tudo! Apenas 10 de dano. Use Port Scan antes!');
      } else {
        this.damageBoss(48, '⚡ CONEXÃO FIBRA SEM FIREWALL! Dano devastador de 48!', true);
      }
    },
    redesPortScan() {
      this.busy = true;
      this.renderMoves();
      this.firewall = false;
      this.fwDownTurns = 2;
      this.damageBoss(14, '🔓 Port Scan concluído! Firewall derrubado por 2 turnos e 14 de dano!');
    },
    redesStabilize() {
      this.busy = true;
      this.renderMoves();
      Sound.heal();
      this.ping = 20;
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 22);
      this.setLog('Rota estabilizada! Ping caiu para 20ms e Lucas recuperou +22 HP!');
      this.updateUI();
      this.finishPlayerTurn();
    },
    redesICMP() {
      this.busy = true;
      this.renderMoves();
      const dmg = this.firewall ? 16 : 22;
      this.damageBoss(dmg, `Pacote ICMP atravessou a rede! Causou ${dmg} de dano!`);
    },

    // --- FLUXO DE TURNOS ---
    finishPlayerTurn() {
      if (this.bossHp <= 0) {
        setTimeout(() => this.victory(), 900);
        return;
      }
      setTimeout(() => this.bossTurn(), 1050);
    },

    bossTurn() {
      let dmg = 14 + Math.floor(Math.random() * 7);
      let msg = '';

      if (this.area === 'dev') {
        if (this.buggedMoveIdx < 0 && Math.random() < 0.45) {
          this.buggedMoveIdx = Math.random() < 0.5 ? 0 : 1;
          dmg = 12;
          msg = `Falcão & Alysson lançaram BUG CRÍTICO! Um golpe foi corrompido e causou ${dmg} de dano!`;
        } else {
          msg = `Falcão & Alysson usaram Loop Infinito! Lucas sofreu ${dmg} de dano!`;
        }
      } else if (this.area === 'manut') {
        this.temp = Math.min(100, this.temp + 14);
        if (this.temp >= 85) {
          dmg += 10;
          msg = `Igor & Leôncio causaram Sobrecarga! Superaquecimento (${this.temp}°C) deu ${dmg} de dano!`;
        } else {
          msg = `Igor & Leôncio usaram Curto-Circuito! ${dmg} de dano e +14°C no gabinete!`;
        }
      } else if (this.area === 'adm') {
        if (this.shieldTurn) {
          dmg = Math.floor(dmg * 0.4);
          this.shieldTurn = false;
        }
        const markets = ['ALTA', 'ESTÁVEL', 'CRISE'];
        this.market = markets[Math.floor(Math.random() * markets.length)];
        if (Math.random() < 0.45) {
          const cut = Math.min(this.budget, 150);
          this.budget -= cut;
          msg = `Maryanne & Wendila aplicaram Auditoria! -R$ ${cut} e ${dmg} de dano! Mercado: ${this.market}.`;
        } else {
          msg = `Maryanne & Wendila usaram Corte de Custos! ${dmg} de dano! Mercado agora: ${this.market}.`;
        }
      } else if (this.area === 'redes') {
        if (this.fwDownTurns > 0) {
          this.fwDownTurns--;
          if (this.fwDownTurns === 0) this.firewall = true;
        }
        if (Math.random() < 0.5) {
          this.ping = Math.min(360, this.ping + 180);
          msg = `Dudu & Alisson dispararam Ataque DDoS! Ping subiu para ${this.ping}ms e ${dmg} de dano!`;
        } else {
          msg = `Dudu & Alisson usaram Pacote Corrompido! Lucas sofreu ${dmg} de dano!`;
        }
      }

      Sound.hit();
      state.player.hp = Math.max(0, state.player.hp - dmg);
      this.shake('playerSpriteCanvas');
      this.setLog(msg);
      this.updateUI();

      if (state.player.hp <= 0) {
        setTimeout(() => this.defeat(), 1100);
      } else {
        setTimeout(() => {
          this.busy = false;
          this.renderMoves();
        }, 700);
      }
    },

  // --- AÇÕES BATALHA & CONEXÃO COM O GUIA LUCAS ---
    victory() {
      Sound.fanfare();
      const area = this.area;
      const data = BOSS_DATA[area];
      state.progress[area].boss = true;
      state.player.hp = state.player.maxHp;
      document.getElementById('battleOverlay').classList.remove('active');
      updateHUD();

      const earned = countBadges();
      const lines = [
        { speaker: data.name, char: data.char1, char2: data.char2, text: data.winText },
        { speaker: 'HELENA', char: 'helena', text: `Consegui a ${AREA_INFO[area].badge}! (${earned}/4 Insígnias)` }
      ];
      if (earned === 4) {
        lines.push({
          speaker: 'LUCAS',
          char: 'lucas',
          text: 'Helena, você conquistou TODAS as 4 Insígnias! Volte ao Pátio Central e venha falar comigo para assinar o seu contrato!'
        });
      }
      Dialogue.start(lines);
    },

    defeat() {
      Sound.error();
      document.getElementById('battleOverlay').classList.remove('active');
      state.player.hp = state.player.maxHp;
      Dialogue.start([
        { speaker: 'LUCAS', char: 'lucas', text: 'Quase lá, Helena! Eu restaurei suas energias. Respire fundo, use a mecânica especial da sala a seu favor e tente novamente!' }
      ]);
    }
  };

  /* ==========================================================================
     9. CONTRATO INTERATIVO COM ASSINATURA EM CANVAS + HALL DA FAMA
  ========================================================================== */
  let hasSigned = false;

  function openContractScreen() {
    state.mode = 'contract';
    hasSigned = false;
    document.getElementById('contractMsg').textContent = '';
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('contractOverlay').classList.add('active');
  }

  function setupSignaturePad() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    let drawing = false;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      hasSigned = true;
      canvas.setPointerCapture(e.pointerId);
      const p = getPos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    });

    canvas.addEventListener('pointermove', (e) => {
      if (!drawing) return;
      const p = getPos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    });

    canvas.addEventListener('pointerup', () => { drawing = false; });
    canvas.addEventListener('pointercancel', () => { drawing = false; });

    document.getElementById('btnClearSign').onclick = () => {
      Sound.beep();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasSigned = false;
      document.getElementById('contractMsg').textContent = '';
    };

    document.getElementById('btnConfirmSign').onclick = () => {
      if (!hasSigned) {
        Sound.error();
        document.getElementById('contractMsg').textContent = 'Por favor, assine no quadro acima antes de confirmar!';
        return;
      }
      Sound.fanfare();
      state.contractSigned = true;
      document.getElementById('contractOverlay').classList.remove('active');
      document.getElementById('hallOfFameOverlay').classList.add('active');
      state.mode = 'hof';
      renderPortrait('hofLucas', 'lucas');
      renderPortrait('hofHelena', 'helena');
      updateHUD();
    };
  }

  /* ==========================================================================
     10. EXPLORAÇÃO DO MAPA, COLISÃO E INTERAÇÕES
  ========================================================================== */
  let transitioning = false;

  function changeMap(toMap, tx, ty, dir) {
    if (transitioning) return;
    transitioning = true;
    Sound.door();
    const fade = document.getElementById('fadeOverlay');
    fade.classList.add('active');
    setTimeout(() => {
      state.currentMap = toMap;
      state.player.x = tx * TILE + 5;
      state.player.y = ty * TILE + 5;
      state.player.dir = dir;
      updateHUD();
      setTimeout(() => {
        fade.classList.remove('active');
        transitioning = false;
      }, 150);
    }, 200);
  }

  function isSolidAt(px, py) {
    const map = MAPS[state.currentMap];
    const points = [
      { x: px + 2, y: py + 6 },
      { x: px + state.player.w - 2, y: py + 6 },
      { x: px + 2, y: py + state.player.h },
      { x: px + state.player.w - 2, y: py + state.player.h }
    ];

    for (const pt of points) {
      const c = Math.floor(pt.x / TILE);
      const r = Math.floor(pt.y / TILE);
      if (c < 0 || c >= COLS || r < 0 || r >= ROWS) return true;
      const tile = map.grid[r][c];
      if (tile === 1 || tile === 3 || tile === 5 || tile === 7 || tile === 8) return true;

      // Colisão com NPCs e Chefes
      for (const ent of map.entities) {
        if (ent.type === 'sign') continue;
        const ex = ent.x * TILE;
        const ey = ent.y * TILE;
        if (pt.x > ex + 3 && pt.x < ex + TILE - 3 && pt.y > ey + 1 && pt.y < ey + TILE - 2) {
          return true;
        }
      }
    }
    return false;
  }

  function interact() {
    if (state.mode === 'dialogue') {
      Dialogue.nextLine();
      return;
    }
    if (state.mode === 'battle' && Battle.qteResolve) {
      Battle.qteResolve();
      return;
    }
    if (state.mode !== 'explore') return;

    const map = MAPS[state.currentMap];
    const cx = state.player.x + state.player.w / 2;
    const cy = state.player.y + state.player.h / 2;
    let fx = cx, fy = cy;
    if (state.player.dir === 'up') fy -= 24;
    if (state.player.dir === 'down') fy += 24;
    if (state.player.dir === 'left') fx -= 24;
    if (state.player.dir === 'right') fx += 24;

    // Procura entidade próxima à frente ou ao redor
    let target = null;
    let bestDist = 42;
    for (const ent of map.entities) {
      const ex = ent.x * TILE + TILE / 2;
      const ey = ent.y * TILE + TILE / 2;
      const dist = Math.hypot(fx - ex, fy - ey);
      if (dist < bestDist) {
        bestDist = dist;
        target = ent;
      }
    }

    if (!target) return;

    if (target.type === 'guide') {
      talkToHelena();
    } else if (target.type === 'sign' || target.type === 'swing') {
      Dialogue.start([{ speaker: target.type === 'swing' ? 'BALANÇO DA ESCOLA' : 'PLACA DA ESCOLA', char: 'helena', text: target.text }]);
    } else if (target.type === 'mission') {
      startMinigame(target.area, target.mNum);
    } else if (target.type === 'boss') {
      const prog = state.progress[target.area];
      if (prog.boss) {
        const bData = BOSS_DATA[target.area];
        Dialogue.start([
          { speaker: bData.name, char: bData.char1, char2: bData.char2, text: 'Você já venceu nosso desafio e conquistou nossa Insígnia! Parabéns, Helena!' }
        ]);
      } else if (!prog.m1 || !prog.m2) {
        const bData = BOSS_DATA[target.area];
        Dialogue.start([
          { speaker: bData.name, char: bData.char1, char2: bData.char2, text: 'Calma lá, Helena! Antes de nos enfrentar, conclua as 2 missões desta área com os monitores da sala!' }
        ]);
      } else {
        const bData = BOSS_DATA[target.area];
        Dialogue.start(bData.intro, () => Battle.start(target.area));
      }
    }
  }

  /* ==========================================================================
     11. RENDERIZAÇÃO DO MAPA TOP-DOWN (ESTILO POKÉMON FIRERED)
  ========================================================================== */
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  let animTick = 0;

  function drawTile(c, r, tile, theme) {
    const x = c * TILE;
    const y = r * TILE;

    // Fundo base (chão)
    if (theme === 'courtyard') {
      // Chão de madeira rústica e aconchegante para substituir o tom branco
      ctx.fillStyle = (c + r) % 2 === 0 ? '#b45309' : '#92400e';
      ctx.fillRect(x, y, TILE, TILE);
      // Linhas da tábua de madeira
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y + TILE - 4, TILE, 4);
      if (c % 2 === 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(x + TILE / 2 - 1, y, 2, TILE - 4);
      }
    } else if (theme === 'dev') {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#dbeafe' : '#cfe2ff';
      ctx.fillRect(x, y, TILE, TILE);
    } else if (theme === 'manut') {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#ffedd5' : '#fed7aa';
      ctx.fillRect(x, y, TILE, TILE);
    } else if (theme === 'adm') {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#fef9c3' : '#fef08a';
      ctx.fillRect(x, y, TILE, TILE);
    } else {
      ctx.fillStyle = (c + r) % 2 === 0 ? '#ede9fe' : '#ddd6fe';
      ctx.fillRect(x, y, TILE, TILE);
    }

    // Detalhes de cada tipo de tile
    if (tile === 2) {
      // Grama vibrante estilo FireRed
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(x, y, TILE, TILE);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(x + 4, y + 8, 4, 6);
      ctx.fillRect(x + 18, y + 18, 4, 6);
      ctx.fillRect(x + 12, y + 4, 3, 5);
    } else if (tile === 1) {
      if (theme === 'courtyard') {
        // Árvore / Muro escolar
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#166534';
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 8);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(x + 6, y + 4, TILE - 12, 10);
      } else {
        // Parede interna de laboratório
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y + TILE - 6, TILE, 6);
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + 2, y + 2, TILE - 4, 4);
      }
    } else if (tile === 3) {
      // Mobília temática da sala
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + 2, y + 4, TILE - 4, TILE - 6);
      if (theme === 'dev') {
        ctx.fillStyle = '#0ea5e9';
        ctx.fillRect(x + 6, y + 7, TILE - 12, 11);
      } else if (theme === 'manut') {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(x + 5, y + 8, TILE - 10, 10);
      } else if (theme === 'adm') {
        // Mesa com computador / monitor de administração
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + 8, TILE - 4, TILE - 10);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 8, y + 4, 16, 12);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(x + 10, y + 6, 12, 8);
      } else {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(x + 4, y + 4, TILE - 8, TILE - 8);
        ctx.fillStyle = (animTick + c) % 30 < 15 ? '#4ade80' : '#a855f7';
        ctx.fillRect(x + 8, y + 10, 4, 4);
        ctx.fillRect(x + 18, y + 10, 4, 4);
      }
    } else if (tile === 4) {
      // Tapete / Portal de entrada
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
    } else if (tile === 6) {
      // Tapete circular clássico em tons de marrom liso e aconchegante
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 3 + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + TILE / 2, TILE / 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (tile === 7) {
      if (theme === 'adm') {
        // Cadeira de escritório acolchoada na Administração
        ctx.fillStyle = '#334155';
        ctx.fillRect(x + 8, y + 6, TILE - 16, TILE - 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 10, y + 4, TILE - 20, 6);
      } else {
        // Balanço padrão
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(x + 6, y + 2, 3, TILE - 4);
        ctx.fillRect(x + TILE - 9, y + 2, 3, TILE - 4);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(x + 4, y + 16, TILE - 8, 8);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(x + 12, y + 8, 8, 8);
      }
    } else if (tile === 8) {
      // Árvore com tronco sólido e copa verde exuberante
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 10, y + 18, 12, 14);
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(x + TILE / 2, y + 12, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + TILE / 2 - 4, y + 10, 8, 0, Math.PI * 2);
      ctx.fill();
    } else if (tile === 9) {
      // Sofá aconchegante para a sala de Administração
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x + 2, y + 6, TILE - 4, TILE - 10);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 4, y + 8, TILE - 8, TILE - 14);
    }
  }

  function renderGame() {
    const map = MAPS[state.currentMap];
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Tiles
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        drawTile(c, r, map.grid[r][c], map.theme);
      }
    }

    // 2. Entidades (Helena, Monitores de Missão, Chefes)
    map.entities.forEach(ent => {
      if (ent.type === 'sign') return;
      const ex = ent.x * TILE;
      const ey = ent.y * TILE;

      if (ent.type === 'boss') {
        const offsetLeft = ent.area === 'adm' ? -16 : -10;
        const offsetRight = ent.area === 'adm' ? 16 : 12;
        const verticalOffset = ent.area === 'adm' ? 18 : 4;
        drawPixelChar(ctx, ex + offsetLeft, ey + verticalOffset, 28, ent.char, 'down', 0);
        drawPixelChar(ctx, ex + offsetRight, ey + verticalOffset, 28, ent.char2, 'down', 0);
        const prog = state.progress[ent.area];
        const tag = prog.boss ? '★ VENCIDOS' : (prog.m1 && prog.m2) ? '⚔️ DESAFIAR!' : '🔒 FAÇA 2 MISSÕES';
        drawFloatingTag(ex + 16, ey - 6, tag, prog.boss ? '#16a34a' : (prog.m1 && prog.m2) ? '#dc2626' : '#475569');
      } else {
        drawPixelChar(ctx, ex + 2, ey + 2, 28, ent.char, 'down', 0);
        if (ent.type === 'guide') {
          const allDone = countBadges() === 4 && !state.contractSigned;
          drawFloatingTag(ex + 16, ey - 4, allDone ? '★ CONTRATO!' : 'LUCAS', allDone ? '#ca8a04' : '#2563eb');
        } else if (ent.type === 'mission') {
          const done = state.progress[ent.area]['m' + ent.mNum];
          drawFloatingTag(ex + 16, ey - 4, done ? `✓ M${ent.mNum}` : `! MISSÃO ${ent.mNum}`, done ? '#15803d' : '#2563eb');
        }
      }
    });

    // 3. Jogador (Helena)
    drawPixelChar(ctx, state.player.x - 3, state.player.y - 4, 28, 'helena', state.player.dir, state.player.frame);

    // 4. Rótulos das Portas/Setores
    if (map.labels) {
      map.labels.forEach(lbl => {
        drawFloatingTag(lbl.x * TILE + 16, lbl.y * TILE, lbl.text, '#0f172a', lbl.color);
      });
    }
  }

  function drawFloatingTag(cx, cy, text, bg = '#0f172a', color = '#fff') {
    ctx.save();
    ctx.font = 'bold 8px monospace';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = bg;
    ctx.fillRect(cx - w / 2, cy - 8, w, 12);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - w / 2, cy - 8, w, 12);
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, cx, cy + 1);
    ctx.restore();
  }

  /* ==========================================================================
     12. LOOP PRINCIPAL
  ========================================================================== */
  function updatePlayer() {
    if (state.mode !== 'explore' || transitioning) return;

    const speed = 2.4;
    let dx = 0, dy = 0;
    if (state.keys.up) { dy = -speed; state.player.dir = 'up'; }
    else if (state.keys.down) { dy = speed; state.player.dir = 'down'; }
    else if (state.keys.left) { dx = -speed; state.player.dir = 'left'; }
    else if (state.keys.right) { dx = speed; state.player.dir = 'right'; }

    if (dx !== 0 || dy !== 0) {
      const nx = state.player.x + dx;
      const ny = state.player.y + dy;
      if (!isSolidAt(nx, state.player.y)) state.player.x = nx;
      if (!isSolidAt(state.player.x, ny)) state.player.y = ny;

      state.player.stepTimer++;
      if (state.player.stepTimer % 10 === 0) {
        state.player.frame = (state.player.frame + 1) % 2;
      }

      // Verifica portais de transição
      const map = MAPS[state.currentMap];
      const pc = Math.floor((state.player.x + state.player.w / 2) / TILE);
      const pr = Math.floor((state.player.y + state.player.h / 2) / TILE);
      for (const p of map.portals) {
        if (p.x === pc && p.y === pr) {
          changeMap(p.to, p.tx, p.ty, p.dir);
          break;
        }
      }
    } else {
      state.player.frame = 0;
    }
  }

  function gameLoop() {
    animTick++;
    updatePlayer();
    renderGame();
    requestAnimationFrame(gameLoop);
  }

  /* ==========================================================================
     13. EVENTOS DE TECLADO, MOUSE E CONTROLES GBA
  ========================================================================== */
  function startGameFromTitle() {
    if (state.mode !== 'title') return;
    Sound.success();
    document.getElementById('titleScreen').classList.remove('active');
    state.mode = 'explore';
    updateHUD();

    if (!state.introSeen) {
      state.introSeen = true;
      Dialogue.start([
        { speaker: 'HELENA', char: 'helena', text: 'Olá, Lucas Ferreira! Seja muito bem-vindo à EEEP Jaime Alencar de Oliveira!' },
        { speaker: 'LUCAS FERREIRA', char: 'lucas', text: 'Oi, Helena! Eu sou aluno da Escola Johnson e vim conhecer o curso de Desenvolvimento de Sistemas.' },
        { speaker: 'HELENA', char: 'helena', text: 'Eu vou ser a sua guia! Aqui temos 4 áreas incríveis: Desenvolvimento, Manutenção, Administração e Redes.' },
        { speaker: 'HELENA', char: 'helena', text: 'Em cada sala, complete as 2 missões práticas e depois derrote a dupla de Chefes para ganhar as 4 Insígnias. Pode falar comigo no pátio sempre que precisar de ajuda!' }
      ]);
    }
  }

  function resetGame() {
    Sound.beep();
    state.currentMap = 'courtyard';
    state.player.x = 7 * TILE + 5;
    state.player.y = 7 * TILE + 5;
    state.player.dir = 'up';
    state.player.hp = 100;
    state.contractSigned = false;
    state.introSeen = false;
    ['dev', 'manut', 'adm', 'redes'].forEach(k => {
      state.progress[k] = { m1: false, m2: false, boss: false };
    });
    document.getElementById('hallOfFameOverlay').classList.remove('active');
    document.getElementById('titleScreen').classList.add('active');
    state.mode = 'title';
    updateHUD();
  }

  // Teclado
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
      if (state.mode !== 'contract') e.preventDefault();
    }

    if (state.mode === 'title' && (k === 'enter' || k === ' ' || k === 'z')) {
      startGameFromTitle();
      return;
    }

    if (k === 'arrowup' || k === 'w') state.keys.up = true;
    if (k === 'arrowdown' || k === 's') state.keys.down = true;
    if (k === 'arrowleft' || k === 'a') state.keys.left = true;
    if (k === 'arrowright' || k === 'd') state.keys.right = true;

    if (k === 'z' || k === 'enter' || k === ' ') {
      interact();
    }
    if (k === 'x' || k === 'escape') {
      if (state.mode === 'minigame') closeMinigame();
    }
  });

  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') state.keys.up = false;
    if (k === 'arrowdown' || k === 's') state.keys.down = false;
    if (k === 'arrowleft' || k === 'a') state.keys.left = false;
    if (k === 'arrowright' || k === 'd') state.keys.right = false;
  });

  // D-Pad na Tela (Mouse + Touch)
  document.querySelectorAll('.dpad-btn').forEach(btn => {
    const dir = btn.dataset.dir;
    const press = (e) => {
      e.preventDefault();
      state.keys[dir] = true;
      btn.classList.add('pressed');
    };
    const release = (e) => {
      e.preventDefault();
      state.keys[dir] = false;
      btn.classList.remove('pressed');
    };
    btn.addEventListener('mousedown', press);
    btn.addEventListener('mouseup', release);
    btn.addEventListener('mouseleave', release);
    btn.addEventListener('touchstart', press, { passive: false });
    btn.addEventListener('touchend', release, { passive: false });
    btn.addEventListener('touchcancel', release, { passive: false });
  });

  // Botões GBA e UI
  document.getElementById('btnStartGame').onclick = startGameFromTitle;
  document.getElementById('dialogueOverlay').onclick = () => Dialogue.nextLine();
  document.getElementById('mgExitBtn').onclick = closeMinigame;
  document.getElementById('btnQteStop').onclick = () => { if (Battle.qteResolve) Battle.qteResolve(); };

  document.getElementById('btnA').onclick = () => {
    if (state.mode === 'title') startGameFromTitle();
    else interact();
  };
  document.getElementById('btnB').onclick = () => {
    if (state.mode === 'minigame') closeMinigame();
    else if (state.mode === 'dialogue') Dialogue.nextLine();
  };
  document.getElementById('btnGuide').onclick = () => {
    if (state.mode === 'explore') talkToHelena();
  };

  document.getElementById('btnAudio').onclick = () => {
    Sound.enabled = !Sound.enabled;
    document.getElementById('btnAudio').textContent = Sound.enabled ? '🔊 SOM' : '🔇 MUDO';
    if (Sound.enabled) {
      Sound.beep();
      if (state.mode === 'explore') Sound.setBgm('explore');
      else if (state.mode === 'battle') Sound.setBgm('battle');
    } else {
      Sound.stopBgm();
    }
  };

  document.getElementById('btnSaveGame').onclick = () => {
    Sound.select();
    Storage.save();
  };

  document.getElementById('btnContinueGame').onclick = () => {
    if (Storage.load()) {
      Sound.success();
      document.getElementById('titleScreen').classList.remove('active');
      state.mode = 'explore';
      updateHUD();
      if (Sound.enabled) Sound.setBgm('explore');
      Dialogue.start([
        { speaker: 'HELENA', char: 'helena', text: 'Jogo carregado com sucesso! Bem-vindo de volta à EEEP Jaime Alencar, Lucas.' }
      ]);
    }
  };

  document.getElementById('btnContinueExplore').onclick = () => {
    Sound.beep();
    document.getElementById('hallOfFameOverlay').classList.remove('active');
    state.mode = 'explore';
  };
  document.getElementById('btnRestartGame').onclick = resetGame;

  /* ==========================================================================
     14. INICIALIZAÇÃO
  ========================================================================== */
  window.onload = () => {
    renderPortrait('titleLucas', 'lucas');
    renderPortrait('titleHelena', 'helena');
    setupSignaturePad();
    if (Storage.hasSave()) {
      const btnCont = document.getElementById('btnContinueGame');
      if (btnCont) btnCont.style.display = 'inline-block';
    }
    updateHUD();
    gameLoop();
  };
})();
