import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({ example: 'page', description: 'Field name with error' })
  field: string;

  @ApiProperty({
    example: 'Page must be >= 1',
    description: 'Validation message',
  })
  message: string;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'https://httpstatuses.io/400',
    description: 'A URI reference that identifies the problem type',
  })
  type: string;

  @ApiProperty({
    example: 'BadRequest',
    description: 'Short, human-readable title of the error',
  })
  title: string;

  @ApiProperty({ example: 400, description: 'HTTP status code' })
  status: number;

  @ApiProperty({
    example: "The 'page' parameter must be at least 1.",
    description: 'Detailed description specific to this error occurrence',
  })
  detail: string;

  @ApiProperty({
    example: '/surf/recent-times?page=0',
    description: 'Request path or instance identifier',
  })
  instance: string;

  @ApiProperty({
    example: '2025-05-04T12:34:56.789Z',
    description: 'Timestamp when the error occurred',
  })
  timestamp: string;

  @ApiProperty({
    type: [ErrorDetail],
    required: false,
    description: 'Optional list of field-level validation errors',
  })
  errors?: ErrorDetail[];
}
