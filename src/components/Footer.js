// src/components/Footer.js
import Link from 'next/link'; // Link bileşenini içe aktar

export default function Footer() {
    return (
        <footer className="bg-gray-100">
            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">İletişim</h3>
                        <p className="text-gray-600">
                            Adres: Örnek Mahallesi, Örnek Sokak No:1
                            <br />
                            Telefon: (555) 123 45 67
                            <br />
                            E-posta: info@restoransiparis.com
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Çalışma Saatleri</h3>
                        <p className="text-gray-600">
                            Hafta içi: 09:00 - 22:00
                            <br />
                            Hafta sonu: 10:00 - 23:00
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-gray-900">
                                Instagram
                            </a>
                            <a href="#" className="text-gray-600 hover:text-gray-900">
                                Facebook
                            </a>
                            <a href="#" className="text-gray-600 hover:text-gray-900">
                                Twitter
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-600">
                    © 2024 Restoran Sipariş. Tüm hakları saklıdır.
                </div>
            </div>
        </footer>
    );
}
