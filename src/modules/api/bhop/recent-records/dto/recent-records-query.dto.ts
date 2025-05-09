import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/modules/helpers/dto/pagination.dto';

export class BhopRecentRecordsQueryDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: 'Filter by map name',
    example: 'bhop_lego2',
  })
  @IsOptional()
  @IsString()
  map?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by bhop style',
    example: 'Sideways',
  })
  @IsOptional()
  @IsString()
  style?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by track number',
    example: '1',
  })
  @IsOptional()
  @IsString()
  track?: string;
}
