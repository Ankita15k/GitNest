import { jest } from '@jest/globals';

const mockSocketEmit = jest.fn();

const mockSocketTo = jest.fn(() => ({
  emit: mockSocketEmit,
}));

const mockNotificationCreate = jest.fn();

const mockNotificationLean = jest.fn();

const mockNotificationPopulate = jest.fn(() => ({
  lean: mockNotificationLean,
}));

const mockNotificationFindById = jest.fn(() => ({
  populate: mockNotificationPopulate,
}));

jest.unstable_mockModule('../src/socket/index.js', () => ({
  getIO: jest.fn(() => ({
    to: mockSocketTo,
  })),
}));

jest.unstable_mockModule(
  '../src/models/Notification.model.js',
  () => ({
    default: {
      create: mockNotificationCreate,
      findById: mockNotificationFindById,
    },
  }),
);

jest.unstable_mockModule(
  '../src/models/Repository.model.js',
  () => ({
    default: {
      findById: jest.fn(),
    },
  }),
);

jest.unstable_mockModule(
  '../src/models/PullRequest.model.js',
  () => ({
    default: {
      findOne: jest.fn(),
    },
  }),
);

const { default: eventEmitter } = await import(
  '../src/events/eventEmitter.js'
);

const { registerSocketSubscribers } = await import(
  '../src/events/socketSubscribers.js'
);

const flushPromises = async () => {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
};

describe('Socket notification subscribers', () => {
  beforeEach(() => {
    eventEmitter.removeAllListeners();

    jest.clearAllMocks();

    mockNotificationCreate.mockResolvedValue({
      _id: 'notification-id',
    });

    mockNotificationLean.mockResolvedValue({
      _id: 'notification-id',
      recipient: 'recipient-user-id',
      type: 'USER_FOLLOWED',
      message: 'actor-user started following you',
    });

    registerSocketSubscribers();
  });

  afterAll(() => {
    eventEmitter.removeAllListeners();
  });

  test('creates and emits a notification for USER_FOLLOWED', async () => {
    eventEmitter.emit('USER_FOLLOWED', {
      targetId: 'recipient-user-id',
      actorId: 'actor-user-id',
      actorUsername: 'actor-user',
    });

    await flushPromises();

    expect(mockNotificationCreate).toHaveBeenCalledWith({
      recipient: 'recipient-user-id',
      type: 'USER_FOLLOWED',
      actor: 'actor-user-id',
      repository: undefined,
      message: 'actor-user started following you',
      metadata: {
        targetId: 'recipient-user-id',
        actorId: 'actor-user-id',
        actorUsername: 'actor-user',
      },
    });

    expect(mockNotificationFindById).toHaveBeenCalledWith(
      'notification-id',
    );

    expect(mockNotificationPopulate).toHaveBeenCalledWith(
      'actor',
      'username avatarUrl',
    );

    expect(mockSocketTo).toHaveBeenCalledWith(
      'user:recipient-user-id',
    );

    expect(mockSocketEmit).toHaveBeenCalledWith(
      'notification',
      expect.objectContaining({
        _id: 'notification-id',
        recipient: 'recipient-user-id',
        type: 'USER_FOLLOWED',
      }),
    );
  });

  test('does not create or emit a notification when target user is missing', async () => {
    eventEmitter.emit('USER_FOLLOWED', {
      actorId: 'actor-user-id',
      actorUsername: 'actor-user',
    });

    await flushPromises();

    expect(mockNotificationCreate).not.toHaveBeenCalled();
    expect(mockSocketTo).not.toHaveBeenCalled();
    expect(mockSocketEmit).not.toHaveBeenCalled();
  });

  test('handles notification persistence failures without throwing', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockNotificationCreate.mockRejectedValueOnce(
      new Error('Database unavailable'),
    );

    expect(() => {
      eventEmitter.emit('USER_FOLLOWED', {
        targetId: 'recipient-user-id',
        actorId: 'actor-user-id',
        actorUsername: 'actor-user',
      });
    }).not.toThrow();

    await flushPromises();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Socket notification error [USER_FOLLOWED]:',
      'Database unavailable',
    );

    expect(mockSocketEmit).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});