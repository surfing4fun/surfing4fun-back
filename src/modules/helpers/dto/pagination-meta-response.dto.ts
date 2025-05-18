import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaResponseDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  page: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  pageSize: number;

  @ApiProperty({
    example: 42,
    description: 'Total number of records matching the query',
  })
  total: number;

  @ApiProperty({
    example: '142',
    description: 'Total of duration of the request in ms',
    required: false,
  })
  durationMs?: number;
}
