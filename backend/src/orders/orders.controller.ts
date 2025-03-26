import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { OrderStatus } from './order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.CUSTOMER)
  async createOrder(@Body() createOrderDto: any, @Request() req) {
    const restaurantId = createOrderDto.restaurantId;
    
    if (!restaurantId) {
      throw new Error('restaurantId field is required');
    }
    
    console.log(`Creating order for restaurant ID: ${restaurantId}`);
    
    return this.ordersService.createOrder(createOrderDto, restaurantId);
  }

  @Get('restaurant')
  @Roles(UserRole.RESTAURANT)
  async getRestaurantOrders(@Request() req) {
    return this.ordersService.getRestaurantOrders(req.user.id);
  }

  @Put(':id/status')
  @Roles(UserRole.RESTAURANT)
  async updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return this.ordersService.updateOrderStatus(parseInt(id), status);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(parseInt(id));
  }
} 