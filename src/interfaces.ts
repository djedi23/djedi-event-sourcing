import { FilterQuery, MatchKeysAndValues, PushOperator, SetFields, UpdateOneOptions } from 'mongodb';

/**
 */
export type Event<T> = EventInsertOne<T> | EventUpdateOne<T>;

/**
 */
interface EventBase {
  //  _id?: string;
  collection: string;
  oid: unknown;
  timestamp?: Date;
}

/**
 */
export interface EventInsertOne<T> extends EventBase {
  type: 'insertOne';
  payload: T;
}

/**
 */
export interface EventUpdateOne<T> extends EventBase {
  type: 'updateOne';
  filter: FilterQuery<T>;
  update: StorableUpdateQuery<T>;
  options?: UpdateOneOptions;
}

/**
 */
export interface Options {
  connectionString?: string;
}

/**
 */
export interface StorableUpdateQuery<T> {
  _set?: MatchKeysAndValues<T>;
  _push?: PushOperator<T>;
  _addToSet?: SetFields<T>;
}
