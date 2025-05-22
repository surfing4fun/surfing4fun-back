import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';


export function getUserProfileDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get recent surf times' }),
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
  );
}