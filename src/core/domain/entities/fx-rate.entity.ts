import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ValidCurrency } from '../../../common/constants/currency.constants';

@Entity('fx_rates')
@Unique('uq_currency_pair', ['sourceCurrency', 'destinationCurrency'])
export class FxRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'source_currency',
    length: 3,
    type: 'varchar',
  })
  sourceCurrency: ValidCurrency;

  @Column({
    name: 'destination_currency',
    length: 3,
    type: 'varchar',
  })
  destinationCurrency: ValidCurrency;

  @Column({
    name: 'buy_price',
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  buyPrice: number;

  @Column({
    name: 'sell_price',
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  sellPrice: number;

  @Column({
    name: 'cap_amount',
    type: 'bigint',
  })
  capAmount: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
