import test from 'ava';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { update as updateObj } from 'sp2';
import { close, mongo } from './db';
import { insertOne, updateOne } from './index';
import { Event } from './interfaces';
import { snapshot } from './snapshot';

type WithId<TSchema> = TSchema & { _id: any };

test('$set', t => {
  const obj: any = { a: 'a' };
  const obj1 = updateObj(obj, { $set: { b: 'b' } });
  t.deepEqual(obj1, { a: 'a', b: 'b' });

  const obj2 = updateObj(obj, { $set: { 'e.b.c': 3 } });
  t.deepEqual(obj2, { a: 'a', e: { b: { c: 3 } } });

  const objArr = { e: { b: [{ c: 1 }, { c: 2 }, { c: 3 }] } };
  const obj3: any = updateObj(objArr, { $set: { 'e.b[0].c': 3 } });
  t.deepEqual(obj3, { e: { b: [{ c: 3 }, { c: 2 }, { c: 3 }] } });
});

test('snapshot === mongo data', async t => {
  const mongod = new MongoMemoryServer();
  const connectionString = await mongod.getConnectionString();
  interface A {
    a: string[];
    b?: string;
    c?: any;
    d?: string;
    _id?: string;
  }

  const a = await insertOne<A>('co', { a: [] }, { connectionString });
  const insertedId = a.insertedId;
  t.deepEqual(a.result, { ok: 1, n: 1 });
  t.deepEqual(a.ops, [{ a: [], _id: insertedId }]);

  await updateOne<A>('co', { _id: insertedId }, { $set: { d: 'b' } }, {}, { connectionString });
  await updateOne<A>('co', { _id: insertedId }, { $set: { b: 'b' } }, {}, { connectionString });
  await updateOne<A>(
    'co',
    { _id: insertedId },
    { $set: { d: 'c', b: 'd' } },
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
  await updateOne<A>(
    'co',
    { _id: insertedId },
    { $addToSet: { 'c.a': 'b' } },
    {},
    { connectionString }
  );

  const data = await (await mongo(connectionString))
    .collection('co')
    .find()
    .toArray();
  t.deepEqual(data, [
    {
      a: [],
      b: 'd',
      c: {
        a: [1, 2, 3, 'b'],
      },
      d: 'c',
      _id: insertedId,
    },
  ]);

  const events = await (await mongo(connectionString))
    .collection<WithId<Event<A>>>('events')
    .find()
    .sort({ timestamp: 1 })
    .toArray();

  t.deepEqual(snapshot<A>(events), {
    a: [],
    b: 'd',
    c: {
      a: [1, 2, 3, 'b'],
    },
    d: 'c',
    _id: insertedId,
  });

  t.deepEqual(
    events.map(({ _id, timestamp, ...event }) => event),
    [
      {
        type: 'insertOne',
        collection: 'co',
        payload: {
          a: [],
          _id: insertedId,
        },
        oid: insertedId,
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        options: {},
        update: {
          _set: {
            d: 'b',
          },
        },
        oid: insertedId,
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        options: {},
        update: {
          _set: {
            b: 'b',
          },
        },
        oid: insertedId,
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        options: {},
        update: {
          _set: {
            d: 'c',
            b: 'd',
          },
        },
        oid: insertedId,
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        options: {},
        update: {
          _set: {
            c__a: [1, 2, 3],
          },
        },
        oid: insertedId,
      },
      {
        type: 'updateOne',
        collection: 'co',
        filter: {
          _id: insertedId,
        },
        options: {},
        update: {
          _addToSet: {
            c__a: 'b',
          },
        },
        oid: insertedId,
      },
    ]
  );

  await close(connectionString);
  await mongod.stop();
});
