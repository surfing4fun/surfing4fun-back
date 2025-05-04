import { Type } from 'class-transformer';
import { IsOptional, IsString, IsInt } from 'class-validator';
import { PaginationDto } from 'src/modules/helpers/dto/pagination.dto';

export class RecentTimesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  map?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  style?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  track?: number;
}
