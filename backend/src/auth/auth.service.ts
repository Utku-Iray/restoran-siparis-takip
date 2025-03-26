import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('Validating user:', email);
    try {
      const user = await this.usersService.findByEmail(email);
      console.log('User found:', user ? 'Yes' : 'No');
      
      if (user && await bcrypt.compare(password, user.password)) {
        console.log('Password comparison successful');
        const { password, ...result } = user;
        return result;
      }
      console.log('Password comparison failed or user not found');
      return null;
    } catch (error) {
      console.error('Error in validateUser:', error);
      return null;
    }
  }

  async login(user: any) {
    console.log('Login attempt for:', user.email);
    const validatedUser = await this.validateUser(user.email, user.password);
    
    if (!validatedUser) {
      console.log('Login failed: Invalid credentials');
      throw new UnauthorizedException('Geçersiz email veya şifre');
    }

    const payload = { 
      email: validatedUser.email, 
      sub: validatedUser.id,
      role: validatedUser.role
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: validatedUser.id,
        email: validatedUser.email,
        name: validatedUser.name,
        role: validatedUser.role
      }
    };
  }

  async register(createUserDto: CreateUserDto) {
    console.log('Registration attempt for:', createUserDto.email);
    
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Bu email adresi zaten kullanımda');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password, ...result } = user;
    return {
      access_token: this.jwtService.sign({ 
        email: user.email, 
        sub: user.id,
        role: user.role
      }),
      user: result
    };
  }
}
