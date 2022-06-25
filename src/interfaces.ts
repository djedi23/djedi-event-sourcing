import {
  Filter,
  MatchKeysAndValues,
  ObjectId,
  PushOperator,
  SetFields,
  UpdateOptions,
} from 'mongodb';
export { WithId } from 'mongodb';

//type WithId<TSchema> = TSchema & { _id: string | ObjectId };

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
  filter: Filter<T>;
  update: StorableUpdateFilter<T>;
  options?: UpdateOptions;
}

/**
 */
export interface Options {
  connectionString?: string;
}

/**
 */
export interface StorableUpdateFilter<T> {
  _set?: MatchKeysAndValues<T>;
  _push?: PushOperator<T>;
  _addToSet?: SetFields<T>;
}
