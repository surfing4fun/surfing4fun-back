import { ApiProperty } from '@nestjs/swagger';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';

import { SurfRecentTimeDto } from './recent-time.dto';

export class SurfRecentTimesResponseDto {
  @ApiProperty({ type: [SurfRecentTimeDto] })
  data: SurfRecentTimeDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;

  @ApiProperty({ type: PaginationLinksResponseDto })
  links: PaginationLinksResponseDto;
}
