import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2, transformer: { 
        to: (value: number) => value,
        from: (value: string) => parseFloat(value)
    }})
    price: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isAvailable: boolean;

    @ManyToOne(() => User, (user) => user.menuItems)
    restaurant: User;

    @Column()
    restaurantId: number;
} 