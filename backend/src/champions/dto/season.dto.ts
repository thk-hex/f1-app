import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SanitizedString } from '../../shared/decorators/sanitization.decorators';

export class SeasonDto {
  @ApiProperty({ description: 'F1 season year', example: '2021' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 4, trimWhitespace: true })
  season: string;

  @ApiProperty({ description: 'Champion driver first name', example: 'Lewis' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 50, trimWhitespace: true })
  givenName: string;

  @ApiProperty({
    description: 'Champion driver last name',
    example: 'Hamilton',
  })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 50, trimWhitespace: true })
  familyName: string;

  @ApiProperty({ description: 'Champion driver ID', example: 'hamilton' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 30, trimWhitespace: true })
  driverId: string;
}
