'use client';

export default function Orders() {
    const orders = [
        { id: 1, status: "Teslim Edildi", date: "2025-03-19", items: 5, total: 150 },
        { id: 2, status: "Bekliyor", date: "2025-03-18", items: 3, total: 100 },
        { id: 3, status: "Hazırlanıyor", date: "2025-03-17", items: 2, total: 80 },
    ];

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6 text-black">Siparişler</h1>
            <div className="space-y-4">
                {orders.map(order => (
                    <div
                        key={order.id}
                        className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center"
                    >
                        <div>
                            <h2 className="text-xl font-semibold text-black">Sipariş No: {order.id}</h2>
                            <p className="text-black">Status: {order.status}</p>
                            <p className="text-black">Tarih: {order.date}</p>
                        </div>
                        <div>
                            <p className="text-black">Toplam Ürün: {order.items}</p>
                            <p className="text-black">Total: {order.total} TL</p>
                        </div>
                        <button
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 "
                            onClick={() => window.location.href = `/orders/${order.id}`}
                        >
                            Detaylar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
