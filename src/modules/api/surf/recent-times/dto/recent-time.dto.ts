import { ApiProperty } from '@nestjs/swagger';

export class SurfRecentTimeDto {
  @ApiProperty({
    example: 1622470423,
    description: 'Unix epoch timestamp when run occurred',
  })
  date: number;

  @ApiProperty({ example: 'surf_utopia', description: 'Map identifier' })
  map: string;

  @ApiProperty({
    example: 'utopia',
    description: 'Map type from maptiers table',
  })
  mapType: string;

  @ApiProperty({
    example: '76561198000000000',
    description: 'Steam auth ID of the player',
  })
  player: string;

  @ApiProperty({
    example: 'Gamer123',
    description: 'Player nickname',
    nullable: true,
  })
  playerNickname?: string | null;

  @ApiProperty({
    example: 'https://steamcommunity.com/id/Gamer123',
    description: 'URL to Steam profile',
    nullable: true,
  })
  playerProfileUrl?: string | null;

  @ApiProperty({
    example: 'https://steamcdn-a.akamaihd.net/avatars/xx/xxxx.jpg',
    description: 'URL of player avatar',
    nullable: true,
  })
  playerAvatar?: string | null;

  @ApiProperty({
    example: 'BR',
    description: 'ISO country code derived from IP',
    nullable: true,
  })
  playerLocationCountry?: string | null;

  @ApiProperty({
    example: 'https://flagcdn.com/w40/us.png',
    description: 'Country flag URL',
    nullable: true,
  })
  playerLocationCountryFlag?: string | null;

  @ApiProperty({ example: 12000, description: 'Run time in milliseconds' })
  runTime: number;

  @ApiProperty({
    example: 200,
    description: 'Difference (ms) to the next-best time',
    nullable: true,
  })
  runTimeDifference?: number | null;

  @ApiProperty({ example: 50, description: 'Points awarded for this run' })
  points: number;

  @ApiProperty({
    example: 1,
    description: 'Position within this page of results',
  })
  rank: number;

  @ApiProperty({
    example: 'Sideways',
    description: 'Surf style name (e.g. Normal, Sideways, Halfsideways, etc)',
  })
  style: string;

  @ApiProperty({ example: 3, description: 'Tier level from maptiers table' })
  tier: number;

  @ApiProperty({
    example: '1',
    description:
      'Number of the track. 0 = Main, 1 = Bonus 1, 2 = Bonus 2 [...]',
  })
  track: string;
}
