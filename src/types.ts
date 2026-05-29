export type Platform = 'Steam' | 'PS4' | 'PS5' | 'Xbox' | 'Android' | 'iOS';

export type WeaponType = 'ar' | 'shotgun' | 'sniper' | 'rpg' | 'pickaxe' | 'medkit' | 'shield' | 'chug';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Weapon {
  id: string;
  name: string;
  type: WeaponType;
  rarity: Rarity;
  damage: number;
  fireRate: number; // speed in ms between shots
  reloadTime: number; // reload speed in ms
  magazineSize: number;
  ammo: number; // current ammo in magazine
  reserveAmmo: number; // total extra ammo
  range: number;
  color: string;
  spread: number;
  bulletSpeed: number;
  healingAmount?: number;
}

export type PlayerState = 'lobby' | 'skydiving' | 'gliding' | 'alive' | 'spectating' | 'dead';

export interface CharacterSkin {
  id: string;
  name: string;
  color: string;
  detailsColor: string;
  accColor: string; // Accessory color
  abilityName: string;
  abilityDesc: string;
  abilityType: 'speed_boost' | 'shield_armor' | 'moon_jump' | 'teleport' | 'minecraft_miner';
  abilityIcon: string;
}

export interface Player {
  id: string;
  name: string;
  platform: Platform;
  skinId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  wood: number;
  state: PlayerState;
  activeSlot: number;
  inventory: (Weapon | null)[]; // 5 inventory weapon slots + pickaxe always on slot 0
  isReloading: boolean;
  reloadTimeRemaining: number;
  lastShotTime: number;
  kills: number;
  isBot: boolean;
  isBuilding: boolean;
  selectedBuildMaterial: 'wood' | 'stone' | 'metal';
  targetBuildType: 'wall' | 'ramp' | 'floor';
  glideProgress: number; // 0 to 1 for skydiving landing
  targetLandingX?: number;
  targetLandingY?: number;
}

export interface Bot extends Player {
  aiState: 'looting' | 'harvesting' | 'wandering' | 'fleeing' | 'attacking' | 'building' | 'landing_sky';
  aiTargetX: number;
  aiTargetY: number;
  aiTargetId: string | null;
  aiLastDecisionTime: number;
  aiAlertness: number; // 0-1 (attention span)
  aiBuildChance: number; // probability of building walls when shot
}

export interface Structure {
  id: string;
  x: number;
  y: number;
  type: 'wall' | 'ramp' | 'floor';
  hp: number;
  maxHp: number;
  angle: number; // Rotation: 0, 90, 180, 270 degrees
  teamId: string; // Creator ID
  createdAt: number;
  width: number;
  height: number;
}

export interface Chest {
  id: string;
  x: number;
  y: number;
  opened: boolean;
  glowing: boolean;
}

export interface LootItem {
  id: string;
  x: number;
  y: number;
  weapon: Weapon;
  quantity?: number;
  glowRotation: number;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  ownerId: string;
  type: WeaponType;
  rangeRemaining: number;
  radius: number;
  color: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  decay: number;
  size: number;
  color: string;
  type: 'spark' | 'dust' | 'wood' | 'shield' | 'explosion' | 'smoke';
}

export interface DamageText {
  id: string;
  x: number;
  y: number;
  text: string;
  life: number; // 0 to 1
  color: string;
  isShield: boolean;
}

export interface AudioVisualCue {
  id: string;
  type: 'shoot' | 'chest' | 'footstep';
  x: number;
  y: number;
  angle: number;
  distance: number;
  time: number; // expiration
}

export interface SoundState {
  muted: boolean;
}

export interface StormPhase {
  duration: number; // total duration in game-ticks or seconds
  durationRemaining: number;
  shrinkSpeed: number;
  damagePerSec: number;
  safeX: number;
  safeY: number;
  safeRadius: number;
  targetSafeRadius: number;
  state: 'waiting' | 'shrinking';
}

export interface ResourceNode {
  id: string;
  x: number;
  y: number;
  type: 'tree' | 'rock';
  woodYield: number;
  hp: number;
  maxHp: number;
  radius: number;
}

export interface GameSettings {
  initialBotCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode?: 'classic' | 'spectator' | 'snipers' | 'pickaxe';
  is3dMode?: boolean;
}
