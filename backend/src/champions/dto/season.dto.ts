import { IsString } from 'class-validator';
import { Expose } from 'class-transformer';

export class SeasonDto {
  @IsString()
  @Expose()
  season: string;

  @IsString()
  @Expose()
  givenName: string;

  @IsString()
  @Expose()
  familyName: string;

  @IsString()
  @Expose()
  driverId: string;
}
