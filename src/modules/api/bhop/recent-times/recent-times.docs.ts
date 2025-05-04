import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

export const GetRecentTimesApiOperation = () =>
  ApiOperation({
    summary: 'Get recent bhop times',
    description: 'Returns a list of recent bhop times from the database',
  });

export const GetRecentTimesApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'List of recent bhop times',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          playerId: { type: 'number' },
          mapId: { type: 'number' },
          time: { type: 'number' },
          date: { type: 'string', format: 'date-time' },
          player: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              steamId: { type: 'string' },
            },
          },
          map: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              tier: { type: 'number' },
            },
          },
        },
      },
    },
  });

export function getRecentTimesDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get recent bhop times' }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number',
      type: String,
    }),
    ApiQuery({
      name: 'pageSize',
      required: false,
      description: 'Items per page',
      type: String,
    }),
    ApiQuery({
      name: 'map',
      required: false,
      description: 'Filter by map name',
      type: String,
    }),
    ApiQuery({
      name: 'style',
      required: false,
      description: 'Filter by bhop style',
      type: String,
    }),
    ApiQuery({
      name: 'track',
      required: false,
      description: 'Filter by track number',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Returns a list of recent bhop times',
    }),
  );
}
