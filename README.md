# Restoran Sipariş Takip Sistemi

## Proje Hakkında

Bu proje, restoranların siparişlerini yönetmelerini ve müşterilerin sipariş vermelerini sağlayan modern bir web uygulamasıdır. Sistem, API bağlantısı olmadığında bile çalışabilmek için test verileri ile entegre edilmiştir.

## Başlangıç

### Sistem Gereksinimleri

- Node.js v18.0.0 veya üzeri (20.19.0 mevcut sürümüm)
- npm v9.0.0 veya üzeri (10.8.2 mevcut sürümüm)
- PostgreSQL v15.0 veya üzeri (16.8 mevcut sürümüm)

### Kullanılan Teknolojiler ve Sürümler

#### Frontend

- Next.js: v14.1.0
- React: v18.2.0
- React DOM: v18.2.0
- Tailwind CSS: v3.4.1
- Axios: v1.8.4
- Hero Icons: v2.2.0
- React Icons: v5.5.0
- Date-fns: v4.1.0
- Critters: v0.0.23

#### Backend

- Node.js: v18.0.0 veya üzeri (20.19.0 mevcut sürümüm)
- NestJS: v11.0.1
- TypeScript: v5.7.3
- PostgreSQL: v15.0 veya üzeri (16.8 mevcut sürümüm)
- TypeORM: v0.3.21
- Passport & JWT kimlik doğrulama
- Bcrypt: v5.1.1
- Class Validator: v0.14.1

### Kurulum Adımları

1. **Node.js Kurulumu**

   - [Node.js resmi sitesinden](https://nodejs.org/) LTS sürümünü indirin ve kurun
   - Kurulumu kontrol etmek için terminal/komut istemcisinde:

   ```bash
   node --version  # v18.0.0 veya üzeri olmalı
   npm --version   # v9.0.0 veya üzeri olmalı
   ```

2. **PostgreSQL Kurulumu**

   - [PostgreSQL resmi sitesinden](https://www.postgresql.org/download/) indirin ve kurun
   - Veritabanı oluşturun:

   ```bash
   # PostgreSQL komut satırına giriş
   psql -U postgres

   # Veritabanı oluşturma
   CREATE DATABASE restaurant_order_db;




   ```

3. **Projeyi Klonlama**

   ```bash
   git clone https://github.com/Utku-Iray/restoran-siparis-takip.git
   cd restoran-siparis-takip
   ```

4. **Frontend Bağımlılıklarının Yüklenmesi**

   ```bash
   npm install
   ```

   Bu komut frontend projesinin tüm bağımlılıklarını yükleyecektir.

5. **Backend Bağımlılıklarının Yüklenmesi**

   ```bash
   cd backend
   npm install
   cd ..
   ```

6. **Veritabanı Yapılandırması**

   Backend klasöründe `.env` dosyasını oluşturun ve veritabanı bağlantı bilgilerinizi ekleyin:

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=restaurant_order_db
   JWT_SECRET=your_jwt_secret_key
   ```

7. **Backend Geliştirme Sunucusunun Başlatılması**

   ```bash
   cd backend
   npm run start:dev
   ```

   Bu komut NestJS backend sunucusunu başlatacaktır. İlk çalıştırmada, TypeORM otomatik olarak veritabanı tablolarını oluşturacaktır.

8. **Frontend Geliştirme Sunucusunun Başlatılması**

   Yeni bir terminal açın ve:

   ```bash
   npm run dev
   ```

   Bu komut, Turbo modunda Next.js geliştirme sunucusunu başlatacaktır.

9. **Tarayıcıda Açma**
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:3001](http://localhost:3001)

## Veritabanı Şeması

Backend çalıştığında aşağıdaki tablolar otomatik olarak oluşturulur:

1. **users** - Kullanıcı bilgileri

   - id: PK
   - email: string
   - password: string (şifrelenmiş)
   - name: string
   - role: enum ('customer', 'restaurant')

2. **restaurants** - Restoran bilgileri

   - id: UUID (PK)
   - name: string
   - address: string
   - phone: string
   - description: string (opsiyonel)
   - imageUrl: string (opsiyonel)
   - userId: string (FK)
   - createdAt: timestamp
   - updatedAt: timestamp

3. **menu_items** - Menü öğeleri

   - id: UUID (PK)
   - name: string
   - price: decimal(10,2)
   - category: string
   - description: string (opsiyonel)
   - isAvailable: boolean (default: true)
   - imageUrl: string (default: '/image/default-food.jpg')
   - restaurantId: string (FK)
   - createdAt: timestamp
   - updatedAt: timestamp

4. **orders** - Siparişler
   - id: PK
   - totalAmount: decimal(10,2)
   - status: enum ('pending', 'preparing', 'ready', 'delivered', 'cancelled')
   - items: jsonb (sepet öğeleri)
   - customerName: string
   - customerPhone: string
   - customerAddress: string (opsiyonel)
   - notes: string (opsiyonel)
   - restaurant: FK (users tablosuna)
   - createdAt: timestamp
   - updatedAt: timestamp

## Proje Yapısı

```
src/
├── app/                    # Next.js 14 App Router yapısı
│   ├── admin/             # Admin paneli sayfaları
│   ├── auth/              # Giriş ve kayıt sayfaları
│   ├── cart/              # Alışveriş sepeti sayfası
│   ├── checkout/          # Ödeme sayfası
│   ├── context/           # React Context dosyaları
│   ├── order-success/     # Sipariş başarı sayfası
│   ├── restaurant/        # Restoran detay sayfası
│   ├── restaurant-panel/  # Restoran yönetim paneli
│   └── services/          # API servisleri
├── components/            # Yeniden kullanılabilir bileşenler
└── public/               # Statik dosyalar

backend/
├── src/
│   ├── auth/              # Kimlik doğrulama modülü
│   ├── restaurants/       # Restoran modülü
│   ├── menu-items/        # Menü öğeleri modülü
│   ├── menu/              # Eski menü modülü
│   ├── orders/            # Sipariş modülü
│   ├── users/             # Kullanıcı modülü
│   ├── config/            # Yapılandırma dosyaları
│   ├── app.module.ts      # Ana uygulama modülü
│   └── main.ts            # Uygulama başlangıç noktası
└── test/                  # Test dosyaları
```

## API ve Test Modu

Sistem öncelikle `http://localhost:3001` adresindeki API'ye bağlanmayı dener. Bağlantı kurulamazsa otomatik olarak test moduna geçer.

### Backend API'yi Başlatma

```bash
# Backend dizinine gidin
cd backend

# Bağımlılıkları yükleyin
npm install

# Geliştirme modunda başlatın
npm run start:dev
```

### Test Kullanıcıları

API bağlantısı olmadığında aşağıdaki test hesaplarını kullanabilirsiniz:

```
Müşteri:
Email: user@example.com
Şifre: password

Restoran:
Email: restaurant1@example.com (Lezzet Dünyası)
Email: restaurant2@example.com (Pizza Express)
Email: restaurant3@example.com (Sushi Master)
Şifre: password (Tüm restoran hesapları için)

Admin:
Email: admin@example.com
Şifre: password
```

## Hata Durumları ve Çözümleri

1. **Node.js Sürüm Hatası**

   - Hata: "Node.js version is not compatible"
   - Çözüm: Node.js'i v18.0.0 veya üzeri sürüme güncelleyin

2. **Bağımlılık Hataları**

   - Hata: "npm install" sırasında hatalar
   - Çözüm:
     ```bash
     npm cache clean --force
     rm -rf node_modules
     npm install
     ```

3. **Port Çakışması**

   - Hata: "Port 3000 is already in use"
   - Çözüm: Farklı bir port kullanın
     ```bash
     npm run dev -- -p 3001
     ```

4. **API Bağlantı Hatası**

   - Hata: "Failed to fetch" veya "Network error"
   - Çözüm: Backend API'nin çalıştığından emin olun veya test modunda çalışın

5. **PostgreSQL Bağlantı Hatası**

   - Hata: "Could not connect to PostgreSQL"
   - Çözüm: PostgreSQL servisinin çalıştığından emin olun ve bağlantı bilgilerini kontrol edin

   ```bash
   # Windows'ta PostgreSQL servisini kontrol etme
   services.msc

   # Linux'ta PostgreSQL servisini kontrol etme
   sudo systemctl status postgresql
   ```

## Production Dağıtımı

Projeyi production ortamına deploy etmek için:

```bash
# Backend production build
cd backend
npm run build
npm run start:prod

# Frontend production build
cd ..
npm run build
npm start
```

## Geliştirme Komutları

```bash
# Frontend geliştirme sunucusu
npm run dev

# Backend geliştirme sunucusu
cd backend
npm run start:dev

# Lint kontrolü
npm run lint

# Production build (frontend)
npm run build

# Production sunucusu (frontend)
npm start

# Production build (backend)
cd backend
npm run build

# Production sunucusu (backend)
npm run start:prod
```

## İletişim

Proje Sahibi - (https://github.com/Utku-Iray/)

Proje Linki: [https://github.com/Utku-Iray/restoran-siparis-takip]
