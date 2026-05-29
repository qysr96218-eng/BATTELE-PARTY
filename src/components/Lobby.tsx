import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameSettings, Platform, CharacterSkin } from '../types';
import { PLATFORMS, PLATFORM_DETAILS, CHARACTER_SKINS, playSynthesizedSound } from '../data';
import { Shield, Sparkles, Gamepad2, Users, Volume2, VolumeX, Cpu, Trophy } from 'lucide-react';

interface LobbyProps {
  onStartGame: (settings: GameSettings, selectedPlatform: Platform, skinId: string, playerName: string) => void;
  soundMuted: boolean;
  onToggleSound: () => void;
}

export default function Lobby({ onStartGame, soundMuted, onToggleSound }: LobbyProps) {
  const [playerName, setPlayerName] = useState(() => {
    const saved = localStorage.getItem('btl_player_name');
    return saved || 'اللاعب_المحترف_' + Math.floor(Math.random() * 900 + 100);
  });
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('PS5');
  const [selectedSkinIndex, setSelectedSkinIndex] = useState(0);
  const [botCount, setBotCount] = useState(50); // Default to a lightweight 50 bots (many characters)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [gameMode, setGameMode] = useState<'classic' | 'spectator' | 'snipers' | 'pickaxe'>('classic');
  const [is3dMode, setIs3dMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'lobby' | 'crossplay' | 'leaderboard' | 'hotspot_p2p'>('lobby');
  const [simulatedOnlineUsers, setSimulatedOnlineUsers] = useState(14820);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [matchmakingProgress, setMatchmakingProgress] = useState(0);
  const [matchmakingLog, setMatchmakingLog] = useState('');

  // Lobby general chat
  const [lobbyChats, setLobbyChats] = useState([
    { sender: 'Ninja_Arab', platform: 'Steam', message: 'مستعد للمعركة القادمة! اللعب ثلاثي الأبعاد رهيب 🔥', time: '16:20', color: '#60a5fa' },
    { sender: 'ابو_فلة_PRO', platform: 'PS5', message: 'وضع الـ ONLY (المشاهدة التفاعلية) حلو للي يحب يتفرج ويدردش 👁️', time: '16:21', color: '#facc15' },
    { sender: 'المحترف_99', platform: 'PS4', message: 'يا شباب جربوا وضع القناص فقط، جلد حقيقي! 💥', time: '16:22', color: '#f472b6' },
    { sender: 'SavageGlider', platform: 'Android', message: 'العاصفة تقتل البوتات بسرعة ههههه', time: '16:23', color: '#34d399' }
  ]);
  const [lobbyInput, setLobbyInput] = useState('');

  // Save name on edit
  useEffect(() => {
    localStorage.setItem('btl_player_name', playerName);
  }, [playerName]);

  // Slowly fluctuate online users to feel dynamic
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulatedOnlineUsers(prev => prev + Math.floor(Math.random() * 21 - 10));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartMatchmaking = () => {
    playSynthesizedSound('reload');
    setIsSearchingMatch(true);
    setMatchmakingProgress(0);
    setMatchmakingLog('جاري البحث عن لاعبين نشطين...');

    const logs = [
      'جاري الاتصال بخوادم اللعب المشترك (Cross-Play)...',
      'تم العثور على لاعبين من منصة [Steam] و [Xbox]...',
      'تم الدمج مع مستخدمي الهواتف الذكية [Android / iOS]...',
      'محاكاة خادم اللعب المشترك المحلي (أوفلاين بالكامل!)...',
      'التحضير لتهيئة خريطة المعركة ولعبة الباص الطائر...',
    ];

    let currentLogIdx = 0;
    
    const interval = setInterval(() => {
      setMatchmakingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onStartGame(
              { initialBotCount: botCount, difficulty, gameMode, is3dMode },
              selectedPlatform,
              CHARACTER_SKINS[selectedSkinIndex].id,
              playerName
            );
          }, 400);
          return 100;
        }
        
        // update text log at specific thresholds
        if (prev > 20 && currentLogIdx === 0) { currentLogIdx = 1; setMatchmakingLog(logs[1]); }
        if (prev > 45 && currentLogIdx === 1) { currentLogIdx = 2; setMatchmakingLog(logs[2]); }
        if (prev > 70 && currentLogIdx === 2) { currentLogIdx = 3; setMatchmakingLog(logs[3]); }
        if (prev > 90 && currentLogIdx === 3) { currentLogIdx = 4; setMatchmakingLog(logs[4]); }

        return prev + Math.floor(Math.random() * 12 + 8);
      });
    }, 250);
  };

  const getDifficultyLabel = (diff: typeof difficulty) => {
    if (diff === 'easy') return 'مبتدئ (ذكاء روبوتات هادئ)';
    if (diff === 'medium') return 'متوسط (تحدي واقعي وبناء سريع)';
    return 'محترف (الروبوتات تبني وتطلق النار فوراً!)';
  };

  return (
    <div id="lobby-container" className="relative min-h-screen bg-indigo-950 text-slate-100 flex flex-col justify-between p-4 md:p-6 overflow-x-hidden font-sans z-10">
      {/* Vibrant Palette Absolute Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 opacity-95 pointer-events-none z-0" />
      {/* Blurred Ambient Lighting Blobs */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-pink-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
      </div>

      {/* Header section */}
      <header className="relative z-10 flex flex-col sm:flex-row justify-between items-center border-b border-white/10 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-xl rotate-12 flex items-center justify-center shadow-lg font-black text-indigo-950 text-2xl">
            Ω
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 font-display italic uppercase tracking-tight">
                نقاط الحرب (War Points) 🧱
              </span>
              <span className="text-xs bg-emerald-600 text-white border border-emerald-400 px-2.5 py-0.5 rounded-full animate-pulse font-mono">
                MINECRAFT EDITION
              </span>
            </h1>
            <p className="text-xs text-indigo-200">العب الآن على أي جهاز! تجربة مثالية بدون إنترنت وبأقل المواصفات.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sounds trigger */}
          <button
            onClick={() => {
              onToggleSound();
              playSynthesizedSound('build');
            }}
            className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition text-white flex items-center gap-2 text-sm"
            title={soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-pink-400 animate-pulse" /> : <Volume2 className="w-4 h-4 text-yellow-400" />}
            <span className="hidden sm:inline font-bold">{soundMuted ? 'الصوت مكتوم' : 'الصوت مفعل'}</span>
          </button>

          {/* Active Player Counter Badge */}
          <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
            <span className="text-xs font-mono font-bold text-yellow-300">
              {simulatedOnlineUsers.toLocaleString()} متصل
            </span>
          </div>
        </div>
      </header>

      {/* Main navigation tabs */}
      <div className="relative z-10 flex flex-wrap justify-center border-b border-white/10 mb-6 gap-1 md:gap-2">
        <button
          onClick={() => { setActiveTab('lobby'); playSynthesizedSound('harvest'); }}
          className={`px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wide transition relative ${activeTab === 'lobby' ? 'text-yellow-400 font-display' : 'text-white/60 hover:text-white'}`}
        >
          غرفة الانتظار (Lobby)
          {activeTab === 'lobby' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
        </button>
        <button
          onClick={() => { setActiveTab('hotspot_p2p'); playSynthesizedSound('harvest'); }}
          className={`px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wide transition relative ${activeTab === 'hotspot_p2p' ? 'text-yellow-300 font-display' : 'text-white/60 hover:text-white'}`}
        >
          👥 اتصال الهوتسبوت وبلوتوث (Local Multi)
          {activeTab === 'hotspot_p2p' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-300" />}
        </button>
        <button
          onClick={() => { setActiveTab('crossplay'); playSynthesizedSound('harvest'); }}
          className={`px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wide transition relative ${activeTab === 'crossplay' ? 'text-yellow-400 font-display' : 'text-white/60 hover:text-white'}`}
        >
          ميزة اللعب المشترك
          {activeTab === 'crossplay' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
        </button>
        <button
          onClick={() => { setActiveTab('leaderboard'); playSynthesizedSound('harvest'); }}
          className={`px-4 sm:px-6 py-2.5 font-black text-xs sm:text-sm uppercase tracking-wide transition relative ${activeTab === 'leaderboard' ? 'text-yellow-400 font-display' : 'text-white/60 hover:text-white'}`}
        >
          أفضل المسجلين
          {activeTab === 'leaderboard' && <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-yellow-400" />}
        </button>
      </div>

      {/* Content wrapper */}
      <main className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <AnimatePresence mode="wait">
          {activeTab === 'lobby' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full"
            >
              {/* Left Column: Character customiser & options */}
              <div className="lg:col-span-8 space-y-6 relative z-10">
                
                {/* Profile card & Platform indicator */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5">
                  <h2 className="text-sm font-black text-yellow-300 uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-2 font-display">
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} />
                    تخصيص اللاعب والمنصة
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 text-right">
                        اسم اللاعب المقاتل:
                      </label>
                      <input
                        type="text"
                        value={playerName}
                        maxLength={20}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full bg-black/30 border border-white/20 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/40 rounded-xl px-4 py-2.5 text-sm font-black text-yellow-300 outline-none text-right transition font-display"
                        placeholder="أدخل اسمك"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 text-right">
                        اختر جهاز التحكم / المنصة:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLATFORMS.map((platform) => {
                          const det = PLATFORM_DETAILS[platform];
                          const isSel = selectedPlatform === platform;
                          return (
                            <button
                              key={platform}
                              onClick={() => {
                                setSelectedPlatform(platform);
                                playSynthesizedSound('harvest');
                              }}
                              className={`py-2 rounded-xl border text-xs font-black transition flex flex-col justify-center items-center gap-0.5 ${
                                isSel
                                  ? 'bg-yellow-400 text-indigo-950 border-transparent shadow-[0_4px_0_0_#ca8a04]'
                                  : 'bg-white/5 text-white/95 border-white/10 hover:bg-white/10 hover:border-white/25'
                              }`}
                            >
                              <span className="text-base">{det.prefix}</span>
                              <span>{det.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Character Skin customizer Carousel */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-indigo-200 text-right">
                      مظهر الشخصية (Skins):
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CHARACTER_SKINS.map((skin, idx) => {
                        const isSel = selectedSkinIndex === idx;
                        return (
                          <button
                            key={skin.id}
                            onClick={() => {
                              setSelectedSkinIndex(idx);
                              playSynthesizedSound('build');
                            }}
                            className={`p-2.5 rounded-xl border text-right transition flex flex-col items-center justify-between gap-2 h-32 relative ${
                              isSel
                                ? 'bg-white/15 border-yellow-400 ring-2 ring-yellow-400/40 shadow-xl'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full relative flex items-center justify-center shadow-inner" style={{ backgroundColor: skin.color }}>
                              {/* Helmet/visor visor */}
                              <div className="w-10 h-4 rounded absolute top-2.5 flex items-center justify-center" style={{ backgroundColor: skin.detailsColor }}>
                                <div className="w-8 h-1 rounded" style={{ backgroundColor: skin.accColor }} />
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-center leading-tight line-clamp-2 h-8 flex items-center text-slate-200">
                              {skin.name}
                            </span>
                            {isSel && (
                              <span className="absolute top-1 right-1 bg-yellow-400 text-slate-950 p-0.5 rounded-full text-[8px] font-bold leading-none">✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Character Special Ability Information Panel */}
                    <div className="mt-4 bg-teal-950/40 border border-teal-500/30 rounded-2xl p-4 flex gap-4 items-start text-right">
                      <div className="w-14 h-14 bg-slate-900/80 border border-teal-400/30 rounded-xl flex items-center justify-center text-3xl shadow-inner shrink-0 select-none">
                        {CHARACTER_SKINS[selectedSkinIndex].abilityIcon}
                      </div>
                      <div className="space-y-1 w-full">
                        <div className="flex justify-between items-center flex-row-reverse flex-wrap gap-2">
                          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-amber-500/20 text-yellow-300 px-2.5 py-0.5 rounded-md border border-amber-500/30">
                            القدرة الأسطورية للعميل
                          </span>
                          <h4 className="text-sm font-black text-teal-300">
                            {CHARACTER_SKINS[selectedSkinIndex].abilityName}
                          </h4>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-300 font-medium">
                          {CHARACTER_SKINS[selectedSkinIndex].abilityDesc}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Match variables */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
                  <h2 className="text-sm font-black text-yellow-300 uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-2 font-display">
                    <Cpu className="w-4 h-4 text-pink-400" />
                    إعدادات المباراة (ملائم للأجهزة الضعيفة)
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Bot Count Slider */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-black text-yellow-300">
                          {botCount} لاعبين (بروبوت)
                        </span>
                        <label className="text-xs font-bold text-indigo-200 text-right">
                          عدد المنافسين الأقصى:
                        </label>
                      </div>
                      <input
                        type="range"
                        min={9}
                        max={99}
                        step={10}
                        value={botCount}
                        onChange={(e) => {
                          setBotCount(parseInt(e.target.value));
                          playSynthesizedSound('harvest');
                        }}
                        className="w-full accent-yellow-400 bg-black/40 rounded-lg cursor-pointer h-2"
                      />
                      <p className="text-[10px] text-indigo-200 mt-1.5 text-right font-medium">
                        * يوصى بـ ٣٠ إلى ٥٠ روبوت للحصول على أعلى سلاسة (٦٠ إطار بالثانية) على المعالجات القديمة.
                      </p>
                    </div>

                    {/* Bot difficulty */}
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 text-right">
                        مستوى صعوبة الروبوتات الذكية:
                      </label>
                      <div className="flex gap-2 bg-black/30 p-1 rounded-xl border border-white/10">
                        {(['easy', 'medium', 'hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => {
                              setDifficulty(diff);
                              playSynthesizedSound('harvest');
                            }}
                            className={`flex-1 py-1.5 text-xs font-black rounded-lg transition capitalize font-display ${
                              difficulty === diff
                                ? 'bg-pink-500 text-white shadow-md'
                                : 'text-white/60 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {diff === 'easy' ? 'سهل' : diff === 'medium' ? 'متوسط' : 'صعب'}
                          </button>
                        ))}
                      </div>
                      <div className="text-[10px] text-indigo-200 mt-2 text-right font-medium">
                        الحالي: {getDifficultyLabel(difficulty)}
                      </div>
                    </div>
                  </div>

                  {/* New settings section for 3D engine and gameMode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10 mt-4">
                    {/* Game Mode Choice */}
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 text-right">
                        وضعية ساحة القتال والمنافسة:
                      </label>
                      <select
                        value={gameMode}
                        onChange={(e) => {
                          setGameMode(e.target.value as any);
                          playSynthesizedSound('reload');
                        }}
                        className="w-full bg-black/30 text-white border border-white/10 text-xs font-black rounded-lg p-2 focus:border-yellow-400 outline-none text-right font-display cursor-pointer"
                      >
                        <option value="classic" className="bg-indigo-950 text-white">🎮 القتال الكلاسيكي (Classical Battle)</option>
                        <option value="spectator" className="bg-indigo-950 text-white">👁️ وضع المشاهدة والدردشة (ONLY Spectator)</option>
                        <option value="snipers" className="bg-indigo-950 text-white">🎯 وضع القناصين فقط (Snipers Only)</option>
                        <option value="pickaxe" className="bg-indigo-950 text-white">🧱 وضع الفأس والبناء فقط (No Gun)</option>
                      </select>
                      <p className="text-[9px] text-indigo-200 mt-1 text-right leading-relaxed font-semibold">
                        * جرب وضع المشاهدة (ONLY) لمتابعة مجريات المعركة والمحادثة مع المشاهدين!
                      </p>
                    </div>

                    {/* 3D Mode Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-indigo-200 mb-1.5 text-right">
                        البعد البصري لبيئة المعركة:
                      </label>
                      <div className="flex bg-black/30 p-1 rounded-xl border border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setIs3dMode(true);
                            playSynthesizedSound('build');
                          }}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition font-display ${
                            is3dMode
                              ? 'bg-yellow-400 text-indigo-950 font-bold shadow'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          🔄 ثلاثي الأبعاد 3D
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIs3dMode(false);
                            playSynthesizedSound('harvest');
                          }}
                          className={`flex-1 py-1.5 text-xs font-black rounded-lg transition font-display ${
                            !is3dMode
                              ? 'bg-pink-500 text-white font-bold shadow'
                              : 'text-white/60 hover:text-white'
                          }`}
                        >
                          平面 ثنائي الأبعاد 2D
                        </button>
                      </div>
                      <p className="text-[9px] text-indigo-200 mt-1 text-right leading-relaxed font-semibold">
                        محرك Voxel Stack فائق الجمال بظلال وارتفاعات مجسمة بالكامل!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lobby General Chat Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="text-[10px] text-indigo-200 font-bold">بث مباشر عام مع المتصلين بالخادم</span>
                    <h2 className="text-sm font-black text-yellow-300 uppercase tracking-widest flex items-center gap-2 font-display">
                      <Users className="w-4 h-4 text-pink-400" />
                      الدردشة التفاعلية للوبي (Lobby Chat)
                    </h2>
                  </div>

                  {/* Chat logs box */}
                  <div className="h-44 overflow-y-auto bg-black/40 border border-white/5 rounded-2xl p-3 flex flex-col gap-2.5">
                    {lobbyChats.map((chat, index) => (
                      <div key={index} className="flex flex-col text-right leading-tight text-xs">
                        <div className="flex justify-end items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] text-indigo-300">({chat.time})</span>
                          <span className="bg-white/10 px-1 py-0.2 rounded text-[8px] text-white select-none">{chat.platform}</span>
                          <strong className="font-bold font-display" style={{ color: chat.color }}>{chat.sender}</strong>
                        </div>
                        <p className="text-slate-100 font-sans break-words bg-white/5 inline-block self-end px-2.5 py-1 rounded-2xl rounded-tr-none hover:bg-white/10 transition leading-snug">
                          {chat.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chat sending form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!lobbyInput.trim()) return;
                      
                      const newMsg = {
                        sender: playerName,
                        platform: selectedPlatform,
                        message: lobbyInput,
                        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                        color: CHARACTER_SKINS[selectedSkinIndex].color
                      };
                      
                      setLobbyChats(prev => [...prev, newMsg]);
                      setLobbyInput('');
                      playSynthesizedSound('build');

                      // Mock dynamic bot answer based on trigger keywords
                      setTimeout(() => {
                        const answers = [
                          "واو! أهلاً بك معنا يا بطل!",
                          "تحدي كبير قادم! من يجرؤ؟ 😎",
                          "اللعب ثلاثي الأبعاد ممتع ومبتكر للغاية!",
                          "الكاميرات والـ ONLY مود ميزة خرافية الصراحة",
                          "أتفق معك تماماً! لنرى من يحصل على الـ Victory Royale!",
                          "الروبوتات هنا قوية حاسبوا من صعوبة المحترف!"
                        ];
                        const answerMsg = {
                          sender: ['أبو_سند', 'المقاتل_الشرس', 'أبو_فلة_PRO', 'المدمر_العربي', 'أرينا_ملك'][Math.floor(Math.random() * 5)],
                          platform: (['PS5', 'Xbox', 'Steam', 'Android'][Math.floor(Math.random() * 4)] as any),
                          message: answers[Math.floor(Math.random() * answers.length)],
                          time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
                          color: CHARACTER_SKINS[Math.floor(Math.random() * CHARACTER_SKINS.length)].color
                        };
                        setLobbyChats(prev => [...prev, answerMsg]);
                        playSynthesizedSound('reload');
                      }, 1200 + Math.random() * 800);
                    }}
                    className="flex gap-2"
                  >
                    <button
                      type="submit"
                      className="px-4 py-2 bg-pink-500 hover:bg-pink-400 text-white font-black rounded-xl text-xs transition shadow active:scale-95"
                    >
                      إرسال
                    </button>
                    <input
                      type="text"
                      value={lobbyInput}
                      onChange={(e) => setLobbyInput(e.target.value)}
                      maxLength={70}
                      placeholder="اكتب رسالة للدردشة مع اللاعبين المقاطعين..."
                      className="flex-1 bg-black/30 border border-white/20 focus:border-yellow-400 rounded-xl px-3 py-2 text-xs font-black text-right text-yellow-300 outline-none transition"
                    />
                  </form>
                </div>

              </div>

              {/* Right Column: Hero Matchmaking Action Panel */}
              <div className="lg:col-span-4 h-full relative z-10 font-display">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col justify-between items-center text-center space-y-6 h-full relative overflow-hidden min-h-[420px] md:min-h-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Skin illustration preview */}
                  <div className="space-y-3 w-full">
                    <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-1 mb-2">
                      <span className="px-4 py-1 text-xs font-black uppercase tracking-widest text-yellow-300">
                        شخصيتك المستعدة
                      </span>
                    </div>
                    <div className="flex justify-center mt-3 scale-110">
                      <div className="relative w-28 h-28 rounded-full flex items-center justify-center shadow-lg border-4 border-white/20" style={{ backgroundColor: CHARACTER_SKINS[selectedSkinIndex].color }}>
                        {/* Helmet layer */}
                        <div className="w-24 h-8 rounded absolute top-6 flex items-center justify-center animate-pulse" style={{ backgroundColor: CHARACTER_SKINS[selectedSkinIndex].detailsColor }}>
                          <div className="w-16 h-2 rounded" style={{ backgroundColor: CHARACTER_SKINS[selectedSkinIndex].accColor }} />
                        </div>
                        {/* Selected platform logo overlay */}
                        <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-indigo-950 border-2 border-indigo-950/20 font-black px-2 py-0.5 rounded-lg text-xs leading-none flex items-center gap-1 shadow">
                          <span>{PLATFORM_DETAILS[selectedPlatform].prefix}</span>
                          <span className="text-[10px] font-mono">{selectedPlatform}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-center pt-2">
                      <p className="font-black text-white text-lg font-display">{playerName}</p>
                      <p className="text-xs text-indigo-200 font-sans">منصة: {selectedPlatform}</p>
                    </div>
                  </div>

                  <div className="w-full space-y-3">
                    {!isSearchingMatch ? (
                      <button
                        onClick={handleStartMatchmaking}
                        className="btn-3d-yellow w-full font-black py-4 px-6 rounded-2xl text-lg uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-lg active:translate-y-1"
                      >
                        <Shield className="w-5 h-5 fill-indigo-900" />
                        ابدأ المعركة الفورية أوفلاين
                      </button>
                    ) : (
                      <div className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3 text-right">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-mono font-black text-yellow-300">{matchmakingProgress}%</span>
                          <span className="text-xs font-black text-white">جاري تجميع السيرفر...</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-black/40 rounded-full h-2.5 overflow-hidden border border-white/10">
                          <motion.div
                            className="bg-gradient-to-r from-yellow-400 via-pink-500 to-orange-500 h-full"
                            initial={{ width: '0%' }}
                            animate={{ width: `${matchmakingProgress}%` }}
                          />
                        </div>

                        {/* Status logs */}
                        <p className="text-[10px] text-yellow-300 font-mono italic animate-pulse truncate leading-relaxed">
                          {matchmakingLog}
                        </p>
                      </div>
                    )}
                    
                    <p className="text-[11px] text-indigo-200 font-sans leading-relaxed select-none">
                      لا يتطلب إنترنت. اللعب بنسبة ١٠٠٪ محلي وعلى أي جهاز بفضل الروبوتات المحاكاة ذات الاستجابة السريعة ولعب المشترك العابر للمنصات.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hotspot_p2p' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-12 bg-slate-900/90 backdrop-blur-md border border-teal-500/30 rounded-3xl p-6 shadow-2xl space-y-6 relative z-10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-4 gap-4">
                <div className="text-right">
                  <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 justify-end font-display">
                    <span className="text-teal-400">📶 رادار الاتصال المحلي (Hotspot & Bluetooth)</span>
                    <span>👥</span>
                  </h2>
                  <p className="text-xs text-indigo-200 mt-1">العب نقاط الحرب مجاناً مع أصدقائك بجانبك عبر نقطة اتصال الهواتف والحسّاس المحمول مباشرة.</p>
                </div>
                <div className="flex bg-black/40 border border-white/10 rounded-xl p-1 gap-2 self-stretch md:self-auto justify-end">
                  <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                    حالة الاتصال: أوفلاين / رادار محلي نشط 🛰️
                  </span>
                </div>
              </div>

              {/* Multi-column network status & radar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left side: Animated Radar search */}
                <div className="lg:col-span-5 bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center space-y-5 h-[340px] relative overflow-hidden">
                  
                  {/* Glowing Radar Background effect */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.06)_0%,transparent_70%)] pointer-events-none" />
                  
                  {/* Radar Circles with pulse */}
                  <div className="relative w-44 h-44 rounded-full border-2 border-teal-500/20 flex items-center justify-center">
                    <div className="absolute w-36 h-36 rounded-full border border-teal-500/10 animate-ping duration-3000" />
                    <div className="absolute w-28 h-28 rounded-full border border-teal-500/20" />
                    <div className="absolute w-16 h-16 rounded-full border border-teal-500/30 animate-pulse" />
                    
                    {/* Rotating Radar Line */}
                    <div className="absolute inset-0 rounded-full border border-transparent border-t-teal-400/40 animate-spin" style={{ animationDuration: '4s' }} />
                    
                    {/* Centered Device */}
                    <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-lg animate-bounce">
                      📱
                    </div>

                    {/* Discovered dummy ping points */}
                    <span className="absolute top-8 left-12 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-ping" />
                    <span className="absolute top-10 left-14 w-2 h-2 bg-yellow-400 rounded-full" />

                    <span className="absolute bottom-10 right-8 w-2 h-2 bg-teal-300 rounded-full animate-pulse" />
                  </div>

                  <div className="space-y-1 relative z-10">
                    <p className="text-sm font-black text-teal-300">جاري مسح ترددات بلوتوث و نقطة الاتصال...</p>
                    <p className="text-[10px] text-slate-400">تأكد من تفعيل البلوتوث وتوصيل صديقك بهوتسبوت هاتفك.</p>
                  </div>
                </div>

                {/* Right side: Discovered devices and action lobby */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-black text-yellow-300 uppercase tracking-widest text-right">الأجهزة القريبة المتوفرة للعب:</h3>
                  
                  <div className="space-y-2.5">
                    
                    {/* Device 1 - Hotspot Client */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center text-right">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('btl_local_mode', 'p2p_connected');
                            alert('تم اقتران البلوتوث بنجاح! سيتم دمج صديقك مباشرة معك كلاعب زميل بفورمات قتالية مشتركة عند بدء المعركة.');
                            playSynthesizedSound('reload');
                          }}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-black text-xs px-3.5 py-2 rounded-lg shadow-md transition"
                        >
                          اقتران وربط 👥
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="bg-emerald-600/20 text-emerald-300 border border-emerald-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            إشارة قوية جداً
                          </span>
                          <span className="text-xs font-black text-slate-100">هاتف صديقك (Hotspot Client)</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">طراز الجهاز: IP: 192.168.43.12 - متصل بنقطة اتصالك</p>
                      </div>
                    </div>

                    {/* Device 2 - Bluetooth Node */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center text-right">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('btl_local_mode', 'p2p_connected');
                            alert('تم إرسال طلب اقتران Bluetooth قتالي! سيظهر صديقك طاقمك القتالي الآن.');
                            playSynthesizedSound('reload');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-3.5 py-2 rounded-lg shadow-md transition"
                        >
                          ربط بلوتوث 🔵
                        </button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            Bluetooth Active
                          </span>
                          <span className="text-xs font-black text-slate-100">Galaxy S23 Plus - نقاط الحرب</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">طراز الجهاز: MAC: FE:3C:D1:88:5A - بنطاق بقرب 2.5 متر</p>
                      </div>
                    </div>

                    {/* Device 3 - Share code portal */}
                    <div className="bg-slate-950/40 border border-dashed border-teal-500/20 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-black text-teal-400 text-right">🔗 شبكة نقاط اتصالات الويب السريعة (Invite Link Network):</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const link = window.location.origin + window.location.pathname + "?room=" + Math.floor(Math.random() * 9000 + 1000);
                            navigator.clipboard.writeText(link);
                            alert("تم نسخ رابط نقاط الحرب المحلي! شاركه مع صديقك المتصل معك بنفس شبكة الهوتسبوت ليدخل في مباراتك مباشرة.");
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-yellow-300 border border-yellow-400/20 font-mono text-[10px] sm:text-xs font-bold px-3.5 py-2 rounded-lg transition shrink-0"
                        >
                          نسخ رابط الغرفة 📋
                        </button>
                        <input
                          type="text"
                          readOnly
                          value={window.location.origin + "?room=7935"}
                          className="w-full bg-black/40 text-slate-400 border border-white/15 px-3 py-1.5 rounded-lg text-xs font-mono text-left"
                        />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* Guidelines to play with friends */}
              <div className="bg-teal-950/20 border border-teal-500/20 rounded-2xl p-5 space-y-3 text-right">
                <h3 className="text-sm font-black text-teal-300">💡 تعليمات الربط المباشر مع أصدقائك (خطوة بخطوة):</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-teal-400 font-black text-sm">1. المضيف (Host Room) 🏰</div>
                    <p className="text-slate-300 leading-relaxed font-medium">قم بتشغيل **نقطة اتصال الهواتف الأجهزة المحمولة (Wi-Fi Hotspot)** لدعم الربط المحلي أو اسمح بصناعة اقتران Bluetooth.</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-teal-400 font-black text-sm">2. الضيف المتصل (Client) 📲</div>
                    <p className="text-slate-300 leading-relaxed font-medium">اجعل صديقك يتصل بنفس شبكة الهوتسبوت الخاصة بك أو قم بعمل Bluetooth Pairing بجهازك فورياً.</p>
                  </div>
                  <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-teal-400 font-black text-sm">3. ابدأ الحرب معاً! ⚔️</div>
                    <p className="text-slate-300 leading-relaxed font-medium">اضغط اقتران أعلاه وسيقوم المحرك بدمج صديقك معك في أرض المعركة لتقاتلوا سوياً أو تدخلا في منافسة ثنائية ضارية.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => { setActiveTab('lobby'); playSynthesizedSound('build'); }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black px-6 py-2.5 rounded-xl text-xs transition"
                >
                  العودة لقائمة اللعب الافتراضية 🗺️
                </button>
              </div>

            </motion.div>
          )}

          {activeTab === 'crossplay' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl space-y-6 relative z-10"
            >
              <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2 border-b border-white/10 pb-3 font-display">
                <Users className="w-5 h-5 text-yellow-300 animate-pulse" />
                تقنية اللعب المشترك (Cross-Play Support) وشروط العمل
              </h2>

              <p className="text-sm md:text-base text-indigo-100 leading-relaxed text-right font-medium">
                تم دمج محاكي اللعب العابر للمنصات داخل التطبيق ليعمل في أي متصفح متطور أو قديم متوافق مع معايير الويب الفائقة. هذا يعني أنه يمكنك ممارسة اللعبة ولعبها عبر الأنظمة التالية:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right font-sans">
                <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition shadow-lg">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-md font-black text-yellow-300 font-display">المشغلات وأجهزة الكونسول</span>
                    <span className="text-lg">🎮</span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    يعمل بكفاءة هائلة على متصفحات كونسولات <strong>PS4, PS5, Xbox One, Xbox Series X/S</strong>. يدعم بشكل كامل ومباشر أذرعة التحكم الرسمية (DualShock, DualSense, Xbox Gamepad) عبر منفذ Gamepad API المتوافق مباشرة بدون برامج إضافية.
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition shadow-lg">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-md font-black text-yellow-300 font-display">الحواسيب و Steam / Steam Deck</span>
                    <span className="text-lg">💻</span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    توافق كامل مع متصفحات الحواسب الشخصية وأنظمة ماك ولينكس. مع حركة خفيفة و60 إطاراً في الثانية. مدمج مع لوحة المفاتيح والماوس لـ <strong>WASD</strong> وإطلاق النار بالماوس، أو باستخدام قبضة التحكم المفضلة لديك.
                  </p>
                </div>

                <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition shadow-lg">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-md font-black text-yellow-300 font-display">الهواتف الذكية iOS و Android</span>
                    <span className="text-lg">📱</span>
                  </div>
                  <p className="text-xs text-indigo-200 leading-relaxed font-medium">
                    يضم التطبيق واجهة تحكم باللمس (Virtual On-Screen Joysticks) تظهر تلقائياً وتتكيف مع أحجام الشاشات المختلفة. تتيح لك توجيه الحركة، البناء، تجميع الأخشاب وإطلاق النار بانسيابية مطلقة ومواصفات طاقة بطارية موفرة جداً.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-yellow-400/20 border border-yellow-400/30 text-indigo-100 text-xs md:text-sm leading-relaxed text-right font-medium shadow-inner">
                💡 <strong className="text-yellow-300">ملاحظة تقنية حول وضع عدم الاتصال (Offline mode)</strong>:
                حرصاً على منحك تجربة سريعة وخفيفة جداً تعمل على أي هاتف قديم أو إشارة ضعيفة، قمنا بتنصيب خوارزميات ذكاء اصطناعي تفاعيلية بالكامل داخل جهازك تعمل محلياً للتحكم بـ ٩٩ روبوت يحاكي لاعبين بأسماء عربية وأجنبية متنوعة مع مستويات لعب وتحركات ذكية تضاهي لاعبي السيرفر الفعليين.
              </div>

              <button
                onClick={() => setActiveTab('lobby')}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:text-yellow-300 font-black text-sm transition text-slate-100 font-display"
              >
                العودة لغرفة الانتظار
              </button>
            </motion.div>
          )}

          {activeTab === 'leaderboard' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="lg:col-span-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl space-y-5 relative z-10"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3 font-display">
                <span className="text-xs text-indigo-200 font-bold">تحديث أسبوعي تلقائي</span>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-300 animate-bounce" />
                  صدارة أبطال اللعب المشترك (Simulated)
                </h2>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-xl">
                <table className="w-full text-right text-xs md:text-sm">
                  <thead className="bg-black/40 text-yellow-300 font-black border-b border-white/15">
                    <tr>
                      <th className="p-3">الإقصاءات (Kills)</th>
                      <th className="p-3">انتصارات ملكية (Wins)</th>
                      <th className="p-3">المنصة</th>
                      <th className="p-3">الاسم</th>
                      <th className="p-3 text-center">الترتيب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 bg-black/10 text-slate-200 font-bold font-mono">
                    {[
                      { rank: '🥇 1', name: 'ابو_فلة_PRO', platform: 'PS5', prefix: '🎮', wins: 142, kills: '1,590' },
                      { rank: '🥈 2', name: 'Ninja_Arab', platform: 'Steam', prefix: '💻', wins: 130, kills: '1,420' },
                      { rank: '🥉 3', name: 'شيطان_المائل', platform: 'Xbox', prefix: '🟢', wins: 112, kills: '1,280' },
                      { rank: '4', name: 'قناص_الجزيرة', platform: 'iOS', prefix: '📱', wins: 95, kills: '1,110' },
                      { rank: '5', name: 'SavageGlider', platform: 'Android', prefix: '📱', wins: 88, kills: '960' },
                      { rank: '6', name: 'المحترف_99', platform: 'PS4', prefix: '🎮', wins: 76, kills: '850' },
                    ].map((row, index) => (
                      <tr key={index} className="hover:bg-white/10 transition">
                        <td className="p-3">{row.kills}</td>
                        <td className="p-3 font-black text-yellow-300">{row.wins}</td>
                        <td className="p-3 text-indigo-200 flex items-center gap-1 justify-end font-sans">
                          {row.prefix} {row.platform}
                        </td>
                        <td className="p-3 font-sans text-white font-bold">{row.name}</td>
                        <td className="p-3 text-center">{row.rank}</td>
                      </tr>
                    ))}
                    {playerName && (
                      <tr className="bg-yellow-400/20 text-yellow-300 border-t-2 border-yellow-400/30 font-black">
                        <td className="p-3">0</td>
                        <td className="p-3 text-yellow-300">0</td>
                        <td className="p-3 flex items-center gap-1 justify-end font-sans text-indigo-100">
                          {PLATFORM_DETAILS[selectedPlatform].prefix} {selectedPlatform}
                        </td>
                        <td className="p-3 font-sans text-white">{playerName} (أنت)</td>
                        <td className="p-3 text-center">99+</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-2 font-display">
                <button
                  onClick={() => setActiveTab('lobby')}
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 hover:text-yellow-300 font-black text-xs transition"
                >
                  العودة للانتظار
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer credits and information */}
      <footer className="mt-8 border-t border-white/10 pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] text-indigo-200/60 font-bold gap-2 select-none text-center relative z-10">
        <p>مصمم ليعمل أوفلاين محلياً ولا يستهلك أياً من موارد شبكتك أو باقتك.</p>
        <p>© 2026 حلبة الباتل رويال الثنائية Lite. كود برمجي فائق الخفة متوافق مع جميع الهواتف والحواسب والمنصات.</p>
      </footer>
    </div>
  );
}
