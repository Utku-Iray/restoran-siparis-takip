'use client'

import Link from 'next/link'
import { useState } from 'react'

const popularItems = [
  {
    id: 1,
    name: 'Klasik Burger',
    description: 'Dana eti, cheddar peyniri, marul, domates',
    price: 150,
    image: '/burger.jpg'
  },
  {
    id: 2,
    name: 'Margherita Pizza',
    description: 'Domates sosu, mozarella peyniri, fesleğen',
    price: 120,
    image: '/pizza.jpg'
  },
  {
    id: 3,
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk, közlenmiş sebzeler',
    price: 90,
    image: '/tavuk.jpg'
  }
]

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 bg-black/50 z-10" />
        <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center" />

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Lezzetli Yemekler Kapınızda
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              En sevdiğiniz yemekleri online sipariş edin, sıcak sıcak teslim alalım
            </p>
            <Link
              href="/menu"
              className="inline-block bg-pink-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pink-600 transition duration-300 transform hover:scale-105"
            >
              Menüyü İncele
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-pink-100 rounded-full">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Hızlı Teslimat</h3>
              <p className="text-gray-600">
                30 dakika içinde kapınızda. Geciken siparişlerde %10 indirim.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-pink-100 rounded-full">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Kalite Garantisi</h3>
              <p className="text-gray-600">
                Memnun kalmazsanız paranızı iade ediyoruz.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-pink-100 rounded-full">
                <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Kolay Sipariş</h3>
              <p className="text-gray-600">
                Birkaç tıkla siparişinizi oluşturun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Popüler Ürünlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300">
                <div className="h-48 bg-gray-200 relative">
                  <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-pink-500">{item.price} ₺</span>
                    <Link
                      href="/menu"
                      className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800"
                    >
                      Sipariş Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/menu"
              className="inline-block border-2 border-gray-900 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition duration-300"
            >
              Tüm Menüyü Gör
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-pink-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Hemen Sipariş Verin!
          </h2>
          <p className="text-xl mb-8 text-pink-100">
            İlk siparişinize özel %15 indirim fırsatını kaçırmayın.
          </p>
          <Link
            href="/menu"
            className="inline-block bg-white text-pink-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-pink-50 transition duration-300"
          >
            Sipariş Ver
          </Link>
        </div>
      </section>
    </main>
  )
}
