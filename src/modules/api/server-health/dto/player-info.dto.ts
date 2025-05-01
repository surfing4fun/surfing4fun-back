import { ApiProperty } from '@nestjs/swagger';

export class PlayerInfoDto {
  @ApiProperty({ example: 'Player1' })
  name: string;

  @ApiProperty({ example: 20 })
  score: number;

  @ApiProperty({ example: 300 })
  duration: number;
}
