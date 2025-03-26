import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Restaurant } from '../../restaurants/entities/restaurant.entity';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column()
    category: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: true })
    isAvailable: boolean;

    @Column({ nullable: true })
    imageUrl: string;

    @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
    restaurant: Restaurant;

    @Column()
    restaurantId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 