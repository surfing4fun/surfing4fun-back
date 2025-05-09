import { ApiProperty } from '@nestjs/swagger';

export class PaginationLinksResponseDto {
  @ApiProperty({ example: '/recent-times?page=2&pageSize=20' })
  self: string;

  @ApiProperty({ example: '/recent-times?page=1&pageSize=20' })
  first: string;

  @ApiProperty({ example: '/recent-times?page=1&pageSize=20', nullable: true })
  prev?: string | null;

  @ApiProperty({ example: '/recent-times?page=3&pageSize=20', nullable: true })
  next?: string | null;

  @ApiProperty({ example: '/recent-times?page=5&pageSize=20' })
  last: string;
}
