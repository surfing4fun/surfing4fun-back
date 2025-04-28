import { Type } from 'class-transformer';
import {
  IsString,
  IsInt,
  Min,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsNotEmpty,
  IsIn,
} from 'class-validator';

export class CheckoutItemDto {
  @IsString()
  @IsNotEmpty()
  priceId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
export class CreateCheckoutSessionDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'You must include at least one item.' })
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsString()
  @IsIn(['subscription', 'payment'], {
    message: 'mode must be either "subscription" or "payment"',
  })
  mode: 'subscription' | 'payment';
}
