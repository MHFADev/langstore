'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order, OrderItem } from '@/types';
import { Check, Clock, Send, X, ExternalLink } from 'lucide-react';

interface OrderWithItems extends Order {
    order_items: OrderItem[];
}

interface OrderListProps {
    initialOrders: OrderWithItems[];
}

export function OrderList({ initialOrders }: OrderListProps) {
    const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders);
    const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
    const [accountDataText, setAccountDataText] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const supabase = createClient();

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', orderId);

            if (error) throw error;

            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
        } catch (err) {
            console.error('Failed to update status:', (err as Error).message);
            alert('Gagal mengupdate status pesanan.');
        }
    };

    const handleSendWA = async () => {
        if (!selectedOrder) return;

        setIsUpdating(true);

        // Format WA Message
        const orderItem = selectedOrder.order_items[0];
        const productName = orderItem?.product?.name || 'Produk';

        const message = `*INVOICE LANG STR*\n\nHalo Kak!\nPesanan untuk *${productName}* (Order ID: ${selectedOrder.id}) telah berhasil diproses.\n\n*📋 Berikut adalah Detail Akun / Pesanan Anda:*\n${accountDataText}\n\nTerima kasih telah berbelanja di Lang STR! Jika ada kendala, silakan balas pesan ini.`;

        const waUrl = `https://wa.me/${selectedOrder.customer_whatsapp}?text=${encodeURIComponent(message)}`;

        try {
            // Mark as completed
            await handleStatusChange(selectedOrder.id, 'completed');

            // Close modal
            setSelectedOrder(null);
            setAccountDataText('');

            // Open WA Web in new tab
            window.open(waUrl, '_blank');
        } catch (err) {
            console.error('Error in send WA flow:', (err as Error).message);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-xs font-medium text-yellow-500"><Clock className="w-3 h-3" /> Menunggu</span>;
            case 'paid': return <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500"><Check className="w-3 h-3" /> Dibayar</span>;
            case 'completed': return <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-500"><Check className="w-3 h-3" /> Selesai</span>;
            case 'cancelled': return <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-500"><X className="w-3 h-3" /> Dibatalkan</span>;
            default: return <span className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-primary/10 bg-card text-card-foreground shadow-md shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary/50 text-secondary-foreground uppercase text-xs">
                            <tr>
                                <th className="px-6 py-5 font-bold tracking-wider">Order ID & Waktu</th>
                                <th className="px-6 py-5 font-bold tracking-wider">Pelanggan</th>
                                <th className="px-6 py-5 font-bold tracking-wider">Produk</th>
                                <th className="px-6 py-5 font-bold tracking-wider">Total</th>
                                <th className="px-6 py-5 font-bold tracking-wider">Status & Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center gap-3">
                                            <Clock className="w-8 h-8 text-primary/30" />
                                            <p>Belum ada pesanan masuk.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-mono text-xs font-semibold text-primary">{order.id.split('-')[0]}***</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {new Date(order.created_at).toLocaleString('id-ID')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-medium text-foreground">{order.customer_name || 'Customer'}</div>
                                            <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                                {order.customer_whatsapp}
                                                <a href={`https://wa.me/${order.customer_whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {order.order_items.map((item, idx) => (
                                                <div key={idx} className="text-sm font-medium">
                                                    {item.product?.name || 'Produk Dihapus'} <span className="text-muted-foreground text-xs">(x{item.quantity})</span>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="font-bold text-foreground">Rp {Number(order.total_amount).toLocaleString('id-ID')}</div>
                                            <div className="text-[10px] font-bold tracking-wider text-muted-foreground mt-1 uppercase bg-secondary inline-block px-2 py-0.5 rounded-md">
                                                {order.payment_method}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col gap-2 items-start">
                                                {getStatusBadge(order.status)}

                                                {order.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'paid')}
                                                        className="text-xs px-4 py-1.5 bg-secondary text-secondary-foreground font-medium rounded-lg hover:bg-primary/20 transition-colors mt-2"
                                                    >
                                                        Mark as Paid
                                                    </button>
                                                )}

                                                {(order.status === 'pending' || order.status === 'paid') && (
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="text-xs px-4 py-1.5 border border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-primary-foreground focus:ring-2 focus:ring-primary/50 transition-all flex items-center gap-1.5 mt-1 shadow-sm"
                                                    >
                                                        <Send className="w-3.5 h-3.5" />
                                                        Kirim Data WA
                                                    </button>
                                                )}

                                                {order.status !== 'cancelled' && order.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'cancelled')}
                                                        className="text-[10px] text-muted-foreground hover:text-red-500 mt-2 hover:underline transition-colors focus:outline-none"
                                                    >
                                                        Batalkan Order
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Kirim Data Akun */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-5 border-b border-border/50 flex justify-between items-center bg-gradient-to-r from-secondary to-background">
                            <h3 className="font-bold text-lg flex items-center gap-2 text-foreground font-[family-name:var(--font-space-grotesk)]">
                                <div className="bg-primary/10 p-1.5 rounded-lg text-primary">
                                    <Send className="w-4 h-4" />
                                </div>
                                Kirim Pesanan via WA
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-muted-foreground hover:bg-secondary hover:text-foreground p-1.5 rounded-lg transition-colors focus:outline-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="bg-secondary/50 p-4 rounded-xl text-sm grid gap-2 border border-border/50">
                                <div className="grid grid-cols-[80px_1fr]">
                                    <span className="text-muted-foreground">Pembeli:</span>
                                    <span className="font-mono font-medium">{selectedOrder.customer_whatsapp}</span>
                                </div>
                                <div className="grid grid-cols-[80px_1fr]">
                                    <span className="text-muted-foreground">Produk:</span>
                                    <span className="font-medium text-primary">{selectedOrder.order_items[0]?.product?.name}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Masukkan Data Akun / Info Pesanan:</label>
                                <textarea
                                    value={accountDataText}
                                    onChange={(e) => setAccountDataText(e.target.value)}
                                    placeholder="Contoh:&#10;Email: player123@gmail.com&#10;Password: password123&#10;Login via: Moonton"
                                    className="min-h-[160px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all font-mono shadow-inner resize-y"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Data ini akan diformat rapi dan dikirimkan lewat WhatsApp Web beserta penutup pesan dari Lang STR.
                                </p>
                            </div>
                        </div>
                        <div className="p-5 border-t border-border/50 bg-secondary/30 flex justify-end gap-3">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="px-5 py-2.5 text-sm font-semibold border-2 border-transparent text-muted-foreground hover:bg-secondary rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                Kembali
                            </button>
                            <button
                                onClick={handleSendWA}
                                disabled={!accountDataText.trim() || isUpdating}
                                className="px-6 py-2.5 text-sm font-bold bg-primary text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            >
                                {isUpdating ? 'Memproses...' : 'Kirim & Selesaikan'}
                                {!isUpdating && <Send className="w-4 h-4 ml-1" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
