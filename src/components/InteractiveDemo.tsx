import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, CreditCard, Check, Bell } from 'lucide-react';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Order {
  id: number;
  items: CartItem[];
  total: number;
  timestamp: string;
  status: 'paid';
}

const menuItems: MenuItem[] = [
  { id: 1, name: 'Burger Classique', price: 12.5, emoji: '🍔' },
  { id: 2, name: 'Pizza Margherita', price: 14.0, emoji: '🍕' },
  { id: 3, name: 'Salade César', price: 10.5, emoji: '🥗' },
  { id: 4, name: 'Pâtes Carbonara', price: 13.0, emoji: '🍝' },
];

export default function InteractiveDemo() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showNotification, setShowNotification] = useState(false);

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const handlePayment = () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newOrder: Order = {
      id: Date.now(),
      items: [...cart],
      total,
      timestamp: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'paid',
    };

    playNotificationSound();
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <section className="py-24 bg-[#0A0A0B]">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#EAEAEA] mb-4">
            Simulez l'expérience
          </h2>
          <p className="text-xl text-[#A0A0A0]">
            Testez Tapzy comme si vous y étiez
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#EAEAEA] mb-2">
                Côté Client
              </h3>
              <p className="text-[#A0A0A0]">Interface mobile</p>
            </div>

            <div className="max-w-sm mx-auto bg-[#161617] rounded-[3rem] p-4 shadow-2xl border border-[#2A2A2B]">
              <div className="bg-[#0A0A0B] rounded-[2.5rem] overflow-hidden h-full border border-[#2A2A2B]">
                <div className="bg-[#3B82F6] p-6 text-white">
                  <h4 className="text-2xl font-bold mb-1">Tapzy</h4>
                  <p className="text-sm opacity-90">Table 12</p>
                </div>

                <div className="p-4 max-h-[500px] overflow-y-auto">
                  <div className="space-y-3 mb-4">
                    {menuItems.map((item) => (
                      <motion.div
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => addToCart(item)}
                        className="bg-[#161617] rounded-xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#202021] transition-colors border border-[#2A2A2B]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{item.emoji}</span>
                          <div>
                            <div className="font-semibold text-[#EAEAEA]">
                              {item.name}
                            </div>
                            <div className="text-[#3B82F6] font-bold">
                              {item.price.toFixed(2)}€
                            </div>
                          </div>
                        </div>
                        <Plus className="w-6 h-6 text-[#3B82F6]" />
                      </motion.div>
                    ))}
                  </div>

                  {cart.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-[#161617] rounded-xl p-4 text-white border border-[#2A2A2B]"
                    >
                      <h5 className="font-bold mb-3 text-[#EAEAEA]">Votre panier</h5>
                      <div className="space-y-2 mb-4">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-[#A0A0A0]">
                              {item.emoji} {item.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeFromCart(item.id);
                                }}
                                className="w-6 h-6 bg-[#2A2A2B] rounded flex items-center justify-center hover:bg-[#323233]"
                              >
                                <Minus className="w-4 h-4 text-[#EAEAEA]" />
                              </button>
                              <span className="font-semibold w-6 text-center text-[#EAEAEA]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                                className="w-6 h-6 bg-[#2A2A2B] rounded flex items-center justify-center hover:bg-[#323233]"
                              >
                                <Plus className="w-4 h-4 text-[#EAEAEA]" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#2A2A2B] pt-3 mb-4">
                        <div className="flex justify-between font-bold text-lg text-[#EAEAEA]">
                          <span>Total</span>
                          <span>{cartTotal.toFixed(2)}€</span>
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handlePayment}
                        className="w-full bg-[#3B82F6] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#2563EB] transition-colors"
                      >
                        <CreditCard className="w-5 h-5" />
                        Payer maintenant
                      </motion.button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-[#EAEAEA] mb-2">
                Écran Cuisine
              </h3>
              <p className="text-[#A0A0A0]">Réception en temps réel</p>
            </div>

            <div className="bg-[#161617] rounded-2xl p-6 shadow-2xl min-h-[600px] border border-[#2A2A2B]">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-2xl font-bold text-[#EAEAEA]">
                  Commandes à préparer
                </h4>
                <AnimatePresence>
                  {showNotification && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="bg-[#3B82F6] text-white px-4 py-2 rounded-full flex items-center gap-2"
                    >
                      <Bell className="w-5 h-5 animate-pulse" />
                      Nouvelle commande !
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {orders.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-20 text-[#A0A0A0]"
                    >
                      En attente de commandes...
                    </motion.div>
                  )}

                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      className="bg-[#0A0A0B] rounded-xl p-5 border border-[#2A2A2B]"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm text-[#A0A0A0] mb-1">
                            Table 12 • {order.timestamp}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-semibold flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              Payé
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#EAEAEA]">
                            {order.total.toFixed(2)}€
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 border-t border-[#2A2A2B]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{item.emoji}</span>
                              <span className="font-medium text-[#EAEAEA]">
                                {item.name}
                              </span>
                            </div>
                            <span className="font-bold text-[#EAEAEA]">
                              x{item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
