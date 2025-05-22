import { PaginationLinksResponseDto } from 'src/modules/helpers/dto/pagination-links-response.dto';
import { PaginationMetaResponseDto } from 'src/modules/helpers/dto/pagination-meta-response.dto';
import { PaginationDto } from 'src/modules/helpers/dto/pagination.dto';
import { UserProfileDto } from './user-profile.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto extends PaginationDto {
  @ApiProperty({ type: [UserProfileDto] })
  data: UserProfileDto;

  // @ApiProperty({ type: PaginationMetaResponseDto })
  // meta: PaginationMetaResponseDto;

  // @ApiProperty({ type: PaginationLinksResponseDto })
  // links: PaginationLinksResponseDto;
}

