import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './menu.entity';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(userId: number, createMenuItemDto: CreateMenuItemDto) {
    const menuItem = this.menuItemRepository.create({
      ...createMenuItemDto,
      restaurantId: userId,
    });
    return await this.menuItemRepository.save(menuItem);
  }

  async findAll() {
    return await this.menuItemRepository.find();
  }

  async findOne(id: number) {
    const menuItem = await this.menuItemRepository.findOne({ where: { id } });
    if (!menuItem) {
      throw new NotFoundException('Menü öğesi bulunamadı');
    }
    return menuItem;
  }

  async update(userId: number, id: number, updateMenuItemDto: UpdateMenuItemDto) {
    const menuItem = await this.findOne(id);
    if (menuItem.restaurantId !== userId) {
      throw new UnauthorizedException('Bu menü öğesini güncelleme yetkiniz yok');
    }
    Object.assign(menuItem, updateMenuItemDto);
    return await this.menuItemRepository.save(menuItem);
  }

  async remove(userId: number, id: number) {
    const menuItem = await this.findOne(id);
    if (menuItem.restaurantId !== userId) {
      throw new UnauthorizedException('Bu menü öğesini silme yetkiniz yok');
    }
    await this.menuItemRepository.remove(menuItem);
    return { message: 'Menü öğesi başarıyla silindi' };
  }

  async toggleAvailability(userId: number, id: number) {
    const menuItem = await this.findOne(id);
    if (menuItem.restaurantId !== userId) {
      throw new UnauthorizedException('Bu menü öğesinin durumunu değiştirme yetkiniz yok');
    }
    menuItem.isAvailable = !menuItem.isAvailable;
    return await this.menuItemRepository.save(menuItem);
  }
} 