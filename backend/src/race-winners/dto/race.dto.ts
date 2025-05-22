import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class RaceDto {
  @ApiProperty({ description: 'Grand Prix name', example: 'Monaco Grand Prix' })
  @IsString()
  @Expose()
  gpName: string;

  @ApiProperty({ description: 'Winner driver ID', example: 'hamilton' })
  @IsString()
  @Expose()
  winnerId: string;

  @ApiProperty({ description: 'Winner driver first name', example: 'Lewis' })
  @IsString()
  @Expose()
  winnerGivenName: string;

  @ApiProperty({ description: 'Winner driver last name', example: 'Hamilton' })
  @IsString()
  @Expose()
  winnerFamilyName: string;
}
