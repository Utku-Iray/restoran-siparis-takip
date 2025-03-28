'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { restaurantService } from './services/restaurantService'
import { StarIcon, ClockIcon, PhoneIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

// Örnek restoranlar API bağlantısı yoksa buradan gelecek veriler
const sampleRestaurants = [
  {
    id: 1,
    name: "Lezzet Dünyası",
    description: "Türk ve dünya mutfağından seçkin lezzetler",
    rating: 4.5,
    imageUrl: '/image/restaurant1.jpg',
    cuisine: "Türk Mutfağı",
    deliveryTime: "30-45 dk"
  },
  {
    id: 2,
    name: "Pizza Express",
    description: "En lezzetli İtalyan pizzaları",
    rating: 4.2,
    imageUrl: '/image/restaurant2.jpg',
    cuisine: "İtalyan Mutfağı",
    deliveryTime: "25-40 dk"
  },
  {
    id: 3,
    name: "Sushi Master",
    description: "Autentik Japon lezzetleri",
    rating: 4.8,
    imageUrl: '/image/restaurant3.jpg',
    cuisine: "Japon Mutfağı",
    deliveryTime: "35-50 dk"
  }
]

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingApiData, setUsingApiData] = useState(false);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      console.log("Ana sayfada popüler restoranlar yükleniyor...");

      try {
        const data = await restaurantService.getAllRestaurants();
        console.log("API'den veya örnek verilerden restoranlar alındı:", data);

        if (data && data.length > 0) {
          const formattedData = data.map(restaurant => ({
            ...restaurant,
            imageUrl: restaurant.imageUrl || '/image/default-restaurant.jpg',
            rating: restaurant.rating || 4.0,
            deliveryTime: restaurant.deliveryTime || "30-45 dk",
            cuisine: restaurant.cuisine || "Karışık"
          }));

          // En fazla 6 restoran göster
          const popularRestaurants = formattedData.slice(0, 6);
          setRestaurants(popularRestaurants);

          // API verisi mi yoksa örnek veri mi kullanıldığını belirle
          // Artık restaurantService içinde bu ayrım yapıldığı için, burada sadece 
          // API'den gelen veriler örnek mi değil mi diye kontrol edelim
          setUsingApiData(localStorage.getItem('token') ? true : false);
        } else {
          console.log("Hiç restoran bulunamadı, boş dizi döndü");
          setRestaurants([]);
          setUsingApiData(false);
        }
      } catch (apiError) {
        console.warn('Restoranlar yüklenirken hata oluştu:', apiError);
        setRestaurants([]);
        setUsingApiData(false);
      }

      setError(null);
    } catch (err) {
      console.error("Restoranlar yüklenirken hata:", err);
      setError("Restoranlar yüklenirken bir hata oluştu");
      setRestaurants([]);
      setUsingApiData(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center pt-32">
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/image/banner-image.jpg')` }}
        />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              Lezzetli Yemekler Kapınızda
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white drop-shadow-lg">
              En sevdiğiniz yemekleri online sipariş edin, sıcak sıcak teslim alalım
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/restaurant"
                className="inline-block bg-red-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition duration-300 shadow-lg"
              >
                Restoranları İncele
              </Link>
              <Link
                href="/contact"
                className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/30 transition duration-300 shadow-lg"
              >
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2 border-red-200 rounded-full bg-red-50">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">"İşimizi gerçekten severek yapıyoruz."</h3>
              <p className="text-gray-700">
                İyi biliyoruz ki, bir işi sevdiğinizde kendinizi geliştirmek ve başarılı olmak için daha çok emek harcarsınız.
              </p>
            </div>
            {/* Diğer özellik kartları */}
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2 border-red-200 rounded-full bg-red-50">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">"İşimizde sürekli gelişiyoruz."</h3>
              <p className="text-gray-700">
                Adeta bir araştırma şirketiyiz. Önerim konusunda yeni olan her ne teknik varsa öğrenmeye çalışıyoruz.
              </p>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center border-2 border-red-200 rounded-full bg-red-50">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">"Müşteri memnuniyeti önceliğimiz."</h3>
              <p className="text-gray-700">
                Yüzümüzü her zaman dışarıya çeviriyoruz ve müşterilerimizin ihtiyaçlarını en iyi şekilde karşılıyoruz.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">Popüler Restoranlar</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            En sevilen restoranlarımızı keşfedin ve lezzetli yemeklerin tadını çıkarın
          </p>

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
              <p className="mt-2 text-gray-600">Restoranlar yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={loadRestaurants}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Tekrar Dene
              </button>
            </div>
          ) : (
            <>
              {usingApiData && (
                <div className="mb-6 text-center">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    API verisi kullanılıyor
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
                    <div className="h-48 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${restaurant.imageUrl || '/image/default-restaurant.jpg'})` }} />
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                        {restaurant.deliveryTime}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900">{restaurant.name}</h3>
                      <p className="text-gray-600 mb-3">{restaurant.cuisine}</p>
                      <div className="flex items-center mb-4">
                        <StarIcon className="h-5 w-5 text-yellow-400" />
                        <span className="ml-1 text-gray-700 font-medium">{restaurant.rating}</span>
                        <span className="mx-2 text-gray-400">•</span>
                        <span className="text-gray-600">{restaurant.deliveryTime}</span>
                      </div>
                      <Link
                        href={`/restaurant/${restaurant.id}`}
                        className="block text-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300 shadow-sm"
                      >
                        Menüyü Gör
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link
                  href="/restaurant"
                  className="inline-block border-2 border-red-600 text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition duration-300"
                >
                  Tüm Restoranları Gör
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-red-600 font-medium mb-2">Desteğe ihtiyacı olanlar</p>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Senin ve şirketin için güvenli yöntemi kullanın.</h2>
                <p className="text-gray-700 mb-6 text-lg">
                  Yaptırmak istediğiniz hizmet tamamlanmadan ödemeniz hizmet verene yatmaz.
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition duration-300 shadow-lg"
                >
                  <PhoneIcon className="h-5 w-5" />
                  Telefon ile talep oluştur
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">Her bütçeye en uygun</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">Hızlı yapılan kaliteli iş</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">Her siparişte korunan ödemeler</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
                  <ShieldCheckIcon className="h-6 w-6 text-red-600" />
                  <span className="text-gray-700">7/24 destek</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
            Hemen Sipariş Verin!
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto drop-shadow">
            İlk siparişinize özel %15 indirim fırsatını kaçırmayın.
            Hemen üye olun ve lezzetli yemeklerin tadını çıkarın.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/restaurant"
              className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-50 transition duration-300 shadow-lg"
            >
              Sipariş Ver
            </Link>
            <Link
              href="/auth/register"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition duration-300 shadow-lg"
            >
              Üye Ol
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
