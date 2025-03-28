import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { MenuItem } from '../menu-items/entities/menu-item.entity';
import { Order, OrderStatus } from '../orders/order.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) { }

  async onModuleInit() {
    console.log('Başlangıç verileri yükleniyor...');

    // Mevcut verileri kontrol et
    const usersCount = await this.userRepository.count();

    if (usersCount === 0) {
      console.log('Kullanıcı verisi bulunamadı, örnek veriler oluşturuluyor...');
      await this.seedUsers();
      await this.seedMenuItems();
      await this.seedOrders();
      console.log('Başlangıç verileri başarıyla yüklendi!');
    } else {
      console.log('Veritabanında mevcut veriler bulundu, seed işlemi atlanıyor...');
    }
  }

  private async seedUsers() {
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = [
      {
        email: 'restaurant1@example.com',
        password: hashedPassword,
        name: 'Lezzet Dünyası',
        role: 'restaurant'
      },
      {
        email: 'restaurant2@example.com',
        password: hashedPassword,
        name: 'Pizza Express',
        role: 'restaurant'
      },
      {
        email: 'restaurant3@example.com',
        password: hashedPassword,
        name: 'Sushi Master',
        role: 'restaurant'
      },
      {
        email: 'user@example.com',
        password: hashedPassword,
        name: 'Örnek Müşteri',
        role: 'customer'
      },
      {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Site Yöneticisi',
        role: 'admin'
      }
    ];

    for (const userData of users) {
      const user = this.userRepository.create(userData as any);
      await this.userRepository.save(user);
      console.log(`Kullanıcı oluşturuldu: ${userData.email} (Şifre: 123456)`);
    }
  }

  private async seedMenuItems() {
    // Kullanıcıları al - restoran rolüne sahip kullanıcıları bul
    const restaurants = await this.userRepository.find({ where: { role: 'restaurant' } as any });

    if (restaurants.length === 0) {
      console.error('Restoran kullanıcıları bulunamadı!');
      return;
    }

    // İlk restoran için menü öğeleri
    const restaurant1Items = [
      {
        name: 'Adana Kebap',
        description: 'Özel baharatlarla hazırlanmış ızgara kebap',
        price: 85.00,
        category: 'Ana Yemek',
        isAvailable: true,
        imageUrl: 'image/adana-kebap.jpg',
        restaurantId: restaurants[0].id
      },
      {
        name: 'İskender',
        description: 'Döner, yoğurt ve özel sos ile servis edilir',
        price: 95.00,
        category: 'Ana Yemek',
        isAvailable: true,
        imageUrl: 'image/iskender.jpg',
        restaurantId: restaurants[0].id
      },
      {
        name: 'Künefe',
        description: 'Sıcak servis edilen geleneksel tatlı',
        price: 55.00,
        category: 'Tatlı',
        isAvailable: true,
        imageUrl: 'image/kunefe.jpg',
        restaurantId: restaurants[0].id
      }
    ];

    // İkinci restoran için menü öğeleri
    const restaurant2Items = [
      {
        name: 'Margarita Pizza',
        description: 'Domates sos, mozzarella peyniri ve fesleğen ile',
        price: 75.00,
        category: 'Pizza',
        isAvailable: true,
        imageUrl: 'image/margarita-pizza.jpg',
        restaurantId: restaurants[1].id
      },
      {
        name: 'Pepperoni Pizza',
        description: 'Domates sos, mozzarella peyniri ve pepperoni ile',
        price: 90.00,
        category: 'Pizza',
        isAvailable: true,
        imageUrl: 'image/pepperoni-pizza.jpg',
        restaurantId: restaurants[1].id
      },
      {
        name: 'Tiramisu',
        description: 'Geleneksel İtalyan tatlısı',
        price: 50.00,
        category: 'Tatlı',
        isAvailable: true,
        imageUrl: 'image/tiramisu.jpg',
        restaurantId: restaurants[1].id
      }
    ];

    // Üçüncü restoran için menü öğeleri (eğer varsa)
    const restaurant3Items: {
      name: string;
      description: string;
      price: number;
      category: string;
      isAvailable: boolean;
      imageUrl: string;
      restaurantId: number;
    }[] = [];
    if (restaurants.length > 2) {
      restaurant3Items.push(
        {
          name: 'Sushi Set',
          description: '12 parça karışık sushi',
          price: 150.00,
          category: 'Sushi',
          isAvailable: true,
          imageUrl: 'image/sushi.jpg',
          restaurantId: restaurants[2].id
        },
        {
          name: 'Miso Çorbası',
          description: 'Geleneksel Japon miso çorbası',
          price: 35.00,
          category: 'Çorba',
          isAvailable: true,
          imageUrl: 'image/miso-soup.jpg',
          restaurantId: restaurants[2].id
        },
        {
          name: 'Matcha Dondurma',
          description: 'Yeşil çay aromalı dondurma',
          price: 45.00,
          category: 'Tatlı',
          isAvailable: true,
          imageUrl: 'image/matcha-ice-cream.jpg',
          restaurantId: restaurants[2].id
        }
      );
    }

    const allMenuItems = [...restaurant1Items, ...restaurant2Items, ...restaurant3Items];

    for (const itemData of allMenuItems) {
      const menuItem = this.menuItemRepository.create(itemData as any);
      await this.menuItemRepository.save(menuItem);
      console.log(`Menü öğesi oluşturuldu: ${itemData.name} (Restoran ID: ${itemData.restaurantId})`);
    }
  }

  private async seedOrders() {
    console.log('Test siparişleri oluşturuluyor...');

    // Restoranları bul
    const restaurants = await this.userRepository.find({ where: { role: 'restaurant' } as any });
    const testCustomer = await this.userRepository.findOne({ where: { role: 'customer' } as any });

    // Her restoran için menü öğelerini al
    for (const restaurant of restaurants) {
      // Restoranın menü öğelerini al
      const menuItems = await this.menuItemRepository.find({ where: { restaurantId: restaurant.id } });

      if (menuItems.length === 0) {
        console.log(`${restaurant.name} için menü öğesi bulunamadı, sipariş oluşturulamıyor.`);
        continue;
      }

      // Rastgele 1-3 menü öğesi seç
      const selectedItems = menuItems.slice(0, Math.min(menuItems.length, Math.floor(Math.random() * 3) + 1));

      // Sipariş öğelerini oluştur
      const orderItems = selectedItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: Math.floor(Math.random() * 3) + 1, // 1-3 adet
        price: item.price
      }));

      // Toplam tutarı hesapla
      const totalAmount = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Sipariş durumunu rastgele seç
      const statuses = [
        OrderStatus.PENDING,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERED
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      // Sipariş oluştur
      const order = this.orderRepository.create({
        totalAmount,
        status: randomStatus,
        items: orderItems,
        customerName: 'Test Müşteri',
        customerPhone: '05551234567',
        customerAddress: 'Test Adres, Ankara',
        notes: 'Bu bir test siparişidir',
        restaurant: restaurant
      });

      await this.orderRepository.save(order);
      console.log(`${restaurant.name} için test siparişi oluşturuldu. Tutar: ${totalAmount} TL, Durum: ${randomStatus}`);
    }

    console.log('Test siparişleri başarıyla oluşturuldu!');
  }
} 