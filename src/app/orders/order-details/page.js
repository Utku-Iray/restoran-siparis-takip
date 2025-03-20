// src/app/orders/[id].js

export default function OrderDetails({ order }) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-4">Sipariş Detayları - {order.id}</h2>
            <p><strong>Status:</strong> {order.status}</p>
            <p><strong>Tarih:</strong> {order.date}</p>
            <div className="mt-4">
                <h3 className="text-xl font-semibold">Ürünler:</h3>
                <ul>
                    {order.items.map(item => (
                        <li key={item.id} className="flex justify-between">
                            <span>{item.name}</span>
                            <span>{item.quantity} x {item.price} TL</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="mt-4">
                <p className="text-xl"><strong>Toplam Fiyat:</strong> {order.total} TL</p>
            </div>
        </div>
    );
}

export async function getServerSideProps(context) {
    const orderId = context.params.id;

    const order = {
        id: orderId,
        status: "Teslim Edildi",
        date: "2025-03-19",
        items: [
            { id: 1, name: "Pizza", quantity: 2, price: 50 },
            { id: 2, name: "Salata", quantity: 1, price: 20 },
            { id: 3, name: "İçecek", quantity: 2, price: 10 }
        ],
        total: 150
    };

    return { props: { order } };
}
