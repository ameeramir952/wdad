
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Truck, 
  Store, 
  Settings, 
  ChevronLeft,
  CheckCircle2,
  UtensilsCrossed,
  ChefHat,
  Calendar,
  AlertCircle,
  Edit2,
  Save,
  X,
  MessageCircle,
  Share2,
  Copy,
  Check
} from 'lucide-react';

// Types
type Category = 'מנות עיקריות' | 'תוספות' | 'סלטים' | 'קינוחים' | 'מיוחדים';
type Day = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  isAvailable: boolean;
  availableDays: Day[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

interface OrderDetails {
  customerName: string;
  phone: string;
  address: string;
  method: 'pickup' | 'delivery';
  notes: string;
}

const DAYS_HEBREW: Record<Day, string> = {
  'Sunday': 'ראשון',
  'Monday': 'שני',
  'Tuesday': 'שלישי',
  'Wednesday': 'רביעי',
  'Thursday': 'חמישי',
  'Friday': 'שישי'
};

// Initial Data
const INITIAL_MENU: MenuItem[] = [
  {
    id: '1',
    name: 'קוסקוס ביתי עם ירקות',
    description: 'קוסקוס עבודת יד עם מרק ירקות עשיר ונתחי עוף רכים',
    price: 65,
    category: 'מנות עיקריות',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=800&auto=format&fit=crop',
    isAvailable: true,
    availableDays: ['Tuesday', 'Friday']
  },
  {
    id: '2',
    name: 'שניצל של אמא',
    description: 'חזה עוף בציפוי פירורי לחם זהובים וקריספיים',
    price: 55,
    category: 'מנות עיקריות',
    image: 'https://images.unsplash.com/photo-1594759077573-2182101a6a60?q=80&w=800&auto=format&fit=crop',
    isAvailable: true,
    availableDays: ['Sunday', 'Monday', 'Wednesday', 'Thursday']
  },
  {
    id: '3',
    name: 'סלט ישראלי קצוץ',
    description: 'מלפפון, עגבנייה ובצל סגול עם שמן זית ולימון',
    price: 35,
    category: 'סלטים',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    isAvailable: true,
    availableDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  {
    id: '4',
    name: 'אורז עם שקדים וצימוקים',
    description: 'אורז בסמטי אחד-אחד עם שקדים קלויים וצימוקים מתוקים',
    price: 30,
    category: 'תוספות',
    image: 'https://images.unsplash.com/photo-1512058560366-cd2427ffad64?q=80&w=800&auto=format&fit=crop',
    isAvailable: true,
    availableDays: ['Sunday', 'Tuesday', 'Thursday']
  }
];

export default function CateringApp() {
  const [menu, setMenu] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('catering_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'home' | 'menu' | 'cart' | 'checkout' | 'success'>('home');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails>({
    customerName: '',
    phone: '',
    address: '',
    method: 'pickup',
    notes: ''
  });

  const currentDayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date()) as Day;
  const [selectedDay, setSelectedDay] = useState<Day>(currentDayName);

  // Persistence
  useEffect(() => {
    localStorage.setItem('catering_menu', JSON.stringify(menu));
  }, [menu]);

  // Business Logic
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(i => i.menuItem.id !== itemId));
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.menuItem.id === itemId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const totalAmount = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.menuItem.price * item.quantity), 0), 
  [cart]);

  const toggleAvailability = (id: string) => {
    setMenu(prev => prev.map(item => 
      item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
    ));
  };

  const updateItem = (updatedItem: MenuItem) => {
    setMenu(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    setEditingItem(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const sendToWhatsApp = () => {
    const businessPhone = '972500000000'; // Replace with Mom's real phone
    const orderItems = cart.map(item => `• ${item.menuItem.name} (${item.quantity} יח') - ₪${item.menuItem.price * item.quantity}`).join('\n');
    const total = totalAmount + (orderDetails.method === 'delivery' ? 35 : 0);
    
    const message = `*הזמנה חדשה מהאפליקציה!* 🍲\n\n` +
      `👤 *שם:* ${orderDetails.customerName}\n` +
      `📞 *טלפון:* ${orderDetails.phone}\n` +
      `📍 *שיטה:* ${orderDetails.method === 'pickup' ? 'איסוף עצמי' : 'משלוח לכתובת: ' + orderDetails.address}\n\n` +
      `🍴 *פירוט מנות:*\n${orderItems}\n\n` +
      `📝 *הערות:* ${orderDetails.notes || 'אין'}\n\n` +
      `💰 *סה"כ לתשלום:* ₪${total}\n\n` +
      `מאשר/ת את ההזמנה?`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${businessPhone}?text=${encodedMessage}`, '_blank');
    setView('success');
  };

  // Components
  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 px-4 py-3 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-xl text-white shadow-lg">
          <ChefHat size={20} />
        </div>
        <div>
          <h1 className="text-lg font-black text-gray-800 leading-none">הקייטרינג של אמא</h1>
          <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider">Homemade Kitchen</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setIsAdmin(!isAdmin)}
          className={`p-2.5 rounded-xl transition-all ${isAdmin ? 'bg-orange-600 text-white' : 'bg-gray-50 text-gray-400 hover:text-orange-500'}`}
        >
          <Settings size={20} />
        </button>
        <button 
          onClick={() => setView('cart')}
          className="relative p-2.5 bg-gray-50 rounded-xl text-gray-600 hover:text-orange-600 transition-all"
        >
          <ShoppingBag size={22} />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white animate-pulse">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>
    </nav>
  );

  const HomeView = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative h-72 overflow-hidden rounded-[2.5rem] mx-4 my-6 shadow-2xl group">
        <img 
          src="https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end items-center text-white text-center p-8">
          <h2 className="text-3xl font-black mb-2 drop-shadow-2xl">אוכל ביתי, טעם של פעם</h2>
          <p className="text-sm opacity-90 max-w-[280px] font-medium leading-relaxed">המנות הכי טעימות של אמא מחכות לכם כאן. פשוט לבחור ולהזמין!</p>
        </div>
      </div>

      <div className="px-6 space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-100 rounded-3xl p-5 flex items-center gap-4 shadow-sm">
          <div className="bg-white p-3.5 rounded-2xl text-orange-600 shadow-sm ring-1 ring-orange-100">
            <Calendar size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">היום יום {DAYS_HEBREW[currentDayName] || 'שבת'}</h3>
            <p className="text-xs text-gray-500 font-medium">בדקו מה התפריט המיוחד להיום</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-8">
          <button 
            onClick={() => setView('menu')}
            className="flex flex-col items-center justify-center gap-3 bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="bg-orange-50 text-orange-600 p-4 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all shadow-inner">
              <UtensilsCrossed size={28} />
            </div>
            <span className="font-bold text-gray-700">לתפריט המלא</span>
          </button>
          <button 
            onClick={() => window.open('https://wa.me/972500000000', '_blank')}
            className="flex flex-col items-center justify-center gap-3 bg-white p-7 rounded-[2rem] shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className="bg-green-50 text-green-600 p-4 rounded-2xl group-hover:bg-green-500 group-hover:text-white transition-all shadow-inner">
              <MessageCircle size={28} />
            </div>
            <span className="font-bold text-gray-700">דברו איתנו</span>
          </button>
        </div>
      </div>
    </div>
  );

  const MenuView = () => {
    const categories: Category[] = ['מנות עיקריות', 'תוספות', 'סלטים', 'קינוחים'];
    const [activeCat, setActiveCat] = useState<Category>('מנות עיקריות');

    const filteredMenu = menu.filter(item => 
      item.category === activeCat && 
      (item.availableDays.includes(selectedDay) || item.availableDays.length === 6)
    );

    return (
      <div className="px-4 py-6 space-y-6 pb-32 animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('home')} className="p-2 -mr-2 text-gray-400 hover:text-orange-500">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-gray-800">התפריט שלנו</h2>
          </div>
          
          <select 
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value as Day)}
            className="bg-gray-100 text-sm font-bold text-gray-700 px-4 py-2 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer shadow-sm"
          >
            {Object.entries(DAYS_HEBREW).map(([en, he]) => (
              <option key={en} value={en}>יום {he}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                activeCat === cat 
                ? 'bg-orange-600 text-white shadow-xl shadow-orange-100 scale-105' 
                : 'bg-white text-gray-400 border border-gray-100 hover:border-orange-100 hover:text-orange-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid gap-6">
          {filteredMenu.length > 0 ? filteredMenu.map(item => (
            <div 
              key={item.id} 
              className={`bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all group ${!item.isAvailable && 'opacity-60 grayscale scale-[0.98]'}`}
            >
              <div className="relative h-60">
                <img src={item.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={item.name} />
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[3px] flex items-center justify-center">
                    <span className="bg-white text-gray-900 px-8 py-3 rounded-full font-black text-sm shadow-2xl tracking-tighter">
                      אזל להיום
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-1.5 rounded-full text-sm font-black text-orange-600 shadow-lg ring-1 ring-orange-50">
                  ₪{item.price}
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-black text-gray-800 mb-2 leading-tight">{item.name}</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-2 font-medium">{item.description}</p>
                <button
                  disabled={!item.isAvailable}
                  onClick={() => addToCart(item)}
                  className={`w-full py-4.5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 ${
                    item.isAvailable 
                    ? 'bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white active:scale-95 shadow-sm hover:shadow-orange-100' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus size={20} />
                  להוספה לסל
                </button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <UtensilsCrossed size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold px-8">אין מנות זמינות בקטגוריה זו ליום {DAYS_HEBREW[selectedDay]}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const AdminPanel = () => (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div>
            <h2 className="text-3xl font-black mb-1">ניהול המטבח</h2>
            <p className="opacity-70 text-sm font-medium">כאן את שולטת על מה שקורה באפליקציה.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleCopyLink}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all ${copySuccess ? 'bg-green-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'}`}
            >
              {copySuccess ? <Check size={18} /> : <Share2 size={18} />}
              {copySuccess ? 'הקישור הועתק!' : 'שתפי את האפליקציה'}
            </button>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-800 flex items-center gap-2 mr-2">
          <Edit2 size={20} className="text-orange-500" />
          עריכת תפריט וזמינות
        </h3>

        {menu.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 transition-all hover:border-orange-200">
            {editingItem?.id === item.id ? (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 mr-2">שם המנה</label>
                  <input 
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 font-bold"
                    value={editingItem.name}
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400 mr-2">מחיר (₪)</label>
                  <input 
                    type="number"
                    className="w-full px-5 py-3 bg-gray-50 rounded-2xl border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 font-bold"
                    value={editingItem.price}
                    onChange={e => setEditingItem({...editingItem, price: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button 
                    onClick={() => updateItem(editingItem)}
                    className="flex-1 bg-gray-900 text-white py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-gray-200"
                  >
                    <Save size={18} /> שמירה
                  </button>
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="px-6 bg-gray-100 text-gray-500 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100" alt="" />
                  <div>
                    <h4 className="font-black text-gray-800 text-lg leading-tight">{item.name}</h4>
                    <p className="text-orange-600 font-black">₪{item.price}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingItem(item)}
                    className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => toggleAvailability(item.id)}
                    className={`px-4 py-1 rounded-2xl text-[11px] font-black uppercase transition-all border-2 ${
                      item.isAvailable 
                      ? 'bg-green-50 text-green-600 border-green-100 shadow-sm' 
                      : 'bg-red-50 text-red-600 border-red-100'
                    }`}
                  >
                    {item.isAvailable ? 'זמין' : 'אזל'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-right font-sans mb-20 selection:bg-orange-100 touch-manipulation" dir="rtl">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl relative border-x border-gray-50 flex flex-col">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto pb-10">
          {isAdmin ? (
            <AdminPanel />
          ) : (
            <>
              {view === 'home' && <HomeView />}
              {view === 'menu' && <MenuView />}
              {view === 'checkout' && (
                <div className="px-4 py-6 space-y-6 pb-24 animate-in slide-in-from-bottom duration-300">
                   <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setView('cart')} className="p-2 -mr-2 text-gray-400 hover:text-orange-500">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-black text-gray-800">פרטי ההזמנה</h2>
                  </div>

                  <div className="flex gap-4 mb-8">
                    <button 
                      onClick={() => setOrderDetails({...orderDetails, method: 'pickup'})}
                      className={`flex-1 p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${orderDetails.method === 'pickup' ? 'border-orange-500 bg-orange-50 shadow-inner scale-105' : 'border-gray-100 bg-white opacity-60'}`}
                    >
                      <Store size={28} className={orderDetails.method === 'pickup' ? 'text-orange-600' : 'text-gray-300'} />
                      <span className={`font-black tracking-tighter ${orderDetails.method === 'pickup' ? 'text-orange-700' : 'text-gray-400'}`}>איסוף עצמי</span>
                    </button>
                    <button 
                      onClick={() => setOrderDetails({...orderDetails, method: 'delivery'})}
                      className={`flex-1 p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-2 ${orderDetails.method === 'delivery' ? 'border-orange-500 bg-orange-50 shadow-inner scale-105' : 'border-gray-100 bg-white opacity-60'}`}
                    >
                      <Truck size={28} className={orderDetails.method === 'delivery' ? 'text-orange-600' : 'text-gray-300'} />
                      <span className={`font-black tracking-tighter ${orderDetails.method === 'delivery' ? 'text-orange-700' : 'text-gray-400'}`}>משלוח הביתה</span>
                    </button>
                  </div>

                  <div className="space-y-5 bg-gray-50/50 p-6 rounded-[2.5rem] border border-gray-100 shadow-inner">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">שם המזמין/ה</label>
                      <input 
                        type="text" 
                        placeholder="איך קוראים לך?"
                        className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 transition-all font-bold shadow-sm"
                        value={orderDetails.customerName}
                        onChange={e => setOrderDetails({...orderDetails, customerName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">מספר טלפון</label>
                      <input 
                        type="tel" 
                        placeholder="05X-XXXXXXX"
                        className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 transition-all font-bold shadow-sm"
                        value={orderDetails.phone}
                        onChange={e => setOrderDetails({...orderDetails, phone: e.target.value})}
                      />
                    </div>
                    {orderDetails.method === 'delivery' && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">כתובת מלאה</label>
                        <input 
                          type="text" 
                          placeholder="רחוב, מספר בית, עיר"
                          className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 transition-all font-bold shadow-sm"
                          value={orderDetails.address}
                          onChange={e => setOrderDetails({...orderDetails, address: e.target.value})}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-4">הערות ודגשים</label>
                      <textarea 
                        placeholder="יש משהו שאמא צריכה לדעת?"
                        rows={3}
                        className="w-full px-6 py-4 rounded-2xl bg-white border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-orange-500 transition-all font-bold resize-none shadow-sm"
                        value={orderDetails.notes}
                        onChange={e => setOrderDetails({...orderDetails, notes: e.target.value})}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={sendToWhatsApp}
                    disabled={!orderDetails.customerName || !orderDetails.phone}
                    className={`w-full py-5 rounded-2xl font-black shadow-xl mt-4 flex items-center justify-center gap-3 transition-all ${
                      (!orderDetails.customerName || !orderDetails.phone) 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
                      : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-green-100'
                    }`}
                  >
                    שליחה בוואטסאפ לאמא
                    <MessageCircle size={24} />
                  </button>
                </div>
              )}
              {view === 'cart' && (
                <div className="px-4 py-6 space-y-6 pb-32 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setView('menu')} className="p-2 -mr-2 text-gray-400 hover:text-orange-500">
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-2xl font-black text-gray-800">הסל שלי</h2>
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-32 space-y-8">
                      <div className="bg-orange-50 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto text-orange-200 border-2 border-dashed border-orange-100 animate-in zoom-in">
                        <ShoppingBag size={56} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-gray-800 font-black text-xl">הסל שלך ריק</p>
                        <p className="text-gray-400 font-medium">המנות של אמא מחכות לך בתפריט</p>
                      </div>
                      <button 
                        onClick={() => setView('menu')}
                        className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-black shadow-2xl shadow-orange-100 hover:bg-orange-700 transition-all active:scale-95"
                      >
                        לתפריט המלא
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div key={item.menuItem.id} className="bg-white p-5 rounded-[2.5rem] border border-gray-100 shadow-sm flex gap-4 animate-in fade-in transition-all hover:shadow-md">
                          <img src={item.menuItem.image} className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-1 ring-gray-100" alt="" />
                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-black text-gray-800 text-lg leading-tight">{item.menuItem.name}</h4>
                              <button onClick={() => removeFromCart(item.menuItem.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center bg-gray-100 rounded-xl px-2 ring-1 ring-gray-200 shadow-inner">
                                <button onClick={() => updateQuantity(item.menuItem.id, -1)} className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                  <Minus size={16} strokeWidth={3} />
                                </button>
                                <span className="w-8 text-center font-black text-gray-800">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.menuItem.id, 1)} className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                                  <Plus size={16} strokeWidth={3} />
                                </button>
                              </div>
                              <span className="font-black text-gray-900 text-lg">₪{item.menuItem.price * item.quantity}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-gray-900 p-8 rounded-[2.5rem] space-y-4 mt-8 shadow-2xl relative overflow-hidden text-white">
                        <div className="flex justify-between text-white/60 font-bold">
                          <span>סיכום מנות ({cart.length})</span>
                          <span>₪{totalAmount}</span>
                        </div>
                        <div className="flex justify-between text-white/60 font-bold">
                          <span>דמי משלוח</span>
                          <span>{orderDetails.method === 'pickup' ? 'איסוף עצמי' : '₪35'}</span>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex justify-between font-black text-3xl">
                          <span>סה"כ</span>
                          <span className="text-orange-400">₪{totalAmount + (orderDetails.method === 'delivery' ? 35 : 0)}</span>
                        </div>
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
                      </div>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-xl border-t border-gray-100">
                      <button 
                        onClick={() => setView('checkout')}
                        className="w-full bg-orange-600 text-white py-5 rounded-[1.8rem] font-black shadow-2xl shadow-orange-200 flex items-center justify-center gap-4 hover:bg-orange-700 active:scale-95 transition-all text-xl"
                      >
                        המשך לפרטי משלוח
                        <ChevronRight size={24} className="rotate-180" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              {view === 'success' && (
                <div className="px-6 py-20 text-center space-y-10 animate-in zoom-in duration-500 h-full flex flex-col justify-center">
                  <div className="bg-green-50 w-32 h-32 rounded-[3rem] flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-50 ring-4 ring-white animate-bounce">
                    <CheckCircle2 size={80} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black text-gray-800 tracking-tighter">המטבח של אמא בדרך!</h2>
                    <p className="text-gray-500 font-bold text-lg leading-relaxed px-4">תודה {orderDetails.customerName}, אמא קיבלה את ההזמנה לוואטסאפ ומתחילה לבשל את המנות שבחרת באהבה.</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setView('home');
                      setCart([]);
                    }}
                    className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black shadow-2xl hover:bg-black transition-all active:scale-95"
                  >
                    חזרה לתפריט
                  </button>
                </div>
              )}
            </>
          )}
        </main>

        {!isAdmin && view !== 'home' && view !== 'success' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-gray-900/95 backdrop-blur-xl text-white px-8 py-4.5 rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] gap-12 z-50 ring-1 ring-white/10">
             <button onClick={() => setView('home')} className={`transition-all duration-300 ${view === 'home' ? 'text-orange-400 scale-125' : 'text-gray-500 hover:text-white'}`}>
              <Store size={26} strokeWidth={view === 'home' ? 3 : 2} />
            </button>
            <button onClick={() => setView('menu')} className={`transition-all duration-300 ${view === 'menu' ? 'text-orange-400 scale-125' : 'text-gray-500 hover:text-white'}`}>
              <UtensilsCrossed size={26} strokeWidth={view === 'menu' ? 3 : 2} />
            </button>
            <button onClick={() => setView('cart')} className={`relative transition-all duration-300 ${view === 'cart' ? 'text-orange-400 scale-125' : 'text-gray-500 hover:text-white'}`}>
              <ShoppingBag size={26} strokeWidth={view === 'cart' ? 3 : 2} />
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 shadow-sm animate-pulse"></span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
