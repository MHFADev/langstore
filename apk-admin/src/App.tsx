import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useOrderListener } from './hooks/useOrderListener';
import { ShoppingBag, LayoutDashboard, Package, TrendingUp, Bell, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  useOrderListener();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <nav className="w-20 lg:w-64 bg-surface border-r border-slate-800 p-4 hidden md:flex flex-col">
        <div className="flex items-center space-x-3 mb-10 px-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-bold text-xl">A</div>
          <h1 className="text-xl font-bold tracking-tight hidden lg:inline">ADMIN<span className="text-primary">PRO</span></h1>
        </div>

        <div className="space-y-2">
          <SidebarItem icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          <SidebarItem icon={<Package size={20}/>} label="Orders" />
          <SidebarItem icon={<TrendingUp size={20}/>} label="Analytics" />
        </div>

        <div className="mt-auto px-2">
          <div className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400"></div>
            <div className="hidden lg:inline">
              <p className="text-sm font-medium">Admin Hilmi</p>
              <p className="text-xs text-slate-400">Superadmin</p>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-surface/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center md:hidden">
             <h1 className="text-xl font-bold tracking-tight">ADMIN<span className="text-primary">PRO</span></h1>
          </div>

          <div className="hidden md:flex items-center bg-slate-800 rounded-lg px-3 py-1.5 w-64 border border-slate-700/50">
            <Search size={16} className="text-slate-400 mr-2" />
            <input type="text" placeholder="Search orders..." className="bg-transparent border-none text-sm outline-none w-full" />
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Orders Realtime</h2>
              <p className="text-slate-400">Monitoring all transactions coming through Supabase</p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-4 py-2 bg-primary hover:bg-blue-600 transition-all rounded-lg font-medium text-sm flex items-center justify-center space-x-2 shadow-lg shadow-primary/20"
            >
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <StatCard label="Today's Orders" value={orders.length.toString()} color="text-primary" />
            <StatCard label="Total Revenue" value={`Rp ${(orders.reduce((acc, curr) => acc + (curr.total_price || 0), 0)).toLocaleString()}`} color="text-green-400" />
            <StatCard label="Pending Items" value={orders.filter(o => o.status === 'pending').length.toString()} color="text-orange-400" />
          </div>

          {/* Table / List */}
          <div className="bg-surface rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-200">Recent Transactions</h3>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Live Feed</span>
            </div>

            <div className="divide-y divide-slate-800/50">
              {loading ? (
                <div className="p-10 text-center text-slate-500">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-10 text-center text-slate-500">No orders found.</div>
              ) : (
                <AnimatePresence>
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-5 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-2xl ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                          <ShoppingBag size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-100 uppercase tracking-tight">Order #{order.id.toString().slice(0, 8)}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end sm:space-x-8">
                        <div className="text-left sm:text-right">
                          <p className="text-lg font-black text-slate-100">Rp {order.total_price?.toLocaleString()}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                          order.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                          'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                        }`}>
                          {order.status || 'NEW'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarItem = ({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <button className={`flex items-center space-x-3 p-3 rounded-xl w-full transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {icon}
    <span className="hidden lg:inline font-medium text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className="bg-surface p-6 rounded-3xl border border-slate-800 shadow-lg">
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{label}</p>
    <p className={`text-3xl font-black ${color} tracking-tight`}>{value}</p>
  </div>
);

export default App;
