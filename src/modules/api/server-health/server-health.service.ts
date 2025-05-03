import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import * as query from 'source-server-query';

interface IPlayerInfo {
  name: string;
  score: number;
  duration: number;
}

interface IServerInfo {
  name: string;
  address: string;
  map: string;
  players: string;
  bots: number;
  serverType: string;
  environment: string;
  visibility: string;
  vac: string;
  version: string;
  playerList: IPlayerInfo[];
}

interface IHealthCheckResponse {
  ip: string;
  timestamp: Date;
  servers: IServerInfo[];
}

@Injectable()
export class ServerHealthService {
  private cache: IHealthCheckResponse | null = null;
  private lastCacheTime = 0;
  private readonly CACHE_TTL = 30 * 1000; // 30 seconds

  constructor(private readonly httpService: HttpService) {}

  private async fetchIServerInfo(
    ip: string,
    port: number,
  ): Promise<IServerInfo | null> {
    try {
      const info = await query.info(ip, port, 1500);
      const players = await query.players(ip, port, 1500);

      // mappings
      const serverTypeMap: Record<string, string> = {
        d: 'dedicated',
        l: 'listen',
        p: 'SourceTV proxy',
      };
      const environmentMap: Record<string, string> = {
        l: 'Linux',
        w: 'Windows',
        m: 'macOS',
        o: 'macOS',
      };
      const visibilityMap: Record<number, string> = {
        0: 'public',
        1: 'private',
      };
      const vacStatusMap: Record<number, string> = {
        0: 'disabled',
        1: 'enabled',
      };

      return {
        name: info.name ?? 'Unnamed Server',
        address: `${ip}:${port}`,
        map: info.map ?? 'N/A',
        players: `${info.players ?? 'N/A'}/${info.max_players ?? 'N/A'}`,
        bots: info.bots ?? 0,
        serverType: serverTypeMap[info.server_type] ?? info.server_type,
        environment: environmentMap[info.environment] ?? info.environment,
        visibility: visibilityMap[info.visibility] ?? String(info.visibility),
        vac: vacStatusMap[info.vac] ?? String(info.vac),
        version: info.version ?? 'unknown',
        playerList: players.map((p) => ({
          name: p.name,
          score: p.score,
          duration: p.duration,
        })),
      };
    } catch {
      // unreachable or offline
      return null;
    }
  }

  async getHealthCheck(): Promise<IHealthCheckResponse> {
    const now = Date.now();
    if (this.cache && now - this.lastCacheTime < this.CACHE_TTL) {
      return this.cache;
    }

    const ip = process.env.SERVER_IP;
    const ports = Array.from({ length: 11 }, (_, i) => 27015 + i);

    const infos = await Promise.all(
      ports.map((port) => this.fetchIServerInfo(ip, port)),
    );
    const servers = infos.filter((s): s is IServerInfo => s !== null);

    const result: IHealthCheckResponse = {
      ip,
      timestamp: new Date(),
      servers,
    };

    this.cache = result;
    this.lastCacheTime = now;
    return result;
  }
}
