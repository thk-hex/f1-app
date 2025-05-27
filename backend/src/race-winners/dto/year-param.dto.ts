import { IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class YearParamDto {
  @ApiProperty({
    description: 'The year to fetch race winners for',
    example: 2021,
    minimum: 1950,
    maximum: new Date().getFullYear(),
  })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(1950, { message: 'Year must be no earlier than 1950' })
  @Max(new Date().getFullYear(), { 
    message: `Year must be no later than ${new Date().getFullYear()}` 
  })
  year: number;
} 