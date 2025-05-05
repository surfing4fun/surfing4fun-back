import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';

@Injectable()
export class CountryFlagService {
  constructor(
    @Inject('AXIOS_INSTANCE') private readonly httpService: AxiosInstance,
  ) {}
  private longToIp(ipLong: number): string {
    const ipBigInt = BigInt(ipLong);
    return [
      Number((ipBigInt >> 24n) & 255n),
      Number((ipBigInt >> 16n) & 255n),
      Number((ipBigInt >> 8n) & 255n),
      Number(ipBigInt & 255n),
    ].join('.');
  }

  async getCountryCodeByLongIp(ipLong: number): Promise<string> {
    const ip = this.longToIp(ipLong);
    const url = `https://api.country.is/${ip}`;
    const response = await this.httpService.get(url);
    return response.data.country;
  }

  async getCountryFlagByCountryCode(countryCode: string): Promise<string> {
    return `https://flagsapi.com/${countryCode}/flat/64.png`;
  }
}
