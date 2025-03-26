import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/enums/user-role.enum';

interface RequestWithUser extends Request {
    user: {
        id: string;
        restaurantId: string;
    }
}

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.RESTAURANT)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantsService) {}

    @Post()
    create(@Body() createRestaurantDto: CreateRestaurantDto, @Request() req: RequestWithUser) {
        return this.restaurantsService.create(createRestaurantDto, req.user.id);
    }

    @Get()
    findOne(@Request() req: RequestWithUser) {
        return this.restaurantsService.findByUserId(req.user.id);
    }

    @Patch()
    update(@Body() updateRestaurantDto: Partial<CreateRestaurantDto>, @Request() req: RequestWithUser) {
        return this.restaurantsService.update(req.user.restaurantId, updateRestaurantDto);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.restaurantsService.remove(id);
    }
}
