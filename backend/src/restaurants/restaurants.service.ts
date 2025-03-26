import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantsService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurantRepository: Repository<Restaurant>,
    ) {}

    async create(createRestaurantDto: CreateRestaurantDto, userId: string): Promise<Restaurant> {
        const restaurant = this.restaurantRepository.create({
            ...createRestaurantDto,
            userId,
        });
        return await this.restaurantRepository.save(restaurant);
    }

    async findByUserId(userId: string): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { userId },
        });
        if (!restaurant) {
            throw new NotFoundException('Restoran bulunamadı');
        }
        return restaurant;
    }

    async update(id: string, updateData: Partial<CreateRestaurantDto>): Promise<Restaurant> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { id },
        });
        if (!restaurant) {
            throw new NotFoundException('Restoran bulunamadı');
        }
        Object.assign(restaurant, updateData);
        return await this.restaurantRepository.save(restaurant);
    }

    async remove(id: string): Promise<void> {
        const restaurant = await this.restaurantRepository.findOne({
            where: { id },
        });
        if (!restaurant) {
            throw new NotFoundException('Restoran bulunamadı');
        }
        await this.restaurantRepository.remove(restaurant);
    }
}
