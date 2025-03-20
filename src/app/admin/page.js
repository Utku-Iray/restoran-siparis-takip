export default function AdminPage() {
    return (
        <div className="p-6 bg-gray-100 text-black">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="mt-4">Yönetim paneline hoş geldiniz.</p>
            <div className="mt-8">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl">Toplam Siparişler</h3>
                        <p>120</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl">Toplam Kullanıcılar</h3>
                        <p>500</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl">Bugünkü Siparişler</h3>
                        <p>30</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
