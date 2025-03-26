import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './order.entity';
import { User } from '../users/user.entity';

interface CreateOrderDto {
  totalAmount: number;
  items: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  notes?: string;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, restaurantId: number): Promise<Order> {
    console.log(`OrdersService - Creating order for restaurant ID: ${restaurantId}`);
    
    // restaurantId'nin sayı olduğundan emin ol
    const resId = Number(restaurantId);
    if (isNaN(resId)) {
      throw new Error(`Invalid restaurant ID: ${restaurantId}`);
    }
    
    const restaurant = await this.usersRepository.findOne({ where: { id: resId } });
    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${resId} not found`);
    }
    
    console.log(`OrdersService - Found restaurant: ${restaurant.name} (ID: ${restaurant.id})`);
    
    const order = this.ordersRepository.create({
      ...createOrderDto,
      restaurant
    });
    
    console.log(`OrdersService - Order created with restaurant ID: ${restaurant.id}`);
    
    return this.ordersRepository.save(order);
  }

  async getRestaurantOrders(restaurantId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { restaurant: { id: restaurantId } },
      order: { createdAt: 'DESC' }
    });
  }

  async updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

  async getOrderById(orderId: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
} 