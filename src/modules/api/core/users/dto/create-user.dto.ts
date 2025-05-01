import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { User } from '../entity/user';

export class CreateUserDto implements Partial<User> {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '76561198116612863',
    description: 'The steamId from the user steam account',
  })
  steamId: string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'The role id of the user',
  })
  roleId: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'http://imageurl.com',
    description: 'The avatar image from the steam account',
  })
  avatar: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '76561198116612863',
    description: 'The steam profile url',
  })
  profile: string;
}
