import conf from '@djedi/configuration';
import { logger } from '@djedi/log';
import { FilterQuery, UpdateOneOptions, UpdateQuery, UpdateWriteOpResult } from 'mongodb';
import { mongo } from './db';
import { Event, Options } from './interfaces';
import { cleanUpdater } from './transform';

const saveUpdateOneEvent = async <T extends { _id: unknown }>(
  collection: string,
  filter: FilterQuery<T>,
  update: UpdateQuery<T>,
  options?: UpdateOneOptions,
  option?: Options
) => {
  const document: T | null = await (await mongo(option?.connectionString))
    .collection<T>(collection)
    .findOne(filter);

  const evt: Event<T> = {
    type: 'updateOne',
    collection,
    filter,
    update: cleanUpdater(update),
    options,
    timestamp: new Date(),
    oid: document?._id,
  };

  return (await mongo(option?.connectionString))
    .collection<Event<T>>(conf.get('events:collection') || 'events')
    .insertOne(evt);
};

export const updateOne = async <T>(
  collection: string,
  filter: FilterQuery<T>,
  update: UpdateQuery<T>,
  options?: UpdateOneOptions,
  connectionOption?: Options
): Promise<UpdateWriteOpResult> => {
  try {
    saveUpdateOneEvent(collection, filter, update, options, connectionOption);
    return (await mongo(connectionOption?.connectionString))
      .collection<T>(collection)
      .updateOne(filter, update, options);
  } catch (error) {
    logger.error(`Error in updateOne: ${error.message}`, error);
    throw error;
  }
};
