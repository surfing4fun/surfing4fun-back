import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function getAllMapsDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all maps' }),
    ApiResponse({
      status: 200,
      description: 'Returns a list of all map tiers',
    }),
  );
}

export function getMapByMapDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get map by map name' }),
    ApiParam({
      name: 'map',
      description: 'Map name to get tier information for',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Returns the tier information for the specified map',
    }),
  );
}
