import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';

@Injectable()
export class MenuItemsService {
    constructor(
        @InjectRepository(MenuItem)
        private menuItemRepository: Repository<MenuItem>,
    ) {}

    async create(createMenuItemDto: CreateMenuItemDto, restaurantId: string): Promise<MenuItem> {
        const menuItem = this.menuItemRepository.create({
            ...createMenuItemDto,
            restaurantId,
        });
        return await this.menuItemRepository.save(menuItem);
    }

    async findAll(restaurantId: string): Promise<MenuItem[]> {
        return await this.menuItemRepository.find({
            where: { restaurantId },
            order: { category: 'ASC', name: 'ASC' },
        });
    }

    async findOne(id: string, restaurantId: string): Promise<MenuItem> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id, restaurantId },
        });
        if (!menuItem) {
            throw new NotFoundException('Menü öğesi bulunamadı');
        }
        return menuItem;
    }

    async update(id: string, updateData: Partial<CreateMenuItemDto>, restaurantId: string): Promise<MenuItem> {
        const menuItem = await this.findOne(id, restaurantId);
        Object.assign(menuItem, updateData);
        return await this.menuItemRepository.save(menuItem);
    }

    async remove(id: string, restaurantId: string): Promise<void> {
        const menuItem = await this.findOne(id, restaurantId);
        await this.menuItemRepository.remove(menuItem);
    }

    async toggleAvailability(id: string, restaurantId: string): Promise<MenuItem> {
        const menuItem = await this.findOne(id, restaurantId);
        menuItem.isAvailable = !menuItem.isAvailable;
        return await this.menuItemRepository.save(menuItem);
    }
} 