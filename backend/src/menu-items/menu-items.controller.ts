import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

@Controller('menu-items')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT)
export class MenuItemsController {
    constructor(private readonly menuItemsService: MenuItemsService) {}

    @Post()
    create(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
        return this.menuItemsService.create(createMenuItemDto, req.user.restaurantId);
    }

    @Get()
    findAll(@Request() req) {
        return this.menuItemsService.findAll(req.user.restaurantId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.menuItemsService.findOne(id, req.user.restaurantId);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateMenuItemDto: Partial<CreateMenuItemDto>,
        @Request() req,
    ) {
        return this.menuItemsService.update(id, updateMenuItemDto, req.user.restaurantId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.menuItemsService.remove(id, req.user.restaurantId);
    }

    @Patch(':id/toggle-availability')
    toggleAvailability(@Param('id') id: string, @Request() req) {
        return this.menuItemsService.toggleAvailability(id, req.user.restaurantId);
    }
} 