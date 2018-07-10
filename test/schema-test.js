

const assert = require('assert');
const begin = require('begin');
const log = require('log');

const Schema = require('../lib/schema/schema.js');

describe("Schema", function() {
  this.timeout(60e3);

  describe("Parsing schema from JSON", function() {

    it("should parse simple schemas", function() {
      let doc1 = {
        name: 'posts',
        version: '1.0.0',
        tables: {
          'posts':                    { pattern:'list',
            columns: {
              'post_id':              { type:'int', primary:true },
              'title':                { type:'varchar(50)' },
              'post_type_id':         { type:'int' },
            },
            joins: {
              'type':                 'post_types',
            },
          },
          'post_types':               { pattern:'enum',
            columns: {
              post_type_id:           { type:'int', primary:true },
              name:                   { type:'varchar(50)' },
            },
            indexes: {
              u_n:                    { columns:['name'], unique:true },
            },
          },
        },
      };
      let schema = new Schema();
      schema.parse(doc1);
      let doc2 = schema.format();

      log('info', "doc2 #byl[%s]", log.dump(doc2));
    });

  });

});
