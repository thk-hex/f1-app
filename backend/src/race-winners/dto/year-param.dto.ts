import { IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { F1ValidationUtil } from '../../shared/utils/f1-validation.util';
import { SanitizeString } from '../../shared/decorators/sanitization.decorators';

export class YearParamDto {
  @ApiProperty({
    description: 'The year to fetch race winners for',
    example: 2021,
    minimum: F1ValidationUtil.getMinValidYear(),
    maximum: new Date().getFullYear(),
  })
  @SanitizeString({ allowHtml: false, trimWhitespace: true, maxLength: 4 })
  @Transform(({ value }) => parseInt(value))
  @IsInt({ message: 'Year must be a valid integer' })
  @Min(F1ValidationUtil.getMinValidYear(), { 
    message: `Year must be no earlier than ${F1ValidationUtil.getMinValidYear()}` 
  })
  @Max(new Date().getFullYear(), { 
    message: `Year must be no later than ${new Date().getFullYear()}` 
  })
  year: number;
} 