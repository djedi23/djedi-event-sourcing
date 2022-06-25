import 'lodash';
import { MatchKeysAndValues, UpdateFilter } from 'mongodb';
import { StorableUpdateFilter } from './interfaces';

export const cleanKeys = <T>(query: MatchKeysAndValues<T>) => {
  const transformed: any = {};
  Object.entries(query).forEach(([key, value]) => {
    transformed[key.replace('.', '__')] = value;
  });

  return transformed;
};

export const cleanUpdater = <T>(update: UpdateFilter<T>): StorableUpdateFilter<T> => {
  const transformed: StorableUpdateFilter<T> = {};
  if (update.$addToSet) transformed._addToSet = cleanKeys(update.$addToSet);
  if (update.$set) transformed._set = cleanKeys(update.$set);
  if (update.$push) transformed._push = cleanKeys(update.$push);
  return transformed;
};

export const restoreKeys = <T>(query: MatchKeysAndValues<T>) => {
  const transformed: any = {};
  Object.entries(query).forEach(([key, value]) => {
    transformed[key.replace('__', '.')] = value;
  });

  return transformed;
};

export const restoreUpdater = <T>(updater: StorableUpdateFilter<T>): UpdateFilter<T> => {
  const restored: UpdateFilter<T> = {};
  if (updater._set) restored['$set'] = restoreKeys(updater._set);
  if (updater._addToSet) restored['$addToSet'] = restoreKeys(updater._addToSet);
  if (updater._push) restored['$push'] = restoreKeys(updater._push);
  return restored;
};
