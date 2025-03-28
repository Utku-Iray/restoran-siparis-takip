import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'restaurant_order_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, 
  dropSchema: true, 
  logging: true,
}; 