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
    ) { }

    async create(createMenuItemDto: CreateMenuItemDto, restaurantId: number): Promise<MenuItem> {
        const menuItem = this.menuItemRepository.create({
            ...createMenuItemDto,
            restaurantId,
        });
        return await this.menuItemRepository.save(menuItem);
    }

    async findAll(restaurantId: number): Promise<MenuItem[]> {
        return await this.menuItemRepository.find({
            where: { restaurantId },
            order: { category: 'ASC', name: 'ASC' },
        });
    }

    async findAllPublic(): Promise<MenuItem[]> {
        return await this.menuItemRepository.find({
            order: { restaurantId: 'ASC', category: 'ASC', name: 'ASC' },
        });
    }

    async findOne(id: number, restaurantId: number): Promise<MenuItem> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id, restaurantId },
        });
        if (!menuItem) {
            throw new NotFoundException('Menü öğesi bulunamadı');
        }
        return menuItem;
    }

    async findOnePublic(id: number): Promise<MenuItem> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id },
        });
        if (!menuItem) {
            throw new NotFoundException('Menü öğesi bulunamadı');
        }
        return menuItem;
    }

    async update(id: number, updateData: Partial<CreateMenuItemDto>, restaurantId: number): Promise<MenuItem> {
        const menuItem = await this.findOne(id, restaurantId);
        Object.assign(menuItem, updateData);
        return await this.menuItemRepository.save(menuItem);
    }

    async remove(id: number, restaurantId: number): Promise<void> {
        const menuItem = await this.findOne(id, restaurantId);
        await this.menuItemRepository.remove(menuItem);
    }

    async toggleAvailability(id: number, restaurantId: number): Promise<MenuItem> {
        const menuItem = await this.findOne(id, restaurantId);
        menuItem.isAvailable = !menuItem.isAvailable;
        return await this.menuItemRepository.save(menuItem);
    }
} 