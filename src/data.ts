import { Weapon, Rarity, WeaponType, Platform, CharacterSkin } from './types';

export const PLATFORMS: Platform[] = ['Steam', 'PS4', 'PS5', 'Xbox', 'Android', 'iOS'];

export const PLATFORM_DETAILS = {
  Steam: { name: 'Steam', color: '#5a9fda', prefix: '💻' },
  PS4: { name: 'PS4', color: '#377aeb', prefix: '🎮' },
  PS5: { name: 'PS5', color: '#e5e7eb', prefix: '🎮' },
  Xbox: { name: 'Xbox', color: '#10bc10', prefix: '🟢' },
  Android: { name: 'Android', color: '#3ddc84', prefix: '📱' },
  iOS: { name: 'iOS', color: '#a3aaae', prefix: '📱' },
};

export const CHARACTER_SKINS: CharacterSkin[] = [
  { 
    id: 'recruit', 
    name: 'العميل المجهول (Recruit)', 
    color: '#4b5320', 
    detailsColor: '#8b5a2b', 
    accColor: '#d2b48c',
    abilityName: '⚡ سرعة البرق الخارقة',
    abilityDesc: 'زيادة دائمة لسرعة الجري والمناورة بنسبة 18% لتفادي رصاص الأعداء والهروب السريع.',
    abilityType: 'speed_boost',
    abilityIcon: '⚡'
  },
  { 
    id: 'knight', 
    name: 'الفارس المظلم (Shield Knight)', 
    color: '#1f2937', 
    detailsColor: '#3b82f6', 
    accColor: '#ffd700',
    abilityName: '🛡️ حصن الدرع المتجدد',
    abilityDesc: 'تجديد تلقائي لدرع الحماية بمقدار 2 نقاط كل ثانيتين بشكل مستمر، بالإضافة لزيادة سعة الدم القصوى لـ 125.',
    abilityType: 'shield_armor',
    abilityIcon: '🛡️'
  },
  { 
    id: 'astronaut', 
    name: 'رائد الفضاء (Void Ranger)', 
    color: '#f3f4f6', 
    detailsColor: '#f97316', 
    accColor: '#1e3a8a',
    abilityName: '🚀 قفزة جاذبية القمر',
    abilityDesc: 'القفز بارتفاع شاهق يصل إلى 3 أضعاف مع هبوط مظلي هادئ يحاكيك لأسلوب الملاحة والتحرك الفضائي.',
    abilityType: 'moon_jump',
    abilityIcon: '🚀'
  },
  { 
    id: 'ninja', 
    name: 'النينجا الأسطوري (Neon Ninja)', 
    color: '#090d16', 
    detailsColor: '#ec4899', 
    accColor: '#a855f7',
    abilityName: '🔮 تفادي الانتقال الآني اللحظي',
    abilityDesc: 'تمكنك من الوميض والتخفي الآني (Blink/Teleport) للأمام بمقدار 110 بكسل لتفادي طلقات القناص والخرطوش.',
    abilityType: 'teleport',
    abilityIcon: '🔮'
  },
  { 
    id: 'constructor', 
    name: 'البنّاء الماينكرافتي (Steve Builder)', 
    color: '#eab308', 
    detailsColor: '#1e293b', 
    accColor: '#ef4444',
    abilityName: '🧱 مُنقّب الموارد والصناعة الذكية',
    abilityDesc: 'الحصول على مضاعفات موارد مضاعفة عند تكسير الأشجار والصخور؛ مع فتح قائمة صناعة ودمج الموارد (Minecraft Crafting) لصناعة الأدوات الذهبية ومشروبات الدرع مجاناً.',
    abilityType: 'minecraft_miner',
    abilityIcon: '🧱'
  }
];

export const MAP_LOCATIONS = [
  { name: 'المدينة المائلة (Tilted Towers)', x: 2400, y: 2400, radius: 260, color: '#f59e0b' },
  { name: 'الحدائق الهادئة (Pleasant Park)', x: 1200, y: 1200, radius: 220, color: '#10b981' },
  { name: 'مقبرة الخردة (Junk Junction)', x: 800, y: 3600, radius: 190, color: '#6b7280' },
  { name: 'مستودع الغبار (Dusty Depot)', x: 3400, y: 1500, radius: 200, color: '#ef4444' },
  { name: 'البحيرة الكسولة (Lazy Lake)', x: 3600, y: 3400, radius: 230, color: '#3b82f6' },
  { name: 'صف التجزئة (Retail Row)', x: 1800, y: 3400, radius: 210, color: '#8b5cf6' },
  { name: 'الصحراء الملعونة (Shifty Sands)', x: 3800, y: 800, radius: 220, color: '#f59e0b' },
  { name: 'المعسكر السري (Secret Outpost)', x: 800, y: 2200, radius: 180, color: '#10b981' },
  { name: 'الأبراج القطبية (Polar Peaks)', x: 1400, y: 4200, radius: 200, color: '#38bdf8' },
  { name: 'غابة المستنقعات (Moisty Mire)', x: 4200, y: 4200, radius: 230, color: '#15803d' },
  { name: 'مصنع الموت (Factory Outlaw)', x: 4400, y: 2200, radius: 190, color: '#475569' },
  { name: 'مخيم الجبال (Mountain Ridge)', x: 2400, y: 600, radius: 210, color: '#ea580c' },
];

export const BOT_NAMES = [
  'ابو_فلة_PRO', 'المدمر_العربي', 'شيطان_المائل', 'قناص_الجزيرة', 'المحترف_99',
  'صائد_القلوب', 'الملك_المميت', 'Ninja_Arab', 'SavageGlider', 'Fort_Sniper',
  'X_DarkKnight', 'Gamer77', 'WreckingCrew', 'TiltedKing', 'NoobSlayer',
  'GoldenLlama', 'PS5_Master', 'SpeedyBuilds', 'StormRunner', 'BushCamper12',
  'الفتى_الذهبي', 'طبيب_الساحة', 'شبح_الضباب', 'فورت_أر_العرب', 'المصمم_الخارق',
  'ApexWeb_Gamer', 'ConsoleWarrior', 'AndroidBoss', 'SteamDeck_Gamer', 'iOS_TapMaster',
  'احمد_ببجي_فورت', 'الوحش_الكاسر', 'بركان_الغضب', 'رصاصة_الموت', 'الصقر_الحر',
  'StormFeeder', 'BushChallenger', 'LlamaHunter', 'WallSpammer', 'DustyDepotRuler',
  'Tilted_Sweat', 'RampRushGod', 'DoublePumpPro', 'ScarSpecialist', 'RPG_Spammer',
  'Spectre_BR', 'Gamer_XboxOne', 'ApexStreamer', 'SilentCreeper', 'VictoryRoyale77'
];

export const WEAPON_TEMPLATES = {
  ar: { name: 'Assault Rifle (M4/SCAR)', dmg: [28, 30, 33, 35, 38], fireRate: 155, reload: 1500, mag: 30 },
  shotgun: { name: 'Pump Shotgun', dmg: [75, 80, 85, 92, 100], fireRate: 850, reload: 2000, mag: 5 },
  sniper: { name: 'Bolt-Action Sniper', dmg: [95, 105, 115, 125, 138], fireRate: 1800, reload: 2500, mag: 1 },
  rpg: { name: 'Rocket Launcher', dmg: [90, 100, 110, 115, 125], fireRate: 1500, reload: 3000, mag: 1 },
  pickaxe: { name: 'Harvesting Pickaxe', dmg: [20, 20, 20, 20, 20], fireRate: 250, reload: 0, mag: 1 }
};

export function generateWeapon(type: WeaponType, rarity: Rarity): Weapon {
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const rarityIndex = rarities.indexOf(rarity);
  
  const rarityColors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#eab308'
  };

  const namePrefix = {
    common: 'رمادي صامد (Common)',
    uncommon: 'أخضر بري (Uncommon)',
    rare: 'أزرق مميز (Rare)',
    epic: 'بنفسجي ملحمي (Epic)',
    legendary: 'ذهبي أسطوري (Legendary)'
  };

  if (type === 'pickaxe') {
    return {
      id: 'pickaxe',
      name: 'معول الحصاد الافتراضي',
      type: 'pickaxe',
      rarity: 'common',
      damage: 20,
      fireRate: 350,
      reloadTime: 0,
      magazineSize: 1,
      ammo: 1,
      reserveAmmo: 0,
      range: 55,
      color: '#6b7280',
      spread: 0,
      bulletSpeed: 0
    };
  }

  if (type === 'medkit') {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: 'حقيبة إسعافات أولية (Medkit)',
      type: 'medkit',
      rarity: 'uncommon',
      damage: 0,
      fireRate: 4000, // takes 4 seconds to consume
      reloadTime: 1000,
      magazineSize: 1,
      ammo: 1,
      reserveAmmo: 2,
      range: 0,
      color: '#ef4444',
      spread: 0,
      bulletSpeed: 0,
      healingAmount: 100
    };
  }

  if (type === 'shield') {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: 'مشروب الدرع الصغير (Mini Shield)',
      type: 'shield',
      rarity: 'rare',
      damage: 0,
      fireRate: 2000, // takes 2 seconds
      reloadTime: 1000,
      magazineSize: 1,
      ammo: 1,
      reserveAmmo: 3,
      range: 0,
      color: '#3b82f6',
      spread: 0,
      bulletSpeed: 0,
      healingAmount: 25
    };
  }

  if (type === 'chug') {
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: 'المشروب الخارق (Big Shield Potion)',
      type: 'chug',
      rarity: 'epic',
      damage: 0,
      fireRate: 3000, // takes 3 seconds
      reloadTime: 1000,
      magazineSize: 1,
      ammo: 1,
      reserveAmmo: 2,
      range: 0,
      color: '#ffd700',
      spread: 0,
      bulletSpeed: 0,
      healingAmount: 50
    };
  }

  const temp = WEAPON_TEMPLATES[type as keyof typeof WEAPON_TEMPLATES] || WEAPON_TEMPLATES.ar;
  const rawDamage = temp.dmg[rarityIndex];
  const color = rarityColors[rarity];
  const prefix = namePrefix[rarity];

  let range = 600;
  let spread = 0.05;
  let bulletSpeed = 22;

  if (type === 'shotgun') {
    range = 150;
    spread = 0.22;
    bulletSpeed = 16;
  } else if (type === 'sniper') {
    range = 1800;
    spread = 0.001;
    bulletSpeed = 35;
  } else if (type === 'rpg') {
    range = 1000;
    spread = 0.02;
    bulletSpeed = 10;
  }

  const arabicTypeName = 
    type === 'ar' ? 'بندقية هجومية SCAR' :
    type === 'shotgun' ? 'بندقية الخرطوش Pump' :
    type === 'sniper' ? 'قناصة الرصاصة الواحدة' : 'قاذف صواريخ RPG';

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${prefix} - ${arabicTypeName}`,
    type,
    rarity,
    damage: rawDamage,
    fireRate: temp.fireRate,
    reloadTime: temp.reload,
    magazineSize: temp.mag,
    ammo: temp.mag,
    reserveAmmo: temp.mag * 3,
    range,
    color,
    spread,
    bulletSpeed
  };
}

// Generate random dynamic chest drops resembling Fortnite
export function generateChestLoot(): (Weapon)[] {
  const items: Weapon[] = [];
  
  // Decide weapon type
  const roll = Math.random();
  let type: WeaponType = 'ar';
  if (roll < 0.40) type = 'ar';
  else if (roll < 0.70) type = 'shotgun';
  else if (roll < 0.90) type = 'sniper';
  else type = 'rpg';

  // Decide rarity
  const rRoll = Math.random();
  let rarity: Rarity = 'common';
  if (rRoll < 0.40) rarity = 'uncommon';
  else if (rRoll < 0.75) rarity = 'rare';
  else if (rRoll < 0.92) rarity = 'epic';
  else rarity = 'legendary';

  items.push(generateWeapon(type, rarity));

  // healing item
  const hRoll = Math.random();
  if (hRoll < 0.4) {
    items.push(generateWeapon('shield', 'rare'));
  } else if (hRoll < 0.7) {
    items.push(generateWeapon('medkit', 'uncommon'));
  } else {
    items.push(generateWeapon('chug', 'epic'));
  }

  return items;
}

// === WEB AUDIO SYNTHESIS ===
let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    // Standard AudioContext initialization with fallback
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const playSynthesizedSound = (type: 'shoot' | 'shoot_shotgun' | 'shoot_sniper' | 'shoot_rpg' | 'reload' | 'build' | 'harvest' | 'shield_break' | 'chest_hum' | 'victory' | 'damage' | 'explosion') => {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'shoot': {
        // Assault Rifle high quality synthesis (white noise + pop)
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(600, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.12);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.linearRampToValueAtTime(0.01, now + 0.14);

        // Add a clean synth click/pop
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.08);
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.linearRampToValueAtTime(0.01, now + 0.08);

        noise.connect(noiseFilter);
        noiseFilter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.connect(oscGain);
        oscGain.connect(ctx.destination);

        noise.start(now);
        osc.start(now);
        noise.stop(now + 0.15);
        osc.stop(now + 0.1);
        break;
      }
      case 'shoot_shotgun': {
        // Broad blast with multiple noise triggers
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.15);
        oscGain.gain.setValueAtTime(0.4, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(oscGain);
        oscGain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);

        // Crackle noise burst
        const bufferSize = ctx.sampleRate * 0.2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.25);
        break;
      }
      case 'shoot_sniper': {
        // Deep powerful thud
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc2.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        osc2.frequency.setValueAtTime(80, now);
        osc2.frequency.setValueAtTime(35, now + 0.3);
        
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.4);
        osc2.stop(now + 0.4);
        break;
      }
      case 'shoot_rpg': {
        // Deep woosh noise rocket
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.4); // WHOOSH rises
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'explosion': {
        // Giant noise bang
        const bufferSize = ctx.sampleRate * 0.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.4);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.48);
        noise.connect(filter).connect(gain).connect(ctx.destination);
        noise.start(now);
        noise.stop(now + 0.5);
        break;
      }
      case 'reload': {
        // Clicking reloader noise (snappy quick clicks)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.setValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.setValueAtTime(0.01, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }
      case 'build': {
        // Wooden hollow thud sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        
        // click
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(600, now);
        clickGain.gain.setValueAtTime(0.1, now);
        clickGain.gain.linearRampToValueAtTime(0.01, now + 0.03);
        click.connect(clickGain).connect(ctx.destination);

        osc.start(now);
        click.start(now);
        osc.stop(now + 0.16);
        click.stop(now + 0.05);
        break;
      }
      case 'harvest': {
        // Pickaxe hitting wood or stone
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        click.type = 'triangle';
        click.frequency.setValueAtTime(2000, now);
        clickGain.gain.setValueAtTime(0.15, now);
        clickGain.gain.linearRampToValueAtTime(0.01, now + 0.02);
        
        osc.connect(gain).connect(ctx.destination);
        click.connect(clickGain).connect(ctx.destination);
        osc.start(now);
        click.start(now);
        osc.stop(now + 0.13);
        click.stop(now + 0.03);
        break;
      }
      case 'shield_break': {
        // Glass shardy static sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.35);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
      case 'chest_hum': {
        // Low warm magical chest humming
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160 + Math.sin(now * 12) * 5, now); // vibrato
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'damage': {
        // Crunch / ouch sound for hit markers
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.setValueAtTime(100, now + 0.06);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'victory': {
        // Epic Fortnite victory synth chord progression!
        const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C chord
        const durations = [0, 0.1, 0.2, 0.3];
        notes.forEach((freq, idx) => {
          const oscNote = ctx.createOscillator();
          const gainNote = ctx.createGain();
          oscNote.type = 'square';
          oscNote.frequency.setValueAtTime(freq, now + durations[idx]);
          oscNote.frequency.linearRampToValueAtTime(freq * 1.5, now + durations[idx] + 0.6);
          gainNote.gain.setValueAtTime(0.12, now + durations[idx]);
          gainNote.gain.exponentialRampToValueAtTime(0.001, now + durations[idx] + 0.7);
          oscNote.connect(gainNote).connect(ctx.destination);
          oscNote.start(now + durations[idx]);
          oscNote.stop(now + durations[idx] + 0.8);
        });
        break;
      }
    }
  } catch (err) {
    console.error('Audio synthesizer error: ', err);
  }
};
