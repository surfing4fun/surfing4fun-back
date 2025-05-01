import { ApiProperty } from '@nestjs/swagger';

import { PlayerInfoDto } from './player-info.dto';

export class ServerInfoDto {
  @ApiProperty({ example: 'My Server' })
  name: string;

  @ApiProperty({ example: '203.0.113.1:27015' })
  address: string;

  @ApiProperty({ example: 'de_dust2' })
  map: string;

  @ApiProperty({ example: '10/32' })
  players: string;

  @ApiProperty({ example: 2 })
  bots: number;

  @ApiProperty({ example: 'dedicated' })
  serverType: string;

  @ApiProperty({ example: 'Linux' })
  environment: string;

  @ApiProperty({ example: 'public' })
  visibility: string;

  @ApiProperty({ example: 'enabled' })
  vac: string;

  @ApiProperty({ example: '1.0.0.1' })
  version: string;

  @ApiProperty({ type: [PlayerInfoDto] })
  playerList: PlayerInfoDto[];
}
