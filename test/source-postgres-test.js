

const assert = require('assert');
const begin = require('begin');
const log = require('log');

const Source = require('../lib/source');
require('../lib/source/postgres');

describe("Source", function() {
  this.timeout(60e3);

  describe("Create the future", function() {
    this.timeout(60e3);

    let source;

    before(function(done) {
      begin().
        then(function() {
          source = Source.provider({
            url: 'postgres://postgres:changeme@localhost/postgres?schema=test',
          });
          return source.start()
        }).
      end(done)
    });
    after(function(done) {
      begin().
        then(function() {
          return source.stop()
        }).
      end(done)
    });

    it("should do start a source", function(done) {
      begin().
        then(function() {
          log('info', "Using source: #gr[%s]", source);

          return source.query('SELECT 1 + 1');
        }).
        then(function(res) {
          log('info', "res #gr[%s]", res);
          return null
        }).
      end(done)
    });

  });

});
