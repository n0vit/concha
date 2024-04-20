// @ts-nocheck
import isString from 'lodash/isString';
import moment from 'moment';
import * as db from '../database/database';
import * as cache from '../../../utils/cache';

const log = console;
export class Record {
  id: string | number | any;
  created: Date;
  modified: Set<string>;
  table: string;

  readonly joinedValues: any = {};

  constructor(obj: any = {}, table: string) {
    if (!table || !isString(table)) {
      throw new Error('Table name required');
    }

    this.id = obj.id;
    this.created = obj.created;
    this.modified = obj.modified || new Set();
    this.table = table;
  }

  setJoinedValue(key: string, value: any) {
    this.joinedValues[key] = value;
  }

  isModified(field = null) {
    if (field) {
      return this.modified.has(field);
    }

    return this.modified.size > 0;
  }

  markModified(key) {
    this.modified.add(key);
  }

  set<T extends this, K extends keyof this>(key: K, value: T[K]): boolean {
    if (this[key] === value) {
      return false;
    }

    this[key] = value;

    this.markModified(key);

    return true;
  }

  cacheKeys() {
    return [`${this.table.slice(0, -1)}:${this.id}`];
  }

  cache() {
    for (let i of this.cacheKeys()) {
      cache.set(i, this as any);
    }

    return this;
  }

  uncache() {
    for (let i of this.cacheKeys()) {
      cache.del(i);
    }

    return this;
  }

  clone() {
    throw new Error('Clone not supported');
  }

  isNew() {
    return !this.id || this.modified.has('id');
  }

  toAPI(): any {
    return {
      id: this.id,
      created: moment.utc(this.created).valueOf(),
      datetime: moment.utc(this.datetime).valueOf()
    };
  }

  directInsert(data: Object) {
    const qs = `INSERT INTO ${this.table} (${Object.keys(data).join(', ')})
    VALUES (${Object.keys(data)
      .map((value, index) => `$${++index}`)
      .join(', ')})`;

    return db.query(qs, Object.values(data)).catch(err => {
      log.error(
        `[record] #${err.code} insert "${this.table}/${this.id}" record failed: "${err.message}", detail: "${err.detail}"`
      );

      if (err.code !== '23505') {
        throw new Error('ADD_FAILED');
      }
    });
  }

  save(client = null) {
    if (!this.isNew() && !this.isModified()) {
      return Promise.resolve(this);
    }

    const action = this[this.isNew() ? '_insert' : '_update'].bind(this);

    if (client) {
      return action(client);
    }

    return action(db.pool);
  }

  remove(client = null) {
    return db
      .query(
        `DELETE
         FROM ${this.table}
         WHERE id = $1`,
        [this.id],
        client
      )
      .then(() => {
        this.uncache();
        return this;
      });
  }

  _insert(client): Promise<any> {
    const modified = Array.from(this.modified);
    const qs = `INSERT INTO ${this.table} (${modified.join(', ')})
                VALUES (${modified.map((value, index) => `$${++index}`).join(', ')})
                RETURNING id, created;`;

    return db
      .query(
        qs,
        modified.map((value: any) => this[value]),
        client
      )
      .then(result => {
        this.id = result.rows[0].id;
        this.created = this.datetime = result.rows[0].created;
        this._onAdded();
        this.modified.clear();
        return this.cache();
      })
      .catch(err => {
        log.error(
          `[record] #${err.code} insert "${this.table}/${this.id}" record failed: "${err.message}", detail: "${err.detail}"`
        );

        if (err.code === '23505') {
          throw new Error('NOT_UNIQUE');
        }

        throw new Error('ADD_FAILED');
      });
  }

  _update(client) {
    if (!this.modified.has('datetime')) {
      this.set('datetime', new Date());
    }

    let modified = Array.from(this.modified);
    let values = modified.map((value: any) => this[value]);

    values.push(this.id);

    const qs = `UPDATE ${this.table}
                SET ${modified.map((value, index) => `${value} = $${++index}`).join(', ')}
                WHERE id = $${modified.length + 1};`;

    return db
      .query(qs, values, client)
      .then(() => {
        this.uncache();
        this._onModified();
        this.modified.clear();
        return this.cache();
      })
      .catch(err => {
        log.error(
          `[record] #${err.code} update "${this.table}/${this.id}" record failed: "${err.message}", detail: "${err.detail}"`
        );

        throw new Error('UPDATE_FAILED');
      });
  }

  _onModified() {}

  _onAdded() {}
}

export default Record;
