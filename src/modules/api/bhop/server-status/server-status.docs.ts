import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const ServerStatusApiTags = () => ApiTags('Bhop Server Status');

export const GetServerStatusApiOperation = () =>
  ApiOperation({
    summary: 'Get bhop server status',
    description: 'Returns the current status of the bhop servers',
  });

export const GetServerStatusApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'List of bhop servers and their status',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          ip: { type: 'string' },
          port: { type: 'number' },
          players: { type: 'number' },
          maxPlayers: { type: 'number' },
          map: { type: 'string' },
          status: { type: 'string', enum: ['online', 'offline'] },
        },
      },
    },
  });
