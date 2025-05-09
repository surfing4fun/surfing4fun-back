import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';

@Injectable()
export class SteamService {
  private readonly STEAM_API_KEY = process.env.STEAM_API_KEY;
  private readonly STEAM_BASE_ID = 76561197960265728n; // Use BigInt for large numbers

  constructor(
    @Inject('AXIOS_INSTANCE') private readonly httpService: AxiosInstance,
  ) {}

  private steamID3To64(accountId: number): string {
    return (this.STEAM_BASE_ID + BigInt(accountId)).toString();
  }

  async getPlayerSummary(accountId: number): Promise<{
    nickname: string;
    profileUrl: string;
    avatar: string;
    locationCountry: string;
  }> {
    const steamID64 = this.steamID3To64(accountId);
    const url =
      'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/';
    const params = {
      key: this.STEAM_API_KEY,
      steamids: steamID64,
    };

    const response = await this.httpService.get(url, { params });
    const players = response.data.response.players;
    if (players && players.length > 0) {
      const player = players[0];
      return {
        nickname: player.personaname,
        profileUrl: player.profileurl,
        avatar: player.avatarfull,
        locationCountry: player.loccountrycode,
      };
    } else {
      throw new Error('Player not found');
    }
  }
}
