import test from 'ava';
import { ObjectId, WithId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { close, mongo } from './db';
import { insertOne, updateOne } from './index';
import { Event } from './interfaces';

test('updateOne $set 1', async t => {
  const mongod = new MongoMemoryServer();
  const connectionString = await mongod.getConnectionString();
  interface A {
    a: string;
    _id?: string;
  }

  const a = await insertOne<A>('co', { a: 'a' }, { connectionString });
  const insertedId = a.insertedId;
  t.is(a.acknowledged, true);
  //  t.deepEqual(a.ops, [{ a: 'a', _id: insertedId }]);

  const m = await updateOne<A>(
    'co',
    { _id: insertedId },
    { $set: { a: 'b' } },
    {},
    { connectionString }
  );

  t.is(m.acknowledged, true);
  t.is(m.modifiedCount, 1);

  const data = await (await mongo(connectionString))
    .collection('co')
    .find()
    .toArray();
  t.deepEqual(data, [{ a: 'b', _id: new ObjectId(insertedId) }]);

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
      {
        type: 'updateOne',
        collection: 'co',
        filter: { _id: insertedId },
        update: { _set: { a: 'b' } },
        oid: insertedId,
        options: {},
      },
    ]
  );

  await close(connectionString);
  await mongod.stop();
});

test('updateOne $set 2', async t => {
  const mongod = new MongoMemoryServer();
  const connectionString = await mongod.getConnectionString();
  interface A {
    a: string;
    _id?: string;
  }

  const a = await insertOne<A>('co', { a: 'a' }, { connectionString });
  const insertedId = a.insertedId;
  await updateOne<A>('co', { _id: insertedId }, { $set: { a: 'b' } }, {}, { connectionString });
  await updateOne<A>('co', { _id: insertedId }, { $set: { b: 'b' } }, {}, { connectionString });
  await updateOne<A>(
    'co',
    { _id: insertedId },
    { $set: { a: 'c', b: 'd' } },
    {},
    { connectionString }
  );
  await updateOne<A>(
    'co',
    { _id: insertedId },
    { $set: { 'c.a': [1, 2, 3] } },
    {},
    { connectionString }
  );

  const data = await (await mongo(connectionString))
    .collection('co')
    .find()
    .toArray();
  t.deepEqual(data, [
    {
      a: 'c',
      b: 'd',
      c: {
        a: [1, 2, 3],
      },
      _id: new ObjectId(insertedId),
    },
  ]);

  const events = await (await mongo(connectionString))
    .collection<WithId<Event<A>>>('events')
    .find()
    .sort({ timestamp: 1 })
    .toArray();
  t.deepEqual(
    events.map(({ _id, timestamp, ...event }) => event),
    [
      { oid: insertedId, type: 'insertOne', collection: 'co', payload: { a: 'a', _id: insertedId } },
      {
        type: 'updateOne',
        collection: 'co',
        filter: { _id: insertedId },
        update: { _set: { a: 'b' } },
        oid: insertedId,
        options: {},
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: { _id: insertedId },
        update: { _set: { b: 'b' } },
        oid: insertedId,
        options: {},
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        update: {
          _set: {
            a: 'c',
            b: 'd',
          },
        },
        oid: insertedId,
        options: {},
      },
      {
        type: 'updateOne',
        collection: 'co',
        options: {},
        filter: {
          _id: insertedId,
        },
        update: {
          _set: {
            c__a: [1, 2, 3],
          },
        },
        oid: insertedId,
      },
    ]
  );

  await close(connectionString);
  await mongod.stop();
});

test('updateOne $addToSet', async t => {
  const mongod = new MongoMemoryServer();
  const connectionString = await mongod.getConnectionString();
  interface A {
    a: string[];
    _id?: string;
  }

  const a = await insertOne<A>('co', { a: [] }, { connectionString });
  const insertedId = a.insertedId;
  t.is(a.acknowledged, true);
  //  t.deepEqual(a.ops, [{ a: [], _id: insertedId }]);

  const m = await updateOne<A>(
    'co',
    { _id: insertedId },
    { $addToSet: { a: 'b' } },
    {},
    { connectionString }
  );

  t.is(m.acknowledged, true);
  t.is(m.modifiedCount, 1);

  const data = await (await mongo(connectionString))
    .collection('co')
    .find()
    .toArray();
  t.deepEqual(data, [{ a: ['b'], _id: new ObjectId(insertedId) }]);

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
        payload: { a: [], _id: a.insertedId },
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: { _id: insertedId },
        update: { _addToSet: { a: 'b' } },
        oid: insertedId,
        options: {},
      },
    ]
  );

  await close(connectionString);
  await mongod.stop();
});
