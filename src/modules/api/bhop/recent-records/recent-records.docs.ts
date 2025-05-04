import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export const GetRecentRecordsApiOperation = () =>
  ApiOperation({
    summary: 'Get recent bhop records',
    description: 'Returns a list of recent bhop records from the database',
  });

export const GetRecentRecordsApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'List of recent bhop records',
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
