import conf from '@djedi/configuration';
import { logger } from '@djedi/log';
import { InsertOneWriteOpResult } from 'mongodb';
import { mongo } from './db';
import { Event, Options } from './interfaces';

type WithId<TSchema> = TSchema & { _id: any };

/**
 */
export const insertOne = async <T>(
  collection: string,
  payload: T,
  option?: Options
): Promise<InsertOneWriteOpResult<WithId<T>>> => {
  try {
    const inserted = await (await mongo(option?.connectionString))
      .collection(collection)
      .insertOne(payload);
    const evt: Event<T> = {
      type: 'insertOne',
      collection,
      payload,
      timestamp: new Date(),
      oid: inserted.insertedId,
    };

    await (await mongo(option?.connectionString))
      .collection<Event<T>>(conf.get('events:collection') || 'events')
      .insertOne(evt);
    return inserted;
  } catch (error) {
    logger.error(`Error in insertOne: ${error.message}`, error);
    throw error;
  }
};
