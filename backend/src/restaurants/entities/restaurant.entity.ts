import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MenuItem } from '../../menu-items/entities/menu-item.entity';

@Entity('restaurants')
export class Restaurant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    address: string;

    @Column()
    phone: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column()
    userId: number;

    @OneToMany(() => MenuItem, menuItem => menuItem.restaurant)
    menuItems: MenuItem[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 