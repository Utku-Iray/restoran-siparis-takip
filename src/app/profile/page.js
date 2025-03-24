'use client';

import { useState } from 'react';

// Örnek veri - Backend entegrasyonunda değiştirilecek
const SAMPLE_USER = {
    name: "Ahmet Yılmaz",
    email: "ahmet@example.com",
    phone: "0532 123 45 67",
    addresses: [
        {
            id: 1,
            title: "Ev",
            address: "Atatürk Caddesi No:123",
            district: "Çankaya",
            city: "Ankara",
            isDefault: true
        },
        {
            id: 2,
            title: "İş",
            address: "İnönü Caddesi No:456",
            district: "Kadıköy",
            city: "İstanbul",
            isDefault: false
        }
    ]
};

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('personal');
    const [user, setUser] = useState(SAMPLE_USER);
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [newAddress, setNewAddress] = useState({
        title: '',
        address: '',
        district: '',
        city: '',
        isDefault: false
    });
    const [showAddressForm, setShowAddressForm] = useState(false);

    const handleUserUpdate = (e) => {
        e.preventDefault();
        setUser(editedUser);
        setIsEditing(false);
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        const newId = user.addresses.length + 1;
        const updatedAddresses = [...user.addresses, { ...newAddress, id: newId }];
        setUser({ ...user, addresses: updatedAddresses });
        setNewAddress({
            title: '',
            address: '',
            district: '',
            city: '',
            isDefault: false
        });
        setShowAddressForm(false);
    };

    const handleDeleteAddress = (addressId) => {
        const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
        setUser({ ...user, addresses: updatedAddresses });
    };

    const handleSetDefaultAddress = (addressId) => {
        const updatedAddresses = user.addresses.map(addr => ({
            ...addr,
            isDefault: addr.id === addressId
        }));
        setUser({ ...user, addresses: updatedAddresses });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Başlık */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Profil</h1>
                </div>

                {/* Tab Menü */}
                <div className="flex justify-center mb-8">
                    <div className="flex space-x-4 bg-white rounded-lg p-1 shadow-sm">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'personal'
                                    ? 'bg-pink-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Kişisel Bilgiler
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${activeTab === 'addresses'
                                    ? 'bg-pink-600 text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Adreslerim
                        </button>
                    </div>
                </div>

                {/* Kişisel Bilgiler */}
                {activeTab === 'personal' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        {!isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Ad Soyad</label>
                                    <p className="mt-1 text-gray-900">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">E-posta</label>
                                    <p className="mt-1 text-gray-900">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                                    <p className="mt-1 text-gray-900">{user.phone}</p>
                                </div>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                >
                                    Düzenle
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleUserUpdate} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Ad Soyad</label>
                                    <input
                                        type="text"
                                        value={editedUser.name}
                                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">E-posta</label>
                                    <input
                                        type="email"
                                        value={editedUser.email}
                                        onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Telefon</label>
                                    <input
                                        type="tel"
                                        value={editedUser.phone}
                                        onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                    />
                                </div>
                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                    >
                                        Kaydet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setEditedUser(user);
                                        }}
                                        className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {/* Adresler */}
                {activeTab === 'addresses' && (
                    <div className="space-y-4">
                        {user.addresses.map((address) => (
                            <div key={address.id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {address.title}
                                            {address.isDefault && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Varsayılan
                                                </span>
                                            )}
                                        </h3>
                                        <p className="mt-1 text-gray-600">{address.address}</p>
                                        <p className="text-gray-600">{address.district}, {address.city}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        {!address.isDefault && (
                                            <button
                                                onClick={() => handleSetDefaultAddress(address.id)}
                                                className="text-sm text-pink-600 hover:text-pink-700"
                                            >
                                                Varsayılan Yap
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteAddress(address.id)}
                                            className="text-sm text-red-600 hover:text-red-700"
                                        >
                                            Sil
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {showAddressForm ? (
                            <div className="bg-white rounded-lg shadow p-6">
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Adres Başlığı</label>
                                        <input
                                            type="text"
                                            value={newAddress.title}
                                            onChange={(e) => setNewAddress({ ...newAddress, title: e.target.value })}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Adres</label>
                                        <textarea
                                            value={newAddress.address}
                                            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                                            rows={3}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">İlçe</label>
                                            <input
                                                type="text"
                                                value={newAddress.district}
                                                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">Şehir</label>
                                            <input
                                                type="text"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="isDefault"
                                            checked={newAddress.isDefault}
                                            onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                                            Varsayılan adres olarak ayarla
                                        </label>
                                    </div>
                                    <div className="flex space-x-4">
                                        <button
                                            type="submit"
                                            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        >
                                            Kaydet
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddressForm(false)}
                                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        >
                                            İptal
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                            >
                                Yeni Adres Ekle
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 