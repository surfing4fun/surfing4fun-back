import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function getServerStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get surf server status' }),
    ApiResponse({
      status: 200,
      description: 'Returns the current status of the surf server',
    }),
  );
}
