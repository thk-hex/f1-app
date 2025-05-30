import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SanitizedString } from '../../shared/decorators/sanitization.decorators';

export class RaceDto {
  @ApiProperty({ description: 'Round number in the season', example: '1' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 2, trimWhitespace: true })
  round: string;

  @ApiProperty({ description: 'Grand Prix name', example: 'Monaco Grand Prix' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 100, trimWhitespace: true })
  gpName: string;

  @ApiProperty({ description: 'Winner driver ID', example: 'hamilton' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 30, trimWhitespace: true })
  winnerId: string;

  @ApiProperty({ description: 'Winner driver first name', example: 'Lewis' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 50, trimWhitespace: true })
  winnerGivenName: string;

  @ApiProperty({ description: 'Winner driver last name', example: 'Hamilton' })
  @IsString()
  @Expose()
  @SanitizedString({ maxLength: 50, trimWhitespace: true })
  winnerFamilyName: string;
}
