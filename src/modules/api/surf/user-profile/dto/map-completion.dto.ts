import { ApiProperty } from '@nestjs/swagger';

export class CompletedMapsTierDto {
  @ApiProperty({ example: 2, description: 'Tier level (from maptiers table)' })
  tier: number;

  @ApiProperty({ example: 5, description: 'Number of completed maps in this tier' })
  completedMaps: number;

  @ApiProperty({ example: 10, description: 'Total number of maps in this tier' })
  totalMaps: number;

  @ApiProperty({
    example: 50,
    description: 'Percentage of maps completed in this tier',
  })
  completedMapsPercentage: number;
}

export class MapCompletionDto {
  @ApiProperty({
    example: 75,
    description: 'Overall percentage of maps completed',
  })
  completedMapsPercentage: number;

  @ApiProperty({
    example: 60,
    description: 'Overall percentage of stages completed',
  })
  completedStagesPercentage: number;

  @ApiProperty({
    example: 40,
    description: 'Overall percentage of bonus stages completed',
  })
  completedBonusPercentage: number;

  @ApiProperty({
    type: CompletedMapsTierDto,
    description: 'Breakdown of completion within a specific tier',
  })
  completedMapsTier: CompletedMapsTierDto;

  @ApiProperty({
    example: 'surf_utopia',
    description: 'Identifier of the most played map',
  })
  mostPlayedMap: string;
}
