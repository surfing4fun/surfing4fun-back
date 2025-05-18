import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/modules/helpers/dto/pagination.dto';

export class SurfRecentRecordsQueryDto extends PaginationDto {
  @ApiProperty({
    required: false,
    description: 'Filter by map name',
    example: 'surf_utopia',
  })
  @IsOptional()
  @IsString()
  map?: string;

  @ApiProperty({
    required: false,
    description: 'Filter by surf style',
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
