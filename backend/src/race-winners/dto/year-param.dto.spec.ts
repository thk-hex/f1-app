import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { YearParamDto } from './year-param.dto';
import { F1ValidationUtil } from '../../shared/utils/f1-validation.util';

describe('YearParamDto', () => {
  const minValidYear = F1ValidationUtil.getMinValidYear();
  const currentYear = new Date().getFullYear();

  it('should validate a valid year within range', async () => {
    const dto = plainToClass(YearParamDto, { year: '2021' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(2021);
  });

  it('should fail validation for year before minimum valid year', async () => {
    const invalidYear = minValidYear - 1;
    const dto = plainToClass(YearParamDto, { year: invalidYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toContain(
      `Year must be no earlier than ${minValidYear}`,
    );
  });

  it('should fail validation for year after current year', async () => {
    const futureYear = currentYear + 1;
    const dto = plainToClass(YearParamDto, { year: futureYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.max).toContain(
      `Year must be no later than ${currentYear}`,
    );
  });

  it('should fail validation for non-numeric input', async () => {
    const dto = plainToClass(YearParamDto, { year: 'abc' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain(
      'Year must be a valid integer',
    );
  });

  it('should validate current year', async () => {
    const dto = plainToClass(YearParamDto, { year: currentYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(currentYear);
  });

  it('should validate minimum valid year (boundary test)', async () => {
    const dto = plainToClass(YearParamDto, { year: minValidYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(minValidYear);
  });
});
