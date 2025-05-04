import { ApiProperty } from '@nestjs/swagger';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';

import { RecentTimeDto } from './recent-time.dto';

export class RecentTimesResponseDto {
  @ApiProperty({ type: [RecentTimeDto] })
  data: RecentTimeDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;

  @ApiProperty({ type: PaginationLinksResponseDto })
  links: PaginationLinksResponseDto;
}
