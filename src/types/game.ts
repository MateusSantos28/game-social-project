export type GameMode =
  | 'title'
  | 'explore'
  | 'dialogue'
  | 'minigame'
  | 'battle'
  | 'contract'
  | 'hof';

export type Direction = 'up' | 'down' | 'left' | 'right';

export type AreaKey = 'courtyard' | 'dev' | 'manut' | 'adm' | 'redes';

export interface AreaProgress {
  m1: boolean;
  m2: boolean;
  boss: boolean;
}

export interface ProgressState {
  dev: AreaProgress;
  manut: AreaProgress;
  adm: AreaProgress;
  redes: AreaProgress;
}

export interface PlayerState {
  x: number;
  y: number;
  w: number;
  h: number;
  dir: Direction;
  frame: number;
  stepTimer: number;
  hp: number;
  maxHp: number;
}

export interface KeysState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export interface Portal {
  x: number;
  y: number;
  to: AreaKey;
  tx: number;
  ty: number;
  dir: Direction;
}

export interface MapLabel {
  text: string;
  x: number;
  y: number;
  color: string;
}

export type EntityType = 'guide' | 'sign' | 'swing' | 'mission' | 'boss' | 'sofa';

export interface BaseEntity {
  id: string;
  type: EntityType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  name?: string;
  char?: string;
  char2?: string;
}

export interface GuideEntity extends BaseEntity {
  type: 'guide';
}

export interface SignEntity extends BaseEntity {
  type: 'sign' | 'swing';
  text: string;
}

export interface MissionEntity extends BaseEntity {
  type: 'mission';
  area: AreaKey;
  mNum: 1 | 2;
}

export interface BossEntity extends BaseEntity {
  type: 'boss';
  area: AreaKey;
  char: string;
  char2: string;
}

export interface SofaEntity extends BaseEntity {
  type: 'sofa';
  w: number;
  h: number;
}

export type GameEntity = GuideEntity | SignEntity | MissionEntity | BossEntity | SofaEntity;

export interface MapData {
  theme: AreaKey;
  areaKey?: AreaKey;
  grid: number[][];
  labels?: MapLabel[];
  portals: Portal[];
  entities: GameEntity[];
}

export interface DialogueLine {
  speaker: string;
  char?: string;
  char2?: string;
  text: string;
}

export interface AreaInfo {
  name: string;
  color: string;
  badge?: string;
  bosses?: string;
}

export interface BossData {
  name: string;
  char1: string;
  char2: string;
  theme: string;
  maxHp: number;
  intro: DialogueLine[];
  winText: string;
}

export interface BattleMove {
  name: string;
  meta: string;
  fn: () => void;
  corrupted?: boolean;
}

export interface SaveData {
  progress: ProgressState;
  contractSigned: boolean;
  introSeen: boolean;
  currentMap: AreaKey;
  player: {
    x: number;
    y: number;
    dir: Direction;
    hp: number;
    maxHp: number;
  };
  savedAt: number;
}
