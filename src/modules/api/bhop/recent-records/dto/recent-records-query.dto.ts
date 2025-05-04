import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BhopRecentRecordsQueryDto {
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
