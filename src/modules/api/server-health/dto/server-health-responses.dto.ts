import { ApiProperty } from '@nestjs/swagger';

import { ServerInfoDto } from './server-info.dto';

export class ServerHealthResponseDto {
  @ApiProperty({ example: '203.0.113.1' })
  ip: string;

  @ApiProperty({ example: '2025-05-01T12:34:56.789Z' })
  timestamp: Date;

  @ApiProperty({ type: [ServerInfoDto] })
  servers: ServerInfoDto[];
}
