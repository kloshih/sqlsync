
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');

/** The Sql class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Sql extends Active {

  static get props() {
    return {
    }
  }

  constructor(config, owner) {
    super(config, owner);
  }



  _start() {
    let self = this;
    return begin().
      then(() => super._start() ).
      then(function() {
        return null
      }).
    end()
  }

  _stop() {
    let self = this;
    return begin().
      then(() => super._stop() ).
      then(function() {
        return null
      }).
    end()
  }

}

module.exports = Sql;
