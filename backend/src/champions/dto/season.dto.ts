import { IsString, Matches, Length } from 'class-validator';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SeasonDto {
  @ApiProperty({ description: 'F1 season year', example: '2021' })
  @IsString()
  @Matches(/^\d{4}$/, { message: 'Season must be a 4-digit year' })
  @Length(4, 4, { message: 'Season must be exactly 4 digits' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  season: string;

  @ApiProperty({ description: 'Champion driver first name', example: 'Lewis' })
  @IsString()
  @Length(1, 50, { message: 'Given name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Given name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  givenName: string;

  @ApiProperty({
    description: 'Champion driver last name',
    example: 'Hamilton',
  })
  @IsString()
  @Length(1, 50, { message: 'Family name must be between 1 and 50 characters' })
  @Matches(/^[a-zA-Z\s'-]+$/, {
    message:
      'Family name can only contain letters, spaces, hyphens, and apostrophes',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Expose()
  familyName: string;

  @ApiProperty({ description: 'Champion driver ID', example: 'hamilton' })
  @IsString()
  @Length(1, 30, { message: 'Driver ID must be between 1 and 30 characters' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Driver ID can only contain letters, numbers, underscores, and hyphens',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @Expose()
  driverId: string;
}
