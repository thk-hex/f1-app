import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { YearParamDto } from './year-param.dto';

describe('YearParamDto', () => {
  it('should validate a valid year within range', async () => {
    const dto = plainToClass(YearParamDto, { year: '2021' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(2021);
  });

  it('should fail validation for year before 1950', async () => {
    const dto = plainToClass(YearParamDto, { year: '1949' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.min).toContain('Year must be no earlier than 1950');
  });

  it('should fail validation for year after current year', async () => {
    const futureYear = new Date().getFullYear() + 1;
    const dto = plainToClass(YearParamDto, { year: futureYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.max).toContain(`Year must be no later than ${new Date().getFullYear()}`);
  });

  it('should fail validation for non-numeric input', async () => {
    const dto = plainToClass(YearParamDto, { year: 'abc' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.isInt).toContain('Year must be a valid integer');
  });

  it('should validate current year', async () => {
    const currentYear = new Date().getFullYear();
    const dto = plainToClass(YearParamDto, { year: currentYear.toString() });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(currentYear);
  });

  it('should validate year 1950 (minimum boundary)', async () => {
    const dto = plainToClass(YearParamDto, { year: '1950' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.year).toBe(1950);
  });
}); 