import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class RaceDto {
  @IsString()
  @Expose()
  gpName: string;

  @IsString()
  @Expose()
  winnerId: string;

  @IsString()
  @Expose()
  winnerGivenName: string;

  @IsString()
  @Expose()
  winnerFamilyName: string;
}
