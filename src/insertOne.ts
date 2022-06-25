import conf from '@djedi/configuration';
import { logger } from '@djedi/log';
import { InsertOneResult } from 'mongodb';
import { mongo } from './db';
import { Event, Options, WithId } from './interfaces';

/**
 */
export const insertOne = async <T>(
  collection: string,
  payload: T,
  option?: Options
): Promise<InsertOneResult<WithId<T>>> => {
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
    logger.error(`Error in insertOne: ${(error as any).message}`, error);
    throw error;
  }
};
