import conf from '@djedi/configuration';
import { logger } from '@djedi/log';
import { Db, MongoClient } from 'mongodb';

let db: Db | null = null;
let dbs: { [id: string]: Db } = {};
let conns: { [id: string]: MongoClient } = {};

export const mongo = async (connectionUrl?: string, options?: any): Promise<Db> => {
  if (connectionUrl && dbs[connectionUrl]) return dbs[connectionUrl];
  if (!db || connectionUrl) {
    const mongoUrl = connectionUrl || conf.get('mongodb:url') || 'mongodb://localhost';
    logger.debug(`Mongo url: ${mongoUrl}`);
    const mongoclient = await MongoClient.connect(mongoUrl);

    if (options) options.client = mongoclient;
    const _db = mongoclient.db(conf.get('db:database') || 'test');
    if (connectionUrl) {
      dbs[connectionUrl] = _db;
      conns[connectionUrl] = mongoclient;
      return _db;
    } else db = _db;
  }
  return db;
};

export const close = async (connectionUrl: string) => {
  if (conns[connectionUrl]) {
    await conns[connectionUrl].close();
    // tslint:disable-next-line:no-dynamic-delete
    delete dbs[connectionUrl];
    // tslint:disable-next-line:no-dynamic-delete
    delete conns[connectionUrl];
  }
};
