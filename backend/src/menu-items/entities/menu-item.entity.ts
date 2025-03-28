import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('menu_items')
export class MenuItem {
    @PrimaryGeneratedColumn()
    id: number;

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

    @ManyToOne(() => User, user => user.menuItems)
    restaurant: User;

    @Column()
    restaurantId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 