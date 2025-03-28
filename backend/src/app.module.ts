import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
// Menu modülünü tamamen kaldırıyoruz
import { OrdersModule } from './orders/orders.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { User } from './users/user.entity';
// MenuItem'ı doğru lokasyondan import ediyoruz
import { MenuItem } from './menu-items/entities/menu-item.entity';
import { Order } from './orders/order.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { SeedService } from './config/seed.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'restaurant_order_db',
      entities: [User, MenuItem, Order, Restaurant],
      synchronize: process.env.NODE_ENV !== 'production',
      dropSchema: true,
      logging: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([User, MenuItem, Restaurant, Order]),
    AuthModule,
    UsersModule,
    OrdersModule,
    RestaurantsModule,
    MenuItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService, SeedService],
})
export class AppModule {}
