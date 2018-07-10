
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');

/** The Statement class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Statement extends Active.EventEmitter {

  constructor(sql, params, opts) {
    super();
    this.sql = sql;
    this.params = params;
    this.options = opts || {};
  }

}

module.exports = Statement;
