import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { GetUsersApiOperation, GetUsersApiResponse } from './users.docs';
import { UsersService } from './users.service';

@ApiTags('Bhop')
@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GetUsersApiOperation()
  @GetUsersApiResponse()
  @Get()
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @GetUsersApiOperation()
  @GetUsersApiResponse()
  @Get(':auth')
  async getUserByAuth(@Param('auth') auth: string) {
    return this.usersService.getUsers(parseInt(auth));
  }
}
