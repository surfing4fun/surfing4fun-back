import { Test, TestingModule } from '@nestjs/testing';
import { PaginatorService } from 'src/modules/helpers/services/paginator.service';

import { SurfRecentRecordsQueryDto } from './dto/recent-records-query.dto';
import { RecentRecordsService } from './recent-records.service';

import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';
import { SteamService } from '../../steam/steam.service';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';

describe('RecentRecordsService', () => {
  let service: RecentRecordsService;

  const mockPrisma = {} as any;
  const mockPaginator: any = {
    paginateSqlAutoCount: jest.fn(),
  };
  const mockCountry: any = {
    getCountryCodeByLongIp: jest.fn(),
    getCountryFlagByCountryCode: jest.fn(),
  };
  const mockSteam: any = {
    getPlayerSummary: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecentRecordsService,
        { provide: SurfPrismaService, useValue: mockPrisma },
        { provide: PaginatorService, useValue: mockPaginator },
        { provide: CountryFlagService, useValue: mockCountry },
        { provide: SteamService, useValue: mockSteam },
      ],
    }).compile();

    service = module.get<RecentRecordsService>(RecentRecordsService);
    jest.resetAllMocks();
  });

  it('should call paginateSqlAutoCount and return meta & links unchanged', async () => {
    const meta = {
      total: 0,
      page: 2,
      pageSize: 5,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: true,
    };
    const links = {
      self: '',
      first: '',
      prev: '',
      next: '',
      last: '',
    };

    // Tell TS this is a Jest mock
    (mockPaginator.paginateSqlAutoCount as jest.Mock).mockResolvedValue({
      data: [],
      meta,
      links,
    });

    const dto = new SurfRecentRecordsQueryDto();
    dto.page = 2;
    dto.pageSize = 5;
    dto.map = 'surf_utopia';
    dto.style = Style[0];
    dto.track = Track[1];

    const result = await service.getRecentRecords(dto);

    expect(mockPaginator.paginateSqlAutoCount).toHaveBeenCalledTimes(1);
    expect(result.meta).toBe(meta);
    expect(result.links).toBe(links);
    expect(result.data).toEqual([]);
  });

  it('should map raw records into SurfRecentRecordDto correctly', async () => {
    const raw: any = {
      id: 1,
      auth: 'user123',
      map: 'surf_utopia',
      track: 0,
      time: 100,
      points: 50,
      date: 123456,
      style: 1,
      user_auth: 'user123',
      user_ip: '1.2.3.4',
      map_type: 'typeA',
      tier: 3,
      second_best_time: 80,
    };
    const meta = {
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    };
    const links = {
      self: '',
      first: '',
      prev: null,
      next: null,
      last: '',
    };

    (mockPaginator.paginateSqlAutoCount as jest.Mock).mockResolvedValue({
      data: [raw],
      meta,
      links,
    });

    mockSteam.getPlayerSummary.mockResolvedValue({
      nickname: 'Nick',
      profileUrl: '/p',
      avatar: 'ava.png',
    });
    mockCountry.getCountryCodeByLongIp.mockResolvedValue('BR');
    mockCountry.getCountryFlagByCountryCode.mockResolvedValue('🇧🇷');

    const dto = new SurfRecentRecordsQueryDto();
    dto.page = 1;
    dto.pageSize = 10;

    const result = await service.getRecentRecords(dto);

    expect(mockSteam.getPlayerSummary).toHaveBeenCalledWith(raw.auth);
    expect(mockCountry.getCountryCodeByLongIp).toHaveBeenCalledWith(
      raw.user_ip,
    );
    expect(mockCountry.getCountryFlagByCountryCode).toHaveBeenCalledWith('BR');

    const item = result.data[0];
    expect(item.date).toBe(raw.date);
    expect(item.map).toBe(raw.map);
    expect(item.mapType).toBe(raw.map_type);
    expect(item.player).toBe(raw.user_auth);
    expect(item.playerNickname).toBe('Nick');
    expect(item.playerProfileUrl).toBe('/p');
    expect(item.playerAvatar).toBe('ava.png');
    expect(item.playerLocationCountry).toBe('BR');
    expect(item.playerLocationCountryFlag).toBe('🇧🇷');
    expect(item.points).toBe(raw.points);
    expect(item.rank).toBe(1);
    expect(item.runTime).toBe(raw.time);
    expect(item.runTimeDifference).toBe(raw.time - raw.second_best_time);
    expect(item.style).toBe(Style[raw.style]);
    expect(item.tier).toBe(raw.tier);
    expect(item.track).toBe(Track[raw.track]);

    expect(result.meta).toBe(meta);
    expect(result.links).toBe(links);
  });
});
