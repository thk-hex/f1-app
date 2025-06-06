import { Injectable } from '@nestjs/common';
import { RaceDto } from './dto/race.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RaceWinnersMapper {
  mapToRaceDto(data: any, raceIndex: number): RaceDto {
    const dto = new RaceDto();

    const race = data.MRData?.RaceTable?.Races?.[raceIndex];

    if (!race) {
      return plainToInstance(RaceDto, dto, { excludeExtraneousValues: true });
    }

    dto.round = race.round || '';
    dto.gpName = race.raceName || '';

    const winner = race.Results?.[0];

    if (winner) {
      dto.winnerId = winner.Driver?.driverId || '';
      dto.winnerGivenName = winner.Driver?.givenName || '';
      dto.winnerFamilyName = winner.Driver?.familyName || '';
    }

    return plainToInstance(RaceDto, dto, { excludeExtraneousValues: true });
  }

  mapToRaceDtos(data: any): RaceDto[] {
    const races = data.MRData?.RaceTable?.Races || [];
    const dtos: RaceDto[] = [];

    for (let i = 0; i < races.length; i++) {
      dtos.push(this.mapToRaceDto(data, i));
    }

    return dtos;
  }
}
