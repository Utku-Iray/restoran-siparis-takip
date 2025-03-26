import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItem } from '../menu/menu.entity';
import { Order } from '../orders/order.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  RESTAURANT = 'restaurant'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  @OneToMany(() => MenuItem, (menuItem) => menuItem.restaurant)
  menuItems: MenuItem[];

  @OneToMany(() => Order, order => order.restaurant)
  orders: Order[];
} 