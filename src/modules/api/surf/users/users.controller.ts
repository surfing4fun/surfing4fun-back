import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { getAllUsersDocs, getUserByAuthDocs } from './users.docs';
import { UsersService } from './users.service';

@ApiTags('Surf')
@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @getAllUsersDocs()
  @Get()
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @getUserByAuthDocs()
  @Get(':auth')
  async getUserByAuth(@Param('auth') auth: string) {
    return this.usersService.getUsers(parseInt(auth));
  }
}
