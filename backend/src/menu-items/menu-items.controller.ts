import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe, Query } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('menu-items')
@Controller('menu-items')
export class MenuItemsController {
    constructor(private readonly menuItemsService: MenuItemsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RESTAURANT)
    @ApiOperation({ summary: 'Yeni menü öğesi oluştur' })
    @ApiResponse({ status: 201, description: 'Menü öğesi başarıyla oluşturuldu' })
    create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
        return this.menuItemsService.create(createMenuItemDto, req.user.restaurantId);
    }

    @Get()
    @ApiOperation({ summary: 'Tüm menü öğelerini getir (opsiyonel restaurant filtresi ile)' })
    @ApiResponse({ status: 200, description: 'Menü öğeleri başarıyla getirildi' })
    @ApiQuery({ name: 'restaurantId', required: false, type: Number })
    async findAll(@Query('restaurantId') restaurantId?: number) {
        if (restaurantId) {
            return this.menuItemsService.findAll(restaurantId);
        }

        // Tüm menü öğelerini getir (kullanıcı giriş yapmadıysa)
        const allItems = await this.menuItemsService.findAllPublic();
        return allItems;
    }

    @Get(':id')
    @ApiOperation({ summary: 'ID ile menü öğesi getir' })
    @ApiResponse({ status: 200, description: 'Menü öğesi başarıyla getirildi' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.menuItemsService.findOnePublic(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RESTAURANT)
    @ApiOperation({ summary: 'Menü öğesini güncelle' })
    @ApiResponse({ status: 200, description: 'Menü öğesi başarıyla güncellendi' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMenuItemDto: Partial<CreateMenuItemDto>,
        @Request() req,
    ) {
        return this.menuItemsService.update(id, updateMenuItemDto, req.user.restaurantId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RESTAURANT)
    @ApiOperation({ summary: 'Menü öğesini sil' })
    @ApiResponse({ status: 200, description: 'Menü öğesi başarıyla silindi' })
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.menuItemsService.remove(id, req.user.restaurantId);
    }

    @Patch(':id/toggle-availability')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.RESTAURANT)
    @ApiOperation({ summary: 'Menü öğesinin durumunu değiştir' })
    @ApiResponse({ status: 200, description: 'Menü öğesi durumu başarıyla değiştirildi' })
    toggleAvailability(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.menuItemsService.toggleAvailability(id, req.user.restaurantId);
    }
} 