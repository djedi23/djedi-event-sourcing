import test from 'ava';
import { Event } from './interfaces';
import { snapshot } from './snapshot';

test('snapshot insertOne', async t => {
  interface A {
    a: string;
    _id?: string;
  }

  const history: Array<Event<A>> = [
    {
      oid: '45444367423',
      type: 'insertOne',
      collection: 'co',
      payload: { a: 'a', _id: '45444367423' },
      timestamp: new Date(),
    },
  ];

  t.deepEqual(snapshot(history), { a: 'a', _id: '45444367423' });
});

test('snapshot updateOne', async t => {
  interface A {
    a: string;
    b?: string;
    c?: any;
    _id?: string;
  }

  const history: Array<Event<A>> = [
    {
      oid: '45444367423',
      type: 'insertOne',
      collection: 'co',
      payload: { a: 'a', _id: '45444367423' },
      timestamp: new Date(),
    },
    {
      type: 'updateOne',
      collection: 'co',
      filter: { _id: '45444367423' },
      update: { _set: { a: 'b' } },
      oid: '45444367423',
      timestamp: new Date(),
    },
    {
      type: 'updateOne',
      collection: 'co',
      filter: { _id: '45444367423' },
      update: { _set: { b: 'b' } },
      oid: '45444367423',
      timestamp: new Date(),
    },
    {
      type: 'updateOne',
      collection: 'co',
      filter: {
        _id: '45444367423',
      },
      update: {
        _set: {
          a: 'c',
          b: 'd',
        },
      },
      oid: '45444367423',
      timestamp: new Date(),
    },
    {
      type: 'updateOne',
      collection: 'co',
      filter: {
        _id: '45444367423',
      },
      update: {
        _set: {
          c__a: [1, 2, 3],
        },
      },
      oid: '45444367423',
      timestamp: new Date(),
    },
  ];

  t.deepEqual(snapshot(history), {
    a: 'c',
    b: 'd',
    c: {
      a: [1, 2, 3],
    },
    _id: '45444367423',
  });
});

test('snapshot updateOne addToSet', async t => {
  interface A {
    a: string[];
    _id?: string;
  }

  const history: Array<Event<A>> = [
    {
      oid: '45444367423',
      type: 'insertOne',
      collection: 'co',
      payload: { a: ['a'], _id: '45444367423' },
      timestamp: new Date(),
    },
    {
      type: 'updateOne',
      collection: 'co',
      filter: { _id: '45444367423' },
      update: { _addToSet: { a: 'b' } },
      oid: '45444367423',
      timestamp: new Date(),
    },
  ];

  t.deepEqual(snapshot(history), { _id: '45444367423', a: ['a', 'b'] });
});
