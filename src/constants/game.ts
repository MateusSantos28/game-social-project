import { AreaInfo, AreaKey } from '../types/game';

export const TILE = 32;
export const COLS = 15;
export const ROWS = 10;
export const PLAYER_SPEED = 2.4;
export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 320;

export const AREA_INFO: Record<AreaKey, AreaInfo> = {
  courtyard: {
    name: 'PÁTIO — JAIME ALENCAR',
    color: '#16a34a'
  },
  dev: {
    name: 'LAB. DESENVOLVIMENTO',
    color: '#2563eb',
    badge: 'Insígnia do Código',
    bosses: 'Falcão & Alysson Gabriel'
  },
  manut: {
    name: 'OFICINA DE MANUTENÇÃO',
    color: '#ea580c',
    badge: 'Insígnia do Hardware',
    bosses: 'Igor & Leôncio'
  },
  adm: {
    name: 'SALA DE ADMINISTRAÇÃO',
    color: '#ca8a04',
    badge: 'Insígnia da Gestão',
    bosses: 'Maryanne & Wendila'
  },
  redes: {
    name: 'CENTRAL DE REDES',
    color: '#7c3aed',
    badge: 'Insígnia da Conexão',
    bosses: 'Dudu & Alisson Coelho'
  }
};

export interface CharPalette {
  hair: string;
  cap: string;
  skin: string;
  shirt: string;
  pants: string;
  accent: string;
}

export const CHAR_PALETTES: Record<string, CharPalette> = {
  helena: {
    hair: '#7c2d12',
    cap: '#facc15',
    skin: '#f6d2a8',
    shirt: '#ec4899',
    pants: '#312e81',
    accent: '#fde047'
  },
  lucas: {
    hair: '#1e1b4b',
    cap: '#dc2626',
    skin: '#f5cfa0',
    shirt: '#2563eb',
    pants: '#1e293b',
    accent: '#ffffff'
  },
  falcao: {
    hair: '#0f172a',
    cap: '#0284c7',
    skin: '#e6b88a',
    shirt: '#0f172a',
    pants: '#1e3a8a',
    accent: '#38bdf8'
  },
  alysson: {
    hair: '#3f2718',
    cap: '#1d4ed8',
    skin: '#f0c497',
    shirt: '#1e40af',
    pants: '#0f172a',
    accent: '#60a5fa'
  },
  igor: {
    hair: '#1c1917',
    cap: '#ea580c',
    skin: '#e8ba8c',
    shirt: '#c2410c',
    pants: '#292524',
    accent: '#fdba74'
  },
  leoncio: {
    hair: '#451a03',
    cap: '#f97316',
    skin: '#d8a574',
    shirt: '#44403c',
    pants: '#1c1917',
    accent: '#fb923c'
  },
  maryanne: {
    hair: '#450a0a',
    cap: '#eab308',
    skin: '#f5cfa0',
    shirt: '#a16207',
    pants: '#1f2937',
    accent: '#fef08a'
  },
  wendila: {
    hair: '#1f2937',
    cap: '#ca8a04',
    skin: '#e0ad7e',
    shirt: '#854d0e',
    pants: '#111827',
    accent: '#fde047'
  },
  dudu: {
    hair: '#0f172a',
    cap: '#7c3aed',
    skin: '#e8ba8c',
    shirt: '#5b21b6',
    pants: '#0f172a',
    accent: '#4ade80'
  },
  alisson: {
    hair: '#27272a',
    cap: '#6d28d9',
    skin: '#f2c89c',
    shirt: '#312e81',
    pants: '#09090b',
    accent: '#a78bfa'
  },
  npc: {
    hair: '#334155',
    cap: '#0ea5e9',
    skin: '#f2c89c',
    shirt: '#0f766e',
    pants: '#1e293b',
    accent: '#99f6e4'
  }
};
