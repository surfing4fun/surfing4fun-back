import { Controller, Get, Param } from '@nestjs/common';
import { Public } from 'src/decorators/Public';

import { UsersService } from './users.service';

@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @Get(':auth')
  async getUserByAuth(@Param('auth') auth: string) {
    return this.usersService.getUsers(parseInt(auth));
  }
}
