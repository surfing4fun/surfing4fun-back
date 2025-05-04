import { ApiProperty } from '@nestjs/swagger';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';

import { BhopRecentTimeDto } from './recent-time.dto';

export class BhopRecentTimesResponseDto {
  @ApiProperty({ type: [BhopRecentTimeDto] })
  data: BhopRecentTimeDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;

  @ApiProperty({ type: PaginationLinksResponseDto })
  links: PaginationLinksResponseDto;
}
