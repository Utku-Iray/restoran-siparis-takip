import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'restaurant_order_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // Development ortamında true, production'da false olmalı
  dropSchema: true, // Veritabanını her seferinde temizle
  logging: true,
}; 