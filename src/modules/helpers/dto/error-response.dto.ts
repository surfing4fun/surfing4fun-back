import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({ example: 'pageSize', description: 'Field name with error' })
  field: string;

  @ApiProperty({
    example: 'must not be greater than 100',
    description: 'Validation message',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'https://httpstatuses.com/401',
    description: 'Error type URI',
  })
  type: string;

  @ApiProperty({
    example: 'Unauthorized',
    description: 'Short, human-readable title',
  })
  title: string;

  @ApiProperty({ example: 401, description: 'HTTP status code' })
  status: number;

  @ApiProperty({
    example: 'Authentication credentials were missing or invalid',
    description: 'Detailed error description',
  })
  detail: string;

  @ApiProperty({
    example: '/surf/recent-times?page=1&pageSize=1',
    description: 'Request path or instance identifier',
  })
  instance: string;

  @ApiProperty({
    example: '2025-05-04T13:05:29.914Z',
    description: 'ISO timestamp when error occurred',
  })
  timestamp: string;

  @ApiProperty({
    type: [ErrorDetail],
    required: false,
    description: 'Field-level error details',
  })
  errors?: ErrorDetail[];
}
