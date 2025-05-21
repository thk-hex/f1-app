import { Injectable } from '@nestjs/common';
import { SeasonDto } from './dto/season.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ChampionsMapper {
  mapToSeasonDto(data: any): SeasonDto {
    const dto = new SeasonDto();
    dto.season = data.MRData?.StandingsTable?.season || '';
    dto.givenName =
      data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver?.givenName || '';
    dto.familyName =
      data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings?.[0]
        ?.Driver?.familyName || '';

    // Use class-transformer to ensure proper instance creation
    return plainToInstance(SeasonDto, dto, { excludeExtraneousValues: true });
  }
}
