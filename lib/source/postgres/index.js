
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Source = require('../index.js');
const Statement = require('../../statement.js');
const Result = require('../../result.js');

const { Pool, Client } = require('pg');
    // https://github.com/brianc/node-postgres
    // https://node-postgres.com/
//    const QueryStream = require('pg-query-stream');
const Cursor = require('pg-cursor');



/** The Postgres class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Postgres extends Source {

  static get props() {
    return {
    }
  }

  static provides(config, baseType) {
    // log('info', "config #gr[%s] baseType #gr[%s]", config, baseType);
    let url = config.url;
    switch (url.scheme) {
      case 'postgres':
      case 'postgresql':
      case 'pg':
        return { impl:this, priority:10 };
      default:
        return null;
    }
  }

  constructor(config, owner) {
    super(config, owner);
  }

  query(sql, params, opts) {
    let self = this, config = this.config;
    if (opts == null) opts = EMPTY;
    let batchCount = Math.max(opts.queryBatchCount || config.queryBatchCount || 1000, 1);
    let readCount = 0;
    let lastRowCount = -1;
    let allRows = [], rowCount = 0;



    return begin().
      then(function() {
        self.pool.connect(this)
      }).
      then(function(client) {
        this.client = client;

        let statement = new Statement(sql, params, opts);
        let query = {
          text: statement.sql,
          values: statement.params,
          rowMode: statement.options.rowMode,
          types: statement.options.types,
        };
        this.cursor = this.client.query(new Cursor(sql, params, opts));
        res = new Result(self, statement);
        res.cursor = this.cursor;
        return null
      }).

      while(() => lastRowCount).
        then(function() {
          this.cursor.read(batchCount, this)
        }).
        then(function(rows, result) {
          log('info', "res: #gr[%s]", res.resultSet);
          log('info', "args: #gr[%s]", arguments.length);
          for (let r = 0, rc = rows.length; r < rc; r++)
            res.resultSet.rows.push(rows[r]);
          if (result)
            res.resultSet.fields = result.fields;
          lastRowCount = rows.length;
          return null
        }).
      end().

      then(function() {
        log('info', "res: #gr[%s]", res);
        log('info', "fields; #yl[%s]", res.fields);
        log('info', "rows; #yl[%s]", res.rows);
        log('info', "rowCount; #yl[%s]", res.rowCount);
        log('info', "command; #yl[%s]", res.command);
        return null
      }).
      finally(function(err) {
        if (this.client)
          this.client.release(false /* dont' disconnect due to error */);
        this.apply(this, arguments)
      }).
    end()
  }

  get poolConnnectionCount() { return this.pg.totalCount }
  get poolIdleCount() { return this.pg.idleCount }
  get poolWaitingCount() { return this.pg.waitingCount }

  _start() {
    let self = this;
    return begin().
      then(() => super._start() ).
      then(function() {
        let url = self.url;
        let config = {};
        if (url.user)
          config.user = url.user;
        if (url.pass)
          config.password = url.pass;
        if (url.hostname)
          config.host = url.hostname;
        if (url.port)
          config.port = url.port;
        if (url.pathParts.length > 0)
          config.database = url.pathParts[0];


        self.pool = new Pool(config);
        self.pool.on('connect', function(client) {
          log('info', "#bbl[postgres] #wh[pool connect client=#bwh[%s]]", client);
        });
        self.pool.on('acquire', function(client) {
          log('info', "#bbl[postgres] #wh[pool acquire client=#bwh[%s]]", client);
        });
        self.pool.on('error', function(error, client) {
          log('info', "#bbl[postgres] #wh[pool error error=#rd[%s] client=#bwh[%s]]", error, client);
        });
        self.pool.on('remove', function(client) {
          log('info', "#bbl[postgres] #wh[pool remove client=#bwh[%s]]", client);
        });
        return null
      }).
    end()
  }

  _stop() {
    let self = this;
    return begin().
      then(() => super._stop() ).
      then(function() {
        let pool = self.pool;
        if (pool == null)
          return null;
        self.pool = null;
        pool.end(this);
      }).
    end()
  }

}

Source.use(Postgres);

module.exports = Postgres;

const EMPTY = {};
