/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback, FormEvent } from 'react';
import { 
  Check, 
  Trash2, 
  Settings, 
  Plus, 
  Coins, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Heart, 
  Gift, 
  X, 
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HabitTask, ShopItem, HistoryRecord, ToastMessage, ChikawaCharacter } from './types';

// Cute Dinosaur Mascots
const MASCOTS: ChikawaCharacter[] = [
  {
    name: '啵啵绿 (霸王龙)',
    emoji: '🦖',
    avatar: '🦖',
    color: '#E2F0D9',
    bg: 'bg-[#F5FAF0]',
    quote: '吼哈！我是超凶(其实很呆萌)的小绿霸王龙！陪你一起打卡成长，嗷呜~！🦖🍃'
  },
  {
    name: '嘟嘟蓝 (腕龙)',
    emoji: '🦕',
    avatar: '🦕',
    color: '#D2E9FF',
    bg: 'bg-[#F0F7FF]',
    quote: '我的脖子很长很长，能帮你看到未来的小惊喜！今天也要稳稳地完成打卡呀！🦕☁️'
  },
  {
    name: '卡卡粉 (三角龙)',
    emoji: '🐲',
    avatar: '🐲',
    color: '#FFDADA',
    bg: 'bg-[#FFF0F0]',
    quote: '头上的三个小角是用来发射元气的！哔波——！今天也为你超级加倍加油哦！🐲💖'
  },
  {
    name: '团团黄 (剑龙)',
    emoji: '🐊',
    avatar: '🐊',
    color: '#FFF4D0',
    bg: 'bg-[#FFFDF0]',
    quote: '背上的小背板亮晶晶的，是金币探测仪哦！完成打卡让金币滚滚来吧！🐊⭐'
  }
];

// Presets for Custom Add Forms
const HABIT_EMOJIS = ['💧', '📚', '🌙', '🏃', '🍎', '🧹', '🎹', '🧘', '🎨', '✍️', '🥦', '🛌', '💖', '🦷', '🐱', '🐰', '🍵', '🚶'];
const SHOP_EMOJIS = ['🍓', '🍦', '🍰', '🍜', '🧸', '🎮', '🚗', '🎨', '🎸', '🎀', '🍪', '🍬', '🍿', '🥤', '🎫', '🍿', '🌸', '🎁'];

// Default Data
const DEFAULT_TASKS: HabitTask[] = [
  { id: '1', name: '喝足 8 杯水 💧', coins: 10, emoji: '💧', createdAt: '2026-07-01' },
  { id: '2', name: '看书/学习 30 分钟 📚', coins: 15, emoji: '📚', createdAt: '2026-07-01' },
  { id: '3', name: '早睡早起不熬夜 🌙', coins: 20, emoji: '🌙', createdAt: '2026-07-01' },
  { id: '4', name: '对朋友或家人说谢谢 💖', coins: 10, emoji: '💖', createdAt: '2026-07-01' }
];

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: 's1', name: '品尝美味的草莓芭菲 🍓', coins: 30, emoji: '🍓' },
  { id: 's2', name: '兑换可爱的小恐龙玩偶 🧸', coins: 120, emoji: '🧸' },
  { id: 's3', name: '大吃一顿美味的拉面 🍜', coins: 50, emoji: '🍜' },
  { id: 's4', name: '畅玩 1 小时电子游戏 🎮', coins: 40, emoji: '🎮' }
];

export default function App() {
  // --- STATE ---
  const [tasks, setTasks] = useState<HabitTask[]>(() => {
    const saved = localStorage.getItem('chikawa_tasks');
    return saved ? JSON.parse(saved) : DEFAULT_TASKS;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    const saved = localStorage.getItem('chikawa_shop_items');
    return saved ? JSON.parse(saved) : DEFAULT_SHOP_ITEMS;
  });

  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('chikawa_coins');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [history, setHistory] = useState<HistoryRecord>(() => {
    const saved = localStorage.getItem('chikawa_history');
    return saved ? JSON.parse(saved) : {};
  });

  const [celebratedDates, setCelebratedDates] = useState<string[]>(() => {
    const saved = localStorage.getItem('chikawa_celebrated_dates');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [currentPartnerIndex, setCurrentPartnerIndex] = useState<number>(() => {
    const saved = localStorage.getItem('chikawa_partner_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentYearMonth, setCurrentYearMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Purchase Log for extra gameplay satisfaction
  const [purchaseHistory, setPurchaseHistory] = useState<{ id: string; name: string; emoji: string; timestamp: string }[]>(() => {
    const saved = localStorage.getItem('chikawa_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  // Modal / Add state
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskCoins, setNewTaskCoins] = useState(10);
  const [newTaskEmoji, setNewTaskEmoji] = useState('💧');

  const [newShopName, setNewShopName] = useState('');
  const [newShopCoins, setNewShopCoins] = useState(30);
  const [newShopEmoji, setNewShopEmoji] = useState('🍓');

  // Backup / Data Migration state
  const [importText, setImportText] = useState('');
  const [showBackupPanel, setShowBackupPanel] = useState(false);

  // Interactive Mascots bubbles and reaction triggers
  const [mascotBubble, setMascotBubble] = useState<string>('');

  // Canvas Celebration Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);

  // Active Partner Info
  const partner = MASCOTS[currentPartnerIndex];

  // --- DATA EXPORT / IMPORT HANDLERS ---
  const handleExportData = () => {
    const backupData = {
      tasks,
      shopItems,
      coins,
      history,
      celebratedDates,
      currentPartnerIndex,
      purchaseHistory
    };
    const jsonStr = JSON.stringify(backupData);
    
    // Set text to input so users can copy easily anyway
    setImportText(jsonStr);

    // Try standard clipboard API
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr)
        .then(() => {
          showToast('数据已成功生成并复制到剪贴板！可以直接去新网址粘贴导入哦！✨', 'success', '📦');
        })
        .catch(() => {
          showToast('已将备份数据生成在下方文本框中，请手动选择复制！', 'info', '📋');
        });
    } else {
      showToast('已将备份数据生成在下方文本框中，请手动选择复制！', 'info', '📋');
    }
  };

  const handleImportData = () => {
    if (!importText.trim()) {
      showToast('请先贴入备份的数据文本哦！', 'error', '⚠️');
      return;
    }
    try {
      const parsed = JSON.parse(importText.trim());
      
      // Basic validations
      if (parsed.tasks && Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
      }
      if (parsed.shopItems && Array.isArray(parsed.shopItems)) {
        setShopItems(parsed.shopItems);
      }
      if (typeof parsed.coins === 'number') {
        setCoins(parsed.coins);
      }
      if (parsed.history && typeof parsed.history === 'object') {
        setHistory(parsed.history);
      }
      if (parsed.celebratedDates && Array.isArray(parsed.celebratedDates)) {
        setCelebratedDates(parsed.celebratedDates);
      }
      if (typeof parsed.currentPartnerIndex === 'number' && parsed.currentPartnerIndex >= 0 && parsed.currentPartnerIndex < MASCOTS.length) {
        setCurrentPartnerIndex(parsed.currentPartnerIndex);
      }
      if (parsed.purchaseHistory && Array.isArray(parsed.purchaseHistory)) {
        setPurchaseHistory(parsed.purchaseHistory);
      }
      
      showToast('数据同步导入成功！打卡记录与商品已全部恢复！🎉', 'success', '🦕');
      setImportText('');
      setShowBackupPanel(false);
    } catch (err) {
      showToast('导入数据格式不正确，请确保完整复制了导出的文本！', 'error', '❌');
    }
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('chikawa_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('chikawa_shop_items', JSON.stringify(shopItems));
  }, [shopItems]);

  useEffect(() => {
    localStorage.setItem('chikawa_coins', coins.toString());
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('chikawa_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('chikawa_celebrated_dates', JSON.stringify(celebratedDates));
  }, [celebratedDates]);

  useEffect(() => {
    localStorage.setItem('chikawa_partner_index', currentPartnerIndex.toString());
  }, [currentPartnerIndex]);

  useEffect(() => {
    localStorage.setItem('chikawa_purchases', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  // Mascot dynamic greeting
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = history[todayStr];
    if (!todayLog || todayLog.completedTaskIds.length === 0) {
      setMascotBubble(partner.quote);
    } else if (todayLog.completedTaskIds.length === tasks.length && tasks.length > 0) {
      setMascotBubble('哇哈！今天的所有任务都完成了！简直太棒了！✨');
    } else {
      setMascotBubble('太棒了，看到你的打卡记录，我很开心哦！♪');
    }
  }, [currentPartnerIndex, history, tasks.length]);

  // --- CUSTOM TOAST NOTIFICATION ---
  const showToast = useCallback((text: string, type: ToastMessage['type'] = 'info', emoji?: string) => {
    const newToast: ToastMessage = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      emoji
    };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newToast.id));
    }, 3200);
  }, []);

  // --- CANVAS CELEBRATION (Hearts & Squares Particle Effect) ---
  const triggerCelebrationEffect = useCallback(() => {
    setIsCelebrating(true);
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      shape: 'heart' | 'square' | 'star';
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      alpha: number;
      gravity: number;
    }

    const particles: Particle[] = [];
    const colors = ['#FFDADA', '#D2E9FF', '#FFF4D0', '#FFADAD', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#FFC6FF'];
    const shapes: ('heart' | 'square' | 'star')[] = ['heart', 'square', 'star'];

    // Spawn 120 particles from the bottom center or scattered
    const particleCount = 120;
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 1.5 + Math.PI * 1.75; // angle leaning up and outward
      const speed = Math.random() * 12 + 8;
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 80,
        y: canvas.height + 20,
        size: Math.random() * 16 + 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        alpha: 1,
        gravity: 0.18
      });
    }

    // Left and Right launchers for wider burst
    for (let i = 0; i < 40; i++) {
      // Left Launcher
      const leftAngle = -Math.PI / 6 - Math.random() * Math.PI / 4;
      const leftSpeed = Math.random() * 14 + 10;
      particles.push({
        x: -20,
        y: canvas.height * 0.8,
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        vx: Math.cos(leftAngle) * leftSpeed,
        vy: Math.sin(leftAngle) * leftSpeed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        alpha: 1,
        gravity: 0.15
      });

      // Right Launcher
      const rightAngle = Math.PI + Math.PI / 6 + Math.random() * Math.PI / 4;
      const rightSpeed = Math.random() * 14 + 10;
      particles.push({
        x: canvas.width + 20,
        y: canvas.height * 0.8,
        size: Math.random() * 14 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        vx: Math.cos(rightAngle) * rightSpeed,
        vy: Math.sin(rightAngle) * rightSpeed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        alpha: 1,
        gravity: 0.15
      });
    }

    const drawHeart = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      c.moveTo(x, y - size / 4);
      c.bezierCurveTo(x + size / 2, y - size, x + size, y - size / 3, x, y + size * 0.8);
      c.bezierCurveTo(x - size, y - size / 3, x - size / 2, y - size, x, y - size / 4);
      c.fill();
    };

    const drawStar = (c: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      c.beginPath();
      for (let j = 0; j < 5; j++) {
        c.lineTo(Math.cos((18 + j * 72) * Math.PI / 180) * size + x,
                 Math.sin((18 + j * 72) * Math.PI / 180) * size + y);
        c.lineTo(Math.cos((54 + j * 72) * Math.PI / 180) * (size / 2) + x,
                 Math.sin((54 + j * 72) * Math.PI / 180) * (size / 2) + y);
      }
      c.closePath();
      c.fill();
    };

    let start: number | null = null;
    const duration = 1800; // 1.8 seconds max

    const updateAndDraw = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98; // atmospheric drag
        p.rotation += p.rotationSpeed;
        
        // Soft fade out towards the end of duration
        if (elapsed > duration * 0.6) {
          p.alpha = Math.max(0, 1 - (elapsed - duration * 0.6) / (duration * 0.4));
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;

        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.shape === 'heart') {
          drawHeart(ctx, 0, 0, p.size);
          ctx.stroke();
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.size);
          ctx.stroke();
        } else {
          // Rounded Square / Cube
          ctx.beginPath();
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.fill();
          ctx.stroke();
        }

        ctx.restore();
      });

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateAndDraw);
      } else {
        setIsCelebrating(false);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);

    // Dynamic resize handler
    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // --- HABIT ACTIONS ---
  const handleToggleTask = (taskId: string, dateStr: string) => {
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setHistory(prev => {
      const currentLog = prev[dateStr] || { completedTaskIds: [], totalCount: tasks.length };
      const exists = currentLog.completedTaskIds.includes(taskId);
      let updatedIds = [];

      if (exists) {
        // Uncheck
        updatedIds = currentLog.completedTaskIds.filter(id => id !== taskId);
        // Deduct coins (cannot go below 0)
        setCoins(c => Math.max(0, c - task.coins));
        showToast(`取消了"${task.name}"打卡，扣除 ${task.coins} 🪙`, 'info', '↩️');
      } else {
        // Check complete
        updatedIds = [...currentLog.completedTaskIds, taskId];
        // Award coins
        setCoins(c => c + task.coins);
        showToast(`成功完成"${task.name}"！获得 +${task.coins} 🪙`, 'coin', '🪙');

        // Trigger dynamic speaking lines
        const lines = [
          '呜哇！今天真的很棒！(づ｡◕‿‿◕｡)づ',
          '金币变多了，亮晶晶的！✨',
          '完成了！加油，明天也要元气满满！☀️',
          '呀哈！乌拉乌拉！( *︾▽︾)'
        ];
        setMascotBubble(lines[Math.floor(Math.random() * lines.length)]);

        // Check if all tasks for "dateStr" are completed
        // Wait, today's celebration trigger:
        if (isToday) {
          const totalActiveTasksCount = tasks.length;
          // Trigger when all active tasks are ticked completed
          if (updatedIds.length === totalActiveTasksCount && totalActiveTasksCount > 0) {
            // Check if already celebrated today
            if (!celebratedDates.includes(dateStr)) {
              setCelebratedDates(prevCeleb => [...prevCeleb, dateStr]);
              // Trigger Celebration particle effect!
              setTimeout(() => {
                triggerCelebrationEffect();
                showToast('🎉 太厉害了！今天的所有习惯都完成啦！', 'success', '👑');
                setMascotBubble('哇——！大圆满！全屏闪闪亮晶晶的花火来了！✨😭🌸');
              }, 400);
            }
          }
        }
      }

      return {
        ...prev,
        [dateStr]: {
          completedTaskIds: updatedIds,
          totalCount: tasks.length // Freeze total tasks count for accurate past logs
        }
      };
    });
  };

  // --- EDIT MODE - HABIT ADD/DELETE ---
  const handleAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) {
      showToast('请输入习惯名称哦！', 'error', '⚠️');
      return;
    }
    const newTask: HabitTask = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${newTaskName.trim()} ${newTaskEmoji}`,
      coins: newTaskCoins,
      emoji: newTaskEmoji,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskName('');
    showToast(`成功添加习惯 "${newTask.name}"！`, 'success', '📝');
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast(`已删除了习惯 "${taskToDelete.name}"`, 'info', '🗑️');
  };

  // --- EDIT MODE - SHOP ITEM ADD/DELETE ---
  const handleAddShopItem = (e: FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) {
      showToast('请输入商品名称哦！', 'error', '⚠️');
      return;
    }
    const newItem: ShopItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${newShopName.trim()} ${newShopEmoji}`,
      coins: newShopCoins,
      emoji: newShopEmoji
    };
    setShopItems(prev => [...prev, newItem]);
    setNewShopName('');
    showToast(`成功上架商品 "${newItem.name}"！`, 'success', '🍓');
  };

  const handleDeleteShopItem = (itemId: string) => {
    const itemToDelete = shopItems.find(i => i.id === itemId);
    if (!itemToDelete) return;
    setShopItems(prev => prev.filter(i => i.id !== itemId));
    showToast(`已下架商品 "${itemToDelete.name}"`, 'info', '🗑️');
  };

  // --- SHOP REDEEM ACTION ---
  const handleRedeemItem = (item: ShopItem) => {
    if (coins < item.coins) {
      showToast(`金币不够哦！还需要 ${item.coins - coins} 🪙 才能兑换`, 'error', '🥺');
      setMascotBubble('呜... 金币还差一点呢，我们再接再厉多做任务吧！🐱🎸');
      return;
    }

    setCoins(prev => prev - item.coins);
    
    // Save to purchase logs
    const newPurchase = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      emoji: item.emoji,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };
    setPurchaseHistory(prev => [newPurchase, ...prev].slice(0, 30)); // limit log to 30 items
    
    showToast(`兑换成功！获得了"${item.name}" 🎉`, 'success', item.emoji);
    
    const reactionLines = [
      `哇！恭喜你获得了 ${item.name}！看起来好好吃/好棒啊！🧁✨`,
      `哼哼，我就知道你可以做到！奖励兑换成功！🎀`,
      `哈——！太棒了！兑换了心仪的宝贝！(≧∇≦)ﾉ`
    ];
    setMascotBubble(reactionLines[Math.floor(Math.random() * reactionLines.length)]);
  };

  // --- CALENDAR SYSTEM HELPERS ---
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday ...
  };

  const handlePrevMonth = () => {
    setCurrentYearMonth(prev => {
      let m = prev.month - 1;
      let y = prev.year;
      if (m < 0) {
        m = 11;
        y -= 1;
      }
      return { year: y, month: m };
    });
  };

  const handleNextMonth = () => {
    setCurrentYearMonth(prev => {
      let m = prev.month + 1;
      let y = prev.year;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      return { year: y, month: m };
    });
  };

  // Generate calendar days
  const calendarDays: { dateStr: string; dayNum: number; isPadding: boolean }[] = [];
  const totalDays = getDaysInMonth(currentYearMonth.year, currentYearMonth.month);
  const firstDayOfWeek = getFirstDayOffset(currentYearMonth.year, currentYearMonth.month);

  // Padding days for the beginning
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ dateStr: '', dayNum: 0, isPadding: true });
  }

  // Real days
  for (let i = 1; i <= totalDays; i++) {
    const formattedMonth = String(currentYearMonth.month + 1).padStart(2, '0');
    const formattedDay = String(i).padStart(2, '0');
    const dStr = `${currentYearMonth.year}-${formattedMonth}-${formattedDay}`;
    calendarDays.push({ dateStr: dStr, dayNum: i, isPadding: false });
  }

  // Format human-friendly header date
  const formatHeaderDate = (dateString: string) => {
    const [y, m, d] = dateString.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return `${m}月${d}日 ${weekDays[dateObj.getDay()]}`;
  };

  // --- STATS HELPER ---
  const getSelectedDateProgress = () => {
    const log = history[selectedDate];
    const completedCount = log?.completedTaskIds.length || 0;
    const totalCount = log?.totalCount ?? tasks.length;
    return { completed: completedCount, total: totalCount };
  };

  const { completed: selCompleted, total: selTotal } = getSelectedDateProgress();

  return (
    <div className="min-h-screen pb-20 relative select-none" style={{ backgroundColor: '#FFFEFA' }}>
      {/* Dynamic Celebration Canvas overlay */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* --- TOASTS LAYER --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full p-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="flex items-center gap-3 p-4 border-[3px] border-[#333] shadow-[4px_4px_0px_#333] bg-white rounded-2xl pointer-events-auto"
            >
              <div 
                className="w-10 h-10 flex items-center justify-center rounded-xl text-xl border-[2px] border-[#333]"
                style={{
                  backgroundColor: 
                    toast.type === 'success' ? '#E2F0D9' : 
                    toast.type === 'coin' ? '#FFF4D0' : 
                    toast.type === 'error' ? '#FFDADA' : '#D2E9FF'
                }}
              >
                {toast.emoji || (toast.type === 'success' ? '✨' : toast.type === 'coin' ? '🪙' : '💡')}
              </div>
              <div className="flex-1 font-semibold text-gray-800 text-sm">
                {toast.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- NAVIGATION / APP HEADER --- */}
      <header className="max-w-4xl mx-auto px-4 pt-6">
        <div className="manga-card bg-[#FFDADA] rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white border-[3px] border-[#333] rounded-full flex items-center justify-center shadow-[4px_4px_0px_#333] text-3xl">
              🦖
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-[#333] tracking-tight flex items-center gap-2">
                小龙打卡器 <span className="text-sm font-medium bg-[#333] text-white px-3 py-1 rounded-full">Dino Habit</span>
              </h1>
              <p className="text-xs text-gray-700 font-medium">今天也要元气满满地完成打卡哦！🌸</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet display */}
            <div className="flex items-center gap-2 bg-[#FFF4D0] border-[3px] border-[#333] py-2 px-5 rounded-full shadow-[3px_3px_0px_#333] font-bold text-lg text-[#333]">
              <Coins className="text-yellow-600 animate-bounce" size={22} />
              <span>{coins}</span>
              <span className="text-xs font-semibold text-gray-600">金币</span>
            </div>

            {/* Toggle Edit Mode button */}
            <button
              id="btn-settings-toggle"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`manga-btn px-4 py-2.5 rounded-full ${isEditMode ? 'bg-[#FFADAD]' : 'bg-[#D2E9FF]'} flex items-center gap-1.5 text-gray-800 font-extrabold text-xs cursor-pointer shadow-[3px_3px_0px_#333]`}
              title="进入/退出编辑模式"
            >
              <Settings size={16} className={isEditMode ? 'animate-spin' : ''} />
              <span>{isEditMode ? '退出管理' : '⚙️ 增减习惯/商品'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- DATE ACCORDION & HISTORICAL CALENDAR --- */}
      <section className="max-w-4xl mx-auto px-4 mt-6">
        <div className="manga-card bg-[#FFF] rounded-[2.5rem] p-6">
          {/* Top Date trigger button */}
          <div 
            id="trigger-calendar-toggle"
            onClick={() => setCalendarExpanded(!calendarExpanded)}
            className="flex items-center justify-between bg-[#FFFDF0] hover:bg-[#FFF9E0] border-[3px] border-[#333] rounded-2xl p-4 cursor-pointer transition-colors shadow-[4px_4px_0px_#333] active:translate-y-0.5"
          >
            <div className="flex items-center gap-3 font-bold text-[#333]">
              <CalendarIcon size={22} className="text-sky-500" />
              <span className="text-lg">{formatHeaderDate(selectedDate)}</span>
              {selectedDate === new Date().toISOString().split('T')[0] && (
                <span className="bg-[#D2E9FF] border-[2px] border-[#333] text-xs font-bold px-2 py-0.5 rounded-full text-blue-800">
                  今天
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold bg-[#FFDADA] border-[2px] border-[#333] px-3 py-1 rounded-full text-[#333]">
                进度: {selCompleted}/{selTotal}
              </div>
              <motion.div
                animate={{ rotate: calendarExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-gray-600"
              >
                ▼
              </motion.div>
            </div>
          </div>

          {/* Expandable Calendar Panel */}
          <AnimatePresence>
            {calendarExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4"
              >
                <div className="border-[3px] border-[#333] bg-[#FDFBF7] rounded-[2rem] p-4 shadow-[4px_4px_0px_#333] mt-2">
                  {/* Month Switcher */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      id="btn-calendar-prev"
                      onClick={handlePrevMonth}
                      className="manga-btn bg-white p-2 rounded-xl text-[#333] hover:bg-gray-100 flex items-center justify-center"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="font-extrabold text-lg text-[#333]">
                      {currentYearMonth.year}年 {currentYearMonth.month + 1}月
                    </div>
                    <button
                      id="btn-calendar-next"
                      onClick={handleNextMonth}
                      className="manga-btn bg-white p-2 rounded-xl text-[#333] hover:bg-gray-100 flex items-center justify-center"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Weekdays Labels */}
                  <div className="grid grid-cols-7 text-center text-xs font-extrabold text-gray-500 mb-2">
                    <div>日</div>
                    <div>一</div>
                    <div>二</div>
                    <div>三</div>
                    <div>四</div>
                    <div>五</div>
                    <div>六</div>
                  </div>

                  {/* Days Grid */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, idx) => {
                      if (day.isPadding) {
                        return <div key={`pad-${idx}`} className="h-14"></div>;
                      }

                      const isSelected = selectedDate === day.dateStr;
                      const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                      
                      // Progress stats
                      const dayLog = history[day.dateStr];
                      const completedCount = dayLog?.completedTaskIds.length || 0;
                      const totalCount = dayLog?.totalCount ?? tasks.length;
                      const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                      const isAllDone = totalCount > 0 && completedCount === totalCount;

                      return (
                        <button
                          key={`day-${day.dayNum}`}
                          id={`btn-date-select-${day.dateStr}`}
                          onClick={() => {
                            setSelectedDate(day.dateStr);
                            // Also focus visual month if clicking different month
                          }}
                          className={`h-16 rounded-2xl flex flex-col items-center justify-center relative border-[2px] transition-all cursor-pointer ${
                            isSelected 
                              ? 'bg-[#D2E9FF] border-[#333] scale-105 shadow-[3px_3px_0px_#333]' 
                              : isToday
                                ? 'bg-[#FFDADA] border-[#333]'
                                : 'bg-white hover:bg-gray-50 border-gray-300'
                          }`}
                        >
                          <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-gray-800'}`}>
                            {day.dayNum}
                          </span>

                          {/* Completion Progress Indicator */}
                          {totalCount > 0 && (
                            <div className="w-full px-1.5 mt-1">
                              {isAllDone ? (
                                <div className="text-center text-[10px] text-pink-600 animate-pulse font-bold">
                                  👑
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden border-[1px] border-gray-400">
                                    <div 
                                      className="bg-sky-400 h-full rounded-full" 
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="text-[9px] text-gray-500 font-medium">
                                    {completedCount}/{totalCount}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Calendar Quick Tip */}
                  <div className="mt-3 text-center text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Info size={12} />
                    <span>点击任意日期可以查看并补打或查看当天的历史进度哦！</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- MAIN SPLIT CONTAINER: HABITS vs SHOP --- */}
      <main className="max-w-4xl mx-auto px-4 mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: DAILY HABIT CHECKLIST (COL: 7) */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="manga-card bg-white rounded-[2.5rem] p-6 flex flex-col flex-1">
            
            {/* Header section with selected date reminder */}
            <div className="flex items-center justify-between border-b-[3px] border-dashed border-gray-300 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="text-2xl">📝</div>
                <div>
                  <h2 className="text-xl font-extrabold text-[#333]">习惯打卡单</h2>
                  <p className="text-xs text-gray-500 font-medium">
                    正在查看：{selectedDate === new Date().toISOString().split('T')[0] ? '今日' : selectedDate} 任务
                  </p>
                </div>
              </div>

              {selCompleted === selTotal && selTotal > 0 && (
                <div className="bg-[#E2F0D9] border-[2px] border-[#333] text-xs font-bold px-3 py-1 rounded-full text-green-800 animate-pulse flex items-center gap-1">
                  <span>✨ 满分打卡</span>
                </div>
              )}
            </div>

            {/* List empty state */}
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 rounded-[2rem] border-[3px] border-dashed border-gray-300">
                <span className="text-4xl mb-2">🐾</span>
                <p className="font-bold text-gray-600">现在没有任何习惯任务呢</p>
                <p className="text-xs text-gray-400 mt-1">进入编辑模式即可添加可爱的打卡习惯哦！</p>
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                {tasks.map(task => {
                  const completedIds = history[selectedDate]?.completedTaskIds || [];
                  const isCompleted = completedIds.includes(task.id);

                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-4 border-[3px] border-[#333] rounded-[1.5rem] transition-all ${
                        isCompleted 
                          ? 'bg-[#E2F0D9] shadow-[3px_3px_0px_#333]' 
                          : 'bg-[#FFFDF0] shadow-[6px_6px_0px_#333]'
                      }`}
                    >
                      {/* Checkbox and Text */}
                      <div className="flex items-center gap-3 flex-1 mr-2">
                        <button
                          id={`btn-check-task-${task.id}`}
                          onClick={() => handleToggleTask(task.id, selectedDate)}
                          className={`w-9 h-9 border-[3px] border-[#333] rounded-xl flex items-center justify-center transition-all ${
                            isCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-white hover:bg-gray-50'
                          } active:scale-90`}
                        >
                          {isCompleted && <Check size={20} strokeWidth={4} />}
                        </button>
                        
                        <div className="flex flex-col">
                          <span className={`font-bold text-base ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.name}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                            完成奖励: <Coins size={12} className="text-yellow-600" /> <span className="text-yellow-700">{task.coins}金币</span>
                          </span>
                        </div>
                      </div>

                      {/* Right Section: Delete button in Edit mode, else coins count */}
                      <div>
                        {isEditMode ? (
                          <button
                            id={`btn-delete-task-${task.id}`}
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-2 border-[2px] border-[#333] hover:bg-red-50 rounded-xl bg-white text-red-500 transition-colors cursor-pointer active:translate-y-0.5"
                            title="删除此任务"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <div className="text-sm font-extrabold bg-white border-[2px] border-[#333] py-1 px-3 rounded-full text-gray-700 shadow-[2px_2px_0px_#333]">
                            +{task.coins}🪙
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick entry for Edit Mode inside habit checklist card */}
            {!isEditMode && (
              <div className="mt-6 pt-4 border-t-[2px] border-dashed border-gray-200 flex justify-center">
                <button
                  id="btn-quick-edit-tasks"
                  onClick={() => setIsEditMode(true)}
                  className="text-xs font-bold bg-[#FFFDF0] hover:bg-[#FFF4D0] border-[2px] border-[#333] px-4 py-2 rounded-full text-gray-700 shadow-[2px_2px_0px_#333] active:translate-y-0.5 active:shadow-[1px_1px_0px_#333] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✨ 增减/删除习惯任务 (开启管理模式)</span>
                </button>
              </div>
            )}

            {/* Edit Mode Custom Add Task Form */}
            {isEditMode && (
              <div className="border-[3px] border-[#333] bg-[#FDFBF7] rounded-[2rem] p-4 shadow-[4px_4px_0px_#333] mt-6">
                <h3 className="font-extrabold text-[#333] text-sm mb-3 flex items-center gap-1.5">
                  <Plus size={16} className="text-pink-500" />
                  <span>添加新习惯任务</span>
                </h3>
                
                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">习惯名称:</label>
                    <input
                      id="input-task-name"
                      type="text"
                      placeholder="例如: 每日拉伸、背单词"
                      value={newTaskName}
                      onChange={e => setNewTaskName(e.target.value)}
                      className="w-full border-[3px] border-[#333] rounded-xl px-3 py-2 bg-white text-sm font-bold outline-none focus:bg-pink-50/20"
                    />
                  </div>

                  {/* Coin Reward Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">金币奖励:</label>
                      <input
                        id="input-task-coins"
                        type="number"
                        min="1"
                        max="200"
                        value={newTaskCoins}
                        onChange={e => setNewTaskCoins(Number(e.target.value))}
                        className="w-full border-[3px] border-[#333] rounded-xl px-3 py-2 bg-white text-sm font-bold outline-none focus:bg-pink-50/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">选择图标:</label>
                      <select
                        id="select-task-emoji"
                        value={newTaskEmoji}
                        onChange={e => setNewTaskEmoji(e.target.value)}
                        className="w-full border-[3px] border-[#333] rounded-xl px-2 py-2 bg-white text-sm font-bold outline-none"
                      >
                        {HABIT_EMOJIS.map(em => (
                          <option key={em} value={em}>{em} 标签</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Emoji Quick Picker Grid */}
                  <div className="py-1">
                    <span className="text-[10px] font-bold text-gray-500 block mb-1">常用快捷图标推荐:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {HABIT_EMOJIS.slice(0, 10).map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setNewTaskEmoji(em)}
                          className={`w-7 h-7 border-[2px] rounded-lg text-sm flex items-center justify-center cursor-pointer ${
                            newTaskEmoji === em ? 'border-pink-500 bg-pink-100' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    id="btn-submit-task"
                    type="submit"
                    className="w-full manga-btn bg-[#FFDADA] hover:bg-[#FFC4C4] text-[#333] font-bold py-2 px-4 rounded-xl text-xs"
                  >
                    💖 确定上架此任务
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REWARDS STORE & MASCOT (COL: 5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* MASCOT QUOTE BOX */}
          <div className="manga-card bg-[#FFF] rounded-[2.5rem] p-5 flex flex-col justify-between">
            <div className="flex items-start gap-3">
              {/* Talking bubble */}
              <div className="flex-1 relative bg-gray-50 border-[3px] border-[#333] rounded-[1.5rem] p-3 shadow-[3px_3px_0px_#333]">
                {/* Arrow */}
                <div className="absolute right-6 -bottom-3.5 w-6 h-6 bg-gray-50 border-[3px] border-[#333] rotate-45 border-t-0 border-l-0"></div>
                <p className="text-sm font-bold text-gray-800 leading-relaxed">
                  {mascotBubble || partner.quote}
                </p>
              </div>

              {/* Character Avatar */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div 
                  className="w-14 h-14 border-[3px] border-[#333] rounded-full flex items-center justify-center shadow-[3px_3px_0px_#333] text-3xl animate-bounce"
                  style={{ backgroundColor: partner.color }}
                >
                  {partner.avatar}
                </div>
                <span className="text-[10px] font-extrabold text-[#333] bg-white border-[2px] border-[#333] px-2 py-0.5 rounded-full shadow-[1px_1px_0px_#333]">
                  {partner.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* Mascot Switcher Grid */}
            <div className="border-t-[2px] border-dashed border-gray-300 pt-3 mt-4">
              <span className="text-[10px] font-bold text-gray-400 block mb-2 text-center">点击更换你的习惯搭档 Mascot：</span>
              <div className="grid grid-cols-4 gap-2">
                {MASCOTS.map((m, index) => (
                  <button
                    key={m.name}
                    id={`btn-select-partner-${index}`}
                    onClick={() => {
                      setCurrentPartnerIndex(index);
                      showToast(`已更换习惯搭档为 ${m.name}！`, 'info', m.avatar);
                    }}
                    className={`border-[2px] border-[#333] rounded-xl p-1.5 flex flex-col items-center justify-center transition-all ${
                      currentPartnerIndex === index 
                        ? 'bg-[#FFF4D0] scale-105 shadow-[2px_2px_0px_#333]' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{m.avatar}</span>
                    <span className="text-[9px] font-bold text-[#333] mt-0.5">{m.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* REWARDS STORE CARD */}
          <div className="manga-card bg-[#FFF] rounded-[2.5rem] p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 border-b-[3px] border-dashed border-gray-300 pb-3 mb-4">
              <div className="text-2xl">🎁</div>
              <div>
                <h2 className="text-xl font-extrabold text-[#333]">奖励兑换商店</h2>
                <p className="text-xs text-gray-500 font-medium">使用辛苦赚来的金币犒劳自己吧！</p>
              </div>
            </div>

            {shopItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-gray-50 rounded-[2rem] border-[3px] border-dashed border-gray-300">
                <span className="text-4xl mb-2">🎈</span>
                <p className="font-bold text-gray-600">货架空空如也呢</p>
                <p className="text-xs text-gray-400 mt-1">进入编辑模式即可上架你专属的小心愿物品哦！</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {shopItems.map(item => {
                  const canAfford = coins >= item.coins;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border-[3px] border-[#333] rounded-[1.5rem] bg-[#FFFDF0] shadow-[4px_4px_0px_#333]"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span className="text-2xl shrink-0">{item.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-800 text-sm truncate">{item.name}</p>
                          <span className="text-[11px] text-[#333] font-extrabold flex items-center gap-0.5">
                            需要: <Coins size={10} className="text-yellow-600 inline" /> <span className="text-yellow-700">{item.coins}金币</span>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEditMode ? (
                          <button
                            id={`btn-delete-shop-item-${item.id}`}
                            onClick={() => handleDeleteShopItem(item.id)}
                            className="p-1.5 border-[2px] border-[#333] hover:bg-red-50 rounded-lg bg-white text-red-500 transition-colors cursor-pointer"
                            title="下架此商品"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : (
                          <button
                            id={`btn-redeem-item-${item.id}`}
                            onClick={() => handleRedeemItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border-[2.5px] border-[#333] transition-all flex items-center gap-1 cursor-pointer shadow-[2px_2px_0px_#333] active:translate-y-0.5 active:shadow-[1px_1px_0px_#333] ${
                              canAfford 
                                ? 'bg-[#FFF4D0] text-[#333] hover:bg-[#FFE39F]' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span>兑换</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick entry for Edit Mode inside rewards shop card */}
            {!isEditMode && (
              <div className="mt-4 pt-3 border-t-[2px] border-dashed border-gray-200 flex justify-center">
                <button
                  id="btn-quick-edit-shop"
                  onClick={() => setIsEditMode(true)}
                  className="text-xs font-bold bg-[#FFFDF0] hover:bg-[#FFF4D0] border-[2px] border-[#333] px-4 py-2 rounded-full text-gray-700 shadow-[2px_2px_0px_#333] active:translate-y-0.5 active:shadow-[1px_1px_0px_#333] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>✨ 增加新商品 / 下架商品</span>
                </button>
              </div>
            )}

            {/* Custom Item Form inside Edit Mode */}
            {isEditMode && (
              <div className="border-[3px] border-[#333] bg-[#FDFBF7] rounded-[2rem] p-4 shadow-[4px_4px_0px_#333] mt-4">
                <h3 className="font-extrabold text-[#333] text-sm mb-3 flex items-center gap-1.5">
                  <Plus size={16} className="text-[#333]" />
                  <span>上架新的奖赏物品</span>
                </h3>

                <form onSubmit={handleAddShopItem} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">物品名称/行为:</label>
                    <input
                      id="input-shop-name"
                      type="text"
                      placeholder="例如: 看电影、吃蛋糕、休息半小时"
                      value={newShopName}
                      onChange={e => setNewShopName(e.target.value)}
                      className="w-full border-[3px] border-[#333] rounded-xl px-3 py-2 bg-white text-sm font-bold outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">所需金币:</label>
                      <input
                        id="input-shop-coins"
                        type="number"
                        min="1"
                        max="1000"
                        value={newShopCoins}
                        onChange={e => setNewShopCoins(Number(e.target.value))}
                        className="w-full border-[3px] border-[#333] rounded-xl px-3 py-2 bg-white text-sm font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">物品图标:</label>
                      <select
                        id="select-shop-emoji"
                        value={newShopEmoji}
                        onChange={e => setNewShopEmoji(e.target.value)}
                        className="w-full border-[3px] border-[#333] rounded-xl px-2 py-2 bg-white text-sm font-bold outline-none"
                      >
                        {SHOP_EMOJIS.map(em => (
                          <option key={em} value={em}>{em} 标签</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    id="btn-submit-shop"
                    type="submit"
                    className="w-full manga-btn bg-[#FFF4D0] hover:bg-[#FFE099] text-[#333] font-bold py-2 px-4 rounded-xl text-xs"
                  >
                    🎁 确定上架此商品
                  </button>
                </form>
              </div>
            )}

            {/* PURCHASE RECOGNITION TIMELINE LOG */}
            {!isEditMode && purchaseHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t-[2px] border-dashed border-gray-300">
                <span className="text-[10px] font-bold text-gray-400 block mb-2">🎁 最近兑换愿望历史记录：</span>
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto">
                  {purchaseHistory.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs font-semibold text-gray-600 bg-gray-50 border-[2px] border-gray-200 rounded-lg p-1.5 px-2.5">
                      <span className="truncate">兑换了: {item.emoji} {item.name}</span>
                      <span className="text-[10px] text-gray-400 shrink-0 font-normal">{item.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- DATA MIGRATION & BACKUP SECTION --- */}
      <section className="max-w-4xl mx-auto px-4 mt-8">
        <div className="manga-card bg-[#FDFBF7] rounded-[2rem] p-5">
          <div 
            id="trigger-backup-toggle"
            onClick={() => setShowBackupPanel(!showBackupPanel)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 font-extrabold text-[#333] text-sm md:text-base">
              <span>🚚</span>
              <span>GitHub / Vercel 部署数据迁移与备份</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
              <span>{showBackupPanel ? '收起' : '展开迁移工具'}</span>
              <span className="text-[10px]">{showBackupPanel ? '▲' : '▼'}</span>
            </div>
          </div>

          <AnimatePresence>
            {showBackupPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t-[2px] border-dashed border-gray-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Export */}
                  <div className="bg-white border-[2.5px] border-[#333] rounded-2xl p-4 shadow-[3px_3px_0px_#333]">
                    <h4 className="font-extrabold text-sm text-[#333] mb-1 flex items-center gap-1">
                      <span>📤 导出本地数据</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mb-3">
                      第一步：在此处点击生成并复制你在此平台中已添加的习惯、商品和金币数据。
                    </p>
                    <button
                      id="btn-export-all-data"
                      onClick={handleExportData}
                      className="manga-btn w-full bg-[#D2E9FF] hover:bg-[#B4DBFF] text-gray-800 font-extrabold py-2 px-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>📦 复制一键备份代码</span>
                    </button>
                  </div>

                  {/* Right Column: Import */}
                  <div className="bg-white border-[2.5px] border-[#333] rounded-2xl p-4 shadow-[3px_3px_0px_#333]">
                    <h4 className="font-extrabold text-sm text-[#333] mb-1 flex items-center gap-1">
                      <span>📥 导入/同步数据</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 mb-3">
                      第二步：在新部署的 Vercel 网站中，展开此工具，将备份代码粘贴在下方并导入。
                    </p>
                    <button
                      id="btn-import-all-data"
                      onClick={handleImportData}
                      className="manga-btn w-full bg-[#E2F0D9] hover:bg-[#C9E7BD] text-gray-800 font-extrabold py-2 px-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>✨ 确认同步并导入数据</span>
                    </button>
                  </div>
                </div>

                {/* Shared Textarea */}
                <div className="mt-4">
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    备份数据文本框 (导出后会自动填入，导入时请把代码贴到这里)：
                  </label>
                  <textarea
                    id="textarea-backup-io"
                    rows={4}
                    value={importText}
                    onChange={e => setImportText(e.target.value)}
                    placeholder='{"tasks":..., "coins":...}'
                    className="w-full border-[3px] border-[#333] rounded-xl p-3 bg-white text-xs font-mono outline-none focus:bg-pink-50/10 placeholder-gray-300"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* --- CUTE FOOTER CREDITS --- */}
      <footer className="max-w-4xl mx-auto px-4 mt-12 mb-6 text-center text-xs text-gray-500 font-bold flex flex-col items-center gap-1">
        <p className="flex items-center gap-1.5">
          <span>( ✿＞◡＜)</span>
          <span>Chikawa Habit Tracker © 2026</span>
          <span>•</span>
          <span>馒头超大圆角 & 手绘粗黑投影风格</span>
        </p>
        <p className="text-[10px] text-gray-400 font-medium">
          数据保存在浏览器的 localStorage 中，换浏览器或清除缓存会重置哦！
        </p>
      </footer>
    </div>
  );
}
