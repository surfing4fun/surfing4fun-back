import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { getUserProfileDocs } from './user-profile.docs';
import { UserProfileService } from './user-profile.service';

@ApiTags('Surf')
@Public()
@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @getUserProfileDocs()
  @Get(':userId')
  async getUserProfile(
    @Param('userId') userId: number
  ) {
    return this.userProfileService.getUserProfile(userId);
  }
}
