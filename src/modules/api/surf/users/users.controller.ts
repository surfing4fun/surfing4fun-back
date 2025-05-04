import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/decorators/Public.decorator';

import { UsersService } from './users.service';

@ApiTags('Surf - Users')
@Public()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all surf users' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all surf users',
  })
  @Get()
  async getAllUsers() {
    return this.usersService.getUsers();
  }

  @ApiOperation({ summary: 'Get user by auth ID' })
  @ApiParam({
    name: 'auth',
    description: 'User auth ID to get information for',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the user information for the specified auth ID',
  })
  @Get(':auth')
  async getUserByAuth(@Param('auth') auth: string) {
    return this.usersService.getUsers(parseInt(auth));
  }
}
