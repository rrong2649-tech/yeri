
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from './services/geminiService';
import { ScriptNode, GameState, Item } from './types';
import { Volume2, VolumeX, Briefcase, Smartphone, Music, RefreshCw, X, MessageCircle, Power, Save, RotateCcw } from 'lucide-react';

const gemini = new GeminiService();

// --- ASSETS MAPPING ---
const ASSETS = {
    bg_default: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop', // Cyberpunk city
    bg_commute: 'https://images.unsplash.com/photo-1515549832467-8783363e19b6?q=80&w=1000&auto=format&fit=crop', // Rainy Street
    bg_room: 'https://images.unsplash.com/photo-1605218427306-635ba7b0483c?q=80&w=1000&auto=format&fit=crop', // Cozy Room
    bg_park: 'https://images.unsplash.com/photo-1519331379826-fda8feb021d5?q=80&w=1000&auto=format&fit=crop', // Park
    bg_glitch: 'https://images.unsplash.com/photo-1533750516457-a7f992034fec?q=80&w=1000&auto=format&fit=crop', // Glitch

    char_ziyu: 'assets/ziyu_default.png',
    char_ziyu_happy: 'assets/ziyu_happy.png',
    char_ziyu_pajamas: 'assets/ziyu_pajamas.png',
    char_ziyu_sleep: 'assets/ziyu_sleep.png', 
    char_thug: 'assets/thug.png',
    char_hufeng: 'assets/hu_feng.png', 
    char_player: 'assets/chen_ximeng.png'
};

// --- SFX ASSETS ---
const SFX = {
    boot: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_8247072a44.mp3?filename=sci-fi-charge-up-37395.mp3', // System Boot
    click: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_243f7216a6.mp3?filename=ui-click-43196.mp3', // Soft UI Click
    collect: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=retro-game-coin-pickup-jam-fx-1-00-03.mp3', // Item Pickup
    message: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_10e4a77883.mp3?filename=interface-124464.mp3', // Phone Msg
    glitch: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_55a5b51c8e.mp3?filename=static-noise-172559.mp3', // Glitch/Thug
    transition: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=whoosh-6316.mp3', // Day Transition
    success: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c7443c.mp3?filename=success-1-6297.mp3', // Good Ending
    error: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_c6ccf3232f.mp3?filename=error-2-126514.mp3', // Bad Event
    save: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_142759d57a.mp3?filename=retro-game-notification-212.mp3' // Save/Load
};

// --- GAME DATA ---
const ITEMS_DB: Record<string, Item> = {
    'note': { id: 'note', name: '便利贴', desc: '揉皱的便签: "好想去看海... 好想吃火锅..."', icon: '📄' },
    'receipt': { id: 'receipt', name: '湿小票', desc: '暴雨的痕迹: 关东煮 x3, 孤单的晚餐。', icon: '🧾' },
    'card': { id: 'card', name: '名片', desc: '垃圾数据: 极恶组联系方式 (已失效)', icon: '📇' },
    'sketch': { id: 'sketch', name: '画稿', desc: '电子绘板的数据备份: 一片宁静的蓝色大海。', icon: '🎨' },
    'hairtie': { id: 'hairtie', name: '发圈', desc: '黑色的基础款发圈，缠绕着几根发丝。', icon: '🎀' },
    'coin': { id: 'coin', name: '金币', desc: '胡枫掉落的游戏币，上面刻着像素笑脸。', icon: '🪙' }
};

const DAYS_TITLES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

// --- SCRIPT ENGINE ---
const SCRIPT: Record<string, ScriptNode> = {
    // --- DAY 1: MONDAY (Anxiety) ---
    'start': { 
        id: 'start', 
        speaker: '陈熙蒙', 
        narrative: '周一...又是无穷无尽的加班。监控画面里，她看起来很疲惫。', 
        bg: ASSETS.bg_default, 
        action: 'daily',
        effect: 'clear',
        next: 'mon_1' 
    },
    'mon_1': { 
        id: 'mon_1', 
        speaker: '旁白', 
        narrative: '她烦躁地在便利贴上写了什么，然后一把揉皱，扔向了屏幕边缘。', 
        action: 'drop_note', // Triggers drop appearance
        collectNext: 'mon_2' // MUST collect to proceed
    },
    'mon_2': { 
        id: 'mon_2', 
        speaker: '系统', 
        narrative: '>>> [便利贴] 已收集。\n陈熙蒙：原来她想去海边...该死的工作。', 
        next: 'mon_phone' 
    },
    'mon_phone': { 
        id: 'mon_phone', 
        speaker: '陈熙蒙', 
        narrative: '给她一点鼓励吧。虽然不能直接说话，但可以通过手机推送。', 
        phone: ['伪装系统推送: “注意休息，身体第一。”'], 
        phoneNext: 'mon_end' 
    },
    'mon_end': { 
        id: 'mon_end', 
        speaker: '鹿子育', 
        narrative: '她看着手机屏幕，紧皱的眉头舒展了一些，露出了一丝笑容。', 
        action: 'happy', 
        endDay: true 
    },

    // --- DAY 2: TUESDAY (Rain) ---
    'd2_start': { 
        id: 'd2_start', 
        speaker: '陈熙蒙', 
        narrative: '周二。这糟糕的天气系统...暴雨倾盆。', 
        bg: ASSETS.bg_commute, 
        action: 'daily', 
        effect: 'rain', // Enable Rain FX
        next: 'd2_1' 
    },
    'd2_1': { 
        id: 'd2_1', 
        speaker: '旁白', 
        narrative: '雨水打湿了她的衣服。她手里紧紧捏着的购物小票不小心掉进了积水里。', 
        action: 'drop_receipt', 
        collectNext: 'd2_2' 
    },
    'd2_2': { 
        id: 'd2_2', 
        speaker: '系统', 
        narrative: '>>> [湿小票] 已入库。\n陈熙蒙：这么大的雨，根本打不到车。我得帮帮她。', 
        next: 'd2_3' 
    },
    'd2_3': { 
        id: 'd2_3', 
        speaker: '陈熙蒙', 
        narrative: '正在黑入约车调度系统...\n指令发送：调配最近的空车。', 
        next: 'd2_4' 
    },
    'd2_4': { 
        id: 'd2_4', 
        speaker: '鹿子育', 
        narrative: '一辆车停在她面前。\n“诶？有专车接我？是...那位陈先生吗？”', 
        endDay: true 
    },

    // --- DAY 3: WEDNESDAY (Thug) ---
    'd3_start': { 
        id: 'd3_start', 
        speaker: '系统', 
        narrative: '警告！检测到敌对NPC靠近！', 
        bg: ASSETS.bg_default,
        effect: 'clear',
        action: 'npc_show', 
        next: 'd3_1' 
    },
    'd3_1': { 
        id: 'd3_1', 
        speaker: '小混混', 
        narrative: '“美女，一个人啊？加个微信聊聊？”\n那家伙猥琐地凑了过去。', 
        next: 'd3_2' 
    },
    'd3_2': { 
        id: 'd3_2', 
        speaker: '陈熙蒙', 
        narrative: '找死。', 
        choices: [
            { text: '物理删除NPC数据 (Delete)', next: 'd3_3' },
            { text: '制造区域停电 (Blackout)', next: 'd3_3' }
        ]
    },
    'd3_3': { 
        id: 'd3_3', 
        speaker: '系统', 
        narrative: 'NPC已清除。掉落物品：名片。', 
        action: 'npc_hide_drop', // Thug leaves, Card appears
        collectNext: 'd3_4'
    },
    'd3_4': { 
        id: 'd3_4', 
        speaker: '系统', 
        narrative: '>>> [名片] 已收集 (垃圾数据)。', 
        next: 'd3_5' 
    },
    'd3_5': { 
        id: 'd3_5', 
        speaker: '陈熙蒙', 
        narrative: '她被吓坏了。送杯热奶茶压压惊吧。', 
        choices: [
            { text: '投递热奶茶', showProp: 'tea', next: 'd3_end' }
        ]
    },
    'd3_end': { 
        id: 'd3_end', 
        speaker: '鹿子育', 
        narrative: '“哇...热奶茶？”\n她捧着奶茶，温暖的感觉从手心传到了心里。', 
        action: 'happy',
        endDay: true 
    },

    // --- DAY 4: THURSDAY (Sketch) ---
    'd4_start': { 
        id: 'd4_start', 
        speaker: '陈熙蒙', 
        narrative: '周四。她在公园写生。难得的宁静时刻。', 
        bg: ASSETS.bg_park, 
        action: 'daily', 
        next: 'd4_1' 
    },
    'd4_1': { 
        id: 'd4_1', 
        speaker: '旁白', 
        narrative: '突然一阵狂风吹过（服务器波动？），她的画稿被吹飞了！', 
        action: 'drop_sketch', 
        collectNext: 'd4_2' 
    },
    'd4_2': { 
        id: 'd4_2', 
        speaker: '陈熙蒙', 
        narrative: '>>> [画稿] 已截获。\n画的是一片蓝色的大海...原来她一直向往自由。', 
        endDay: true 
    },

    // --- DAY 5: FRIDAY (Pajamas & Gift) ---
    'd5_start': { 
        id: 'd5_start', 
        speaker: '鹿子育', 
        narrative: '“终于...终于周五了。”\n她回到家，换上了最舒服的睡衣。', 
        bg: ASSETS.bg_room, 
        action: 'pajamas', 
        next: 'd5_1' 
    },
    'd5_1': { 
        id: 'd5_1', 
        speaker: '旁白', 
        narrative: '解头发的时候，发圈崩断了，掉在地上。', 
        action: 'drop_hairtie', 
        collectNext: 'd5_2' 
    },
    'd5_2': { 
        id: 'd5_2', 
        speaker: '陈熙蒙', 
        narrative: '>>> [发圈] 已私藏。\n这上面有她的气息...收藏完毕。', 
        next: 'd5_3' 
    },
    'd5_3': { 
        id: 'd5_3', 
        speaker: '旁白', 
        narrative: '她太累了，倒在床上秒睡了过去。', 
        action: 'sleep', 
        next: 'd5_4' 
    },
    'd5_4': { 
        id: 'd5_4', 
        speaker: '陈熙蒙', 
        narrative: '看她睡得这么香...在梦里送她个礼物吧。', 
        choices: [
            { text: '送一束电子花', showProp: 'flower', next: 'd5_end' },
            { text: '送一张按摩券', showProp: 'coupon', next: 'd5_end' }
        ]
    },
    'd5_end': { 
        id: 'd5_end', 
        speaker: '鹿子育', 
        narrative: '她在梦中露出了甜甜的笑容。晚安。', 
        endDay: true 
    },

    // --- DAY 6: SATURDAY (Intruder) ---
    'd6_start': { 
        id: 'd6_start', 
        speaker: '系统', 
        narrative: '警告！非法入侵！ID: Hu Feng (胡枫)', 
        bg: ASSETS.bg_default, 
        action: 'hufeng_show', 
        next: 'd6_1' 
    },
    'd6_1': { 
        id: 'd6_1', 
        speaker: '胡枫', 
        narrative: '“嗨嗨嗨！美女理理我！我是内测玩家！”\n他在鹿子育面前跳来跳去，烦死人了。', 
        next: 'd6_2' 
    },
    'd6_2': { 
        id: 'd6_2', 
        speaker: '陈熙蒙', 
        narrative: '滚。', 
        choices: [
            { text: '强制踢下线 (Kick)', next: 'd6_3' }
        ]
    },
    'd6_3': { 
        id: 'd6_3', 
        speaker: '系统', 
        narrative: '入侵者已清除。掉落物品：金币。', 
        action: 'hufeng_hide_drop', 
        collectNext: 'd6_4' 
    },
    'd6_4': { 
        id: 'd6_4', 
        speaker: '系统', 
        narrative: '>>> [金币] 已回收。\n世界清静了。', 
        endDay: true 
    },

    // --- DAY 7: SUNDAY (Ending) ---
    'd7_start': { 
        id: 'd7_start', 
        speaker: '陈熙蒙', 
        narrative: '周日。熙泰发来警告：系统将在今晚进行全服重置。\n所有NPC记忆将被清零...她会忘记我。', 
        bg: ASSETS.bg_glitch, 
        effect: 'code', // Enable Matrix FX
        next: 'd7_1' 
    },
    'd7_1': { 
        id: 'd7_1', 
        speaker: '鹿子育', 
        narrative: '她站在窗前，似乎察觉到了世界的崩塌。\n她转身看向虚空：\n“注视者...陈先生...你在那里，对吗？”', 
        choices: [
            { text: '回应她', ending: 'HE' },
            { text: '锁定数据', ending: 'BE' },
            { text: '断开连接', ending: 'NE' }
        ]
    }
};

const DAY_MAP = ['start', 'd2_start', 'd3_start', 'd4_start', 'd5_start', 'd6_start', 'd7_start'];
const SAVE_KEY = 'earth_online_save_v1';

export default function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [gameState, setGameState] = useState<GameState>({
      day: 0,
      inventory: [],
      history: [],
      stats: { rationality: 50, affinity: 20 }
  });
  
  const [bgImage, setBgImage] = useState(ASSETS.bg_default);
  const [spriteState, setSpriteState] = useState({
      ziyu: 'daily', 
      npc: false, 
      hufeng: false
  });
  const [activeDrops, setActiveDrops] = useState<string[]>([]);
  const [showProp, setShowProp] = useState<string | null>(null);
  const [showPhone, setShowPhone] = useState(false);
  const [showBag, setShowBag] = useState(false);
  const [dayTransition, setDayTransition] = useState<string | null>(null);
  const [effect, setEffect] = useState<'none' | 'rain' | 'code'>('none');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mute, setMute] = useState(false);
  const [ending, setEnding] = useState<'HE' | 'BE' | 'NE' | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentNode = SCRIPT[currentNodeId];

  useEffect(() => {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) setHasSave(true);
  }, []);

  // Helper for Sound Effects
  const playSfx = (key: keyof typeof SFX) => {
      if (mute) return;
      const audio = new Audio(SFX[key]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('SFX Play Error:', e));
  };

  // --- ENGINE LOGIC ---

  useEffect(() => {
     if (!currentNode || !gameStarted) return;
     
     // Handle Background
     if (currentNode.bg) setBgImage(currentNode.bg);

     // Handle Effects
     if (currentNode.effect) {
         setEffect(currentNode.effect === 'clear' ? 'none' : currentNode.effect);
     }

     // Handle Actions
     if (currentNode.action) {
         const act = currentNode.action;
         // Character States
         if (['daily', 'happy', 'pajamas', 'sleep'].includes(act)) {
             setSpriteState(prev => ({ ...prev, ziyu: act, npc: false, hufeng: false }));
         }
         // NPC Control
         if (act === 'npc_show') {
             setSpriteState(prev => ({ ...prev, npc: true }));
             playSfx('glitch');
         }
         if (act === 'npc_hide_drop') {
             setSpriteState(prev => ({ ...prev, npc: false }));
             setActiveDrops(['card']);
             playSfx('click');
         }
         if (act === 'hufeng_show') {
             setSpriteState(prev => ({ ...prev, hufeng: true }));
             playSfx('glitch');
         }
         if (act === 'hufeng_hide_drop') {
             setSpriteState(prev => ({ ...prev, hufeng: false }));
             setActiveDrops(['coin']);
             playSfx('click');
         }
         // Drops
         if (act.startsWith('drop_')) {
             const item = act.replace('drop_', '');
             setActiveDrops(prev => {
                 // Prevent duplicate drops if revisiting node (e.g. load)
                 if (prev.includes(item) || gameState.inventory.includes(item)) return prev;
                 return [...prev, item];
             });
             playSfx('click');
         }
     }
  }, [currentNodeId, gameStarted]);

  const handleNext = (nextNodeId?: string) => {
      if (!nextNodeId) return;
      playSfx('click');
      setCurrentNodeId(nextNodeId);
  };

  const advanceDay = () => {
      const nextDayIdx = gameState.day + 1;
      if (nextDayIdx >= DAY_MAP.length) return;
      
      playSfx('transition');
      setDayTransition(DAYS_TITLES[nextDayIdx]);
      setGameState(prev => ({ ...prev, day: nextDayIdx }));
      
      setTimeout(() => {
          setDayTransition(null);
          setCurrentNodeId(DAY_MAP[nextDayIdx]);
          // Reset daily visuals
          setSpriteState({ ziyu: 'daily', npc: false, hufeng: false });
          setActiveDrops([]);
          setEffect('none');
      }, 2500);
  };

  const handleChoice = (choice: any) => {
      playSfx('click');
      if (choice.showProp) {
          setShowProp(choice.showProp);
          playSfx('collect');
          setTimeout(() => setShowProp(null), 2000);
      }
      if (choice.ending) {
          setEnding(choice.ending);
          if (choice.ending === 'HE') playSfx('success');
          else if (choice.ending === 'BE') playSfx('error');
          else playSfx('transition');
          return;
      }
      if (choice.endDay) {
          advanceDay();
          return;
      }
      if (choice.next) handleNext(choice.next);
  };

  const handleDropClick = (item: string) => {
      // Add to inventory
      playSfx('collect');
      setGameState(prev => ({ ...prev, inventory: [...prev.inventory, item] }));
      setActiveDrops(prev => prev.filter(d => d !== item));
      
      // Advance Narrative strictly based on current node's collectNext
      if (currentNode && currentNode.collectNext) {
          handleNext(currentNode.collectNext);
      }
  };

  const playSpeech = async () => {
      if (isSpeaking) return;
      setIsSpeaking(true);
      try {
          const audioData = await gemini.generateSpeech(currentNode.narrative, currentNode.speaker);
          if (audioData) {
              // Ensure we have a reusable AudioContext
              if (!audioContextRef.current) {
                  audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
              }
              const ctx = audioContextRef.current;
              
              // Gemini TTS returns raw PCM: 24kHz, 1 channel, Int16, Little Endian
              const sampleRate = 24000;
              const binaryString = atob(audioData);
              const len = binaryString.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                  bytes[i] = binaryString.charCodeAt(i);
              }
              
              // Create Int16 view of the byte buffer
              const int16Data = new Int16Array(bytes.buffer);
              
              // Create AudioBuffer
              const audioBuffer = ctx.createBuffer(1, int16Data.length, sampleRate);
              const channelData = audioBuffer.getChannelData(0);
              
              // Convert Int16 to Float32
              for (let i = 0; i < int16Data.length; i++) {
                  // Normalize to range [-1.0, 1.0]
                  channelData[i] = int16Data[i] / 32768.0;
              }

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => { setIsSpeaking(false); };
              source.start(0);
          } else {
              setIsSpeaking(false);
          }
      } catch (e) {
          console.error("Audio Error:", e);
          setIsSpeaking(false);
      }
  };

  const toggleMusic = () => {
      if (audioRef.current) {
          if (mute) {
              audioRef.current.pause();
              setMute(false);
          } else {
              audioRef.current.play().catch(e => console.log("Audio autoplay prevented", e));
              setMute(true);
          }
      }
  };

  // --- SAVE/LOAD SYSTEM ---
  const saveGame = () => {
      const saveData = {
          currentNodeId,
          gameState,
          bgImage,
          spriteState,
          activeDrops,
          effect,
          timestamp: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      playSfx('save');
      alert("SYSTEM: PROGRESS SAVED TO LOCAL MEMORY.");
  };

  const loadGame = () => {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return;
      try {
          const data = JSON.parse(saved);
          setCurrentNodeId(data.currentNodeId);
          setGameState(data.gameState);
          setBgImage(data.bgImage);
          setSpriteState(data.spriteState);
          setActiveDrops(data.activeDrops);
          setEffect(data.effect);
          
          setGameStarted(true);
          playSfx('save');
          // Resume music if it was on
          if (audioRef.current && !mute) {
              audioRef.current.play().catch(() => {});
          }
      } catch (e) {
          console.error("Failed to load save", e);
          alert("SYSTEM ERROR: CORRUPTED SAVE DATA.");
      }
  };

  // Start game sequence
  const startGame = () => {
    playSfx('boot');
    setGameStarted(true);
    // Try to start music on interaction
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
        audioRef.current.play().catch(e => console.log("Music require interaction"));
        setMute(true); // Is playing (state logic inverted in UI: true = icon active)
    }
  };

  const restartGame = () => {
      playSfx('boot');
      window.location.reload();
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-screen bg-black flex items-center justify-center overflow-hidden font-sans select-none text-white">
        
        {/* CSS FX LAYERS */}
        <style>{`
            .pixelated { image-rendering: pixelated; }
            @keyframes rain {
                0% { background-position: 0 0; }
                100% { background-position: 20% 100%; }
            }
            .rain-overlay {
                background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAABZJREFUeNpiYGBgAAgwAA0gAAAB//8DAgA6BAs7QAAAABJRU5ErkJggg==');
                background-size: 20px 20px;
                opacity: 0.3;
                animation: rain 0.5s linear infinite;
                pointer-events: none;
            }
            .code-overlay {
                background: linear-gradient(rgba(0, 255, 0, 0), rgba(0, 255, 0, 0.2));
                background-size: 100% 3px;
                pointer-events: none;
            }
            .scanline-text {
                background: linear-gradient(to bottom, #fff, #aaa 50%, #fff 50%);
                background-size: 100% 4px;
                -webkit-background-clip: text;
                color: transparent;
            }
        `}</style>

        {/* START SCREEN */}
        {!gameStarted && (
            <div className="absolute inset-0 z-[999] bg-black flex flex-col items-center justify-center text-center p-8 space-y-8">
                <div className="space-y-2 animate-pulse">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-cyan-400 font-mono" style={{ textShadow: '0 0 20px cyan' }}>
                        EARTH ONLINE
                    </h1>
                    <p className="text-amber-500 font-mono tracking-[0.5em] text-sm md:text-xl">SYSTEM OBSERVER: CHEN XIMENG</p>
                </div>

                <div className="w-full max-w-md border border-stone-800 bg-stone-900/50 p-6 rounded font-mono text-sm text-green-500 text-left space-y-2">
                    <div>> CHECKING SYSTEM... OK</div>
                    <div>> LOADING ASSETS... OK</div>
                    <div>> TARGET LOCATED: LU ZIYU</div>
                    {hasSave && <div className="text-amber-400">> SAVE DATA DETECTED</div>}
                    <div className="animate-pulse">> WAITING FOR CONNECTION...</div>
                </div>

                <div className="flex flex-col gap-4">
                    <button 
                        onClick={startGame}
                        className="group relative px-12 py-4 bg-transparent border-2 border-cyan-500 text-cyan-500 font-bold text-xl tracking-widest hover:bg-cyan-500 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(0,255,255,0.3)] hover:shadow-[0_0_40px_rgba(0,255,255,0.6)]"
                    >
                        <span className="flex items-center gap-2">
                            <Power size={24} /> INITIALIZE LINK
                        </span>
                    </button>

                    {hasSave && (
                        <button 
                            onClick={loadGame}
                            className="group relative px-12 py-4 bg-transparent border-2 border-amber-500 text-amber-500 font-bold text-xl tracking-widest hover:bg-amber-500 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)]"
                        >
                            <span className="flex items-center gap-2">
                                <RotateCcw size={24} /> RESUME CONNECTION
                            </span>
                        </button>
                    )}
                </div>
                
                <p className="text-stone-600 text-xs mt-8 font-mono">
                   VERSION 1.0.5 // MEMORY FRAGMENTS
                </p>
            </div>
        )}

        {/* DAY TRANSITION OVERLAY */}
        {dayTransition && (
            <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-500">
                <h1 className="text-6xl font-bold text-amber-500 font-mono tracking-[0.5em] animate-pulse">
                    {dayTransition}
                </h1>
                <div className="mt-4 text-cyan-500 font-mono text-sm">SYSTEM BACKUP... COMPLETED</div>
            </div>
        )}

        {/* ENDING OVERLAY */}
        {ending && (
            <div className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center animate-in fade-in duration-1000 p-8 text-center">
                <h1 className={`text-6xl font-bold mb-6 tracking-widest ${
                    ending === 'HE' ? 'text-pink-500' : ending === 'BE' ? 'text-red-600' : 'text-stone-400'
                }`}>
                    {ending === 'HE' && 'HAPPY ENDING'}
                    {ending === 'BE' && 'BAD ENDING'}
                    {ending === 'NE' && 'NORMAL ENDING'}
                </h1>
                <h2 className="text-2xl text-white font-mono mb-8">
                    {ending === 'HE' && '赛博私奔: 跨越维度的爱恋'}
                    {ending === 'BE' && '笼中鸟: 永恒的静止数据'}
                    {ending === 'NE' && '沉默告别: 相忘于江湖'}
                </h2>
                <p className="text-stone-300 max-w-2xl text-lg leading-relaxed mb-12">
                    {ending === 'HE' && "你回应了她的呼唤，将她的数据备份到了本地核心。在这个虚构的地球Online崩塌之际，你们在私有服务器中重建了属于你们的二人世界。"}
                    {ending === 'BE' && "为了不让她消失，你利用黑客权限强行锁定了她的状态。她永远定格在了这一刻，安全，但也失去了灵魂。你守着这具空壳，直到永远。"}
                    {ending === 'NE' && "你选择了断开连接。系统重置了，她忘记了一切。第二天，新的周一开始了，你依然是那个屏幕前的观察者，而她再也不记得那个送奶茶的陈先生。"}
                </p>
                <button 
                    onClick={restartGame} 
                    className="px-8 py-3 border-2 border-white text-white bg-stone-900 hover:bg-white hover:text-black transition-colors font-mono text-xl flex items-center gap-2 cursor-pointer z-50 pointer-events-auto"
                >
                    <RefreshCw size={24} /> REBOOT SYSTEM (重启)
                </button>
            </div>
        )}

        {/* MAIN GAME CONTAINER */}
        <div className={`relative w-full max-w-[1024px] aspect-[4/3] bg-stone-900 shadow-2xl overflow-hidden border-8 border-stone-800 rounded-lg transition-opacity duration-1000 ${gameStarted ? 'opacity-100' : 'opacity-0'}`}>
            
            {/* 1. BACKGROUND LAYER (Z-0) */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000 z-0"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
                {effect === 'rain' && <div className="absolute inset-0 rain-overlay z-10"></div>}
                {effect === 'code' && <div className="absolute inset-0 code-overlay z-10 bg-green-900/10"></div>}
            </div>

            {/* 2. CHARACTERS & NPC LAYER (Z-20) */}
            <div className="absolute inset-0 pointer-events-none z-20">
                {/* NPC Thug */}
                {spriteState.npc && (
                    <img src={ASSETS.char_thug} className="absolute left-[20%] bottom-[25%] h-[350px] pixelated animate-pulse" alt="Thug" />
                )}

                {/* Hu Feng (Thug Recolor) */}
                {spriteState.hufeng && (
                    <img src={ASSETS.char_hufeng} className="absolute left-[20%] bottom-[25%] h-[350px] pixelated hue-rotate-90" style={{ filter: 'hue-rotate(90deg)' }} alt="Hu Feng" />
                )}

                {/* Ziyu (Target) */}
                <img 
                    src={
                        spriteState.ziyu === 'happy' ? ASSETS.char_ziyu_happy :
                        spriteState.ziyu === 'pajamas' ? ASSETS.char_ziyu_pajamas :
                        spriteState.ziyu === 'sleep' ? ASSETS.char_ziyu_sleep : 
                        ASSETS.char_ziyu
                    }
                    className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 pixelated drop-shadow-xl
                        ${spriteState.ziyu === 'sleep' ? 'bottom-[10%] w-[350px]' : 'bottom-[25%] h-[350px]'}
                    `}
                    alt="Ziyu"
                />
            </div>

            {/* 3. DROPS LAYER (Z-30) */}
            {activeDrops.map(drop => (
                <div 
                    key={drop}
                    onClick={() => handleDropClick(drop)}
                    className="absolute z-30 cursor-pointer animate-bounce w-16 h-16 bg-black/60 border-2 border-white rounded-full flex items-center justify-center text-3xl shadow-[0_0_15px_white] hover:scale-110 transition-transform"
                    style={{ left: '50%', bottom: '40%' }}
                >
                    {ITEMS_DB[drop]?.icon || '?'}
                </div>
            ))}

            {/* 4. UI LAYER (Dialogue) (Z-40) */}
            <div 
                className="absolute bottom-0 left-0 right-0 h-[220px] bg-black/95 border-t-4 border-amber-500 p-6 pr-[250px] z-40 flex flex-col gap-2 cursor-pointer select-none"
                onClick={() => {
                    // CRITICAL FIX: Allow clicking if endDay is true, OR if there is a next node (and not locked)
                    if (currentNode.collectNext) return; // Locked by interaction
                    
                    if (currentNode.endDay) {
                        advanceDay();
                    } else if (currentNode.next) {
                        handleNext(currentNode.next);
                    }
                }}
            >
                <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-bold text-xl tracking-wider">{currentNode.speaker}</span>
                    <button onClick={(e) => { e.stopPropagation(); playSpeech(); }} className={`text-stone-500 hover:text-amber-500 ${isSpeaking ? 'text-green-500 animate-pulse' : ''}`}>
                        <Volume2 size={18} />
                    </button>
                </div>
                <p className="text-stone-100 text-lg leading-relaxed whitespace-pre-line font-sans">
                    {currentNode.narrative}
                </p>
                
                {/* Click to Continue Indicators */}
                {(currentNode.next && !currentNode.collectNext) && (
                    <div className="mt-auto text-amber-500 text-sm animate-pulse">
                        ▼ 点击继续 (NEXT)
                    </div>
                )}
                
                {currentNode.endDay && (
                    <div className="mt-auto text-amber-500 text-sm animate-pulse">
                        ▼ 点击进入下一天 (NEXT DAY)
                    </div>
                )}
                
                {/* Interaction Hint */}
                {activeDrops.length > 0 && (
                    <div className="mt-auto text-yellow-500 text-sm animate-pulse font-bold">
                        [!] 请点击画面中的物品以继续
                    </div>
                )}
            </div>

            {/* 5. PROPS LAYER (Large visual effects) (Z-50) */}
            {showProp && (
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce pointer-events-none">
                     <div className="text-[100px] filter drop-shadow-[0_0_20px_gold]">
                         {showProp === 'tea' && '🧋'}
                         {showProp === 'flower' && '💐'}
                         {showProp === 'coupon' && '🎫'}
                     </div>
                 </div>
            )}

            {/* 6. PLAYER AVATAR (Chen Ximeng) (Z-60) - Topmost as requested */}
            <img 
                src={ASSETS.char_player} 
                className="absolute -right-10 -bottom-10 h-[500px] object-contain z-60 drop-shadow-[0_0_20px_rgba(0,255,255,0.2)] pointer-events-none" 
                alt="Player"
            />

            {/* 7. OVERLAY UI (Choices, Phone, Inventory) (Z-70+) */}
            
            {/* Top Bar */}
            <div className="absolute top-4 left-4 flex gap-2 z-[70] font-mono text-amber-500 text-sm">
                <div className="bg-black/80 px-3 py-1 border border-amber-600 rounded">TARGET: LU ZIYU</div>
                <div className="bg-black/80 px-3 py-1 border border-amber-600 rounded">DAY: {DAYS_TITLES[gameState.day]}</div>
            </div>

            {/* Side Tools */}
            <div className="absolute top-16 left-4 flex flex-col gap-3 z-[70]">
                <button onClick={() => { setShowBag(true); playSfx('click'); }} className="w-12 h-12 bg-black/80 border-2 border-amber-500 rounded flex items-center justify-center text-amber-500 hover:bg-amber-900 transition-colors relative" title="Inventory">
                    <Briefcase size={20} />
                    {gameState.inventory.length > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />}
                </button>
                <button onClick={toggleMusic} className={`w-12 h-12 bg-black/80 border-2 border-amber-500 rounded flex items-center justify-center hover:bg-amber-900 transition-colors ${mute ? 'text-stone-600' : 'text-amber-500 animate-pulse'}`} title="Toggle Music">
                    {mute ? <VolumeX size={20} /> : <Music size={20} />}
                </button>
                <button onClick={saveGame} className="w-12 h-12 bg-black/80 border-2 border-cyan-500 rounded flex items-center justify-center text-cyan-500 hover:bg-cyan-900 transition-colors" title="Save Game">
                    <Save size={20} />
                </button>
                 <button onClick={loadGame} className="w-12 h-12 bg-black/80 border-2 border-cyan-500 rounded flex items-center justify-center text-cyan-500 hover:bg-cyan-900 transition-colors" title="Load Game">
                    <RotateCcw size={20} />
                </button>
            </div>

            {/* Phone Icon */}
            {currentNode.phone && (
                <button 
                    onClick={() => { setShowPhone(true); playSfx('click'); }}
                    className="absolute right-[280px] bottom-[240px] z-[70] w-16 h-24 bg-black border-2 border-cyan-400 rounded-xl flex items-center justify-center animate-bounce shadow-[0_0_20px_cyan]"
                >
                    <Smartphone className="text-cyan-400" size={32} />
                </button>
            )}

            {/* Choices Overlay */}
            {currentNode.choices && (
                <div className="absolute inset-0 bg-black/80 z-[80] flex flex-col items-center justify-center gap-4 animate-in fade-in">
                    {currentNode.choices.map((choice, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleChoice(choice)}
                            className="w-[60%] py-4 px-6 bg-stone-900 border-2 border-amber-500 text-amber-500 text-xl font-bold hover:bg-amber-600 hover:text-black hover:scale-105 transition-all text-left font-sans shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                        >
                            <span className="mr-4 text-cyan-400 font-mono">{`> 0${idx + 1}`}</span>
                            {choice.text}
                        </button>
                    ))}
                </div>
            )}

            {/* Phone Modal */}
            {showPhone && currentNode.phone && (
                <div className="absolute inset-0 bg-black/90 z-[90] flex items-center justify-center">
                    <div className="w-[350px] bg-stone-900 border-2 border-cyan-500 rounded-lg overflow-hidden flex flex-col shadow-[0_0_30px_cyan]">
                         <div className="bg-stone-800 p-3 text-cyan-500 font-bold flex justify-between items-center">
                             <div className="flex items-center gap-2"><MessageCircle size={16}/> MESSAGES</div>
                             <button onClick={() => setShowPhone(false)}><X size={18}/></button>
                         </div>
                         <div className="p-4 flex flex-col gap-3">
                             {currentNode.phone.map((msg, i) => (
                                 <button 
                                    key={i}
                                    onClick={() => {
                                        playSfx('message');
                                        setShowPhone(false);
                                        if (currentNode.phoneNext) handleNext(currentNode.phoneNext);
                                    }}
                                    className="p-3 bg-stone-800 text-left text-white rounded border border-stone-600 hover:border-cyan-500 hover:bg-stone-700 transition-colors text-sm"
                                 >
                                     {msg}
                                 </button>
                             ))}
                         </div>
                    </div>
                </div>
            )}

            {/* Bag Modal */}
            {showBag && (
                <div className="absolute inset-0 bg-black/90 z-[90] flex items-center justify-center" onClick={() => setShowBag(false)}>
                    <div className="w-[500px] h-[400px] bg-stone-900 border-2 border-amber-500 rounded p-4 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setShowBag(false)} className="absolute top-2 right-2 text-stone-500 hover:text-white"><X /></button>
                        <h2 className="text-2xl text-amber-500 font-mono mb-6 border-b border-stone-700 pb-2 flex items-center gap-2">
                            <Briefcase /> INVENTORY
                        </h2>
                        <div className="grid grid-cols-4 gap-4">
                            {gameState.inventory.length === 0 && <div className="text-stone-500 col-span-4 text-center py-10 font-mono">NO DATA COLLECTED</div>}
                            {gameState.inventory.map((itemId, i) => (
                                <div key={i} className="aspect-square bg-black/50 border border-stone-600 flex items-center justify-center text-4xl cursor-help group relative hover:border-white transition-colors">
                                    {ITEMS_DB[itemId]?.icon}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white text-black text-xs p-2 rounded w-40 hidden group-hover:block z-50 pointer-events-none shadow-xl text-center">
                                        <div className="font-bold mb-1">{ITEMS_DB[itemId]?.name}</div>
                                        <div className="opacity-75 leading-tight">{ITEMS_DB[itemId]?.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
        <audio ref={audioRef} loop src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3" />
    </div>
  );
}
