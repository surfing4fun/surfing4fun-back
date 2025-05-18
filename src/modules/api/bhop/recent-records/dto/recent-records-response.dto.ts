import { ApiProperty } from '@nestjs/swagger';
import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';

import { BhopRecentRecordDto } from './recent-record.dto';

export class BhopRecentRecordsResponseDto {
  @ApiProperty({ type: [BhopRecentRecordDto] })
  data: BhopRecentRecordDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;

  @ApiProperty({ type: PaginationLinksResponseDto })
  links: PaginationLinksResponseDto;
}
