import test from 'ava';
import { cleanKeys, cleanUpdater, restoreKeys, restoreUpdater } from './transform';

test('cleanUpdater $set', async t => {
  t.deepEqual(cleanUpdater({ $set: { a: 'b' } }), { _set: { a: 'b' } });
});

test('cleanKey dot', async t => {
  t.deepEqual(cleanKeys({ 'a.b': 5 }), { a__b: 5 });
});

test('restoreUpdater $set', async t => {
  t.deepEqual(restoreUpdater({ _set: { a: 'b' } }), { $set: { a: 'b' } });
});

test('restoreKey dot', async t => {
  t.deepEqual(restoreKeys({ a__b: 5 }), { 'a.b': 5 });
});

test('cleanUpdater $push', async t => {
  t.deepEqual(cleanUpdater({ $push: { a: 'b' } }), { _push: { a: 'b' } });
});
test('restoreUpdater $push', async t => {
  t.deepEqual(restoreUpdater({ _push: { a: 'b' } }), { $push: { a: 'b' } });
});

test('cleanUpdater $addToSet', async t => {
  t.deepEqual(cleanUpdater({ $addToSet: { a: 'b' } }), { _addToSet: { a: 'b' } });
});
test('restoreUpdater $addToSet', async t => {
  t.deepEqual(restoreUpdater({ _addToSet: { a: 'b' } }), { $addToSet: { a: 'b' } });
});
