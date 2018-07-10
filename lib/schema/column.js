
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Prop = require('./prop.js');

class Column extends Prop {

  constructor(table, name) {
    super(name);
    this.table = table;
  }

  parse(doc) {
    if (doc.type) {
      this.type = doc.type;
    } else if (doc.one) {
      this.one = doc.one;
    }
    this.primary = doc.primary;
    this.unique = doc.unique;
  }

  toString() {
    return this.table + '.' + this.name;
  }

  commit(phase) {
    let schema = this.table.schema;
    switch (phase) {
      case 'types':
        if (!this.name)
          throw new Error("Name");
        break;
      case 'identity':
      case 'dependencies':
        if (!this.type && this.one) {
          let targetTable = schema.table(this.one);
          if (!targetTable)
            throw new Error("No target table " + this.one + ' in schema ()');

          log('info', "#bbl[model %s] #bmg[commit] #wh[resolving one #gr[%s] and schema #gr[%s]]", this, this.one, targetTable);
        }
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
    // //    log('info', "#bbl[model #mg[%s]] #bmg[commit] #wh[type #gr[%s] one #gr[%s] and schema #gr[%s]]", this, this.type, this.one, this.table.schema);
    //     if (!this.type && this.one) {
    //       let targetTable = schema.table(this.one);
    //       if (!targetTable)
    //         throw new Error("No target table " + this.one + ' in schema ()');
    //
    //       log('info', "#bbl[model %s] #bmg[commit] #wh[resolving one #gr[%s] and schema #gr[%s]]", this, this.one, targetTable);
    //     }
  }

  format() {
    let doc = {
      name: this.name,
      type: this.type,
    };
    return doc;
  }

}

module.exports = Column;
