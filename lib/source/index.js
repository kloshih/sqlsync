
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');

/** The Source class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Source extends Active {

  static get props() {
    return {
      url: {implicit:true},
    }
  }

  constructor(config, owner) {
    super(config, owner);
    if (this.constructor === Source)
      throw new Error("Source class is abstract");
  }

  query() {
    let self = this, config = this.config;
    return begin().
      then(function() {
        return null
      }).
    end()
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

module.exports = Source;
