import { Test, TestingModule } from '@nestjs/testing';
import { RecentRecordsService } from './recent-records.service';
import { SurfPrismaService } from '../../../shared/prisma/surf.service';
import { PaginatorService } from 'src/modules/helpers/services/paginator.service';
import { CountryFlagService } from '../../country-flag/country-flag.service';
import { SteamService } from '../../steam/steam.service';
import { SurfRecentRecordsQueryDto } from './dto/recent-records-query.dto';
import { Style } from '../constants/styles.enum';
import { Track } from '../constants/tracks.enum';

describe('RecentRecordsService', () => {
  let service: RecentRecordsService;

  // mocks
  const mockPrismaService = {};
  const mockPaginatorService = { paginate: jest.fn() };
  const mockCountryFlagService = { getFlag: jest.fn() };
  const mockSteamService = { getAvatarUrl: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecentRecordsService,
        { provide: SurfPrismaService, useValue: mockPrismaService },
        { provide: PaginatorService, useValue: mockPaginatorService },
        { provide: CountryFlagService, useValue: mockCountryFlagService },
        { provide: SteamService, useValue: mockSteamService },
      ],
    }).compile();

    service = module.get<RecentRecordsService>(RecentRecordsService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('calls paginator.paginate with a queryable and returns meta & links unchanged', async () => {
    const metaStub = { total: 1, page: 1, pageSize: 10 };
    const linksStub = { first: '', prev: '', next: '', last: '' };

    // Set paginate to return empty items
    mockPaginatorService.paginate.mockResolvedValue({
      items: [],
      meta: metaStub,
      links: linksStub,
    });

    const dto = new SurfRecentRecordsQueryDto();
    dto.page = 2;
    dto.pageSize = 5;
    dto.map = 'surf_utopia';
    dto.style = 0;
    dto.track = 1;

    const result = await service.getRecentRecords(dto);

    // paginate called exactly once
    expect(mockPaginatorService.paginate).toHaveBeenCalledTimes(1);

    // First argument is an object with `query` and `count` functions
    const [queryableArg] = mockPaginatorService.paginate.mock.calls[0];
    expect(queryableArg).toEqual({
      query: expect.any(Function),
      count: expect.any(Function),
    });

    // Service should return meta & links as-is
    expect(result.meta).toBe(metaStub);
    expect(result.links).toBe(linksStub);
    expect(result.data).toEqual([]);
  });

  it('maps raw records into SurfRecentRecordDto correctly', async () => {
    // raw record shape as returned by Prisma
    const rawRecord = {
      date: 1622470423,
      map: 'surf_utopia',
      country: 'BR',
      steamId: 'STEAM_1:0:12345',
      runTimeDifference: 150,
      style: 1, // Sideways
      tier: 3,
      track: 0, // Main
    };

    const metaStub = { total: 1, page: 1, pageSize: 10 };
    const linksStub = { first: '', prev: '', next: '', last: '' };

    mockPaginatorService.paginate.mockResolvedValue({
      items: [rawRecord],
      meta: metaStub,
      links: linksStub,
    });

    // stub dependent services
    mockCountryFlagService.getFlag.mockReturnValue('🇧🇷');
    mockSteamService.getAvatarUrl.mockResolvedValue(
      'https://avatars.example/steam123.png',
    );

    const dto = new SurfRecentRecordsQueryDto();
    dto.page = 1;
    dto.pageSize = 10;

    const result = await service.getRecentRecords(dto);

    expect(result.data).toHaveLength(1);
    const mapped = result.data[0];

    // basic fields passthrough
    expect(mapped.date).toBe(rawRecord.date);
    expect(mapped.map).toBe(rawRecord.map);

    // transformations
    expect(mapped.countryFlag).toBe('🇧🇷');
    expect(mapped.avatarUrl).toBe('https://avatars.example/steam123.png');
    expect(mapped.runTimeDifference).toBe(rawRecord.runTimeDifference);

    // enum lookups
    expect(mapped.style).toBe(Style[rawRecord.style]);
    expect(mapped.tier).toBe(rawRecord.tier);
    expect(mapped.track).toBe(Track[rawRecord.track]);

    // also meta/links
    expect(result.meta).toBe(metaStub);
    expect(result.links).toBe(linksStub);
  });
});
