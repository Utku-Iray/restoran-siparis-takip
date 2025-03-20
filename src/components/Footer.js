// src/components/Footer.js
import Link from 'next/link'; // Link bileşenini içe aktar

export default function Footer() {
    return (
        <footer className="bg-gray-800 text-white py-6">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex justify-between items-center">
                    <div className="text-lg font-bold">
                        <Link href="/" className="text-white hover:text-gray-400">
                            Restoran Sipariş Takip
                        </Link>
                    </div>
                    <div className="space-x-6">
                        <Link href="/about" className="text-white hover:text-gray-400">
                            Hakkımızda
                        </Link>
                        <Link href="/contact" className="text-white hover:text-gray-400">
                            İletişim
                        </Link>
                        <Link href="/privacy" className="text-white hover:text-gray-400">
                            Gizlilik Politikası
                        </Link>
                    </div>
                </div>
                <div className="text-center text-sm mt-4">
                    &copy; {new Date().getFullYear()} Restoran Sipariş Takip. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
}
