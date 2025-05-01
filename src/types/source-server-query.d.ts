declare module 'source-server-query' {
  export function info(
    ip: string,
    port: number,
    timeout?: number,
  ): Promise<{
    name?: string;
    map?: string;
    players?: number;
    max_players?: number;
    bots?: number;
    server_type?: string;
    environment?: string;
    visibility?: number;
    vac?: number;
    version?: string;
  }>;

  export function players(
    ip: string,
    port: number,
    timeout?: number,
  ): Promise<
    {
      name: string;
      score: number;
      duration: number;
    }[]
  >;
}
