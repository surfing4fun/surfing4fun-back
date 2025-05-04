import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SurfRecentRecordsQueryDto {
  @ApiProperty({
    required: false,
    description: 'Page number',
    example: '1',
  })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiProperty({
    required: false,
    description: 'Items per page',
    example: '10',
  })
  @IsOptional()
  @IsString()
  pageSize?: string;

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
