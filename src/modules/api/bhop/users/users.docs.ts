import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

export const UsersApiTags = () => ApiTags('Bhop Users');

export const GetUsersApiOperation = () =>
  ApiOperation({
    summary: 'Get bhop users',
    description: 'Returns a list of bhop users from the database',
  });

export const GetUsersApiResponse = () =>
  ApiResponse({
    status: 200,
    description: 'List of bhop users',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          steamId: { type: 'string' },
          lastSeen: { type: 'string', format: 'date-time' },
          totalPlaytime: { type: 'number' },
          records: { type: 'number' },
          top10s: { type: 'number' },
        },
      },
    },
  });
