import { update } from 'sp2';
import { Event } from './interfaces';
import { restoreUpdater } from './transform';

export const snapshot = <T extends object>(events: Array<Event<T>>): T => {
  let obj: T = Object();

  events.forEach(event => {
    switch (event.type) {
      case 'insertOne': {
        obj = event.payload;
        break;
      }
      case 'updateOne': {
        obj = update(obj, restoreUpdater(event.update)) as T;
        break;
      }
    }
  });

  return obj;
};
