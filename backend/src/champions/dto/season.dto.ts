import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SeasonDto {
  @ApiProperty({ description: 'F1 season year', example: '2021' })
  @IsString()
  @Expose()
  season: string;

  @ApiProperty({ description: 'Champion driver first name', example: 'Lewis' })
  @IsString()
  @Expose()
  givenName: string;

  @ApiProperty({
    description: 'Champion driver last name',
    example: 'Hamilton',
  })
  @IsString()
  @Expose()
  familyName: string;

  @ApiProperty({ description: 'Champion driver ID', example: 'hamilton' })
  @IsString()
  @Expose()
  driverId: string;
}
