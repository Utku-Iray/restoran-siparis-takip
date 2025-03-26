import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('menu')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles('restaurant')
  create(@Request() req, @Body() createMenuItemDto: CreateMenuItemDto) {
    return this.menuService.create(req.user.id, createMenuItemDto);
  }

  @Get()
  findAll() {
    return this.menuService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(+id);
  }

  @Patch(':id')
  @Roles('restaurant')
  update(@Request() req, @Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
    return this.menuService.update(req.user.id, +id, updateMenuItemDto);
  }

  @Delete(':id')
  @Roles('restaurant')
  remove(@Request() req, @Param('id') id: string) {
    return this.menuService.remove(req.user.id, +id);
  }

  @Patch(':id/toggle-availability')
  @Roles('restaurant')
  toggleAvailability(@Request() req, @Param('id') id: string) {
    return this.menuService.toggleAvailability(req.user.id, +id);
  }
} 