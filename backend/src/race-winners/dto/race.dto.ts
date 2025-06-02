import { IsString, Matches, Length } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RaceDto {
  @ApiProperty({ description: 'Round number in the season', example: '1' })
  @IsString()
  @Matches(/^\d{1,2}$/, { message: 'Round must be a 1-2 digit number' })
  @Length(1, 2, { message: 'Round must be between 1 and 2 characters' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  round: string;

  @ApiProperty({ description: 'Grand Prix name', example: 'Monaco Grand Prix' })
  @IsString()
  @Length(1, 100, {
    message: 'Grand Prix name must be between 1 and 100 characters',
  })
  @Matches(/^[a-zA-Z0-9\s'-]+$/, {
    message:
      'Grand Prix name can only contain letters, numbers, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  gpName: string;

  @ApiProperty({ description: 'Winner driver ID', example: 'hamilton' })
  @IsString()
  @Length(1, 30, { message: 'Winner ID must be between 1 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Winner ID can only contain letters, numbers, underscores, and hyphens',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Expose()
  winnerId: string;

  @ApiProperty({ description: 'Winner driver first name', example: 'Lewis' })
  @IsString()
  @Length(1, 50, {
    message: 'Winner given name must be between 1 and 50 characters',
  })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Winner given name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  winnerGivenName: string;

  @ApiProperty({ description: 'Winner driver last name', example: 'Hamilton' })
  @IsString()
  @Length(1, 50, {
    message: 'Winner family name must be between 1 and 50 characters',
  })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Winner family name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  winnerFamilyName: string;
}
