import { logger } from '@djedi/log';
import test from 'ava';
import { ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { close, mongo } from './db';
import { insertOne } from './index';
import { Event, WithId } from './interfaces';

test('insertOne', async t => {
  try {
    const mongod = new MongoMemoryServer();
    const connectionString = await mongod.getConnectionString();

    interface A {
      a: string;
      _id?: string;
    }

    const a = await insertOne<A>('co', { a: 'a' }, { connectionString });
    t.is(a.acknowledged, true);

    const data = await (await mongo(connectionString))
      .collection('co')
      .find()
      .toArray();
    t.deepEqual(data, [{ a: 'a', _id: new ObjectId(a.insertedId) }]);

    const events = await (await mongo(connectionString))
      .collection<WithId<Event<A>>>('events')
      .find()
      .toArray();
    t.deepEqual(
      events.map(({ _id, timestamp, ...event }) => event),
      [
        {
          oid: a.insertedId,
          type: 'insertOne',
          collection: 'co',
          payload: { a: 'a', _id: a.insertedId },
        },
      ]
    );

    await close(connectionString);
    await mongod.stop();
  } catch (e) {
    logger.error(`Error in insertOne: ${(e as any).message}`, e);
  }
});
