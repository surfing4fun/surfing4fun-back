import { ApiProperty } from '@nestjs/swagger';
import { MapCompletionDto } from './map-completion.dto';

export class UserProfileDto {
  @ApiProperty({
    example: 'Proxychains Gamer123',
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
    example: 25,
    description: 'Global position of the player on the server leaderboard',
  })
  serverRank: number;

  @ApiProperty({
    example: 'US',
    description: 'ISO country code derived from the player IP',
    nullable: true,
  })
  locationCountry?: string | null;

  @ApiProperty({
    example: 'https://flagcdn.com/w40/us.png',
    description: 'URL to the player’s country flag image',
    nullable: true,
  })
  locationFlag?: string | null;

  @ApiProperty({
    example: 123456,
    description: 'Total points accumulated by the player',
  })
  totalPoints: number;

  @ApiProperty({
    example: 3600000,
    description: 'Total playtime in milliseconds',
  })
  totalPlaytime: number;

  @ApiProperty({
    example: 1622470423,
    description: 'Unix epoch timestamp when the player was first seen',
  })
  firstSeen: number;

  @ApiProperty({
    example: 1625072423,
    description: 'Unix epoch timestamp when the player was last seen',
  })
  lastSeen: number;

  @ApiProperty({
    example: 5,
    description: 'Count of world-record map completions',
  })
  worldRecordsMap: number;

  @ApiProperty({
    example: 2,
    description: 'Count of world-record bonus completions',
  })
  worldRecordsBonus: number;

  @ApiProperty({
    example: 8,
    description: 'Count of world-record stage completions',
  })
  worldRecordsStage: number;

  @ApiProperty({
    example: 150,
    description: 'Total number of maps the player has run',
  })
  totalPlayedMaps: number;

  @ApiProperty({
    example: 50,
    description: 'Total number of bonus maps the player has run',
  })
  totalPlayedMapsBonus: number;

  @ApiProperty({
    example: 300,
    description: 'Total number of individual stages the player has run',
  })
  totalPlayedStages: number;

  @ApiProperty({
    type: MapCompletionDto,
    description: 'Detailed completion statistics',
  })
  mapCompletion: MapCompletionDto;
}
