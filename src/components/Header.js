export default function Header() {
    return (
        <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold">Restoran Sipariş Takip</h1>
            <ul className="flex space-x-6">
                <li>
                    <a href="/orders" className="hover:underline">
                        Siparişler
                    </a>
                </li>
                <li>
                    <a href="/auth/login" className="hover:underline">
                        Giriş
                    </a>
                </li>
            </ul>
        </nav>
    );
}
