import conf from '@djedi/configuration';
import { logger } from '@djedi/log';
import { Filter, InferIdType, UpdateFilter, UpdateOptions, UpdateResult } from 'mongodb';
import { mongo } from './db';
import { Event, Options, WithId } from './interfaces';
import { cleanUpdater } from './transform';

const saveUpdateOneEvent = async <T>(
  collection: string,
  filter: Filter<T>,
  update: UpdateFilter<T>,
  options?: UpdateOptions,
  option?: Options
) => {
  const document: WithId<T> | null = await (await mongo(option?.connectionString))
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
  filter: Filter<T>,
  update: UpdateFilter<T>,
  options?: UpdateOptions,
  connectionOption?: Options
): Promise<UpdateResult> => {
  try {
    saveUpdateOneEvent(collection, filter, update, options, connectionOption);
    return (await mongo(connectionOption?.connectionString))
      .collection<T>(collection)
      .updateOne(filter, update, options ?? {});
  } catch (error) {
    logger.error(`Error in updateOne: ${(error as any).message}`, error);
    throw error;
  }
};
