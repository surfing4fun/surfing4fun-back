import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

export function getAllUsersDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all surf users' }),
    ApiResponse({
      status: 200,
      description: 'Returns a list of all surf users',
    }),
  );
}

export function getUserByAuthDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Get user by auth ID' }),
    ApiParam({
      name: 'auth',
      description: 'User auth ID to get information for',
      type: String,
    }),
    ApiResponse({
      status: 200,
      description: 'Returns the user information for the specified auth ID',
    }),
  );
}
