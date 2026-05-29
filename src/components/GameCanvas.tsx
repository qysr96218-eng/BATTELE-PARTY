import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameSettings, Platform, Player, Bot, Structure, Chest, LootItem, Bullet, Particle, DamageText, AudioVisualCue, ResourceNode, StormPhase, Weapon, WeaponType, Rarity } from '../types';
import { PLATFORMS, CHARACTER_SKINS, PLATFORM_DETAILS, MAP_LOCATIONS, BOT_NAMES, generateWeapon, generateChestLoot, playSynthesizedSound } from '../data';
import { Shield, Sparkles, AlertCircle, Crosshair, MapPin, Minimize, LogOut, ArrowRight, Swords, HelpCircle, HardDrive, Zap, Compass } from 'lucide-react';

interface GameCanvasProps {
  settings: GameSettings;
  selectedPlatform: Platform;
  selectedSkinId: string;
  playerName: string;
  onExitGame: () => void;
}

export default function GameCanvas({ settings, selectedPlatform, selectedSkinId, playerName, onExitGame }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Live in-game interactive chat state
  const [inGameChats, setInGameChats] = useState<{ id: string; sender: string; platform: Platform; message: string; color: string }[]>([
    { id: 'ig_1', sender: 'ابو_فلة_PRO', platform: 'PS5', message: 'شباب الهبوط شغال! مين ينزل معي البرج؟ 🪂', color: '#facc15' },
    { id: 'ig_2', sender: 'Ninja_Arab', platform: 'Steam', message: 'البعد الثلاثي 3D فخم جداً، طالع مجسم وخارق! 😍', color: '#60a5fa' },
    { id: 'ig_3', sender: 'المحترف_99', platform: 'PS4', message: 'وضع الـ ONLY رهيب تقدر تدردش وتشوف البوتات تهاوش 😂', color: '#f472b6' }
  ]);
  const [inGameChatInput, setInGameChatInput] = useState('');
  const [is3dMode, setIs3dMode] = useState<boolean>(settings.is3dMode !== false);

  // Reactionary state for React UI (updated at 10Hz to avoid slowing canvas)
  const [playerHp, setPlayerHp] = useState(100);
  const [playerShield, setPlayerShield] = useState(100);
  const [playerWood, setPlayerWood] = useState(200);
  const [aliveCount, setAliveCount] = useState(settings.initialBotCount + 1);
  const [killCount, setKillCount] = useState(0);
  const [spectatingName, setSpectatingName] = useState<string>('');
  const [spectatingPlatform, setSpectatingPlatform] = useState<Platform>('PS5');
  const [spectatingKills, setSpectatingKills] = useState<number>(0);
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'dead' | 'victory'>('intro');
  const [activeSlot, setActiveSlot] = useState(0);
  const [playerInventory, setPlayerInventory] = useState<(Weapon | null)[]>([]);
  const [bulletsInClip, setBulletsInClip] = useState(0);
  const [clipSize, setClipSize] = useState(0);
  const [reserveAmmo, setReserveAmmo] = useState(0);
  const [reloadingStatus, setReloadingStatus] = useState(false);
  const [activeBuildType, setActiveBuildType] = useState<'wall' | 'ramp' | 'floor'>('wall');
  const [isInBuildMode, setIsInBuildMode] = useState(false);
  const [viewMode, setViewMode] = useState<'topdown' | 'tp' | 'fp'>('topdown');
  const [stormStageText, setStormStageText] = useState('انطلاق باص المعركة!');
  const [stormTimer, setStormTimer] = useState('00:00');
  const [damageIndicators, setDamageIndicators] = useState<AudioVisualCue[]>([]);
  const [miniMapUrl, setMiniMapUrl] = useState<string>('');
  const [isCraftingOpen, setIsCraftingOpen] = useState(false);
  const [abilityCooldown, setAbilityCooldown] = useState(0); // Cooldown in frames/seconds
  const [goldenPickaxeActive, setGoldenPickaxeActive] = useState(false); // Steve's golden pickaxe option
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(null);
  const [vehicleHp, setVehicleHp] = useState(100);
  const [vehicleMaxHp, setVehicleMaxHp] = useState(100);
  const [vehicleSpeed, setVehicleSpeed] = useState(0);

  // Killfeed state
  const [killfeed, setKillfeed] = useState<{ id: string; text: string; time: number }[]>([]);

  // Periodic in-game chat chatter
  useEffect(() => {
    if (gameState !== 'playing' && gameState !== 'intro') return;
    
    const interval = setInterval(() => {
      const names = [...BOT_NAMES, 'مشاهد_عشوائي', 'ملك_الساحة', 'روبوت_زاحف', 'الأستاذ_سعد', 'المحترف_العربي'];
      const sender = names[Math.floor(Math.random() * names.length)];
      const platform = (['Steam', 'PS5', 'Xbox', 'Android', 'iOS'][Math.floor(Math.random() * 5)] as any);
      
      const gameChats = [
        "واو على اللعب والمنافسة اليوم!",
        "البعد الثلاثي 3D معطي اللعبة هيبة ثانية 😍",
        "يا جماعة خوذوا بالكم من الدائرة الآمنة الأبيض!",
        "انتبهوا واحد متخفي وراء شجرة!",
        "تباً، ذكاء الروبوتات هوني صعب!",
        "جاري تجميع دروع الـ Shield و MedKit",
        "البصريات خيالية والأداء سلس للغاية!",
        "اللاعب استعمل RPG قبل شوي هههه",
        "البث والدردشة باللوبي ميزة تيننن",
        "أقوى مواجهة شفتها بحياتي!"
      ];
      const message = gameChats[Math.floor(Math.random() * gameChats.length)];
      const id = 'ig_auto_' + Math.random().toString();
      const color = CHARACTER_SKINS[Math.floor(Math.random() * CHARACTER_SKINS.length)].color;
      
      setInGameChats(prev => [...prev.slice(-30), { id, sender, platform, message, color }]);
    }, 9000 + Math.random() * 8000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Input states (persistent via refs)
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const mousePos = useRef({ x: 0, y: 0, clientX: 0, clientY: 0, isDown: false });
  const touchJoystickMove = useRef({ x: 0, y: 0, active: false, startX: 0, startY: 0 });
  const touchJoystickAim = useRef({ x: 0, y: 0, active: false, startX: 0, startY: 0 });
  const isMobileDevice = useRef(false);

  // Game world state (persistent refs for 60fps)
  const worldWidth = 4800;
  const worldHeight = 4800;
  
  // Game loops values ref
  const playerRef = useRef<Player | Bot | null>(null);
  const alivePlayers = useRef<(Player | Bot)[]>([]);
  const deadPlayers = useRef<(Player | Bot)[]>([]);
  const structures = useRef<Structure[]>([]);
  const houses = useRef<{
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    color: string;
    roofColor: string;
    name: string;
    ammoPadActive: boolean;
    lastRefillTime: number;
    doorOpen?: boolean;
  }[]>([]);
  const chests = useRef<Chest[]>([]);
  const vehicles = useRef<{
    id: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    type: 'sports' | 'truck' | 'buggy';
    hp: number;
    maxHp: number;
    color: string;
    name: string;
    speed: number;
    driverId: string | null;
  }[]>([]);
  const itemDrops = useRef<LootItem[]>([]);
  const bullets = useRef<Bullet[]>([]);
  const particles = useRef<Particle[]>([]);
  const damageTexts = useRef<DamageText[]>([]);
  const resources = useRef<ResourceNode[]>([]);
  const grassTufts = useRef<{ x: number; y: number; size: number; color: string }[]>([]);
  const soundCues = useRef<AudioVisualCue[]>([]);
  const storm = useRef<StormPhase>({
    duration: 70,
    durationRemaining: 70,
    shrinkSpeed: 0.75,
    damagePerSec: 2,
    safeX: 2400,
    safeY: 2400,
    safeRadius: 2300,
    targetSafeRadius: 1200,
    state: 'waiting',
  });

  const nextStormStage = useRef<number>(1);
  const camera = useRef({ x: 0, y: 0, shake: 0 });
  const isSpectating = useRef(false);
  const spectateIndex = useRef(0);
  const gameActiveRef = useRef(true);
  const gamepadIndexRef = useRef<number | null>(null);

  // Detect Mobile device initially
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    isMobileDevice.current = isMobile || (selectedPlatform === 'Android' || selectedPlatform === 'iOS');
    
    // For developers so they can see gamepad status or touch buttons on PC too if chosen android/ios
    if (selectedPlatform === 'Android' || selectedPlatform === 'iOS') {
      isMobileDevice.current = true;
    }
  }, [selectedPlatform]);

  // Setup gamepad listeners
  useEffect(() => {
    const handleGamepadConnected = (e: GamepadEvent) => {
      console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
        e.gamepad.index, e.gamepad.id,
        e.gamepad.buttons.length, e.gamepad.axes.length);
      gamepadIndexRef.current = e.gamepad.index;
      addNotification("تم رصد يد التحكم! متوافقة مع أجهزة " + selectedPlatform);
    };

    const handleGamepadDisconnected = (e: GamepadEvent) => {
      console.log('Gamepad disconnected');
      if (gamepadIndexRef.current === e.gamepad.index) {
        gamepadIndexRef.current = null;
      }
    };

    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);
    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
    };
  }, [selectedPlatform]);

  // Add standard notification in Arabic
  const addNotification = (text: string) => {
    const id = Math.random().toString();
    setKillfeed(prev => [{ id, text, time: Date.now() }, ...prev.slice(0, 10)]);
  };

  // Helper: Find closest target for AI
  const findClosestTarget = (bot: Bot): Player | Bot | null => {
    let closestDist = 999999;
    let closest: Player | Bot | null = null;
    
    alivePlayers.current.forEach(p => {
      if (p.id === bot.id) return;
      const dx = p.x - bot.x;
      const dy = p.y - bot.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist && dist < 1200) { // dentro del radio de vision
        closestDist = dist;
        closest = p;
      }
    });
    return closest;
  };

  // Setup and bootstrap world elements
  const initWorld = () => {
    // 1. Spawning resources nodes (trees and rocks)
    const resourceList: ResourceNode[] = [];
    // Spawning 180 trees on the larger map
    for (let i = 0; i < 180; i++) {
      resourceList.push({
        id: 'tree_' + i,
        x: Math.random() * (worldWidth - 120) + 60,
        y: Math.random() * (worldHeight - 120) + 60,
        type: Math.random() < 0.75 ? 'tree' : 'rock',
        woodYield: Math.random() < 0.75 ? 40 : 60, // Boosted amount of wood/stone drop for faster progression
        hp: Math.random() < 0.75 ? 200 : 350,
        maxHp: 200,
        radius: Math.random() < 0.75 ? 40 : 25,
      });
    }
    resources.current = resourceList;

    // Spawning 420 lush grass tufts across our vast forest field!
    const grassList: { x: number; y: number; size: number; color: string }[] = [];
    const grassColors = ['#166534', '#15803d', '#14532d', '#22c55e', '#4ade80'];
    for (let i = 0; i < 420; i++) {
      grassList.push({
        x: Math.random() * (worldWidth - 50) + 25,
        y: Math.random() * (worldHeight - 50) + 25,
        size: Math.random() * 8 + 8,
        color: grassColors[Math.floor(Math.random() * grassColors.length)],
      });
    }
    grassTufts.current = grassList;

    // 2. Spawning Chests
    const chestList: Chest[] = [];
    const points = [
      ...MAP_LOCATIONS,
      // Random surrounding positions distributed correctly across coordinates
      { name: 'الريف الآمن', x: 600, y: 2200 },
      { name: 'البرج المنفرد', x: 2200, y: 600 },
      { name: 'موقع الهبوط الفرعي', x: 4200, y: 2200 },
      { name: 'القرية الصغيرة', x: 2200, y: 4200 },
    ];

    points.forEach((pt, idx) => {
      for (let c = 0; c < 4; c++) {
        chestList.push({
          id: 'chest_' + idx + '_' + c,
          x: pt.x + (Math.random() * 300 - 150),
          y: pt.y + (Math.random() * 300 - 150),
          opened: false,
          glowing: true
        });
      }
    });
    chests.current = chestList;

    // 2.5 Spawning Solid 3D Houses with Integrated Ammo Refill Stations
    const houseList: typeof houses.current = [];
    MAP_LOCATIONS.forEach((loc, locIdx) => {
      // Create 3 houses in each city/landmark!
      const houseConfigs = [
        { dx: -130, dy: -130, w: 140, h: 100, color: '#334155', roofColor: '#dc2626', name: `منزل ${loc.name} أ` },
        { dx: 130, dy: -130, w: 100, h: 130, color: '#475569', roofColor: '#0d9488', name: `منزل ${loc.name} ب` },
        { dx: 0, dy: 145, w: 150, h: 110, color: '#1e293b', roofColor: '#ea580c', name: `منزل ${loc.name} ج` }
      ];
      houseConfigs.forEach((cfg, houseIdx) => {
        // Ensure within boundaries
        const hx = loc.x + cfg.dx;
        const hy = loc.y + cfg.dy;
        if (hx > 100 && hx < worldWidth - 100 && hy > 100 && hy < worldHeight - 100) {
          houseList.push({
            id: `house_${locIdx}_${houseIdx}`,
            x: hx,
            y: hy,
            w: cfg.w,
            h: cfg.h,
            color: cfg.color,
            roofColor: cfg.roofColor,
            name: cfg.name,
            ammoPadActive: true,
            lastRefillTime: 0,
            doorOpen: false
          });
        }
      });
    });
    houses.current = houseList;

    // 2.7 Spawning Interactive Vehicles of multiple types across landmarks
    const vehicleList: typeof vehicles.current = [];
    const vehicleTypes: ('sports' | 'truck' | 'buggy')[] = ['sports', 'truck', 'buggy'];
    
    MAP_LOCATIONS.forEach((loc, locIdx) => {
      const type = vehicleTypes[locIdx % vehicleTypes.length];
      
      let carColor = '#ef4444'; // Sports Car Red
      let carName = 'بوجاتي الحمراء الرياضية 🏎️ (Sports Car)';
      let hpValue = 250;
      
      if (type === 'truck') {
        carColor = '#3f3f46'; // Armored metal gray
        carName = 'شاحنة سايبر جيب المدرعة 🚚 (Armored Truck)';
        hpValue = 500;
      } else if (type === 'buggy') {
        carColor = '#eab308'; // Desert yellow buggy
        carName = 'عربة رغد باجي الصحراء 🌅 (Desert Buggy)';
        hpValue = 350;
      }
      
      // Spawn near the landmark coordinates
      const cx = loc.x + (locIdx % 2 === 0 ? 105 : -105);
      const cy = loc.y + (locIdx % 2 === 0 ? -105 : 105);
      
      vehicleList.push({
        id: `car_${locIdx}`,
        x: cx,
        y: cy,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        type: type,
        hp: hpValue,
        maxHp: hpValue,
        color: carColor,
        name: carName,
        speed: 0,
        driverId: null
      });
    });
    vehicles.current = vehicleList;

    // 3. Spawning ground items initially (weapons/shields)
    const drops: LootItem[] = [];
    const getModeWeaponType = (originalType: WeaponType): WeaponType => {
      if (settings.gameMode === 'snipers') return 'sniper';
      if (settings.gameMode === 'pickaxe') {
        const heals: WeaponType[] = ['shield', 'medkit', 'chug'];
        if (originalType === 'pickaxe' || originalType === 'shield' || originalType === 'medkit' || originalType === 'chug') return originalType;
        return heals[Math.floor(Math.random() * heals.length)];
      }
      return originalType;
    };

    for (let d = 0; d < 120; d++) { // spawn 120 items covering the larger map
      const types: WeaponType[] = ['ar', 'shotgun', 'sniper', 'shield', 'medkit', 'chug'];
      const rawType = types[Math.floor(Math.random() * types.length)];
      const type = getModeWeaponType(rawType);
      const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
      const rarity = rarities[Math.floor(Math.random() * rarities.length)];

      drops.push({
        id: 'drop_' + d,
        x: Math.random() * (worldWidth - 100) + 50,
        y: Math.random() * (worldHeight - 100) + 50,
        weapon: generateWeapon(type, rarity),
        quantity: type === 'shield' || type === 'medkit' ? 2 : undefined,
        glowRotation: Math.random() * Math.PI
      });
    }
    itemDrops.current = drops;

    // 4. Initialize Local Human Player
    const pickaxeObj = generateWeapon('pickaxe', 'common');
    const starterType = getModeWeaponType('ar');
    // If pickaxe only mode, starter weapon slot is null
    const startAR = settings.gameMode === 'pickaxe' ? null : generateWeapon(starterType, 'common');
    const human: Player = {
      id: 'human_player',
      name: playerName || 'أنت_المحترف',
      platform: selectedPlatform,
      skinId: selectedSkinId,
      x: worldWidth / 2,
      y: worldHeight / 2,
      vx: 0,
      vy: 0,
      angle: 0,
      hp: 100,
      maxHp: 100,
      shield: 50,
      maxShield: 100,
      wood: 180, // initial wood to build some structures
      state: settings.gameMode === 'spectator' ? 'spectating' : 'skydiving', // bus dropping!
      activeSlot: settings.gameMode === 'pickaxe' ? 0 : 1,
      inventory: [pickaxeObj, startAR, null, null, null, null],
      isReloading: false,
      reloadTimeRemaining: 0,
      lastShotTime: 0,
      kills: 0,
      isBot: false,
      isBuilding: false,
      selectedBuildMaterial: 'wood',
      targetBuildType: 'wall',
      glideProgress: 0,
      targetLandingX: worldWidth / 2 + (Math.random() * 300 - 150),
      targetLandingY: worldHeight / 2 + (Math.random() * 300 - 150),
    };
    playerRef.current = human;
    isSpectating.current = settings.gameMode === 'spectator';

    // 5. Initialize Bots (99 Competitors!)
    const botList: (Bot)[] = [];
    const botDifficulty = settings.difficulty;
    const botNum = settings.initialBotCount;

    for (let b = 0; b < botNum; b++) {
      const bPlatform = PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)];
      const bSkin = CHARACTER_SKINS[Math.floor(Math.random() * CHARACTER_SKINS.length)].id;
      const bName = BOT_NAMES[b % BOT_NAMES.length] + '_' + Math.floor(Math.random() * 90 + 10);
      
      const targetLX = Math.random() * (worldWidth - 300) + 150;
      const targetLY = Math.random() * (worldHeight - 300) + 150;
 
      const rawBotType = Math.random() < 0.6 ? 'ar' : Math.random() < 0.5 ? 'shotgun' : 'sniper';
      const botWeaponType = getModeWeaponType(rawBotType);
      const botWeapon = settings.gameMode === 'pickaxe' ? null : generateWeapon(
        botWeaponType,
        botDifficulty === 'hard' ? 'rare' : 'common'
      );

      const bot: Bot = {
        id: 'bot_' + b,
        name: bName,
        platform: bPlatform,
        skinId: bSkin,
        x: targetLX + Math.random() * 40 - 20,
        y: targetLY + Math.random() * 40 - 20,
        vx: 0,
        vy: 0,
        angle: Math.random() * Math.PI * 2,
        hp: 100,
        maxHp: 100,
        shield: Math.random() < 0.5 ? 50 : 0,
        maxShield: 100,
        wood: Math.random() < 0.4 ? 40 : 150,
        state: 'skydiving', // bus drop
        activeSlot: settings.gameMode === 'pickaxe' ? 0 : 1,
        inventory: [generateWeapon('pickaxe', 'common'), botWeapon, null, null, null, null],
        isReloading: false,
        reloadTimeRemaining: 0,
        lastShotTime: 0,
        kills: 0,
        isBot: true,
        isBuilding: false,
        selectedBuildMaterial: 'wood',
        targetBuildType: 'wall',
        glideProgress: 0,
        targetLandingX: targetLX,
        targetLandingY: targetLY,
        aiState: 'landing_sky',
        aiTargetX: targetLX,
        aiTargetY: targetLY,
        aiTargetId: null,
        aiLastDecisionTime: 0,
        aiAlertness: botDifficulty === 'hard' ? 0.9 : botDifficulty === 'medium' ? 0.6 : 0.3,
        aiBuildChance: botDifficulty === 'hard' ? 0.91 : botDifficulty === 'medium' ? 0.5 : 0.15,
      };
      
      botList.push(bot);
    }

    alivePlayers.current = [human, ...botList];
    addNotification('انطلقت حافلة المعركة الطائرة! انقر لبدء القفز الحر والمظلي.');
  };

  // Kickoff game world
  useEffect(() => {
    initWorld();
    gameActiveRef.current = true;

    // React clean timer
    const uInterval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;

      // Update basic status hook
      setPlayerHp(Math.ceil(p.hp));
      setPlayerShield(Math.ceil(p.shield));
      setPlayerWood(p.wood);
      setAliveCount(alivePlayers.current.length);
      setKillCount(p.kills);
      setActiveSlot(p.activeSlot);
      setPlayerInventory([...p.inventory]);

      const activeItem = p.inventory[p.activeSlot];
      if (activeItem) {
        setBulletsInClip(activeItem.ammo);
        setClipSize(activeItem.magazineSize);
        setReserveAmmo(activeItem.reserveAmmo);
      } else {
        setBulletsInClip(0);
        setClipSize(0);
        setReserveAmmo(0);
      }
      setReloadingStatus(p.isReloading);

      // Handle spectator tracking
      if (isSpectating.current) {
        const spectated = alivePlayers.current[spectateIndex.current % alivePlayers.current.length];
        if (spectated) {
          setSpectatingName(spectated.name);
          setSpectatingPlatform(spectated.platform);
          setSpectatingKills(spectated.kills);
          setPlayerHp(Math.ceil(spectated.hp));
          setPlayerShield(Math.ceil(spectated.shield));
          setPlayerWood(spectated.wood);
          setPlayerInventory([...spectated.inventory]);
          setActiveSlot(spectated.activeSlot);
        }
      }

      // Storm text and clock
      const ratio = storm.current.durationRemaining;
      const m = Math.floor(ratio / 60);
      const s = Math.floor(ratio % 60);
      setStormTimer(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      
      if (storm.current.state === 'waiting') {
        setStormStageText(`انقباض العاصفة يبدأ خلال:`);
      } else {
        setStormStageText(`العاصفة تتقلص وتتحرك!`);
      }
    }, 150);

    return () => {
      clearInterval(uInterval);
      gameActiveRef.current = false;
    };
  }, []);

  // Event Listeners for inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysPressed.current[k] = true;

      // Space trigger jumping
      if (e.key === ' ' || k === 'spacebar') {
        e.preventDefault();
        triggerJump();
      }

      // Inventory Slot Hotkeys
      if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        const slot = parseInt(e.key) - 1;
        changeActiveSlot(slot);
      }

      // E trigger interact
      if (k === 'e') {
        interactAction();
      }

      // R trigger reload
      if (k === 'r') {
        triggerReload();
      }

      // X or G trigger special active ability
      if (k === 'x' || k === 'g') {
        activateSpecialAbility();
      }

      // Q/B trigger build mode
      if (k === 'q' || k === 'b') {
        setIsBuildModeActive(prev => !prev);
      }

      // F/C to switch build type
      if (k === 'f' || k === 'c') {
        cycleBuildType();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      // Mouse vector relative to player center
      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        clientX: e.clientX,
        clientY: e.clientY,
        isDown: mousePos.current.isDown,
      };
    };

    const handleMouseDown = (e: MouseEvent) => {
      mousePos.current.isDown = true;
      
      const p = playerRef.current;
      if (p && p.state === 'skydiving') {
        // Eject / glide immediately on first click
        p.state = 'gliding';
        playSynthesizedSound('harvest');
      }
    };

    const handleMouseUp = () => {
      mousePos.current.isDown = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const changeActiveSlot = (slot: number) => {
    const p = playerRef.current;
    if (p && slot >= 0 && slot < 6) {
      p.activeSlot = slot;
      playSynthesizedSound('reload');
    }
  };

  const setIsBuildModeActive = (val: boolean | ((p: boolean) => boolean)) => {
    const p = playerRef.current;
    if (p) {
      if (typeof val === 'function') {
        const next = val(p.isBuilding);
        p.isBuilding = next;
        setIsInBuildMode(next);
      } else {
        p.isBuilding = val;
        setIsInBuildMode(val);
      }
      playSynthesizedSound('build');
    }
  };

  const cycleBuildType = () => {
    const p = playerRef.current;
    if (p) {
      const types: ('wall' | 'ramp' | 'floor')[] = ['wall', 'ramp', 'floor'];
      const index = types.indexOf(p.targetBuildType);
      const nextIndex = (index + 1) % types.length;
      p.targetBuildType = types[nextIndex];
      setActiveBuildType(types[nextIndex]);
      playSynthesizedSound('build');
    }
  };

  const triggerJump = () => {
    const p = playerRef.current;
    if (p && p.state === 'alive' && p.glideProgress <= 0) {
      // simulate localized temporary dynamic leaping high
      p.glideProgress = 1; // 1 used for jump height tick simulation
      playSynthesizedSound('build');
      
      // Spawn trail particles
      for (let i = 0; i < 6; i++) {
        spawnParticle(p.x, p.y + 10, Math.random() * 2 - 1, Math.random() * 2, 'dust', '#f3f4f6');
      }
    }
  };

  const triggerReload = () => {
    const p = playerRef.current;
    if (p && !p.isReloading) {
      const wep = p.inventory[p.activeSlot];
      if (wep && wep.ammo < wep.magazineSize && wep.reserveAmmo > 0 && wep.type !== 'pickaxe' && wep.type !== 'medkit' && wep.type !== 'shield' && wep.type !== 'chug') {
        p.isReloading = true;
        p.reloadTimeRemaining = wep.reloadTime;
        playSynthesizedSound('reload');
      }
    }
  };

  const activateSpecialAbility = () => {
    const p = playerRef.current;
    if (!p || p.state !== 'alive') return;

    if (p.skinId === 'ninja') {
      if (abilityCooldown > 0) {
        addNotification(`🔮 الوميض السريع قيد تبريد الانتظار (${abilityCooldown} ثانية)! ⏳`);
        return;
      }
      
      const distance = 130;
      const targetAngle = p.angle;
      const targetX = p.x + Math.cos(targetAngle) * distance;
      const targetY = p.y + Math.sin(targetAngle) * distance;

      // Particles
      for (let i = 0; i < 15; i++) {
        spawnParticle(p.x, p.y, Math.random() * 4 - 2, Math.random() * 4 - 2, 'dust', '#a855f7');
      }

      // Movement with map clamping
      p.x = Math.max(30, Math.min(worldWidth - 30, targetX));
      p.y = Math.max(30, Math.min(worldHeight - 30, targetY));

      for (let i = 0; i < 15; i++) {
        spawnParticle(p.x, p.y, Math.random() * 4 - 2, Math.random() * 4 - 2, 'dust', '#c084fc');
      }

      playSynthesizedSound('victory');
      addNotification("🔮 تم تفعيل الوميض السريع (Ninja Teleport)!");

      // Start static cooldown indicator
      setAbilityCooldown(7);
      const interval = setInterval(() => {
        setAbilityCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } else if (p.skinId === 'constructor') {
      setIsCraftingOpen(prev => !prev);
      playSynthesizedSound('build');
      addNotification(!isCraftingOpen ? "🛠️ طاولـة الكرافتنـج لماينكـرافـت مفتوحـة الآن!" : "🚪 تم إغلاق منضدة كرافتنج");
    } else {
      addNotification("🛡️ ميزات بطل الكابوس الخارق تعمل تلقائياً دون تفعيل يدوّي!");
    }
  };

  const craftItem = (itemType: 'golden_pickaxe' | 'shield' | 'medkit') => {
    const p = playerRef.current;
    if (!p || p.state !== 'alive') return;

    if (itemType === 'golden_pickaxe') {
      if (p.wood < 60) {
        addNotification("الموارد غير كافية! (يتطلب 60 خشب وكرافتنج) 🪓");
        return;
      }
      p.wood -= 60;
      setPlayerWood(p.wood);
      setGoldenPickaxeActive(true);
      playSynthesizedSound('victory');
      addNotification("🪓 تم تركيب المعول الذهبي الفتاك! قوتك وهيدج نود حفرك أصبح مضاعفاً!");
    } else if (itemType === 'shield') {
      if (p.wood < 40) {
        addNotification("الموارد غير كافية! (يتطلب 40 خشب) 🧱");
        return;
      }
      p.wood -= 40;
      setPlayerWood(p.wood);
      p.shield = Math.min(100, p.shield + 50);
      setPlayerShield(p.shield);
      playSynthesizedSound('reload');
      addNotification("🛡️ تم تركيب درع ذهبي خارق! (+50 درع)");
    } else if (itemType === 'medkit') {
      if (p.wood < 55) {
        addNotification("الموارد غير كافية! (يتطلب 55 خشب) 🧪");
        return;
      }
      p.wood -= 55;
      setPlayerWood(p.wood);
      
      const medObj = generateWeapon('medkit', 'common');
      let foundSlot = false;
      for (let i = 2; i < 6; i++) {
        if (p.inventory[i] === null) {
          p.inventory[i] = medObj;
          foundSlot = true;
          break;
        }
      }
      if (!foundSlot) {
        p.inventory[p.activeSlot] = medObj;
      }
      setPlayerInventory([...p.inventory]);
      playSynthesizedSound('victory');
      addNotification("❤️ تم تركيب حقيبة طبية علاجية بنجاح!");
    }
  };

  // Interact: Opens chests, picks up ground items
  const interactAction = () => {
    const p = playerRef.current;
    if (!p || p.state !== 'alive') return;

    // 0. If player is currently driving a vehicle, exit the vehicle!
    const activeCar = vehicles.current.find(v => v.driverId === p.id);
    if (activeCar) {
      activeCar.driverId = null;
      activeCar.speed = 0;
      
      // Eject player in a safe direction slightly behind the car
      p.x = activeCar.x - Math.cos(activeCar.angle) * 35;
      p.y = activeCar.y - Math.sin(activeCar.angle) * 35;
      p.vx = 0;
      p.vy = 0;
      
      setActiveVehicleId(null);
      addNotification(`🚪 ترجلت من ${activeCar.name}`);
      playSynthesizedSound('reload');
      return;
    }

    // 1. Check closest house door to open/close (within 65px radius)
    let doorToggled = false;
    houses.current.forEach(hs => {
      if (doorToggled) return;
      const doorX = hs.x;
      const doorY = hs.y + hs.h / 2;
      const dx = doorX - p.x;
      const dy = doorY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 65) {
        hs.doorOpen = !hs.doorOpen;
        playSynthesizedSound('reload');
        addNotification(hs.doorOpen ? `🚪 تم فتح الباب في ${hs.name}` : `🚪 تم إغلاق الباب في ${hs.name}`);
        doorToggled = true;
      }
    });

    if (doorToggled) return;

    // 2. Check if player is near any vehicle to enter and drive (within 65px radius)
    let enteredCar = false;
    vehicles.current.forEach(car => {
      if (enteredCar || car.driverId !== null) return;
      
      const dx = car.x - p.x;
      const dy = car.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 65) {
        car.driverId = p.id;
        car.speed = 0;
        
        setActiveVehicleId(car.id);
        setVehicleHp(car.hp);
        setVehicleMaxHp(car.maxHp);
        setVehicleSpeed(0);
        
        addNotification(`🚗 دخلت ${car.name}! استخدم [W/S/A/D] للقيادة!`);
        playSynthesizedSound('reload');
        enteredCar = true;
      }
    });

    if (enteredCar) return;

    let actionDone = false;

    // Check closest chest to open
    chests.current.forEach(c => {
      if (c.opened) return;
      const dx = c.x - p.x;
      const dy = c.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 85 && !actionDone) {
        c.opened = true;
        c.glowing = false;
        playSynthesizedSound('explosion'); // chest opening burst sound synthetic
        actionDone = true;

        // Spawn dynamic chest items flying out
        const droppedX = c.x + (Math.random() * 50 - 25);
        const droppedY = c.y - 30;
        const loot = generateChestLoot();
        
        loot.forEach((wep, index) => {
          itemDrops.current.push({
            id: 'drop_chest_' + Math.random().toString(),
            x: droppedX + (index * 40 - 20),
            y: droppedY + (Math.random() * 30 - 15),
            weapon: wep,
            glowRotation: Math.random() * Math.PI
          });
        });

        // award some materials
        p.wood += 30;
        spawnDamageText(c.x, c.y - 20, '+30 خشب', '#eab308');
        addNotification(`📱 [اللعب المشترك] ${p.name} قام بفتح صندوق غنائم`);
      }
    });

    if (actionDone) return;

    // Check closest ground items to swap or pick up
    let closestDrop: LootItem | null = null;
    let closestDist = 80;

    itemDrops.current.forEach(drop => {
      const dx = drop.x - p.x;
      const dy = drop.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closestDrop = drop;
      }
    });

    if (closestDrop) {
      const drop: LootItem = closestDrop;
      const wep = drop.weapon;

      // Healing consume items or direct stack slot
      if (wep.type === 'shield' || wep.type === 'medkit' || wep.type === 'chug') {
        // Look for empty slot or stackable slot
        let added = false;
        for (let i = 1; i < 6; i++) {
          const invItem = p.inventory[i];
          if (invItem && invItem.type === wep.type && (invItem.reserveAmmo || 0) < 6) {
            invItem.reserveAmmo = (invItem.reserveAmmo || 0) + (drop.quantity || 1);
            added = true;
            break;
          }
        }
        
        if (!added) {
          // find empty slot
          for (let i = 1; i < 6; i++) {
            if (p.inventory[i] === null) {
              const bundleWep = { ...wep, reserveAmmo: drop.quantity || 1 };
              p.inventory[i] = bundleWep;
              added = true;
              break;
            }
          }
        }

        if (!added) {
          // swap current slot
          if (p.activeSlot > 0) {
            const currentItem = p.inventory[p.activeSlot];
            const bundleWep = { ...wep, reserveAmmo: drop.quantity || 1 };
            p.inventory[p.activeSlot] = bundleWep;
            
            // drop old current item on ground
            if (currentItem) {
              drop.weapon = currentItem;
              drop.quantity = currentItem.reserveAmmo;
            } else {
              itemDrops.current = itemDrops.current.filter(d => d.id !== drop.id);
            }
            added = true;
          }
        } else {
          itemDrops.current = itemDrops.current.filter(d => d.id !== drop.id);
        }

        playSynthesizedSound('reload');
        spawnDamageText(p.x, p.y - 25, `التقطت: ${wep.name}`, wep.color);
      } else {
        // Gun swapping slot
        let added = false;
        // find empty gun slot
        for (let i = 1; i < 6; i++) {
          if (p.inventory[i] === null) {
            p.inventory[i] = wep;
            added = true;
            break;
          }
        }

        if (!added) {
          // Swap active slot (excluding pickaxe)
          const currSlot = p.activeSlot > 0 ? p.activeSlot : 1;
          const oldWep = p.inventory[currSlot];
          p.inventory[currSlot] = wep;

          if (oldWep) {
            drop.weapon = oldWep;
          } else {
            itemDrops.current = itemDrops.current.filter(d => d.id !== drop.id);
          }
        } else {
          itemDrops.current = itemDrops.current.filter(d => d.id !== drop.id);
        }

        playSynthesizedSound('reload');
        spawnDamageText(p.x, p.y - 25, `التقطت سلاح: ${wep.name}`, wep.color);
      }
    }
  };

  // Fire Weapon Shoot action
  const shootAction = (p: Player | Bot, targetAngle: number) => {
    if (p.isReloading) return;

    const currentWep = p.inventory[p.activeSlot];
    if (!currentWep) return;

    const now = Date.now();
    if (now - p.lastShotTime < currentWep.fireRate) return;

    p.lastShotTime = now;

    // Healing consumable items usage
    if (currentWep.type === 'medkit' || currentWep.type === 'shield' || currentWep.type === 'chug') {
      // Consume item sequence
      if (currentWep.type === 'medkit' && p.hp >= 100) return;
      if (currentWep.type === 'shield' && p.shield >= 50) return;
      if (currentWep.type === 'chug' && p.shield >= 100) return;

      p.isReloading = true; // Use reload timer as casting/consumption gauge
      p.reloadTimeRemaining = currentWep.fireRate; // takes fireRate milliseconds to cast!
      if (!p.isBot) {
        addNotification(`📱 استخدام مادة علاجية: ${currentWep.name}`);
      }
      return;
    }

    // Pickaxe harvesting
    if (currentWep.type === 'pickaxe') {
      playSynthesizedSound('harvest');
      
      // Simulate visual pickaxe strike
      const strikeX = p.x + Math.cos(targetAngle) * 50;
      const strikeY = p.y + Math.sin(targetAngle) * 50;
      
      // Damage trees or structures
      let hitNode = false;

      resources.current.forEach(n => {
        if (n.hp <= 0) return;
        const dx = n.x - strikeX;
        const dy = n.y - strikeY;
        const d = Math.sqrt(dx * dx + dy * dy);
        
        if (d < n.radius + 30) {
          // Steve constructor gets an incredible 4x crafting multiplier, and a Golden Pickaxe gets double that!
          const harvestMult = (p.skinId === 'constructor' ? 4 : 1) * (p.id === 'human_player' && goldenPickaxeActive ? 2 : 1);
          const finalYield = n.woodYield * harvestMult;
          n.hp -= (p.id === 'human_player' && goldenPickaxeActive ? 80 : 40); // Double strike node damage if golden pickaxe active!
          p.wood += finalYield;
          
          hitNode = true;
          playSynthesizedSound('harvest');
          spawnDamageText(n.x, n.y - 15, `+${finalYield} ${n.type === 'tree' ? 'خشب' : 'حجارة'}`, '#22c55e');
          camera.current.shake = p.id === 'human_player' && goldenPickaxeActive ? 5 : 3;

          // Splinter wood particles
          for (let pi = 0; pi < 8; pi++) {
            spawnParticle(n.x, n.y, Math.random() * 4 - 2, Math.random() * 4 - 2, 'wood', '#8b5a2b');
          }

          if (n.hp <= 0) {
            spawnDamageText(n.x, n.y, 'تدمير العقدة كاملة!', '#ffd700');
            // massive splinters
            for (let pi = 0; pi < 15; pi++) {
              spawnParticle(n.x, n.y, Math.random() * 6 - 3, Math.random() * 6 - 3, 'wood', '#4b5320');
            }
          }
        }
      });

      // Hit built wood structures to dismantle
      if (!hitNode) {
        structures.current.forEach(st => {
          if (st.hp <= 0) return;
          const dx = st.x - strikeX;
          const dy = st.y - strikeY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 45) {
            st.hp -= 70;
            p.wood += 20;
            hitNode = true;
            playSynthesizedSound('harvest');
            spawnDamageText(st.x, st.y - 10, `+20 خشب معاد تدويره`, '#eab308');
            
            for (let pi = 0; pi < 5; pi++) {
              spawnParticle(st.x, st.y, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, 'wood', '#d2b48c');
            }
          }
        });
      }

      // Check damage to close enemies via pickaxe
      if (!hitNode) {
        alivePlayers.current.forEach(enemy => {
          if (enemy.id === p.id || enemy.state !== 'alive') return;
          const dx = enemy.x - p.x;
          const dy = enemy.y - p.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 65) {
            damageEntity(p, enemy, currentWep.damage, 'حصاد المعول');
            hitNode = true;
          }
        });
      }

      return;
    }

    // Fire actual Gun weapon bullets
    if (currentWep.ammo <= 0) {
      if (!p.isBot) {
        playSynthesizedSound('reload');
        triggerReload();
      }
      return;
    }

    currentWep.ammo -= 1;

    // Trigger local synthesized sound
    if (!p.isBot) {
      if (currentWep.type === 'shotgun') playSynthesizedSound('shoot_shotgun');
      else if (currentWep.type === 'sniper') playSynthesizedSound('shoot_sniper');
      else if (currentWep.type === 'rpg') playSynthesizedSound('shoot_rpg');
      else playSynthesizedSound('shoot');

      camera.current.shake = currentWep.type === 'sniper' ? 12 : currentWep.type === 'shotgun' ? 8 : currentWep.type === 'rpg' ? 15 : 4;
    } else {
      // Spawn low-range alert sound cue for human player screen map
      const hPlayer = playerRef.current;
      if (hPlayer) {
        const dx = p.x - hPlayer.x;
        const dy = p.y - hPlayer.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 1000) {
          // add shooting visual sound indicator
          soundCues.current.push({
            id: Math.random().toString(),
            type: 'shoot',
            x: p.x,
            y: p.y,
            angle: Math.atan2(dy, dx),
            distance: d,
            time: Date.now() + 1000
          });
        }
      }
    }

    // Shotgun fires 6 distinct pellet bullets spreading out
    if (currentWep.type === 'shotgun') {
      const pelletCount = 6;
      for (let i = 0; i < pelletCount; i++) {
        const offsetSpread = (Math.random() * currentWep.spread) - (currentWep.spread / 2);
        const bulletAngle = targetAngle + offsetSpread;
        
        bullets.current.push({
          id: 'b_' + Math.random().toString(),
          x: p.x + Math.cos(targetAngle) * 20,
          y: p.y + Math.sin(targetAngle) * 20,
          vx: Math.cos(bulletAngle) * currentWep.bulletSpeed,
          vy: Math.sin(bulletAngle) * currentWep.bulletSpeed,
          damage: Math.ceil(currentWep.damage / pelletCount),
          ownerId: p.id,
          type: 'shotgun',
          rangeRemaining: currentWep.range,
          radius: 2.5,
          color: currentWep.color
        });
      }
    } else {
      // Ordinary guns / RPG
      const offsetSpread = (Math.random() * currentWep.spread) - (currentWep.spread / 2);
      const bulletAngle = targetAngle + offsetSpread;

      bullets.current.push({
        id: 'b_' + Math.random().toString(),
        x: p.x + Math.cos(targetAngle) * 30,
        y: p.y + Math.sin(targetAngle) * 30,
        vx: Math.cos(bulletAngle) * currentWep.bulletSpeed,
        vy: Math.sin(bulletAngle) * currentWep.bulletSpeed,
        damage: currentWep.damage,
        ownerId: p.id,
        type: currentWep.type,
        rangeRemaining: currentWep.range,
        radius: currentWep.type === 'rpg' ? 5 : currentWep.type === 'sniper' ? 3 : 2,
        color: currentWep.type === 'rpg' ? '#ff3f00' : currentWep.color
      });
    }

    // Trigger visual muzzle flash sparkles
    for (let f = 0; f < 5; f++) {
      spawnParticle(
        p.x + Math.cos(targetAngle) * 26,
        p.y + Math.sin(targetAngle) * 26,
        Math.cos(targetAngle) * 3 + (Math.random() * 2 - 1),
        Math.sin(targetAngle) * 3 + (Math.random() * 2 - 1),
        'spark',
        '#facc15'
      );
    }
  };

  // Perform structures building (Wall, Ramp, Floor)
  const buildStructure = (p: Player | Bot, buildType: 'wall' | 'ramp' | 'floor', angle: number) => {
    if (p.wood < 10) {
      if (!p.isBot) {
        addNotification("الموارد غير كافية للبناء! (يتطلب ١٠ خشب)");
        playSynthesizedSound('reload');
      }
      return;
    }

    // Build the structure directly in front of facing direction
    const distanceOffset = 65;
    const spawnX = p.x + Math.cos(angle) * distanceOffset;
    const spawnY = p.y + Math.sin(angle) * distanceOffset;

    // Check if another structure occupies the exact spot to avoid endless stacking
    let occupied = false;
    structures.current.forEach(st => {
      const dx = st.x - spawnX;
      const dy = st.y - spawnY;
      if (Math.abs(dx) < 30 && Math.abs(dy) < 30) {
        occupied = true;
      }
    });

    if (occupied) return;

    p.wood -= 10;
    playSynthesizedSound('build');

    const roundedAngle = Math.round((angle * 180) / Math.PI / 90) * 90;

    structures.current.push({
      id: 'st_' + Math.random().toString(),
      x: spawnX,
      y: spawnY,
      type: buildType,
      hp: 150,
      maxHp: 150,
      angle: roundedAngle,
      teamId: p.id,
      createdAt: Date.now(),
      width: buildType === 'wall' ? 80 : 70,
      height: buildType === 'wall' ? 12 : 70,
    });

    // Splinters particles
    for (let pi = 0; pi < 6; pi++) {
      spawnParticle(spawnX, spawnY, Math.random() * 2 - 1, Math.random() * 2 - 1, 'wood', '#d2b48c');
    }
  };

  // Inflict damage to characters
  const damageEntity = (attacker: Player | Bot, target: Player | Bot, amount: number, wepName: string) => {
    if (target.state !== 'alive' || target.hp <= 0) return;

    // Shield absorbing mechanics
    let displayDamage = amount;
    let isShieldHit = false;

    if (target.shield > 0) {
      isShieldHit = true;
      if (target.shield >= amount) {
        target.shield -= amount;
        displayDamage = amount;
      } else {
        const shieldAbsorb = target.shield;
        target.shield = 0;
        target.hp -= (amount - shieldAbsorb);
        displayDamage = amount; // show complete total damage
        playSynthesizedSound('shield_break'); // break sound
        
        // blue debris particles
        for(let pi=0;pi<10;pi++){
          spawnParticle(target.x, target.y, Math.random()*4-2, Math.random()*4-2, 'shield', '#06b6d4');
        }
      }
    } else {
      target.hp -= amount;
    }

    if (!target.isBot) {
      // Local screen red indicators
      playSynthesizedSound('damage');
    }

    // Spawn flying damage number text
    spawnDamageText(
      target.x + (Math.random()*16-8),
      target.y - 15,
      `-${displayDamage}`,
      isShieldHit ? '#3b82f6' : '#ef4444'
    );

    // AI bot defensive construction - wall spamming!
    if (target.isBot && target.hp > 0) {
      const bot = target as Bot;
      if (Math.random() < bot.aiBuildChance && bot.wood >= 10) {
        // instantly build defensive wall blocking shooter direction
        const revAngle = Math.atan2(attacker.y - target.y, attacker.x - target.x);
        buildStructure(bot, 'wall', revAngle);
        bot.aiState = 'building';
        bot.aiTargetX = attacker.x;
        bot.aiTargetY = attacker.y;
        bot.aiLastDecisionTime = Date.now();
      }
    }

    // Death confirmation
    if (target.hp <= 0) {
      target.state = 'spectating';
      attacker.kills += 1;

      // Drop all bot weapons on ground as loot drops!
      target.inventory.forEach((invItem, idx) => {
        if (invItem && invItem.type !== 'pickaxe') {
          itemDrops.current.push({
            id: 'drop_death_' + Math.random().toString(),
            x: target.x + (idx * 30 - 60),
            y: target.y + (Math.random() * 20 - 10),
            weapon: invItem,
            glowRotation: Math.random() * Math.PI
          });
        }
      });

      // Drop basic wood resources
      itemDrops.current.push({
        id: 'drop_wood_' + Math.random().toString(),
        x: target.x,
        y: target.y,
        weapon: generateWeapon('medkit', 'uncommon'), // drop medkit as a guaranteed treat
        glowRotation: 0
      });

      // Show in live killfeed
      const attPlat = attacker.platform;
      const attBadge = PLATFORM_DETAILS[attPlat].prefix;
      const tarPlat = target.platform;
      const tarBadge = PLATFORM_DETAILS[tarPlat].prefix;

      addNotification(`${attBadge} [${attPlat}] ${attacker.name} قضى على ${tarBadge} [${tarPlat}] ${target.name} (${wepName})`);

      // If user was killed, move to spectate or death menu
      if (target.id === 'human_player') {
        playSynthesizedSound('explosion');
        setGameState('dead');
        isSpectating.current = true;
        
        // Find next live player index to spectate
        const liveIndex = alivePlayers.current.findIndex(p => p.id !== 'human_player' && p.state === 'alive');
        if (liveIndex !== -1) {
          spectateIndex.current = liveIndex;
        }
      }
    }
  };

  // Helpers: Particle generators
  const spawnParticle = (x: number, y: number, vx: number, vy: number, type: typeof particles.current[0]['type'], color: string) => {
    particles.current.push({
      id: Math.random().toString(),
      x,
      y,
      vx,
      vy,
      life: 1.0,
      decay: type === 'explosion' ? 0.04 : type === 'spark' ? 0.08 : 0.03,
      size: type === 'explosion' ? 8 : type === 'smoke' ? 12 : 3,
      color,
      type
    });
  };

  const spawnDamageText = (x: number, y: number, text: string, color: string) => {
    damageTexts.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      life: 1.0,
      color,
      isShield: color === '#3b82f6'
    });
  };

  // Real-time physics, AI decisions, collisions, and renderer loop
  useEffect(() => {
    let animationId: number;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      if (!gameActiveRef.current) return;

      // Handle container viewport resized safely (low-spec optimized)
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        if (canvas.width !== cw || canvas.height !== ch) {
          canvas.width = cw;
          canvas.height = ch;
        }
      }

      // Clear dark blue void
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Access current player state
      let activeFocus: Player | Bot | null = playerRef.current;
      if (isSpectating.current && alivePlayers.current.length > 0) {
        // filter or get active alive player
        const specPl = alivePlayers.current[spectateIndex.current % alivePlayers.current.length];
        if (specPl && specPl.state === 'alive') {
          activeFocus = specPl;
        } else {
          // find any first alive bot
          const firstAlive = alivePlayers.current.find(b => b.state === 'alive');
          if (firstAlive) {
            activeFocus = firstAlive;
          }
        }
      }

      if (!activeFocus) return;

      // === CAMERA FOLLOW SETUP ===
      const destCamX = activeFocus.x - canvas.width / 2;
      const destCamY = activeFocus.y - canvas.height / 2;
      camera.current.x += (destCamX - camera.current.x) * 0.12;
      camera.current.y += (destCamY - camera.current.y) * 0.12;

      // clamp camera bounds
      camera.current.x = Math.max(0, Math.min(worldWidth - canvas.width, camera.current.x));
      camera.current.y = Math.max(0, Math.min(worldHeight - canvas.height, camera.current.y));

      // screen shake decay
      if (camera.current.shake > 0) {
        camera.current.x += (Math.random() * camera.current.shake - camera.current.shake / 2);
        camera.current.y += (Math.random() * camera.current.shake - camera.current.shake / 2);
        camera.current.shake *= 0.9;
      }

      ctx.save();
      
      if (viewMode === 'tp') {
        // Third-Person Chase Camera
        ctx.translate(canvas.width / 2, canvas.height / 2 + 100);
        
        // Rotate world around current player focus so they face forward/UP
        const rot = activeFocus.angle + Math.PI / 2;
        ctx.rotate(-rot);
        
        // Center relative to player position
        ctx.translate(-activeFocus.x, -activeFocus.y);
      } else if (viewMode === 'fp') {
        // First-Person Camera
        ctx.translate(canvas.width / 2, canvas.height / 2);
        
        // Rotate world around player position
        const rot = activeFocus.angle + Math.PI / 2;
        ctx.rotate(-rot);
        
        // Immersive FPS scale adjustment
        ctx.scale(1.25, 1.25);
        
        ctx.translate(-activeFocus.x, -activeFocus.y);
      } else {
        // Classic Topdown setup camera translate
        ctx.translate(-camera.current.x, -camera.current.y);
      }

      // === RENDER MAP GROUND ===
      // Checkered Minecraft-style grass meadow background! (Low-spec optimized)
      ctx.fillStyle = '#115e59'; // rich dark teal-green grass base
      ctx.fillRect(0, 0, worldWidth, worldHeight);

      const blockSize = 160;
      ctx.fillStyle = '#134e4a'; // alternate green tone
      for (let x = 0; x < worldWidth; x += blockSize * 2) {
        for (let y = 0; y < worldHeight; y += blockSize * 2) {
          ctx.fillRect(x, y, blockSize, blockSize);
          ctx.fillRect(x + blockSize, y + blockSize, blockSize, blockSize);
        }
      }

      // Draw our custom swaying grass tufts!
      const windTime = Date.now() / 320;
      const swayX = Math.sin(windTime) * 3.5;

      grassTufts.current.forEach(gt => {
        // viewport frustum culling: skip drawing faraway grass elements for maximum silky-smooth FPS!
        const padding = 120;
        if (viewMode === 'topdown') {
          if (gt.x < camera.current.x - padding || gt.x > camera.current.x + canvas.width + padding ||
              gt.y < camera.current.y - padding || gt.y > camera.current.y + canvas.height + padding) {
            return;
          }
        } else {
          const dx = gt.x - activeFocus.x;
          const dy = gt.y - activeFocus.y;
          if (dx * dx + dy * dy > 800 * 800) return;
        }

        ctx.fillStyle = gt.color;
        
        // Draw 3 block-like vertical grass blades waving in tandem
        ctx.beginPath();
        // Blade 1
        ctx.moveTo(gt.x - 3, gt.y);
        ctx.lineTo(gt.x - 3 + swayX, gt.y - gt.size);
        ctx.lineTo(gt.x + swayX, gt.y - gt.size);
        ctx.lineTo(gt.x, gt.y);
        
        // Blade 2
        ctx.moveTo(gt.x, gt.y);
        ctx.lineTo(gt.x + swayX * 1.25, gt.y - gt.size * 1.25);
        ctx.lineTo(gt.x + 3 + swayX * 1.25, gt.y - gt.size * 1.25);
        ctx.lineTo(gt.x + 3, gt.y);

        // Blade 3
        ctx.moveTo(gt.x + 3, gt.y);
        ctx.lineTo(gt.x + 1 + swayX * 0.8, gt.y - gt.size * 0.85);
        ctx.lineTo(gt.x + 4 + swayX * 0.8, gt.y - gt.size * 0.85);
        ctx.lineTo(gt.x + 4, gt.y);
        ctx.fill();
        
        // Flower buds on select tall grass clumps
        if (gt.size > 13.5) {
          ctx.beginPath();
          ctx.fillStyle = '#fbbf24'; // beautiful gold flower
          ctx.arc(gt.x + swayX * 1.25 + 1.5, gt.y - gt.size * 1.25, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw massive grass grid lines
      const gridSpacing = 160;
      ctx.strokeStyle = '#022c22'; // deep green grid lines
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let x = 0; x < worldWidth; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, worldHeight);
      }
      for (let y = 0; y < worldHeight; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(worldWidth, y);
      }
      ctx.stroke();

      // Outer bounding safe walls
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 12;
      ctx.strokeRect(0, 0, worldWidth, worldHeight);

      // Draw map landmarks
      MAP_LOCATIONS.forEach(loc => {
        // glowing region circle label
        ctx.fillStyle = loc.color + '07';
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, loc.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = loc.color + '18';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 15px "Inter", "Arial"';
        ctx.textAlign = 'center';
        ctx.fillText(loc.name, loc.x, loc.y);
      });

      // === POLICING SYSTEM INPUTS (KEYBOARD / GAMEPAD / MOBILE TOUCH) ===
      if (activeFocus && activeFocus.id === 'human_player' && activeFocus.state === 'alive') {
        const hPlayer = activeFocus;

        // 1. Gamepad polling
        let gpadMoved = false;
        if (gamepadIndexRef.current !== null) {
          const gamepads = navigator.getGamepads();
          const gp = gamepads[gamepadIndexRef.current];
          if (gp) {
            // Analog Sticks Move
            const stickX = gp.axes[0];
            const stickY = gp.axes[1];
            if (Math.abs(stickX) > 0.15 || Math.abs(stickY) > 0.15) {
              hPlayer.vx = stickX * 4.5;
              hPlayer.vy = stickY * 4.5;
              gpadMoved = true;
            }

            // Aiming Stick
            const aimX = gp.axes[2];
            const aimY = gp.axes[3];
            if (Math.abs(aimX) > 0.2 || Math.abs(aimY) > 0.2) {
              hPlayer.angle = Math.atan2(aimY, aimX);
            } else if (Math.abs(hPlayer.vx) > 0.1 || Math.abs(hPlayer.vy) > 0.1) {
              // auto facing moving direction if no aim input
              hPlayer.angle = Math.atan2(hPlayer.vy, hPlayer.vx);
            }

            // R2 / Right Trigger shooting/building (button [7])
            const triggerBtn = gp.buttons[7];
            if (triggerBtn && triggerBtn.value > 0.3) {
              if (hPlayer.isBuilding) {
                buildStructure(hPlayer, hPlayer.targetBuildType, hPlayer.angle);
              } else {
                shootAction(hPlayer, hPlayer.angle);
              }
            }

            // R1 cycle weapon slot (button [5]) - tap detection
            if (gp.buttons[5].pressed && !keysPressed.current['gpad_r1']) {
              keysPressed.current['gpad_r1'] = true;
              const nextSlot = (hPlayer.activeSlot + 1) % 6;
              changeActiveSlot(nextSlot);
            } else if (!gp.buttons[5].pressed) {
              keysPressed.current['gpad_r1'] = false;
            }

            // L1 cycle prev slot (button [4])
            if (gp.buttons[4].pressed && !keysPressed.current['gpad_l1']) {
              keysPressed.current['gpad_l1'] = true;
              const prevSlot = (hPlayer.activeSlot - 1 + 6) % 6;
              changeActiveSlot(prevSlot);
            } else if (!gp.buttons[4].pressed) {
              keysPressed.current['gpad_l1'] = false;
            }

            // Circle / B toggle build mode (button [1])
            if (gp.buttons[1].pressed && !keysPressed.current['gpad_circle']) {
              keysPressed.current['gpad_circle'] = true;
              setIsBuildModeActive(prev => !prev);
            } else if (!gp.buttons[1].pressed) {
              keysPressed.current['gpad_circle'] = false;
            }

            // Jump button A/Cross (button [0])
            if (gp.buttons[0].pressed && !keysPressed.current['gpad_cross']) {
              keysPressed.current['gpad_cross'] = true;
              triggerJump();
            } else if (!gp.buttons[0].pressed) {
              keysPressed.current['gpad_cross'] = false;
            }

            // Interact X/Square (button [2])
            if (gp.buttons[2].pressed && !keysPressed.current['gpad_square']) {
              keysPressed.current['gpad_square'] = true;
              interactAction();
            } else if (!gp.buttons[2].pressed) {
              keysPressed.current['gpad_square'] = false;
            }
          }
        }

        // 2. Keyboard & Mouse Movement (if Gamepad did not already override movement forces)
        if (!gpadMoved) {
          const speedMult = hPlayer.skinId === 'recruit' ? 1.18 : 1.0;
          let hor = 0;
          let ver = 0;

          if (keysPressed.current['w'] || keysPressed.current['arrowup']) ver = -1;
          if (keysPressed.current['s'] || keysPressed.current['arrowdown']) ver = 1;
          if (keysPressed.current['a'] || keysPressed.current['arrowleft']) hor = -1;
          if (keysPressed.current['d'] || keysPressed.current['arrowright']) hor = 1;

          if (activeVehicleId !== null) {
            hPlayer.vx = 0;
            hPlayer.vy = 0;
            let angleValue = hPlayer.angle;
            if (viewMode === 'topdown') {
              const playerScreenX = hPlayer.x - camera.current.x;
              const playerScreenY = hPlayer.y - camera.current.y;
              const dx = mousePos.current.x - playerScreenX;
              const dy = mousePos.current.y - playerScreenY;
              angleValue = Math.atan2(dy, dx);
            }
            hPlayer.angle = angleValue;
          } else {
            hPlayer.vx = 0;
            hPlayer.vy = 0;
            const diagonalSpeed = 3.3 * speedMult;
            const baseSpeed = 4.4 * speedMult;

            if (hor !== 0 && ver !== 0) {
              hPlayer.vx = hor * diagonalSpeed;
              hPlayer.vy = ver * diagonalSpeed;
            } else {
              hPlayer.vx = hor * baseSpeed;
              hPlayer.vy = ver * baseSpeed;
            }
          }

          // Desktop Mouse Angle Tracking: Adjusted for Camera rotation in FP / TP
          let angleValue = hPlayer.angle;
          if (viewMode === 'tp' || viewMode === 'fp') {
            // Determine forward and right vectors relative to player's current angle
            const angle = hPlayer.angle;
            const fwdX = Math.cos(angle);
            const fwdY = Math.sin(angle);
            // Rotated 90 deg clockwise to get 'right' vector
            const rgtX = -Math.sin(angle);
            const rgtY = Math.cos(angle);

            // ver = -1 is forward, ver = 1 is backward
            // hor = -1 is left, hor = 1 is right
            const moveX = (fwdX * -ver) + (rgtX * hor);
            const moveY = (fwdY * -ver) + (rgtY * hor);

            // Normalize move vector if diagonal to prevent fast running
            const dist = Math.sqrt(moveX * moveX + moveY * moveY);
            if (dist > 0) {
              const speed = 4.4 * speedMult;
              hPlayer.vx = (moveX / dist) * speed;
              hPlayer.vy = (moveY / dist) * speed;
            } else {
              hPlayer.vx = 0;
              hPlayer.vy = 0;
            }

            // Steering wheel rotation model (prevents infinite spinning and allows smooth camera flight)
            const screenDX = mousePos.current.x - canvas.width / 2;
            // Only rotate if the mouse is moved away from the deadzone (inner 18px center)
            if (Math.abs(screenDX) > 18) {
              const rotationSpeed = 0.042; // smooth steering speed
              angleValue += (screenDX / (canvas.width / 2)) * rotationSpeed;
            }
          } else {
            // Classic Topdown setup camera translate
            const playerScreenX = hPlayer.x - camera.current.x;
            const playerScreenY = hPlayer.y - camera.current.y;
            const dx = mousePos.current.x - playerScreenX;
            const dy = mousePos.current.y - playerScreenY;
            angleValue = Math.atan2(dy, dx);
          }
          hPlayer.angle = angleValue;

          // Shooting trigger directly
          if (mousePos.current.isDown) {
            if (hPlayer.isBuilding) {
              buildStructure(hPlayer, hPlayer.targetBuildType, hPlayer.angle);
              mousePos.current.isDown = false; // build wall single-click
            } else {
              shootAction(hPlayer, hPlayer.angle);
            }
          }
        }

        // 3. Mobile Touch drag-joystick controls override
        if (touchJoystickMove.current.active) {
          hPlayer.vx = touchJoystickMove.current.x * 4.4;
          hPlayer.vy = touchJoystickMove.current.y * 4.4;
        }

        if (touchJoystickAim.current.active) {
          hPlayer.angle = Math.atan2(touchJoystickAim.current.y, touchJoystickAim.current.x);
        }
      }

      // === COLLISION CHECKS AND POSITION LOGIC ===
      alivePlayers.current.forEach(p => {
        if (p.state === 'skydiving' || p.state === 'gliding') {
          // descend sequence - gliding is much faster landing!
          const speedMultiplier = p.state === 'gliding' ? 0.08 : 0.03;
          const progressStep = p.state === 'gliding' ? 0.015 : 0.003;

          p.x += (p.targetLandingX! - p.x) * speedMultiplier;
          p.y += (p.targetLandingY! - p.y) * speedMultiplier;
          p.glideProgress += progressStep;
          
          if (p.glideProgress >= 1.0) {
            p.state = 'alive';
            p.glideProgress = 0; // reset
            if (p.id === 'human_player') {
              setGameState('playing');
              addNotification(`📱 [المشغل الذكي] ${p.name} هبط على ساحة المعركة!`);
              playSynthesizedSound('victory');
            }
          }
          return;
        }

        if (p.state !== 'alive') return;

        // Jump physics lift height simulation
        if (p.glideProgress > 0) {
          const gravityFactor = p.skinId === 'astronaut' ? 0.012 : 0.05;
          p.glideProgress -= gravityFactor; // descend jump gravity
          if (p.glideProgress < 0) p.glideProgress = 0;
        }

        // Knight active shield regeneration (+2 shield every 100 frames)
        if (p.skinId === 'knight') {
          p.knightRegenCooldown = (p.knightRegenCooldown || 0) + 1;
          if (p.knightRegenCooldown >= 100) {
            p.knightRegenCooldown = 0;
            if (p.shield < p.maxShield) {
              p.shield = Math.min(p.maxShield, p.shield + 2);
              if (p.id === 'human_player') {
                setPlayerShield(p.shield);
              }
            }
          }
        }

        // Add speed and boundary walls
        p.x += p.vx;
        p.y += p.vy;

        // map clamping
        p.x = Math.max(25, Math.min(worldWidth - 25, p.x));
        p.y = Math.max(25, Math.min(worldHeight - 25, p.y));

        // Reload trigger countdown Tick
        if (p.isReloading) {
          p.reloadTimeRemaining -= 16.67; // approx ms in 1 frame at 60Hz
          if (p.reloadTimeRemaining <= 0) {
            p.isReloading = false;
            // finish reloading gun ammo clip fills
            const wep = p.inventory[p.activeSlot];
            if (wep) {
              if (wep.type === 'medkit' || wep.type === 'shield' || wep.type === 'chug') {
                // healing consumption complete!
                let applied = false;
                if (wep.type === 'medkit') {
                  p.hp = 100;
                  applied = true;
                  playSynthesizedSound('victory');
                } else if (wep.type === 'shield') {
                  p.shield = Math.min(50, p.shield + 25);
                  applied = true;
                  playSynthesizedSound('victory');
                } else if (wep.type === 'chug') {
                  p.shield = Math.min(100, p.shield + 50);
                  applied = true;
                  playSynthesizedSound('victory');
                }

                if (applied) {
                  wep.reserveAmmo = (wep.reserveAmmo || 0) - 1;
                  if (wep.reserveAmmo <= 0) {
                    p.inventory[p.activeSlot] = null; // consume completely
                  }
                  spawnDamageText(p.x, p.y - 25, 'تم تطبيق الشفاء العالي!', '#22c55e');
                }
              } else {
                // ordinary gun ammo reloading
                const ammoRequired = wep.magazineSize - wep.ammo;
                const fillAmount = Math.min(ammoRequired, wep.reserveAmmo);
                wep.ammo += fillAmount;
                wep.reserveAmmo -= fillAmount;
                playSynthesizedSound('reload');
              }
            }
          }
        }

        // Physics Collisions: Players hitting Trees/Rocks (resource nodes)
        resources.current.forEach(n => {
          if (n.hp <= 0) return;
          const dx = p.x - n.x;
          const dy = p.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const comfortBound = n.radius + 18;
          if (dist < comfortBound) {
            // Push player out smoothly
            const pushAngle = Math.atan2(dy, dx);
            p.x = n.x + Math.cos(pushAngle) * comfortBound;
            p.y = n.y + Math.sin(pushAngle) * comfortBound;
          }
        });

        // Physics Collisions: Highly Precise Rotated Bounding Box for Fortnite structures (Walls)
        structures.current.forEach(st => {
          if (st.type !== 'wall' || st.hp <= 0) return;
          const dx = p.x - st.x;
          const dy = p.y - st.y;
          
          // Rotate points into wall's local space coordinates
          const angleRad = (st.angle * Math.PI) / 180;
          const cos = Math.cos(-angleRad);
          const sin = Math.sin(-angleRad);
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          
          const halfW = st.width / 2;
          const halfH = st.height / 2;
          const pRadius = 15; // player physical radius
          
          if (Math.abs(rx) < halfW + pRadius && Math.abs(ry) < halfH + pRadius) {
            // Collision detected! Push play out along the shallowest axis in local space
            const overlapX = (halfW + pRadius) - Math.abs(rx);
            const overlapY = (halfH + pRadius) - Math.abs(ry);
            
            let pushLocalX = 0;
            let pushLocalY = 0;
            if (overlapX < overlapY) {
              pushLocalX = Math.sign(rx) * overlapX;
            } else {
              pushLocalY = Math.sign(ry) * overlapY;
            }
            
            // Convert back to world coordinates
            const pushWorldX = pushLocalX * Math.cos(angleRad) - pushLocalY * Math.sin(angleRad);
            const pushWorldY = pushLocalX * Math.sin(angleRad) + pushLocalY * Math.cos(angleRad);
            
            p.x += pushWorldX;
            p.y += pushWorldY;
          }
        });

        // Physics Collisions: Players hitting solid rectangular Houses (with entering/exiting doors)
        houses.current.forEach(hs => {
          const dx = p.x - hs.x;
          const dy = p.y - hs.y;
          const halfW = hs.w / 2;
          const halfH = hs.h / 2;
          const playerRadius = 15;
          const doorOpen = hs.doorOpen || false;

          // Door area at the bottom: centered at hs.x, Y = hs.y + halfH
          const isNearDoor = Math.abs(p.x - hs.x) < 20 && Math.abs(p.y - (hs.y + halfH)) < 24;

          if (doorOpen && isNearDoor) {
            // Player is actively passing through the open door! Allow bypass
            return;
          }

          const isInside = Math.abs(dx) < halfW && Math.abs(dy) < halfH;

          if (isInside) {
            // Constrain player inside the house margins
            // Left boundary wall
            if (p.x < hs.x - halfW + playerRadius) {
              p.x = hs.x - halfW + playerRadius;
            }
            // Right boundary wall
            if (p.x > hs.x + halfW - playerRadius) {
              p.x = hs.x + halfW - playerRadius;
            }
            // Top boundary wall
            if (p.y < hs.y - halfH + playerRadius) {
              p.y = hs.y - halfH + playerRadius;
            }
            // Bottom boundary wall (blocks exit except through the door when open)
            if (p.y > hs.y + halfH - playerRadius) {
              const nearDoorExit = Math.abs(p.x - hs.x) < 20;
              if (doorOpen && nearDoorExit) {
                // Let exit!
              } else {
                p.y = hs.y + halfH - playerRadius;
              }
            }
          } else {
            // Player is OUTSIDE. Apply rectangular push-out block
            if (Math.abs(dx) < halfW + playerRadius && Math.abs(dy) < halfH + playerRadius) {
              const overlapX = (halfW + playerRadius) - Math.abs(dx);
              const overlapY = (halfH + playerRadius) - Math.abs(dy);
              
              if (overlapX < overlapY) {
                p.x += Math.sign(dx) * overlapX;
              } else {
                const nearDoorEnter = Math.abs(p.x - hs.x) < 20;
                // Allow passing bottom wall if door is open and player is walking up
                if (dy > 0 && doorOpen && nearDoorEnter) {
                  // Bypass
                } else {
                  p.y += Math.sign(dy) * overlapY;
                }
              }
            }
          }
        });

        // Interactive Ammo Pad Refill Mechanics
        houses.current.forEach(hs => {
          if (!hs.ammoPadActive) return;
          const dx = p.x - hs.x;
          const dy = p.y - hs.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 26) {
            const now = Date.now();
            if (now - hs.lastRefillTime > 3500) {
              hs.lastRefillTime = now;
              
              // Refill human player or bot weapons ammo
              let refilled = false;
              p.inventory.forEach(item => {
                if (item && item.type !== 'pickaxe' && item.type !== 'medkit' && item.type !== 'shield' && item.type !== 'chug') {
                  const maxExtra = item.type === 'rpg' ? 8 : item.type === 'sniper' ? 24 : item.type === 'shotgun' ? 30 : 120;
                  if (item.ammo < item.magazineSize || item.reserveAmmo < maxExtra) {
                    item.ammo = item.magazineSize;
                    item.reserveAmmo = maxExtra;
                    refilled = true;
                  }
                }
              });
              
              if (refilled) {
                playSynthesizedSound('reload');
                if (!p.isBot) {
                  addNotification(`🔋 [محطة الذخيرة] تم شحن وتعبئة الرصاص لجميع أسلحتك من داخل مجمع المنازل!`);
                  spawnDamageText(hs.x, hs.y - 32, '+شحن كامل للرصاص 🔋', '#10b981');
                  
                  // Instantly update React HUD display
                  const currentWep = p.inventory[p.activeSlot];
                  if (currentWep) {
                    setBulletsInClip(currentWep.ammo);
                    setReserveAmmo(currentWep.reserveAmmo);
                  }
                }
              }
            }
          }
        });
      });

      // === BOT AI LOGIC SEQUENCE (Every few ticks, optimized) ===
      alivePlayers.current.forEach(p => {
        if (!p.isBot || p.state !== 'alive') return;
        const bot = p as Bot;
        
        const now = Date.now();
        if (now - bot.aiLastDecisionTime > 400 + Math.random() * 400) {
          bot.aiLastDecisionTime = now;

          // Storm survival override
          const dxS = bot.x - storm.current.safeX;
          const dyS = bot.y - storm.current.safeY;
          const distFromStorm = Math.sqrt(dxS * dxS + dyS * dyS);
          
          if (distFromStorm > storm.current.safeRadius - 100) {
            // Storm is coming! Flee immediately to the safe center
            bot.aiState = 'fleeing';
            bot.aiTargetX = storm.current.safeX + (Math.random() * 100 - 50);
            bot.aiTargetY = storm.current.safeY + (Math.random() * 100 - 50);
            bot.vx = Math.cos(Math.atan2(bot.aiTargetY - bot.y, bot.aiTargetX - bot.x)) * 3;
            bot.vy = Math.sin(Math.atan2(bot.aiTargetY - bot.y, bot.aiTargetX - bot.x)) * 3;
            return;
          }

          // Attack closest visible players if found
          const threat = findClosestTarget(bot);
          if (threat) {
            bot.aiState = 'attacking';
            bot.aiTargetId = threat.id;
            bot.aiTargetX = threat.x;
            bot.aiTargetY = threat.y;

            // Attack angle
            bot.angle = Math.atan2(threat.y - bot.y, threat.x - bot.x);

            // decide whether to fire, or build first defensively
            shootAction(bot, bot.angle);

            // move closer or evade
            bot.vx = Math.cos(bot.angle) * 2;
            bot.vy = Math.sin(bot.angle) * 2;
            return;
          }

          // Low materials -> harvest close trees!
          if (bot.wood < 40) {
            // find nearest active node
            let closestNode: ResourceNode | null = null;
            let closestNdist = 900;
            resources.current.forEach(rn => {
              if (rn.hp <= 0) return;
              const d = Math.sqrt(Math.pow(bot.x - rn.x, 2) + Math.pow(bot.y - rn.y, 2));
              if (d < closestNdist) {
                closestNdist = d;
                closestNode = rn;
              }
            });

            if (closestNode) {
              const node: ResourceNode = closestNode;
              bot.aiState = 'harvesting';
              bot.aiTargetX = node.x;
              bot.aiTargetY = node.y;

              const angleToNode = Math.atan2(node.y - bot.y, node.x - bot.x);
              bot.angle = angleToNode;
              
              if (closestNdist < 65) {
                bot.vx = 0; bot.vy = 0;
                bot.activeSlot = 0; // Pickaxe strike!
                shootAction(bot, angleToNode);
              } else {
                bot.vx = Math.cos(angleToNode) * 2.8;
                bot.vy = Math.sin(angleToNode) * 2.8;
              }
              return;
            }
          }

          // Seek unopened Chests / loot on ground
          let closestChest: Chest | null = null;
          let closestCdist = 1000;
          chests.current.forEach(ch => {
            if (ch.opened) return;
            const d = Math.sqrt(Math.pow(bot.x - ch.x, 2) + Math.pow(bot.y - ch.y, 2));
            if (d < closestCdist) {
              closestCdist = d;
              closestChest = ch;
            }
          });

          if (closestChest) {
            const ch: Chest = closestChest;
            bot.aiState = 'looting';
            const angleToChest = Math.atan2(ch.y - bot.y, ch.x - bot.x);
            bot.angle = angleToChest;

            if (closestCdist < 65) {
              bot.vx = 0; bot.vy = 0;
              // Open chest sequence simulating interaction delay
              ch.opened = true;
              ch.glowing = false;
              playSynthesizedSound('explosion');
              bot.wood += 30;

              // spawn chests drops inside ground pool
              const flyX = ch.x + (Math.random()*40-20);
              const flyY = ch.y - 10;
              const loot = generateChestLoot();
              loot.forEach((w, i) => {
                itemDrops.current.push({
                  id: 'drop_bot_loot_' + Math.random().toString(),
                  x: flyX + (i * 30 - 15),
                  y: flyY,
                  weapon: w,
                  glowRotation: Math.random() * Math.PI
                });
              });
            } else {
              bot.vx = Math.cos(angleToChest) * 2.8;
              bot.vy = Math.sin(angleToChest) * 2.8;
            }
            return;
          }

          // Random wandering movement (Idle state)
          bot.aiState = 'wandering';
          const randAngle = Math.random() * Math.PI * 2;
          bot.vx = Math.cos(randAngle) * 2;
          bot.vy = Math.sin(randAngle) * 2;
          bot.angle = randAngle;
        }

        // Apply simple physics decay to AI if stuck or build mode is over
        if (bot.aiState === 'building') {
          bot.vx = 0; bot.vy = 0;
        }
      });

      // === VEHICLES PHYSICS & DRIVING CONTROLS TICK ===
      vehicles.current.forEach(car => {
        // If human player is the driver, apply driver keyboard/mouse/touch forces
        if (car.driverId === 'human_player') {
          const hPlayer = playerRef.current;
          if (hPlayer && hPlayer.state === 'alive') {
            const driveSpeedMult = car.type === 'sports' ? 1.25 : car.type === 'buggy' ? 1.05 : 0.8;
            const maxSpeed = 7.5 * driveSpeedMult;
            const acceleration = 0.16 * driveSpeedMult;
            const friction = 0.985;
            const steeringSpeed = car.type === 'buggy' ? 0.052 : car.type === 'sports' ? 0.046 : 0.028;
            
            // Accelerate / Reverse
            let accelerate = 0;
            if (keysPressed.current['w'] || keysPressed.current['arrowup']) accelerate = 1;
            if (keysPressed.current['s'] || keysPressed.current['arrowdown']) accelerate = -1;

            // Handle touch virtual joystick move as drive inputs!
            if (touchJoystickMove.current.active) {
              accelerate = -touchJoystickMove.current.y * 1.5;
              car.angle += touchJoystickMove.current.x * steeringSpeed * 1.2;
            }

            if (accelerate > 0) {
              car.speed = Math.min(car.speed + acceleration, maxSpeed);
            } else if (accelerate < 0) {
              car.speed = Math.max(car.speed - acceleration, -maxSpeed * 0.5);
            } else {
              car.speed *= friction;
            }

            // Steer/Turn
            let steer = 0;
            if (keysPressed.current['a'] || keysPressed.current['arrowleft']) steer = -1;
            if (keysPressed.current['d'] || keysPressed.current['arrowright']) steer = 1;

            if (steer !== 0) {
              const steerDirection = car.speed !== 0 ? Math.sign(car.speed) : 0;
              car.angle += steer * steeringSpeed * steerDirection;
            }

            // Calculate velocity components
            car.vx = Math.cos(car.angle) * car.speed;
            car.vy = Math.sin(car.angle) * car.speed;

            // Update car position
            car.x += car.vx;
            car.y += car.vy;

            // Lock human player center position directly to the vehicle!
            hPlayer.x = car.x;
            hPlayer.y = car.y;
            hPlayer.vx = car.vx;
            hPlayer.vy = car.vy;

            // Update HUD values
            setVehicleSpeed(Math.round(Math.abs(car.speed) * 16)); // mph scale
          }
        } else {
          // Passive friction for un-driven cars
          car.speed *= 0.92;
          car.vx = Math.cos(car.angle) * car.speed;
          car.vy = Math.sin(car.angle) * car.speed;
          
          car.x += car.vx;
          car.y += car.vy;
        }

        // Map safe-boundaries for all vehicles
        car.x = Math.max(50, Math.min(worldWidth - 50, car.x));
        car.y = Math.max(50, Math.min(worldHeight - 50, car.y));

        // Crash and harvest resource nodes (trees/stones) with high-speed impact!
         if (Math.abs(car.speed) > 2.2) {
           resources.current.forEach(n => {
             if (n.hp <= 0) return;
             const dx = n.x - car.x;
             const dy = n.y - car.y;
             const dist = Math.sqrt(dx * dx + dy * dy);
             if (dist < n.radius + 32) {
               // Crashing node!
               const damageVal = car.type === 'truck' ? 120 : 60;
               n.hp -= damageVal;
               
               const harvestMult = car.type === 'truck' ? 3.0 : 1.5;
               const finalYield = Math.floor(n.woodYield * harvestMult);
               
               if (car.driverId === 'human_player') {
                 const driverPl = playerRef.current;
                 if (driverPl) {
                   driverPl.wood += finalYield;
                   setPlayerWood(driverPl.wood);
                 }
               }
               
               spawnDamageText(n.x, n.y - 12, `💥 اصطدام: +${finalYield} خشب`, '#a7f3d0');
               playSynthesizedSound('harvest');
               camera.current.shake = 5;
               
               // bounce back slow down
               car.speed *= -0.4;
               
               if (n.hp <= 0) {
                 playSynthesizedSound('explosion');
                 for (let pi = 0; pi < 12; pi++) {
                   spawnParticle(n.x, n.y, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, 'wood', '#451a03');
                 }
               }
             }
           });

           // Hit bots / enemies crash mechanics
           alivePlayers.current.forEach(enemy => {
             if (enemy.id === car.driverId || enemy.state !== 'alive') return;
             const dx = enemy.x - car.x;
             const dy = enemy.y - car.y;
             const dist = Math.sqrt(dx * dx + dy * dy);
             if (dist < 34) {
               // Deal crushing damage proportional to speed!
               const crashDmg = Math.floor(Math.abs(car.speed) * (car.type === 'truck' ? 10.5 : 7.0));
               const attacker = car.driverId === 'human_player' ? playerRef.current! : null;
               damageEntity(attacker, enemy, crashDmg, car.name);
               
               // bounce enemy
               const bounceAngle = Math.atan2(dy, dx);
               enemy.x += Math.cos(bounceAngle) * 45;
               enemy.y += Math.sin(bounceAngle) * 45;
               
               playSynthesizedSound('explosion');
               camera.current.shake = 7;
               
               car.speed *= -0.3; // bounce vehicle back
             }
           });
         }
      });

      // === DRAW RESOURCE NODES (TREES / ROCKS) ===
      resources.current.forEach(n => {
        if (n.hp <= 0) return;

        // Draw shadow base
        ctx.fillStyle = 'rgba(15,23,42,0.22)';
        ctx.beginPath();
        ctx.arc(n.x, n.y + 10, n.radius - 2, 0, Math.PI * 2);
        ctx.fill();

        if (is3dMode) {
          if (n.type === 'tree') {
            // Extruded cylinder trunk in 3D
            ctx.fillStyle = '#78350f';
            for (let h = 0; h < 20; h++) {
              ctx.beginPath();
              ctx.arc(n.x, n.y - h, 8 - (h * 0.15), 0, Math.PI * 2);
              ctx.fill();
            }
            // Concentric spherical layered canopies for gorgeous 3D tree
            const treeLayers = ['#14532d', '#166534', '#15803d', '#22c55e', '#4ade80'];
            for (let i = 0; i < treeLayers.length; i++) {
              ctx.fillStyle = treeLayers[i];
              const r = n.radius - i * 4.5;
              ctx.beginPath();
              ctx.arc(n.x, n.y - 20 - i * 4.5, Math.max(3, r), 0, Math.PI * 2);
              ctx.fill();

              // Shine/reflection detail
              ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
              ctx.beginPath();
              ctx.arc(n.x - r * 0.2, (n.y - 20 - i * 4.5) - r * 0.2, Math.max(2, r * 0.6), 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            // Rock boulder: stacked layered stone slabs
            for (let h = 0; h < 12; h++) {
              const shade = 70 + h * 5;
              ctx.fillStyle = `rgb(${shade}, ${shade + 8}, ${shade + 15})`;
              const r = n.radius - h * 1.2;
              ctx.beginPath();
              ctx.arc(n.x - h * 0.4, n.y - h * 1.3, Math.max(2, r), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        } else {
          if (n.type === 'tree') {
            // Tree body visual style
            ctx.fillStyle = '#15803d'; // Rich green
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#166534'; // darker outline
            ctx.beginPath();
            ctx.arc(n.x - 4, n.y - 4, n.radius - 6, 0, Math.PI * 2);
            ctx.fill();

            // Tree trunk stem core
            ctx.fillStyle = '#78350f';
            ctx.beginPath();
            ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Rock boulder style
            ctx.fillStyle = '#64748b'; // slate dark grey
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#475569';
            ctx.beginPath();
            ctx.arc(n.x - 3, n.y - 3, n.radius - 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Health bar display when damaged
        if (n.hp < n.maxHp) {
          const ratio = n.hp / n.maxHp;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(n.x - 25, n.y - n.radius - 12 - (is3dMode ? 18 : 0), 50, 6);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(n.x - 25, n.y - n.radius - 12 - (is3dMode ? 18 : 0), 50 * ratio, 6);
        }
      });

      // === DRAW SOLID 3D URBAN HOUSES ===
      houses.current.forEach(hs => {
        // Evaluate if player is inside this house bounds to make walls/roof translucent
        let playerInside = false;
        const curPl = playerRef.current;
        if (curPl) {
          playerInside = Math.abs(curPl.x - hs.x) < hs.w / 2 && Math.abs(curPl.y - hs.y) < hs.h / 2;
        }
        
        const opacity = playerInside ? 0.30 : 0.98;
        
        ctx.save();
        
        // Solid House ground shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
        ctx.fillRect(hs.x - hs.w / 2 + 8, hs.y - hs.h / 2 + 8, hs.w, hs.h);
        
        // 1. Wood plank flooring inside
        ctx.fillStyle = '#5c4033'; // Deep brown wood floor
        ctx.fillRect(hs.x - hs.w / 2, hs.y - hs.h / 2, hs.w, hs.h);
        
        // Drawing floor board patterns
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 1;
        for (let fx = hs.x - hs.w / 2; fx < hs.x + hs.w / 2; fx += 25) {
          ctx.beginPath();
          ctx.moveTo(fx, hs.y - hs.h / 2);
          ctx.lineTo(fx, hs.y + hs.h / 2);
          ctx.stroke();
        }
        
        // 2. Glowing Holographic Gun/Ammo Pad Station inside the house
        if (hs.ammoPadActive) {
          const osc = (Date.now() / 380) % (Math.PI * 2);
          const padRad = 20 + Math.sin(osc) * 3;
          
          ctx.strokeStyle = `rgba(14, 165, 233, ${0.45 + Math.sin(osc) * 0.2})`;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(hs.x, hs.y, padRad, 0, Math.PI * 2);
          ctx.stroke();
          
          // Inner core circle
          ctx.fillStyle = 'rgba(14, 165, 233, 0.2)';
          ctx.beginPath();
          ctx.arc(hs.x, hs.y, 14, 0, Math.PI * 2);
          ctx.fill();
          
          // Outer spinning brackets
          ctx.strokeStyle = '#0ea5e9';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(hs.x, hs.y, padRad + 5, osc, osc + 1);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(hs.x, hs.y, padRad + 5, osc + Math.PI, osc + Math.PI + 1);
          ctx.stroke();
          
          // Refill pad label text
          ctx.fillStyle = '#38bdf8';
          ctx.font = '900 10px "Inter", "Arial"';
          ctx.textAlign = 'center';
          ctx.fillText('📡 رصاص', hs.x, hs.y + 3);
        }
        
        // 3. Extruded 3D structures or flat layout topdown fallback
        ctx.globalAlpha = opacity;
        if (is3dMode) {
          const wallHeightLayers = 38;
          
          // Stack the walls of the house
          for (let i = 0; i < wallHeightLayers; i++) {
            // Brighten layers from bottom to top for shading
            const shad = 40 + i * 1.5;
            ctx.fillStyle = `rgb(${shad}, ${shad + 8}, ${shad + 18})`; // Slate bricks
            ctx.fillRect(hs.x - hs.w / 2, (hs.y - hs.h / 2) - i * 1.1, hs.w, hs.h);
            
            // Draw a door and windows on the lower layers
            if (i < 16) {
              // Front central door segment (mahogany look)
              ctx.fillStyle = '#7c2d12';
              ctx.fillRect(hs.x - 15, (hs.y + hs.h / 2 - 3) - i * 1.1, 30, 4);
              
              // Light blue windows on left and right walls
              ctx.fillStyle = '#bae6fd'; 
              ctx.fillRect(hs.x - hs.w / 2 - 2, (hs.y - 10) - i * 1.1, 4, 20);
              ctx.fillRect(hs.x + hs.w / 2 - 2, (hs.y - 10) - i * 1.1, 4, 20);
            }
          }
          
          // 4. Slanted pyramidal extruded roof
          const roofLayers = 22;
          for (let r = 0; r < roofLayers; r++) {
            const shrinkW = r * 3.5;
            const shrinkH = r * 2.5;
            
            const wRemaining = Math.max(8, hs.w - shrinkW * 2);
            const hRemaining = Math.max(8, hs.h - shrinkH * 2);
            
            // Deep crimson roof tiles
            ctx.fillStyle = hs.roofColor;
            ctx.fillRect(hs.x - wRemaining / 2, (hs.y - hs.h / 2 - wallHeightLayers * 1.1) - r * 1.1, wRemaining, hRemaining);
            
            if (r === roofLayers - 1) {
              // Top-most chimney detail on the peak
              ctx.fillStyle = '#3c0d0d';
              ctx.fillRect(hs.x - 6, (hs.y - hs.h / 2 - wallHeightLayers * 1.1) - r * 1.1 - 6, 12, 12);
            }
          }
        } else {
          // Classic Flat top-down roof design
          ctx.fillStyle = hs.roofColor;
          ctx.fillRect(hs.x - hs.w / 2, hs.y - hs.h / 2, hs.w, hs.h);
          
          // Shading cross lines representing roof segments
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(hs.x - hs.w/2, hs.y - hs.h/2);
          ctx.lineTo(hs.x + hs.w/2, hs.y + hs.h/2);
          ctx.moveTo(hs.x + hs.w/2, hs.y - hs.h/2);
          ctx.lineTo(hs.x - hs.w/2, hs.y + hs.h/2);
          ctx.stroke();
          
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3.5;
          ctx.strokeRect(hs.x - hs.w / 2, hs.y - hs.h / 2, hs.w, hs.h);
          
          // Small roof peak dot atcenter
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(hs.x, hs.y, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      // === DRAW BUILDING BLUEPRINT PREVIEW ===
      const hPl = playerRef.current;
      if (hPl && hPl.id === 'human_player' && hPl.state === 'alive' && isInBuildMode) {
        const offsetDist = 65;
        const blueprintX = hPl.x + Math.cos(hPl.angle) * offsetDist;
        const blueprintY = hPl.y + Math.sin(hPl.angle) * offsetDist;
        const buildAngleRound = Math.round((hPl.angle * 180) / Math.PI / 90) * 90;
        
        ctx.save();
        ctx.translate(blueprintX, blueprintY);
        ctx.rotate((buildAngleRound * Math.PI) / 180);
        
        // Translucent neon-emerald matrix mesh look
        ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.8;
        
        const previewW = activeBuildType === 'wall' ? 80 : 70;
        const previewH = activeBuildType === 'wall' ? 12 : 70;
        
        ctx.fillRect(-previewW / 2, -previewH / 2, previewW, previewH);
        ctx.strokeRect(-previewW / 2, -previewH / 2, previewW, previewH);
        
        // Draw centered blueprints icon grid lines
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 9px "Inter", "Arial"';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ مخطط ثلاثي الأبعاد', 0, 3);
        
        ctx.restore();
      }

      // === DRAW BUILT FORTNITE STRUCTURES (WALLS, RAMPS, FLOORS) ===
      structures.current.forEach(st => {
        if (st.hp <= 0) return;

        ctx.save();
        ctx.translate(st.x, st.y);
        ctx.rotate((st.angle * Math.PI) / 180);

        if (is3dMode) {
          if (st.type === 'wall') {
            const layers = 15;
            for (let i = 0; i < layers; i++) {
              // Darken bottom layers for shadow depth shading, brighten the top caps
              const brightness = 50 + i * 4;
              ctx.fillStyle = `rgb(${brightness}, ${brightness - 15}, ${brightness - 30})`;
              ctx.fillRect(-st.width / 2, -st.height / 2 - i * 1.5, st.width, st.height);

              if (i === layers - 1) {
                // top surface outlines
                ctx.strokeStyle = '#d97706';
                ctx.lineWidth = 1.3;
                ctx.strokeRect(-st.width / 2, -st.height / 2 - i * 1.5, st.width, st.height);

                // center divider lines for natural planks look
                ctx.strokeStyle = '#a16207';
                ctx.beginPath();
                ctx.moveTo(-st.width / 2, -i * 1.5);
                ctx.lineTo(st.width / 2, -i * 1.5);
                ctx.stroke();
              }
            }
          } else if (st.type === 'floor') {
            const layers = 3;
            for (let i = 0; i < layers; i++) {
              ctx.fillStyle = i === layers - 1 ? '#a16207' : '#78350f';
              ctx.fillRect(-st.width / 2, -st.height / 2 - i * 1.5, st.width, st.height);
              
              if (i === layers - 1) {
                ctx.strokeStyle = '#78350f';
                ctx.lineWidth = 1.5;
                ctx.strokeRect(-st.width / 2, -st.height / 2 - i * 1.5, st.width, st.height);
              }
            }
          } else {
            // Ramp stairs: progressive ascending blocks
            const steps = 8;
            const stepW = st.width;
            const stepH = st.height / steps;
            for (let i = 0; i < steps; i++) {
              const shade = 100 + i * 8;
              ctx.fillStyle = `rgb(${shade}, ${shade - 30}, ${shade - 70})`;
              // slide stair steps up and back
              ctx.fillRect(-stepW / 2, -st.height / 2 + i * stepH - i * 1.5, stepW, stepH);
              
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1;
              ctx.strokeRect(-stepW / 2, -st.height / 2 + i * stepH - i * 1.5, stepW, stepH);
            }
          }
        } else {
          if (st.type === 'wall') {
            // Draw solid wooden wall plank with textures
            ctx.fillStyle = '#854d0e'; // Golden brown wood
            ctx.fillRect(-st.width / 2, -st.height / 2, st.width, st.height);

            // texture lines representing wood planks
            ctx.strokeStyle = '#a16207';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(-st.width / 2, 0);
            ctx.lineTo(st.width / 2, 0);
            ctx.stroke();

            // HP indicators
            ctx.strokeStyle = '#ffffff88';
            ctx.strokeRect(-st.width / 2, -st.height / 2, st.width, st.height);
          } else if (st.type === 'floor') {
            // Flat horizontal wood plank plates
            ctx.fillStyle = '#a16207';
            ctx.fillRect(-st.width / 2, -st.height / 2, st.width, st.height);
            
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 2;
            ctx.strokeRect(-st.width / 2, -st.height / 2, st.width, st.height);
          } else {
            // Ramp wooden stairs drawing with directional diagonal lines
            ctx.fillStyle = '#b45309';
            ctx.fillRect(-st.width / 2, -st.height / 2, st.width, st.height);

            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = -st.width / 2 + 10; i < st.width / 2; i += 15) {
              ctx.moveTo(i, -st.height / 2);
              ctx.lineTo(i, st.height / 2);
            }
            ctx.stroke();
          }
        }

        ctx.restore();

        // HP bar above structure if damaged
        if (st.hp < st.maxHp) {
          const ratio = st.hp / st.maxHp;
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(st.x - 20, st.y - 35 - (is3dMode ? 14 : 0), 40, 5);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(st.x - 20, st.y - 35 - (is3dMode ? 14 : 0), 40 * ratio, 5);
        }
      });

      // === DRAW CHESTS (GOLD CHESTS WITH GLOWING LIGHTS) ===
      chests.current.forEach(c => {
        if (c.glowing && !c.opened) {
          // Draw subtle pulsing background golden light radial
          const pulse = 24 + Math.sin(Date.now() / 150) * 8;
          const grad = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, pulse);
          grad.addColorStop(0, 'rgba(234, 179, 8, 0.45)');
          grad.addColorStop(1, 'rgba(234, 179, 8, 0.0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(c.x, c.y, pulse, 0, Math.PI * 2);
          ctx.fill();

          // Low range sound indicators hmmm for chest location
          const hP = playerRef.current;
          if (hP && hP.state === 'alive') {
            const dx = c.x - hP.x;
            const dy = c.y - hP.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 400 && Math.random() < 0.02) {
              playSynthesizedSound('chest_hum');
            }
          }
        }

        // Draw physical chest body container
        if (is3dMode) {
          const depth = 8;
          for (let i = 0; i < depth; i++) {
            if (c.opened) {
              ctx.fillStyle = i === depth - 1 ? '#475569' : '#1f2937';
            } else {
              const goldB = 140 + i * 12;
              ctx.fillStyle = `rgb(${goldB}, ${goldB - 40}, 15)`;
            }
            ctx.fillRect(c.x - 14, (c.y - 11) - i * 1.4, 28, 22);

            if (i === depth - 1) {
              ctx.strokeStyle = c.opened ? '#334155' : '#f59e0b';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(c.x - 14, (c.y - 11) - i * 1.4, 28, 22);

              // lock latch on front cap
              ctx.fillStyle = '#111827';
              ctx.fillRect(c.x - 4, (c.y - 2) - i * 1.4, 8, 6);
            }
          }
        } else {
          ctx.fillStyle = c.opened ? '#475569' : '#ca8a04'; // Grey if opened, Golden gold if locked
          ctx.strokeStyle = c.opened ? '#334155' : '#eab308';
          ctx.lineWidth = 2.5;

          ctx.fillRect(c.x - 14, c.y - 11, 28, 22);
          ctx.strokeRect(c.x - 14, c.y - 11, 28, 22);

          // Chest central latch lock plate
          ctx.fillStyle = c.opened ? '#1e293b' : '#334155';
          ctx.fillRect(c.x - 4, c.y - 1, 8, 7);
        }
      });

      // === DRAW LOOT DROPS (WEAPONS ON GROUND WITH AMBIENT GLOW BANDS) ===
      itemDrops.current.forEach(drop => {
        const wep = drop.weapon;
        
        // draw colored rarity glow aura
        drop.glowRotation += 0.012;
        ctx.strokeStyle = wep.color + '44';
        ctx.lineWidth = 1.5;
        ctx.save();
        ctx.translate(drop.x, drop.y);
        ctx.rotate(drop.glowRotation);
        
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // draw loot physical core badge
        ctx.fillStyle = wep.color;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffffdd';
        ctx.lineWidth = 1;
        ctx.stroke();

        // text title hover indicator if player is close
        const hPlayer = playerRef.current;
        if (hPlayer && hPlayer.state === 'alive' && !isSpectating.current) {
          const dx = drop.x - hPlayer.x;
          const dy = drop.y - hPlayer.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 75) {
            ctx.fillStyle = 'rgba(15,23,42,0.85)';
            ctx.fillRect(drop.x - 55, drop.y - 32, 110, 18);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 9px "Inter", "Arial"';
            ctx.textAlign = 'center';
            ctx.fillText(wep.name, drop.x, drop.y - 20);
          }
        }
      });

      // === DRAW BULLETS AND MISSILE ROCKETS ===
      const activeBullets: Bullet[] = [];
      bullets.current.forEach(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.rangeRemaining -= Math.sqrt(b.vx * b.vx + b.vy * b.vy);

        // Render bullet line trails
        ctx.strokeStyle = b.color;
        ctx.lineWidth = b.radius * 2;
        ctx.beginPath();
        ctx.moveTo(b.x - b.vx * 1.5, b.y - b.vy * 1.5);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();

        let bulletDismited = false;

        // Bullets hitting built wood walls / structures
        structures.current.forEach(st => {
          if (st.type === 'wall' && st.hp > 0 && !bulletDismited) {
            // Rotated bounding box intersection check for structural blocks in local space!
            const dx = b.x - st.x;
            const dy = b.y - st.y;
            const angleRad = (st.angle * Math.PI) / 180;
            const cos = Math.cos(-angleRad);
            const sin = Math.sin(-angleRad);
            const rx = dx * cos - dy * sin;
            const ry = dx * sin + dy * cos;
            
            const halfW = st.width / 2;
            const halfH = st.height / 2;
            
            if (Math.abs(rx) < halfW && Math.abs(ry) < halfH) {
              st.hp -= b.damage;
              bulletDismited = true;
              playSynthesizedSound('harvest');

              // splinter debris
              for (let pi = 0; pi < 6; pi++) {
                spawnParticle(b.x, b.y, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, 'wood', '#854d0e');
              }

              if (st.hp <= 0) {
                // play structural crumbling sound
                playSynthesizedSound('explosion');
                 spawnDamageText(st.x, st.y, 'تهدم الجدار!', '#b45309');
                 // huge debris explosion
                 for (let pi = 0; pi < 12; pi++) {
                   spawnParticle(st.x, st.y, Math.random() * 5 - 2.5, Math.random() * 5 - 2.5, 'wood', '#d2b48c');
                 }
               }
             }
           }
         });
 
         // Bullets hitting physical stone house blocks
         houses.current.forEach(hs => {
           if (!bulletDismited) {
             const dx = Math.abs(b.x - hs.x);
             const dy = Math.abs(b.y - hs.y);
             const halfW = hs.w / 2;
             const halfH = hs.h / 2;
             
             if (dx < halfW && dy < halfH) {
               bulletDismited = true;
               playSynthesizedSound('harvest');
               // stone fragments debris sparks
               for (let pi = 0; pi < 6; pi++) {
                 spawnParticle(b.x, b.y, Math.random() * 3 - 1.5, Math.random() * 3 - 1.5, 'stone', '#475569');
               }
             }
           }
         });

        // RPG Rocket Explosion burst
        if (b.type === 'rpg' && (b.rangeRemaining <= 10 || bulletDismited)) {
          bulletDismited = true;
          playSynthesizedSound('explosion');
          camera.current.shake = 18;

          // explosion smoke / sparks fire
          for (let pIdx = 0; pIdx < 20; pIdx++) {
            const pAngle = Math.random() * Math.PI * 2;
            const pSpeed = Math.random() * 5 + 2;
            spawnParticle(
              b.x, b.y,
              Math.cos(pAngle) * pSpeed,
              Math.sin(pAngle) * pSpeed,
              'explosion',
              Math.random() < 0.6 ? '#f97316' : '#ffd700'
            );
          }

          // Damage entire targets close to RPG burst radius (120px)
          alivePlayers.current.forEach(p => {
            if (p.state !== 'alive') return;
            const dx = p.x - b.x;
            const dy = p.y - b.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 120) {
              const falloffdmg = Math.ceil(b.damage * (1 - d / 120));
              damageEntity(alivePlayers.current.find(att => att.id === b.ownerId) || playerRef.current!, p, falloffdmg, 'انفجار قاذف RPG');
            }
          });

          // Collapse nearby wooden walls in radius
          structures.current.forEach(st => {
            if (st.hp <= 0) return;
            const dx = st.x - b.x;
            const dy = st.y - b.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 130) {
              st.hp -= Math.ceil(b.damage * 1.5);
              if (st.hp <= 0) {
                playSynthesizedSound('explosion');
                for (let pi = 0; pi < 8; pi++) {
                  spawnParticle(st.x, st.y, Math.random()*4-2, Math.random()*4-2, 'wood', '#854d0e');
                }
              }
            }
          });
        }

        // Bullets hitting Vehicles
        if (!bulletDismited) {
          vehicles.current.forEach(car => {
            if (bulletDismited) return;
            const dx = car.x - b.x;
            const dy = car.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            const hitRadius = car.type === 'truck' ? 38 : 28;
            if (dist < hitRadius) {
              bulletDismited = true;
              car.hp -= b.damage;
              
              // Spark particles
              for (let pi = 0; pi < 5; pi++) {
                spawnParticle(b.x, b.y, Math.random() * 4 - 2, Math.random() * 4 - 2, 'stone', '#fca5a5');
              }
              playSynthesizedSound('harvest');
              spawnDamageText(car.x, car.y - 30, `-${b.damage}`, '#f87171');
              
              if (car.driverId === 'human_player') {
                setVehicleHp(car.hp);
              }
              
              if (car.hp <= 0) {
                playSynthesizedSound('explosion');
                camera.current.shake = 16;
                addNotification(`⚠️ انفجرت ${car.name}!`);
                
                for (let pi = 0; pi < 15; pi++) {
                  spawnParticle(car.x, car.y, Math.random() * 7 - 3.5, Math.random() * 7 - 3.5, 'explosion', '#f97316');
                }
                
                if (car.driverId) {
                  const driverPl = alivePlayers.current.find(p => p.id === car.driverId);
                  if (driverPl) {
                    driverPl.hp -= 30;
                    spawnDamageText(driverPl.x, driverPl.y - 15, `-30 ضرر انفجار المركبة`, '#ef4444');
                    if (driverPl.id === 'human_player') {
                      setActiveVehicleId(null);
                      setPlayerHp(driverPl.hp);
                    }
                  }
                  car.driverId = null;
                }
                
                vehicles.current = vehicles.current.filter(v => v.id !== car.id);
              }
            }
          });
        }

        // Bullets hitting Players/Bots
        if (!bulletDismited) {
          alivePlayers.current.forEach(enemy => {
            if (enemy.id === b.ownerId || enemy.state !== 'alive' || bulletDismited) return;

            const dx = enemy.x - b.x;
            const dy = enemy.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 18) { // hit radius bound
              bulletDismited = true;
              const attacker = alivePlayers.current.find(att => att.id === b.ownerId) || playerRef.current!;
              damageEntity(attacker, enemy, b.damage, b.type === 'ar' ? 'بندقية SCAR' : b.type === 'shotgun' ? 'بندقية Pump' : b.type === 'sniper' ? 'سلاح قناص' : 'رصاصة طائشة');
            }
          });
        }

        if (b.rangeRemaining > 0 && !bulletDismited) {
          activeBullets.push(b);
        }
      });
      bullets.current = activeBullets;

      // === DRAW VEHICLES ===
      vehicles.current.forEach(car => {
        ctx.save();
        ctx.translate(car.x, car.y);
        ctx.rotate(car.angle);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(-22, -14, 44, 28);

        // Wheels
        ctx.fillStyle = '#090d16'; // Tires
        ctx.fillRect(10, -17, 10, 5);
        ctx.fillRect(10, 12, 10, 5);
        ctx.fillRect(-18, -17, 10, 5);
        ctx.fillRect(-18, 12, 10, 5);

        if (car.type === 'sports') {
          // Sleek Bugatti sports car
          ctx.fillStyle = car.color;
          ctx.beginPath();
          ctx.moveTo(-20, -13);
          ctx.lineTo(15, -13);
          ctx.lineTo(25, -6);
          ctx.lineTo(25, 6);
          ctx.lineTo(15, 13);
          ctx.lineTo(-20, 13);
          ctx.closePath();
          ctx.fill();

          // Black spoiler
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-23, -14, 4, 28);

          // Front windshield hood
          ctx.fillStyle = '#bae6fd';
          ctx.beginPath();
          ctx.moveTo(-2, -9);
          ctx.lineTo(12, -7);
          ctx.lineTo(12, 7);
          ctx.lineTo(-2, 9);
          ctx.closePath();
          ctx.fill();

          // Yellow headlights
          ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.beginPath();
          ctx.moveTo(25, -6);
          ctx.lineTo(55, -20);
          ctx.lineTo(55, 20);
          ctx.lineTo(25, 6);
          ctx.closePath();
          ctx.fill();
        } else if (car.type === 'truck') {
          // Heavy cyber truck
          ctx.fillStyle = car.color;
          ctx.fillRect(-24, -15, 48, 30);

          ctx.strokeStyle = '#71717a';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-24, -15, 48, 30);

          // Roof lights
          ctx.fillStyle = '#fdba74';
          ctx.fillRect(-4, -10, 2, 20);
          ctx.fillStyle = '#ffedd5';
          ctx.fillRect(-4, -8, 2, 4);
          ctx.fillRect(-4, 4, 2, 4);

          // Shield cabin tint
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(8, -11, 8, 22);

          // Yellow headlights
          ctx.fillStyle = 'rgba(251, 191, 36, 0.45)';
          ctx.beginPath();
          ctx.moveTo(24, -10);
          ctx.lineTo(54, -24);
          ctx.lineTo(54, 24);
          ctx.lineTo(24, 10);
          ctx.closePath();
          ctx.fill();
        } else {
          // Buggy
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 2.5;
          ctx.strokeRect(-16, -11, 32, 22);

          ctx.fillStyle = '#eab308';
          ctx.fillRect(-10, -8, 18, 16);

          ctx.fillStyle = '#475569';
          ctx.fillRect(10, -6, 5, 12);
        }

        // Draw Health bar above
        if (car.hp < car.maxHp) {
          ctx.restore();
          ctx.save();
          ctx.translate(car.x, car.y);
          
          const barW = 32;
          const barH = 4;
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(-barW/2, -26, barW, barH);
          ctx.fillStyle = '#34d399';
          ctx.fillRect(-barW/2, -26, barW * (car.hp / car.maxHp), barH);
        }

        ctx.restore();
      });

      // === DRAW PLAYERS & SIMULATED BOTS (CHASSIS, SKIN COLORING, AND PLATES) ===
      alivePlayers.current.forEach(p => {
        // If player is driving a vehicle, draw their head in the cabin and return
        const activeCar = vehicles.current.find(v => v.driverId === p.id);
        if (activeCar) {
          ctx.save();
          ctx.translate(activeCar.x, activeCar.y);
          ctx.rotate(activeCar.angle);
          
          // Draw helmet head inside the cabin
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
          
          // visor
          ctx.fillStyle = p.detailsColor || '#030712';
          ctx.beginPath();
          ctx.arc(3, 0, 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
          return;
        }

        // Skydive flight rendering styling
        if (p.state === 'skydiving' || p.state === 'gliding') {
          // Draw a stylized glider parachute above them
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y - 25, 30, Math.PI, Math.PI * 2);
          ctx.stroke();

          // parachute ropes
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x - 30, p.y - 25);
          ctx.lineTo(p.x, p.y);
          ctx.moveTo(p.x + 30, p.y - 25);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();

          // Skydiver body preview
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
          ctx.fill();
          return;
        }

        if (p.state !== 'alive') return;

        // First Person viewport HUD substitution
        if (viewMode === 'fp' && activeFocus && p.id === activeFocus.id) {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          
          const isGunEquiped = p.inventory[p.activeSlot] !== null;
          if (isGunEquiped) {
            // Draw dual FPS assault/gun barrels pointing forward!
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(10, -5, 24, 6); // main barrel
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(32, -4, 4, 4); // red laser sight
          } else {
            // Pickaxe model
            ctx.fillStyle = '#c084fc'; // neon purple pickaxe indicator
            ctx.fillRect(8, -4, 18, 5);
          }
          ctx.restore();
          return;
        }

        // Render Jump Elevation lift offset height if dynamic jump active
        let heightShadowOffset = 0;
        let liftY = 0;
        if (p.glideProgress > 0) {
          // Simulate climbing sine wave apex leap elevation - Astronaut jumps much higher!
          const jumpHeight = p.skinId === 'astronaut' ? 44 : 16;
          liftY = -Math.sin(p.glideProgress * Math.PI) * jumpHeight;
          heightShadowOffset = Math.sin(p.glideProgress * Math.PI) * (jumpHeight / 2.2);
        }

        // Draw Player shadow base
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        // shadow shrinks slightly when leaping high
        ctx.arc(p.x, p.y + 12, Math.max(2, 11 - heightShadowOffset), 0, Math.PI*2);
        ctx.fill();

        // 1. Client circular Body / 3D Extrusion
        const skin = CHARACTER_SKINS.find(s => s.id === p.skinId) || CHARACTER_SKINS[0];

        if (is3dMode) {
          const layers = 12;

          // Draw weapon beneath top layer for proper depth
          ctx.save();
          ctx.translate(p.x, p.y + liftY - 8);
          ctx.rotate(p.angle);
          const isGunEquiped = p.inventory[p.activeSlot] !== null;
          if (isGunEquiped) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(8, -12, 16, 5); // gun
            ctx.fillStyle = skin.color;
            ctx.fillRect(9, -14, 4, 4); // grip
          } else {
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(6, -11, 4, 18); // pickaxe staff
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(4, -14, 8, 3); // pickaxe metal
          }
          ctx.restore();

          // Stack body cylinder capsule layers
          for (let i = 0; i < layers; i++) {
            // Brighten up the player layers to emulate top lighting
            ctx.fillStyle = skin.color;
            ctx.beginPath();
            ctx.arc(p.x, (p.y + liftY) - i * 1.3, 14.8 - i * 0.25, 0, Math.PI * 2);
            ctx.fill();

            if (i === layers - 1) {
              // outline cap
              ctx.strokeStyle = '#0f172a';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Draw beautiful helmet visor faceplate on top cap
              ctx.save();
              ctx.translate(p.x, (p.y + liftY) - i * 1.3);
              ctx.rotate(p.angle);
              
              ctx.fillStyle = skin.detailsColor;
              ctx.fillRect(4, -6, 7, 12);
              
              ctx.fillStyle = skin.accColor;
              ctx.fillRect(7, -2, 3.5, 4); // visor glowing indicator
              ctx.restore();
            }
          }
        } else {
          ctx.fillStyle = skin.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y + liftY, 15, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Helmet mask visor
          ctx.fillStyle = skin.detailsColor;
          ctx.save();
          ctx.translate(p.x, p.y + liftY);
          ctx.rotate(p.angle);
          ctx.fillRect(4, -6, 8, 12);
          
          ctx.fillStyle = skin.accColor;
          ctx.fillRect(8, -2, 4, 4); // glowing visor light

          // Weapon hands holding simulation
          const isGunEquiped = p.inventory[p.activeSlot] !== null;
          if (isGunEquiped) {
            // Draws small blocks for hands gripping a rifle gun barrel
            ctx.fillStyle = '#64748b';
            ctx.fillRect(8, -12, 14, 5); // Rifle barrel length representation
            ctx.fillStyle = skin.color;
            ctx.fillRect(9, -14, 4, 4);  // hand grip
          } else {
            // Harvesting weapon pickaxe grip
            ctx.fillStyle = '#ca8a04';
            ctx.fillRect(6, -11, 4, 18); // pickaxe branch staff
            ctx.fillStyle = '#9ca3af';
            ctx.fillRect(4, -14, 8, 3);  // pickaxe hammer plate
          }
          ctx.restore();
        }

        // 2. Health and Shield Bars above head (HUD helper)
        if (p.hp > 0) {
          const barW = 34;
          const barH = 3.5;
          const barY = p.y - 28 + liftY;

          // grey bg
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(p.x - barW/2, barY, barW, barH * 2);

          // hp green bar
          ctx.fillStyle = '#22c55e';
          ctx.fillRect(p.x - barW/2, barY, barW * (p.hp / 100), barH);

          // shield blue bar
          if (p.shield > 0) {
            ctx.fillStyle = '#3b82f6';
            ctx.fillRect(p.x - barW/2, barY + barH, barW * (p.shield / 100), barH);
          }
        }

        // 3. Username platform badge text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px "Inter", "Arial"';
        ctx.textAlign = 'center';
        
        const platformBadge = PLATFORM_DETAILS[p.platform].prefix;
        const nameText = `${platformBadge} ${p.name}`;
        
        // Glow if spectating active client
        if (activeFocus && p.id === activeFocus.id) {
          ctx.fillStyle = '#facc15'; // Golden name for highlighted shooter
        }
        ctx.fillText(nameText, p.x, p.y - 32 + liftY);
      });

      // === DRAW PARTICLES (EXPLOSION, SPARK, DUST) ===
      const activeParticles: Particle[] = [];
      particles.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        
        const size = p.size * (type => type === 'smoke' || type === 'explosion' ? p.life : 1.0)(p.type);
        ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
        ctx.fill();

        if (p.life > 0) {
          activeParticles.push(p);
        }
      });
      particles.current = activeParticles;
      ctx.globalAlpha = 1.0; // reset transparency

      // === DRAW DAMAGE FLOATING TEXTS ===
      const activeTexts: DamageText[] = [];
      damageTexts.current.forEach(t => {
        t.y -= 0.65; // float upwards
        t.life -= 0.02;

        ctx.fillStyle = t.color;
        ctx.globalAlpha = t.life;
        ctx.font = 'black 14px "Inter"';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);

        if (t.life > 0) {
          activeTexts.push(t);
        }
      });
      damageTexts.current = activeTexts;
      ctx.globalAlpha = 1.0;

      // === DRAW THE GLOWING SHRINKING STORM CIRCLE ===
      // Safe White Zone Border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.arc(storm.current.safeX, storm.current.safeY, storm.current.safeRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // clear dash

      // Storm shrinking mechanism tick
      const hP = playerRef.current;
      if (hP) {
        // Storm countdown
        storm.current.durationRemaining -= 1 / 60; // decrement per frame ticks

        if (storm.current.durationRemaining <= 0) {
          // toggle shrink stage phase
          if (storm.current.state === 'waiting') {
            storm.current.state = 'shrinking';
            storm.current.durationRemaining = 40; // takes 40s to shrink
            addNotification('⚠️ العاصفة تتقلص وتتحرك في الأرجاء! ابحث عن الدائرة الآمنة!');
          } else {
            // Shrinkage done! Configure next phase
            storm.current.state = 'waiting';
            
            nextStormStage.current += 1;
            const mult = nextStormStage.current;
            
            // setup new random safe offset circle inside the current safe circle
            const rOffset = storm.current.safeRadius - (storm.current.safeRadius / 2);
            const offsetAng = Math.random() * Math.PI * 2;
            
            storm.current.safeX = storm.current.safeX + Math.cos(offsetAng) * (rOffset * 0.4);
            storm.current.safeY = storm.current.safeY + Math.sin(offsetAng) * (rOffset * 0.4);
            storm.current.safeRadius = Math.max(70, storm.current.safeRadius / 2);
            
            storm.current.durationRemaining = Math.max(20, 60 - mult * 8);

            addNotification(`🔒 بدأت المرحلة رقم ${mult} من العاصفة. الدائرة الآمنة أصبحت أصغر!`);
          }
        }

        // Apply progressive radius shrink values on active state
        if (storm.current.state === 'shrinking') {
          const targetRad = Math.max(60, storm.current.safeRadius - storm.current.shrinkSpeed);
          storm.current.safeRadius = targetRad;
        }

        // Apply Storm damage to players sitting outside safe zone
        alivePlayers.current.forEach(p => {
          if (p.state !== 'alive') return;
          const dxS = p.x - storm.current.safeX;
          const dyS = p.y - storm.current.safeY;
          const dist = Math.sqrt(dxS * dxS + dyS * dyS);

          if (dist > storm.current.safeRadius) {
            // Player is outside! Hurt progressively
            if (Math.random() < 0.015) { // ticks damage periodically
              damageEntity(p, p, storm.current.damagePerSec, 'أضرار العاصفة المميتة');
            }
          }
        });
      }

      // Render dark purple storm layer fog on outskirts
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      // Using Canvas overlay subtraction
      ctx.beginPath();
      ctx.arc(storm.current.safeX, storm.current.safeY, storm.current.safeRadius, 0, Math.PI * 2);
      ctx.rect(worldWidth, 0, -worldWidth, worldHeight);
      ctx.fill();

      // Draw purple storm outer border
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(storm.current.safeX, storm.current.safeY, storm.current.safeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // === DRAW DYNAMIC ACCESSIBILITY SOUND CUES ON USER HEAD MARGINS ===
      if (playerRef.current && playerRef.current.state === 'alive') {
        const clientObj = playerRef.current;
        soundCues.current.forEach(cue => {
          const durationRemaining = cue.time - Date.now();
          if (durationRemaining <= 0) return;

          // direction vector
          const diffAng = cue.angle - clientObj.angle;
          const screenRadius = 80;

          const cueScreenX = clientObj.x + Math.cos(diffAng) * screenRadius;
          const cueScreenY = clientObj.y + Math.sin(diffAng) * screenRadius;

          ctx.fillStyle = cue.type === 'shoot' ? 'rgba(239, 68, 68, 0.6)' : cue.type === 'chest' ? 'rgba(234, 179, 8, 0.6)' : 'rgba(243, 244, 246, 0.5)';
          ctx.beginPath();
          ctx.arc(cueScreenX, cueScreenY, 6, 0, Math.PI * 2);
          ctx.fill();

          // simple tiny emblem
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px "Inter"';
          ctx.textAlign = 'center';
          ctx.fillText(cue.type === 'shoot' ? '💥' : cue.type === 'chest' ? '👑' : '👣', cueScreenX, cueScreenY + 3);
        });

        // clean expired cues
        soundCues.current = soundCues.current.filter(c => c.time > Date.now());
      }

      ctx.restore(); // Clear camera translates

      // === DRAW SCREEN SPACE CROSSHAIR FOR FP/TP VIEW MODES ===
      if ((viewMode === 'fp' || viewMode === 'tp') && gameState === 'playing' && !isSpectating.current) {
        const crosshairX = canvas.width / 2;
        const crosshairY = canvas.height / 2;

        ctx.save();
        
        // Draw elegant high-contrast neon green crosshair
        ctx.strokeStyle = 'rgba(34, 197, 94, 0.9)'; // neon emerald green
        ctx.lineWidth = 1.6;
        
        // Circular ring
        ctx.beginPath();
        ctx.arc(crosshairX, crosshairY, 5, 0, Math.PI * 2);
        ctx.stroke();

        // High contrast drop-shadow/backing glow for low-visibility zones
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.lineWidth = 3;
        // Top shadow line
        ctx.beginPath();
        ctx.moveTo(crosshairX, crosshairY - 14);
        ctx.lineTo(crosshairX, crosshairY - 6);
        ctx.stroke();
        // Bottom shadow line
        ctx.beginPath();
        ctx.moveTo(crosshairX, crosshairY + 6);
        ctx.lineTo(crosshairX, crosshairY + 14);
        ctx.stroke();
        // Left shadow line
        ctx.beginPath();
        ctx.moveTo(crosshairX - 14, crosshairY);
        ctx.lineTo(crosshairX - 6, crosshairY);
        ctx.stroke();
        // Right shadow line
        ctx.beginPath();
        ctx.moveTo(crosshairX + 6, crosshairY);
        ctx.lineTo(crosshairX + 14, crosshairY);
        ctx.stroke();

        // Actual foreground crisp neon lines
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 1.5;
        // Top
        ctx.beginPath();
        ctx.moveTo(crosshairX, crosshairY - 13);
        ctx.lineTo(crosshairX, crosshairY - 6);
        ctx.stroke();
        // Bottom
        ctx.beginPath();
        ctx.moveTo(crosshairX, crosshairY + 6);
        ctx.lineTo(crosshairX, crosshairY + 13);
        ctx.stroke();
        // Left
        ctx.beginPath();
        ctx.moveTo(crosshairX - 13, crosshairY);
        ctx.lineTo(crosshairX - 6, crosshairY);
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(crosshairX + 6, crosshairY);
        ctx.lineTo(crosshairX + 13, crosshairY);
        ctx.stroke();
        
        // Ruby Red center point indicator
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(crosshairX, crosshairY, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // === FILTER OUT DEAD PLAYERS TO SYNCHRONIZE ALIVE STATS ===
      const activePlayers: (Player | Bot)[] = [];
      alivePlayers.current.forEach(p => {
        if (p.state === 'alive' || p.state === 'skydiving' || p.state === 'gliding' || p.state === 'spectating') {
          activePlayers.push(p);
        } else {
          deadPlayers.current.push(p);
        }
      });
      alivePlayers.current = activePlayers;

      // Check Victory condition based on remaining alivePlayers.current list (active contestants)
      const isHumanAlive = alivePlayers.current.some(p => p.id === 'human_player');
      if (!isSpectating.current) {
        if (isHumanAlive && alivePlayers.current.length === 1 && gameState === 'playing') {
          playSynthesizedSound('victory');
          setGameState('victory');
        }
        if (!isHumanAlive && gameState === 'playing') {
          setGameState('dead');
        }
      } else {
        // Human is spectating; game concludes when only 1 or 0 contestants remain
        if (alivePlayers.current.length <= 1 && gameState === 'playing') {
          setGameState('victory');
        }
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [gameState, activeBuildType]);

  // Handle touch interactions
  const handleTouchStart = (e: React.TouchEvent, type: 'move' | 'aim') => {
    e.preventDefault();
    const touch = e.touches[0];
    if (type === 'move') {
      touchJoystickMove.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        x: 0, y: 0
      };
    } else {
      touchJoystickAim.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        x: 0, y: 0
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent, type: 'move' | 'aim') => {
    e.preventDefault();
    const joystick = type === 'move' ? touchJoystickMove.current : touchJoystickAim.current;
    if (!joystick.active) return;

    for (let i = 0; i < e.touches.length; i++) {
      const touch = e.touches[i];
      const dx = touch.clientX - joystick.startX;
      const dy = touch.clientY - joystick.startY;
      
      const maxDistance = 45;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      let finalX = dx;
      let finalY = dy;

      if (distance > maxDistance) {
        finalX = (dx / distance) * maxDistance;
        finalY = (dy / distance) * maxDistance;
      }

      // Normalized magnitude (0 to 1) for speed
      joystick.x = finalX / maxDistance;
      joystick.y = finalY / maxDistance;
    }

    // Auto trigger shooting when aim stick drag is held down heavily
    if (type === 'aim') {
      const p = playerRef.current;
      if (p && p.state === 'alive') {
        const angle = Math.atan2(touchJoystickAim.current.y, touchJoystickAim.current.x);
        if (p.isBuilding) {
          buildStructure(p, p.targetBuildType, angle);
        } else {
          shootAction(p, angle);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent, type: 'move' | 'aim') => {
    const joystick = type === 'move' ? touchJoystickMove.current : touchJoystickAim.current;
    joystick.active = false;
    joystick.x = 0;
    joystick.y = 0;
  };

  const jumpMobileButton = () => {
    triggerJump();
  };

  const reloadMobileButton = () => {
    triggerReload();
  };

  const useHealingMobileButton = () => {
    const p = playerRef.current;
    if (p) {
      shootAction(p, p.angle);
    }
  };

  const buildActiveStructureMobile = () => {
    const p = playerRef.current;
    if (p) {
      buildStructure(p, p.targetBuildType, p.angle);
    }
  };

  const cycleBuildTypeMobile = () => {
    cycleBuildType();
  };

  const toggleBuildModeMobile = () => {
    setIsBuildModeActive(prev => !prev);
  };

  // Skip skydive and land immediately helper
  const triggerInstaland = () => {
    const p = playerRef.current;
    if (p && p.state === 'skydiving') {
      p.state = 'alive';
      p.glideProgress = 0;
      setGameState('playing');
      playSynthesizedSound('victory');
      addNotification('🪂 تم تخطي مسار الهبوط والهبوط فوراً!');
    }
  };

  // Reset/Restart match fully
  const handleRestartMatch = () => {
    setGameState('intro');
    isSpectating.current = false;
    spectateIndex.current = 0;
    deadPlayers.current = [];
    structures.current = [];
    bullets.current = [];
    particles.current = [];
    damageTexts.current = [];
    soundCues.current = [];
    
    storm.current = {
      duration: 60,
      durationRemaining: 60,
      shrinkSpeed: 0.65,
      damagePerSec: 2,
      safeX: 1600,
      safeY: 1600,
      safeRadius: 1500,
      targetSafeRadius: 800,
      state: 'waiting',
    };
    nextStormStage.current = 1;

    initWorld();
  };

  // Next spectator index
  const cycleSpectatorIndex = () => {
    const aliveBots = alivePlayers.current.filter(p => p.state === 'alive' && p.id !== 'human_player');
    if (aliveBots.length > 0) {
      spectateIndex.current = (spectateIndex.current + 1) % aliveBots.length;
      playSynthesizedSound('reload');
    }
  };

  return (
    <div id="game-arena-root" className="relative w-screen h-screen flex flex-col justify-between bg-slate-950 font-sans select-none overflow-hidden text-right">
      
      {/* 1. Main HTML5 interactive Canvas */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-crosshair z-0">
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>

      {/* 2. LIVE HUD OVERLAY SECTION */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 md:p-4">
        
        {/* Top bar header */}
        <div className="flex justify-between items-start w-full gap-4">
          
          {/* Left top block: Killfeed list */}
          <div className="flex flex-col gap-1 items-start max-w-sm text-left">
            <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-white/20 text-[10px] text-yellow-300 font-mono font-black uppercase tracking-wider shadow-lg">
              <Swords className="w-3.5 h-3.5 text-pink-500" />
              <span>أحداث سيرفر اللعب المشترك (Live Cross-Play)</span>
            </div>
            
            <div className="flex flex-col gap-1 overflow-hidden max-h-[140px] mt-1 select-none pointer-events-auto">
              {killfeed.slice(0, 5).map((log) => (
                <div key={log.id} className="text-[10px] bg-black/40 border border-white/5 px-2 py-1 rounded-lg text-slate-100 font-bold max-w-xs text-right leading-relaxed flex items-center gap-1 justify-end">
                  <span>{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 2.8 VEHICLE DRIVING HUD SPEEDOMETER */}
          {activeVehicleId && (
            <div id="vehicle-hud" className="bg-slate-950/95 backdrop-blur-md border border-yellow-500/50 p-4 rounded-2xl shadow-2xl pointer-events-auto select-none font-display text-white w-52 flex flex-col gap-2 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[9px] bg-yellow-500 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">نشط ⚡</span>
                <span className="text-[10px] font-black text-yellow-300">🎮 وضع القيادة</span>
              </div>

              <h4 className="text-[11px] font-black text-slate-100 border-b border-white/5 pb-1 mt-0.5 text-right">
                {vehicles.current.find(v => v.id === activeVehicleId)?.name || 'مركبة الدرفت'}
              </h4>

              {/* Vehicle speed meter */}
              <div className="flex items-baseline justify-between py-0.5">
                <span className="text-[9px] text-slate-400 font-bold">السرعة الحالية</span>
                <span className="text-lg font-mono font-black text-emerald-400 animate-pulse">{vehicleSpeed} <span className="text-[9px] font-sans">كم/س</span></span>
              </div>

              {/* Vehicle Health bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] font-bold text-slate-300">
                  <span>هيكل السيارة 🛡️</span>
                  <span>{vehicleHp} / {vehicleMaxHp}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-emerald-400 transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, (vehicleHp / vehicleMaxHp) * 100))}%` }}
                  />
                </div>
              </div>

              {/* Leave car instructions */}
              <button
                onClick={() => {
                  interactAction();
                }}
                className="w-full py-1.5 bg-red-600 hover:bg-red-500 hover:scale-102 active:scale-95 transition text-[9px] font-black rounded-lg text-white shadow font-display mt-1.5 cursor-pointer"
              >
                🚪 خروج من السيارة [E]
              </button>
            </div>
          )}

          {/* Right top block: Dynamic mini map & stats */}
          <div className="flex flex-col gap-2 items-end pointer-events-auto">
            <div className="flex flex-wrap gap-2 items-center justify-end">
              {/* Camera Perspective Mode Group Selector */}
              <div className="flex bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-0.5 shadow-md">
                <button
                  onClick={() => {
                    setViewMode('topdown');
                    playSynthesizedSound('build');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                    viewMode === 'topdown'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  علوي 🛰️
                </button>
                <button
                  onClick={() => {
                    setViewMode('fp');
                    setIs3dMode(true);
                    playSynthesizedSound('build');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                    viewMode === 'fp'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  شخص 1️⃣
                </button>
                <button
                  onClick={() => {
                    setViewMode('tp');
                    setIs3dMode(true);
                    playSynthesizedSound('build');
                  }}
                  className={`px-2.5 py-1 text-[10px] font-black rounded-lg transition-all ${
                    viewMode === 'tp'
                      ? 'bg-teal-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  شخص 3️⃣
                </button>
              </div>

              {/* Dynamic 3D Toggle live in match button */}
              <button
                onClick={() => {
                  setIs3dMode(!is3dMode);
                  playSynthesizedSound('build');
                }}
                className={`px-3 py-1.5 font-black text-xs rounded-xl transition flex items-center gap-1 shadow-md font-display border ${
                  is3dMode 
                    ? 'bg-yellow-400 text-indigo-950 border-yellow-300 hover:bg-yellow-300' 
                    : 'bg-indigo-900 text-white border-indigo-700 hover:bg-indigo-800'
                }`}
              >
                <span>{is3dMode ? 'الكلاسيكي 2D 🗺️' : 'ثلاثي الأبعاد 3D 🔄'}</span>
              </button>

              {/* Exit/Surrender Button */}
              <button
                onClick={onExitGame}
                className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 font-black text-xs text-white rounded-xl transition flex items-center gap-1 border border-pink-400 z-20 shadow-md font-display"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>الخروج للوبي</span>
              </button>
            </div>

            {/* Storm indicators circle */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 md:p-4 text-slate-100 flex items-center justify-between gap-4 shadow-2xl select-none w-52">
              <div className="flex flex-col items-start text-left font-mono">
                <span className="text-[10px] text-indigo-200 font-sans font-black leading-none uppercase tracking-wider">{stormStageText}</span>
                <span className="text-xl font-black text-yellow-300 leading-tight font-display">{stormTimer}</span>
              </div>
              <Compass className="w-7 h-7 text-pink-400 animate-spin-slow" />
            </div>

            {/* Players remaining counters */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl flex items-center gap-4 text-xs font-black text-slate-200 shadow-2xl font-display">
              <div className="flex items-center gap-1">
                <span className="font-mono text-yellow-300 text-sm font-black">{aliveCount}</span>
                <span className="text-[10px] text-indigo-200">على قيد الحياة</span>
              </div>
              <div className="w-0.5 h-4 bg-white/20" />
              <div className="flex items-center gap-1">
                <span className="font-mono text-pink-400 text-sm font-black">{killCount}</span>
                <span className="text-[10px] text-indigo-200">إقصاءات</span>
              </div>
            </div>
          </div>
        </div>

        {/* INTRO DROP INSTRUCTIONS BANNER */}
        {gameState === 'intro' && playerRef.current && playerRef.current.state === 'skydiving' && (
          <div className="self-center bg-slate-900/95 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center flex flex-col justify-center items-center max-w-md gap-4 backdrop-blur pointer-events-auto animate-bounce-slow">
            <span className="text-3xl">🪂</span>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">تطهير حافلة الهبوط!</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                اضغط على <strong>أي مكان على الشاشة</strong> أو <strong>انقر بالماوس</strong> للبدء بالقفز الحر نحو المواقع وتجميع كبسولات اللوت قبل المنافسين!
              </p>
            </div>
            
            <button
              onClick={() => {
                triggerInstaland();
                setGameState('playing');
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs transition"
            >
              هبوط تكتيكي فوري (Insta-Land)
            </button>
          </div>
        )}

        {/* SPECTATOR HUD DISPLAY */}
        {isSpectating.current && (
          <div className="self-center bg-slate-900/90 border-2 border-yellow-500 rounded-3xl p-4 shadow-xl text-center max-w-sm pointer-events-auto flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-yellow-400 font-bold">يقوم بالمشاهدة الآن:</p>
              <h3 className="text-base font-black text-white">{spectatingName}</h3>
              <p className="text-xs text-slate-400">منصة: {spectatingPlatform} | إقصاءات: {spectatingKills}</p>
            </div>
            <button
              onClick={cycleSpectatorIndex}
              className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs transition"
            >
              اللاعب التالي ➔
            </button>
          </div>
        )}

        {/* Bottom indicators, HP shield bars, Inventory quickslots */}
        <div className="flex flex-col sm:flex-row justify-between items-end w-full gap-4">
          
          {/* Bottom Left: Game Chat logs + HP Shield Bars Dashboard (Arabic style) */}
          <div className="w-full sm:w-72 flex flex-col gap-2.5 pointer-events-auto">
            
            {/* IN-GAME FLOATING LIVE SPECTATOR & PLAYERS CHAT */}
            <div className="w-full bg-black/60 backdrop-blur-lg border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shadow-2xl">
              <div className="flex justify-between items-center border-b border-white/5 pb-1 font-display">
                <span className="text-[8px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded-full animate-pulse select-none">بث مباشر - {settings.gameMode === 'spectator' ? 'المشاهدة ONLY' : 'دردشة اللعب'}</span>
                <span className="text-[10px] text-yellow-300 font-black">محادثات السيرفر والمنصات 🌐</span>
              </div>

              {/* Chat message threads */}
              <div className="h-28 overflow-y-auto flex flex-col gap-1.5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {inGameChats.map((c, i) => (
                  <div key={c.id || i} className="text-right text-[10px] leading-tight">
                    <div className="flex justify-end gap-1 items-center mb-0.5">
                      <span className="bg-white/10 text-[7px] text-white/80 px-1 py-0.2 rounded font-mono select-none">{c.platform}</span>
                      <strong className="font-bold font-display" style={{ color: c.color }}>{c.sender}</strong>
                    </div>
                    <p className="bg-white/5 text-slate-100 inline-block self-end px-2 py-1 rounded-xl rounded-tr-none max-w-[240px] break-words">
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Form to chat inside gameplay */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!inGameChatInput.trim()) return;

                  const currentSkin = CHARACTER_SKINS.find(s => s.id === selectedSkinId) || CHARACTER_SKINS[0];
                  const newChat = {
                    id: 'ig_manual_' + Math.random().toString(),
                    sender: playerName || 'المحترف',
                    platform: selectedPlatform,
                    message: inGameChatInput,
                    color: currentSkin.color
                  };

                  setInGameChats(prev => [...prev, newChat]);
                  setInGameChatInput('');
                  playSynthesizedSound('build');

                  // generate funny response
                  setTimeout(() => {
                    const answers = [
                      "كفو يا أسطورة! أتابع لعبك هالحين",
                      "الوضع حماس وثلاثي الأبعاد شغال 💯",
                      "منتبهين للدائرة الآمنة يا جماعة؟ قربت تسكر",
                      "مين يبي يسوي تيم؟ اللعب مشترك شغال ممتاز",
                      "اللعبة سريعة وسلسة جداً تبارك الله!",
                      "روبوت قوي قضى علي قبل شوي الصراحة"
                    ];
                    const reply = {
                      id: 'ig_reply_' + Math.random().toString(),
                      sender: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
                      platform: (['Xbox', 'PS5', 'Steam', 'Android'][Math.floor(Math.random() * 4)] as any),
                      message: answers[Math.floor(Math.random() * answers.length)],
                      color: CHARACTER_SKINS[Math.floor(Math.random() * CHARACTER_SKINS.length)].color
                    };
                    setInGameChats(prev => [...prev, reply]);
                    playSynthesizedSound('reload');
                  }, 1100 + Math.random() * 700);
                }}
                className="flex gap-1.5"
              >
                <button
                  type="submit"
                  className="px-2 py-1 bg-pink-500 hover:bg-pink-400 text-white rounded-lg text-[9px] font-black transition cursor-pointer"
                >
                  أرسل
                </button>
                <input
                  type="text"
                  value={inGameChatInput}
                  onChange={(e) => setInGameChatInput(e.target.value)}
                  maxLength={40}
                  placeholder="اكتب رسالة بث مباشر تفاعلية..."
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-yellow-200 outline-none placeholder-slate-400 text-right focus:border-yellow-400"
                />
              </form>
            </div>

            {/* Health and wood display card */}
            <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 flex flex-col gap-2.5 shadow-2xl font-display">
              
              {/* Plate stats label */}
              <div className="flex justify-between items-center text-xs font-black border-b border-white/10 pb-1 text-slate-100">
                <span className="font-mono text-pink-400 text-sm">الدرع: {playerShield}%</span>
                <span className="font-mono text-yellow-300 text-sm">الحياة: {playerHp}%</span>
              </div>

              {/* Health bar container */}
              <div className="w-full bg-black/40 rounded-full h-3 border border-white/10 overflow-hidden relative">
                <div
                  className="bg-yellow-400 h-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, playerHp))}%` }}
                />
              </div>

              {/* Shield bar container */}
              <div className="w-full bg-black/40 rounded-full h-3 border border-white/10 overflow-hidden">
                <div
                  className="bg-pink-500 h-full transition-all duration-300"
                  style={{ width: `${Math.max(0, Math.min(100, playerShield))}%` }}
                />
              </div>

              {/* Wood count display */}
              <div className="flex items-center justify-between text-xs font-black text-indigo-100 pt-1 border-b border-white/5 pb-2">
                <span className="font-mono text-yellow-300 text-sm">🧱 {playerWood}</span>
                <span className="text-[10px] text-indigo-200">الموارد (الخشب)</span>
              </div>

              {/* Special Ability Active HUD Trigger */}
              {playerRef.current && (
                <div className="pt-2">
                  <button
                    onClick={activateSpecialAbility}
                    className="w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 active:scale-95 transition text-[10px] font-black rounded-xl text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-purple-400"
                  >
                    <span>{playerRef.current.skinId === 'ninja' ? '🔮 قدرة الوميض الانتقالي (X)' : playerRef.current.skinId === 'constructor' ? '🛠️ كرافتنـج ماينكـرافـت (X)' : '🛡️ القدرة الخارقة نشطة تلقائياً'}</span>
                    {abilityCooldown > 0 && (
                      <span className="px-1.5 py-0.5 bg-black/60 rounded-md text-[8px] text-yellow-300 font-mono animate-pulse">{abilityCooldown}s</span>
                    )}
                  </button>
                  <p className="text-[8px] text-indigo-200/90 text-center mt-1 font-semibold leading-relaxed">
                    {playerRef.current.skinId === 'ninja' ? 'انقر أو اضغط مفتاح X أو G للوميض بـ 130px بالاتجاه الحالي!' : playerRef.current.skinId === 'constructor' ? 'افتح منضدة التركيب لصنع الأسلحة الأسطورية والمعول!' : 'قدرات بطل الكابوس (مثل السرعة الإضافية والجاذبية) مفعّلة على الدوام!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Center: Quickbar Inventory Slots */}
          <div className="flex flex-col items-center gap-1.5 w-full sm:w-auto pointer-events-auto">
            
            {/* Beautiful Detailed Controls Instructions Bar at the Bottom */}
            <div className="hidden md:flex items-center gap-3 bg-black/85 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl shadow-2xl select-none text-right font-display whitespace-nowrap mb-1">
              <span className="text-yellow-400 font-black text-xs mr-1 animate-pulse">🎮 دليل التحكم:</span>
              
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">W/A/S/D</kbd>
                <span className="text-[9px] text-slate-300 font-bold">التحرك</span>
              </div>
              
              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">🖱️ الماوس اليسار</kbd>
                <span className="text-[9px] text-slate-300 font-bold">إطلاق النار/البناء</span>
              </div>

              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">Q</kbd>
                <span className="text-[9px] text-slate-300 font-bold">وضع البناء</span>
              </div>

              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">E</kbd>
                <span className="text-[9px] text-slate-300 font-bold">التفاعل والفتح loot 📦</span>
              </div>

              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">R</kbd>
                <span className="text-[9px] text-slate-300 font-bold">التلقيم</span>
              </div>

              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">Space</kbd>
                <span className="text-[9px] text-slate-300 font-bold">القفز</span>
              </div>

              <span className="text-white/20 text-xs">|</span>

              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[10px] font-mono text-white">1 - 6</kbd>
                <span className="text-[9px] text-slate-300 font-bold">السلاح</span>
              </div>
            </div>

            {/* Mobile Touch controls instructions */}
            <div className="flex md:hidden items-center gap-2 bg-indigo-950/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl shadow select-none text-right font-display text-[9px] mb-1">
              <span className="text-pink-400 font-black">📱 أزرار اللمس:</span>
              <span className="text-slate-300 font-bold">اليسار للحركة | اليمين للتصويب والإطلاق | الأزرار الجانبية للقفز والبناء والتبديل</span>
            </div>

            <div className="flex gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-3xl shadow-2xl justify-center w-full max-w-sm sm:max-w-none">
              {Array.from({ length: 6 }).map((_, idx) => {
                const invItem = playerInventory[idx];
                const isSel = idx === activeSlot;
                
                return (
                  <button
                    key={idx}
                    onClick={() => changeActiveSlot(idx)}
                    className={`w-11 sm:w-14 h-11 sm:h-14 rounded-xl border flex flex-col items-center justify-center relative transition-all ${
                      isSel
                        ? 'border-yellow-400 bg-black/50 scale-105 shadow-lg ring-4 ring-yellow-400/30'
                        : 'border-white/10 bg-black/20 hover:border-white/35'
                    }`}
                  >
                    {/* Hotkey identifier bubble */}
                    <span className="absolute top-0.5 right-1.5 text-[8px] font-black text-indigo-200/70">
                      {idx + 1}
                    </span>

                    {invItem ? (
                      <div className="flex flex-col items-center justify-center p-1 font-sans">
                        {/* Emblem representative */}
                        <span className="text-sm">
                          {invItem.type === 'pickaxe' ? '⛏️' : invItem.type === 'shield' ? '🛡️' : invItem.type === 'medkit' ? '❤️' : invItem.type === 'chug' ? '🧉' : '🔫'}
                        </span>
                        
                        {/* Ammo indication */}
                        {invItem.type !== 'pickaxe' && invItem.type !== 'medkit' && invItem.type !== 'shield' && invItem.type !== 'chug' && (
                          <span className="text-[8px] font-black text-yellow-300 leading-none mt-1 font-mono">
                            {invItem.ammo}/{invItem.reserveAmmo}
                          </span>
                        )}

                        {/* Shields quantity */}
                        {(invItem.type === 'shield' || invItem.type === 'medkit' || invItem.type === 'chug') && (
                          <span className="text-[8px] font-black text-pink-400 leading-none mt-1 font-mono">
                            x{invItem.reserveAmmo}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/20 text-xs">-</span>
                    )}

                    {/* Colored rarity strip footer */}
                    {invItem && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl" style={{ backgroundColor: invItem.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Right: Build Menu Dashboard */}
          <div className="w-full sm:w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-4 flex flex-col gap-2 shadow-2xl pointer-events-auto font-display">
            <div className="flex justify-between items-center text-xs font-black border-b border-white/10 pb-1 text-slate-100">
              <span className="text-[10px] text-indigo-200">مفتاح [Q] لوضع البناء</span>
              <span className="text-yellow-300 flex items-center gap-1 font-black">
                وضع البناء {isInBuildMode ? '🧱 نشط' : '🛡️ مغلق'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1.5">
              {[
                { type: 'wall', name: 'جدار (Wall)', icon: '🧱' },
                { type: 'ramp', name: 'درج (Ramp)', icon: '🪜' },
                { type: 'floor', name: 'أرضية (Floor)', icon: '🧇' }
              ].map((b) => {
                const isActive = activeBuildType === b.type && isInBuildMode;
                return (
                  <button
                    key={b.type}
                    onClick={() => {
                      if (!isInBuildMode) {
                        setIsBuildModeActive(true);
                      }
                      setActiveBuildType(b.type as any);
                      const p = playerRef.current;
                      if (p) p.targetBuildType = b.type as any;
                    }}
                    className={`py-2 rounded-xl text-[10px] font-black border flex flex-col items-center justify-center gap-1 transition ${
                      isActive
                        ? 'bg-yellow-400 text-indigo-950 border-transparent shadow-[0_2px_0_0_#ca8a04]'
                        : 'bg-black/30 text-white/70 border-white/10 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{b.icon}</span>
                    <span>{b.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[9px] text-indigo-200 select-none text-right mt-1 font-semibold leading-relaxed">
              * انقر بالماوس لبناء العنصر المختار فوراً في ساحتك لتفادي الرصاص!
            </p>
          </div>
        </div>
      </div>

      {/* 3. MOBILE ONLY VIRTUAL JOYSTICK OVERLAYS */}
      {isMobileDevice.current && (
        <div id="touch-controls-container" className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-5 select-none">
          
          {/* Virtual Joystick Movement Left */}
          <div
            className="w-28 h-28 bg-slate-900/30 rounded-full border border-slate-800/40 relative flex items-center justify-center pointer-events-auto touch-none"
            onTouchStart={(e) => handleTouchStart(e, 'move')}
            onTouchMove={(e) => handleTouchMove(e, 'move')}
            onTouchEnd={(e) => handleTouchEnd(e, 'move')}
          >
            <div className="w-11 h-11 bg-slate-100 rounded-full shadow-lg absolute pointer-events-none" />
            <span className="text-[9px] text-slate-400 absolute bottom-1 uppercase font-bold">حرك اللاعب</span>
          </div>

          {/* Virtual Joystick Right for Building + Combat Shooting triggers */}
          <div className="flex flex-col gap-3 items-end">
            
            {/* Quick Action buttons panel */}
            <div className="flex gap-2.5 pointer-events-auto">
              {/* Build button immediate */}
              {isInBuildMode && (
                <button
                  onClick={buildActiveStructureMobile}
                  className="w-14 h-14 bg-yellow-500 active:bg-yellow-400 rounded-full text-slate-950 font-black text-xs flex justify-center items-center shadow-lg border-2 border-white select-none pointer-events-auto"
                >
                  🧱 ابنِ!
                </button>
              )}

              {/* Jump trigger */}
              <button
                onClick={jumpMobileButton}
                className="w-14 h-14 bg-sky-500 active:bg-sky-400 text-white rounded-full font-black text-xs flex justify-center items-center shadow-lg border border-sky-400 select-none pointer-events-auto"
              >
                اقفز 🪂
              </button>

              {/* Reload ammo */}
              <button
                onClick={reloadMobileButton}
                className="w-14 h-14 bg-slate-800 active:bg-slate-700 text-slate-200 rounded-full font-bold text-xs flex justify-center items-center shadow-lg border border-slate-700 select-none pointer-events-auto"
              >
                تلقيم 🔁
              </button>
            </div>

            {/* Shoot Action Joystick */}
            <div
              className="w-28 h-28 bg-rose-950/20 rounded-full border border-rose-800/30 active:border-rose-500 relative flex items-center justify-center pointer-events-auto touch-none"
              onTouchStart={(e) => handleTouchStart(e, 'aim')}
              onTouchMove={(e) => handleTouchMove(e, 'aim')}
              onTouchEnd={(e) => handleTouchEnd(e, 'aim')}
            >
              <div className="w-12 h-12 bg-rose-500 rounded-full shadow-lg absolute pointer-events-none flex items-center justify-center text-white">
                <Crosshair className="w-6 h-6 shrink-0" />
              </div>
              <span className="text-[8px] text-rose-400 absolute bottom-1 uppercase font-bold tracking-tight">اضغط/اسحب لإطلاق النار</span>
            </div>
            
            {/* Toggle Build Mode mobile bubble */}
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={cycleBuildTypeMobile}
                className="px-3 py-2 bg-slate-800 active:bg-slate-700 text-slate-100 rounded-xl font-bold text-[10px] border border-slate-700 shadow"
              >
                تغيير البناء 🪵
              </button>
              <button
                onClick={toggleBuildModeMobile}
                className="px-4 py-2 bg-amber-500 active:bg-amber-400 text-slate-950 rounded-xl font-black text-[10px] border border-amber-400 shadow"
              >
                {isInBuildMode ? 'رجوع للقتال ⚔️' : 'تبويب البناء 🧱'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 4. MODALS DEFEAT / SPECTATE OR VICTORY MODALS */}
      <AnimatePresence>
        {gameState === 'dead' && (
          <div className="absolute inset-0 bg-indigo-950/90 flex flex-col justify-center items-center p-4 z-40 text-center pointer-events-auto overflow-hidden">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-900 to-purple-950 border border-white/20 rounded-3xl p-6 md:p-8 max-w-sm space-y-6 shadow-2xl relative font-display text-slate-100"
            >
              <span className="text-5xl">💀</span>
              <div className="space-y-1">
                <h2 className="text-xl md:text-2xl font-black text-pink-500 tracking-tight">لقد تم إقصاؤك!</h2>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  أبليت بلاءً حسناً في ساحة القتال بين المنصات! يمكنك متابعة المباراة مع مشغلات الروبوت كمتفرج أو البدء من جديد.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => setIsInBuildMode(false) || setGameState('playing') || playSynthesizedSound('victory')}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-black py-2.5 rounded-xl text-xs transition border border-white/10 shadow-sm"
                >
                  تخطي لمشاهدة المباراة (Spectate)
                </button>
                <button
                  onClick={handleRestartMatch}
                  className="w-full btn-3d-yellow text-indigo-950 font-black py-2.5 rounded-xl text-xs shadow-md"
                >
                  البدء في جولة جديدة
                </button>
                <button
                  onClick={onExitGame}
                  className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-indigo-200 py-2 rounded-xl text-xs transition"
                >
                  الخروج إلى القائمة
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {gameState === 'victory' && (
          <div className="absolute inset-0 bg-indigo-950/90 flex flex-col justify-center items-center p-4 z-40 text-center pointer-events-auto overflow-hidden">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="bg-gradient-to-br from-indigo-900 to-purple-950 border-4 border-yellow-400 rounded-3xl p-6 md:p-8 max-w-md space-y-6 shadow-2xl relative text-slate-100 font-display"
            >
              {/* Confettis mockup decorative */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-orange-500 animate-pulse" />
              
              <span className="text-6xl animate-bounce inline-block" style={{ animationDuration: '3s' }}>🏆</span>
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 tracking-tight uppercase italic leading-none block">انتصار ملكي! (Victory Royale!)</h2>
                <span className="inline-block px-4 py-1 self-center text-xs font-black uppercase tracking-widest text-indigo-950 bg-yellow-400 rounded-full mt-2">
                  المركز الأول #1
                </span>
                <p className="text-xs text-indigo-200 leading-relaxed pt-2 font-medium font-sans">
                  تهانينا يا بطل! لقد استطعت هزيمة جميع المنافسين الـ {settings.initialBotCount} على شتى منصات اللعب المشترك (PS5, Xbox, PC) وحصلت على الانتصار المطلق كاملاً!
                </p>
              </div>

              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 flex justify-around font-mono text-sm shadow-inner">
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold">الإقصاءات</p>
                  <p className="font-extrabold text-pink-500 text-lg leading-snug">{killCount}</p>
                </div>
                <div className="w-0.5 h-8 bg-white/15" />
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold">المركز</p>
                  <p className="font-extrabold text-yellow-300 text-lg leading-snug">#1</p>
                </div>
                <div className="w-0.5 h-8 bg-white/15" />
                <div>
                  <p className="text-[10px] text-indigo-300 font-bold">عدد الروبوتات</p>
                  <p className="font-extrabold text-white text-lg leading-snug">{settings.initialBotCount}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleRestartMatch}
                  className="w-full btn-3d-yellow text-indigo-950 font-black py-3 rounded-xl text-xs shadow-md"
                >
                  اللعب مرة أخرى
                </button>
                <button
                  onClick={onExitGame}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/15 text-white py-2.5 rounded-xl text-xs transition font-black"
                >
                  العودة لصالة الانتظار
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Minecraft Crafting Table Overlay */}
      {isCraftingOpen && playerRef.current && playerRef.current.skinId === 'constructor' && (
        <div className="absolute inset-0 bg-black/75 flex justify-center items-center p-4 z-[45] pointer-events-auto select-none font-display">
          <div className="bg-gradient-to-br from-[#4c321b] to-[#302111] border-4 border-[#3e2716] rounded-3xl p-5 w-full max-w-sm shadow-2xl relative text-slate-100 flex flex-col items-center">
            
            {/* Header tag */}
            <div className="flex justify-between items-center w-full border-b-2 border-[#5c3e21] pb-2 mb-4">
              <button
                onClick={() => setIsCraftingOpen(false)}
                className="text-amber-400 hover:text-amber-300 text-xs font-black transition cursor-pointer"
              >
                ❌ إغلاق المنضدة
              </button>
              <h3 className="text-xs font-black text-yellow-200 flex items-center gap-1.5 text-right">
                <span>🛠️ منضدة كرافتنج ماينكرافت</span>
              </h3>
            </div>

            <div className="text-[10px] text-yellow-300/90 border border-[#5c3e21]/60 bg-yellow-950/40 p-2.5 rounded-xl text-center mb-4 leading-relaxed font-semibold">
              ⛏️ اجمع الموارد بضرب الأشجار والصخور لصنع عتاد ذهبي أسطوري ومعاول حفر فتاكة!
            </div>

            {/* Items loop */}
            <div className="space-y-2.5 w-full">
              {/* Golden Pickaxe */}
              <div className="bg-[#1e130a]/75 border border-[#5c3e21]/40 p-3 rounded-2xl flex items-center justify-between">
                <button
                  onClick={() => craftItem('golden_pickaxe')}
                  disabled={goldenPickaxeActive}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition cursor-pointer ${
                    goldenPickaxeActive
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-[#ca8a04] hover:bg-yellow-400 text-slate-950 shadow-[0_2px_0_0_#854d0e]'
                  }`}
                >
                  {goldenPickaxeActive ? '✔️ مفعل' : '🔨 صنع'}
                </button>
                <div className="text-right">
                  <h4 className="text-[11px] font-black text-yellow-100">⚒️ معـول ذهبـي أسطـوري</h4>
                  <p className="text-[8px] text-yellow-200/50 mt-0.5 leading-snug">تعدين دبل ومضاعفة الضرر للأجسام والكتل فوراً!</p>
                  <span className="text-[9px] font-bold text-yellow-400 block mt-1 font-mono">الخشب المطلوب: 60 / {playerWood}</span>
                </div>
              </div>

              {/* Gold Armor Shield */}
              <div className="bg-[#1e130a]/75 border border-[#5c3e21]/40 p-3 rounded-2xl flex items-center justify-between">
                <button
                  onClick={() => craftItem('shield')}
                  className="px-3 py-1.5 bg-[#ca8a04] hover:bg-yellow-400 text-indigo-950 rounded-xl text-[10px] font-black transition cursor-pointer shadow-[0_2px_0_0_#854d0e]"
                >
                  🔨 صنع
                </button>
                <div className="text-right">
                  <h4 className="text-[11px] font-black text-yellow-100">🛡️ بـلوكات الـدرع الـذهـبي الخارق</h4>
                  <p className="text-[8px] text-yellow-200/50 mt-0.5 leading-snug">تفعيل طاقة درعية إضافية تمنحك +50 في شريط النجاة!</p>
                  <span className="text-[9px] font-bold text-yellow-400 block mt-1 font-mono">الخشب المطلوب: 40 / {playerWood}</span>
                </div>
              </div>

              {/* Medkit medicine */}
              <div className="bg-[#1e130a]/75 border border-[#5c3e21]/40 p-3 rounded-2xl flex items-center justify-between">
                <button
                  onClick={() => craftItem('medkit')}
                  className="px-3 py-1.5 bg-[#ca8a04] hover:bg-yellow-400 text-indigo-950 rounded-xl text-[10px] font-black transition cursor-pointer shadow-[0_2px_0_0_#854d0e]"
                >
                  🔨 صنع
                </button>
                <div className="text-right">
                  <h4 className="text-[11px] font-black text-yellow-100">❤️ حقيـبة صحـية متكاملـة</h4>
                  <p className="text-[8px] text-yellow-200/50 mt-0.5 leading-snug font-sans">توليد حزمة الإسعاف الطبي لعلاج نقاط صحتك المصابة!</p>
                  <span className="text-[9px] font-bold text-yellow-400 block mt-1 font-mono">الخشب المطلوب: 55 / {playerWood}</span>
                </div>
              </div>
            </div>

            <div className="text-[8.5px] text-yellow-100/40 mt-4 text-center font-semibold">
              انقر فوق إغلاق لتفادي النيران والعودة لإقصاء المعادين!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
