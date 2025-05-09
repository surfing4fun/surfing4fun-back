import { UsersService } from '../../../users/users.service';
import { SteamAuthStrategy } from '../steam.strategy';

describe('SteamAuthStrategy', () => {
  let strategy: SteamAuthStrategy;
  let usersService: Partial<UsersService>;
  let done: jest.Mock;

  beforeEach(() => {
    usersService = {
      findBySteamId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    strategy = new SteamAuthStrategy(usersService as UsersService);
    done = jest.fn();
  });

  function makeProfile(id = 'STEAM_1:2:3456', name = 'Gamer123') {
    return {
      id,
      displayName: name,
      _json: {
        avatarmedium: 'http://avatar.url/medium.jpg',
        profileurl: 'http://steamcommunity/profile/123',
      },
    } as any;
  }

  it('should create a new user when none exists', async () => {
    const profile = makeProfile();
    // findBySteamId returns null → triggers create()
    (usersService.findBySteamId as jest.Mock).mockResolvedValue(null);

    const createdUser = {
      id: 99,
      steamId: profile.id,
      name: profile.displayName,
    };
    (usersService.create as jest.Mock).mockResolvedValue(createdUser);

    await strategy.validate('ignoredIdentifier', profile, done);

    // findBySteamId called with steamId and true
    expect(usersService.findBySteamId).toHaveBeenCalledWith(profile.id, true);

    // create called once with the exact fields
    expect(usersService.create).toHaveBeenCalledWith({
      steamId: profile.id,
      name: profile.displayName,
      roleId: 3,
      avatar: profile._json.avatarmedium,
      profile: profile._json.profileurl,
    });

    // update should NOT have been called
    expect(usersService.update).not.toHaveBeenCalled();

    // done called with null error and the created user
    expect(done).toHaveBeenCalledWith(null, createdUser);
  });

  it('should update an existing user when one is found', async () => {
    const profile = makeProfile('STEAM_7:8:91011', 'ProGamer');
    const existingUser = { id: 123, steamId: profile.id, name: 'OldName' };
    // findBySteamId returns an existing user
    (usersService.findBySteamId as jest.Mock).mockResolvedValue(existingUser);

    const updatedUser = { ...existingUser, avatar: profile._json.avatarmedium };
    (usersService.update as jest.Mock).mockResolvedValue(updatedUser);

    await strategy.validate('ignoredIdentifier', profile, done);

    // findBySteamId still called first
    expect(usersService.findBySteamId).toHaveBeenCalledWith(profile.id, true);

    // create should NOT have been called
    expect(usersService.create).not.toHaveBeenCalled();

    // update called once with id and the avatar/profile fields
    expect(usersService.update).toHaveBeenCalledWith(existingUser.id, {
      avatar: profile._json.avatarmedium,
      profile: profile._json.profileurl,
    });

    // done called with null error and the updated user
    expect(done).toHaveBeenCalledWith(null, updatedUser);
  });
});
