import express from 'express';
import jwt from 'jsonwebtoken';
import request from 'supertest';

import notificationRoutes from '../src/routes/notification.routes.js';
import errorHandler from '../src/middleware/errorHandler.js';
import User from '../src/models/User.model.js';
import Notification from '../src/models/Notification.model.js';

process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'notification-test-secret';

const createTestApp = () => {
  const app = express();

  app.use(express.json());
  app.use('/api/v1/notifications', notificationRoutes);
  app.use(errorHandler);

  return app;
};

const app = createTestApp();

const createUserAndToken = async ({
  username,
  email,
}) => {
  const user = await User.create({
    username,
    email,
    password: 'Password123',
  });

  const token = jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: '1h' },
  );

  return { user, token };
};

describe('Notification API', () => {
  let recipient;
  let recipientToken;
  let secondUser;
  let actor;

  beforeEach(async () => {
    const recipientAuth = await createUserAndToken({
      username: 'notification-recipient',
      email: 'notification-recipient@gitnest.test',
    });

    const secondUserAuth = await createUserAndToken({
      username: 'notification-second-user',
      email: 'notification-second-user@gitnest.test',
    });

    actor = await User.create({
      username: 'notification-actor',
      email: 'notification-actor@gitnest.test',
      password: 'Password123',
    });

    recipient = recipientAuth.user;
    recipientToken = recipientAuth.token;
    secondUser = secondUserAuth.user;
  });

  test('rejects unauthenticated notification requests', async () => {
    const response = await request(app)
      .get('/api/v1/notifications');

    expect(response.statusCode).toBe(401);
  });

  test('returns paginated notifications belonging only to the authenticated user', async () => {
    await Notification.create([
      {
        recipient: recipient._id,
        actor: actor._id,
        type: 'USER_FOLLOWED',
        message: 'First notification',
      },
      {
        recipient: recipient._id,
        actor: actor._id,
        type: 'USER_FOLLOWED',
        message: 'Second notification',
      },
      {
        recipient: secondUser._id,
        actor: actor._id,
        type: 'USER_FOLLOWED',
        message: 'Another user notification',
      },
    ]);

    const response = await request(app)
      .get('/api/v1/notifications?page=1&limit=1')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.notifications).toHaveLength(1);

    expect(response.body.data.pagination).toEqual({
      page: 1,
      limit: 1,
      total: 2,
      pages: 2,
    });

    expect(
      response.body.data.notifications[0].recipient.toString(),
    ).toBe(recipient._id.toString());

    expect(response.body.data.notifications[0].actor).toMatchObject({
      username: actor.username,
    });
  });

  test('returns the unread notification count for the authenticated user', async () => {
    await Notification.create([
      {
        recipient: recipient._id,
        type: 'USER_FOLLOWED',
        message: 'Unread notification one',
        read: false,
      },
      {
        recipient: recipient._id,
        type: 'USER_FOLLOWED',
        message: 'Unread notification two',
        read: false,
      },
      {
        recipient: recipient._id,
        type: 'USER_FOLLOWED',
        message: 'Already read notification',
        read: true,
      },
      {
        recipient: secondUser._id,
        type: 'USER_FOLLOWED',
        message: 'Other user unread notification',
        read: false,
      },
    ]);

    const response = await request(app)
      .get('/api/v1/notifications/unread-count')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.count).toBe(2);
  });

  test('marks a notification owned by the authenticated user as read', async () => {
    const notification = await Notification.create({
      recipient: recipient._id,
      actor: actor._id,
      type: 'USER_FOLLOWED',
      message: 'Please read me',
    });

    expect(notification.read).toBe(false);

    const response = await request(app)
      .patch(
        `/api/v1/notifications/${notification._id}/read`,
      )
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.read).toBe(true);

    const updatedNotification =
      await Notification.findById(notification._id);

    expect(updatedNotification.read).toBe(true);
  });

  test('does not allow a user to mark another user notification as read', async () => {
    const notification = await Notification.create({
      recipient: secondUser._id,
      actor: actor._id,
      type: 'USER_FOLLOWED',
      message: 'Private notification',
    });

    const response = await request(app)
      .patch(
        `/api/v1/notifications/${notification._id}/read`,
      )
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe(
      'Notification not found',
    );

    const unchangedNotification =
      await Notification.findById(notification._id);

    expect(unchangedNotification.read).toBe(false);
  });

  test('marks all unread notifications of the authenticated user as read', async () => {
    await Notification.create([
      {
        recipient: recipient._id,
        type: 'USER_FOLLOWED',
        message: 'Recipient notification one',
        read: false,
      },
      {
        recipient: recipient._id,
        type: 'USER_FOLLOWED',
        message: 'Recipient notification two',
        read: false,
      },
      {
        recipient: secondUser._id,
        type: 'USER_FOLLOWED',
        message: 'Second user notification',
        read: false,
      },
    ]);

    const response = await request(app)
      .patch('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${recipientToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.data.message).toBe(
      'All notifications marked as read',
    );

    const recipientUnreadCount =
      await Notification.countDocuments({
        recipient: recipient._id,
        read: false,
      });

    const secondUserUnreadCount =
      await Notification.countDocuments({
        recipient: secondUser._id,
        read: false,
      });

    expect(recipientUnreadCount).toBe(0);
    expect(secondUserUnreadCount).toBe(1);
  });
});