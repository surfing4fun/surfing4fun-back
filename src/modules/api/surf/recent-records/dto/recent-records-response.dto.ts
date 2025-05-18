import { ApiProperty } from '@nestjs/swagger';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';

import { SurfRecentRecordDto } from './recent-record.dto';

export class SurfRecentRecordsResponseDto {
  @ApiProperty({ type: [SurfRecentRecordDto] })
  data: SurfRecentRecordDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;

  @ApiProperty({ type: PaginationLinksResponseDto })
  links: PaginationLinksResponseDto;
}
