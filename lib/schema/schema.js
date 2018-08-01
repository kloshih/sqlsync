
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');

const parse = require('./parse');


/*
 * Schema
 * - tables : Table < PropSet
 *   - columns : Column < Prop
 *   - indexes : Index
 *   - triggers : Trigger
 * - views : View < PropSet
 *   - columns : Column < Prop
 * - funcs : Func < PropSet
 *   - params : Param < Prop
 *   - returns : Return < Prop
 * - datatypes : Datatype
 */

/** The Schema class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Schema {

  static get props() {
    return {
    }
  }

  constructor(config, owner) {
    this.name = null;
    this.version = null;
    this.tables = array();
    this.tables.index('name', {unique:true});
    this.views = array();
    this.views.index('name', {unique:true});
    this.funcs = array();
    this.funcs.index('name', {unique:true});
    this.datatypes = array();
    this.datatypes.index('name', {unique:true});
    if (kv.typeof(config) == 'object')
      this.parse(config);
  }

  static parse(doc) {
    let schema = new Schema();
    schema.parse(doc);
    return schema;
  }

  table(name) {
    return this.tables.get('name', name);
  }
  view(name) {
    return this.views.get('name', name);
  }
  func(name) {
    return this.funcs.get('name', name);
  }
  datatype(name) {
    return this.datatypes.get('name', name);
  }

  parse(doc) {
    parse.value(this, doc, 'name');
    parse.value(this, doc, 'version');
    parse.items(this, doc, 'tables', Table);
    parse.items(this, doc, 'views', View);
    parse.items(this, doc, 'func', Func);
    parse.items(this, doc, 'datatypes', Datatype);

    // this.name = doc.name || null;
    // this.version = doc.version || null;
    // for (let name in doc.tables) {
    //   let subdoc = doc.tables[name];
    //   // log('info', "table #gr[%s] subdoc #byl[%s]", name, subdoc);
    //   let table = new Table(this, name);
    //   table.parse(subdoc);
    //   this.tables.push(table);
    // }
    // for (let name in doc.views) {
    //   let subdoc = doc.views[name];
    //   let view = new View(this, name);
    //   view.parse(subdoc);
    //   this.views.push(view);
    // }
    // for (let name in doc.funcs) {
    //   let subdoc = doc.funcs[name];
    //   let func = new Func(this, name);
    //   func.parse(subdoc);
    //   this.funcs.push(func);
    // }
    // for (let name in doc.datatypes) {
    //   let subdoc = doc.datatypes[name];
    //   let datatype = new Datatype(this, name);
    //   datatype.parse(subdoc);
    //   this.datatypes.push(datatype);
    // }
    this.commit();
  }

  commit(phase) {
    /* If called with commit(), then perform multiphase commit */
    if (arguments.length == 0) {
      this.commit('types');          /* Define types */
      this.commit('identity');       /* Calculate primary keys */
      this.commit('dependencies');   /* Link to dependencies */
      this.commit('props');          /* Resolve props  */
      this.commit('joins');          /* Calculate joins */
      this.commit('generator');      /* Generate codes */
      return;
    }

    switch (phase) {
      case 'types':
        break;
      case 'identity':
      case 'dependencies':
      case 'props':
      case 'joins':
      case 'generator':
    }
    this.tables.forEach((table) => {
      table.commit(phase);
    });
    this.views.forEach((view) => {
      view.commit(phase);
    });
    this.funcs.forEach((func) => {
      func.commit(phase);
    });
    this.datatypes.forEach((datatype) => {
      datatype.commit(phase);
    });
  }

  format() {
    let doc = {
      name: this.name,
      version: this.version,
      tables: {},
      views: {},
      funcs: {},
      datatypes: {},
    };
    this.tables.forEach((table) => {
      let subdoc = table.format();
      delete(subdoc.name);
      doc.tables[table.name] = subdoc;
    });
    this.views.forEach((view) => {
      let subdoc = view.format();
      delete(subdoc.name);
      doc.views[view.name] = subdoc;
    });
    this.funcs.forEach((func) => {
      let subdoc = func.format();
      delete(subdoc.name);
      doc.funcs[func.name] = subdoc;
    });
    this.datatypes.forEach((datatype) => {
      let subdoc = datatype.format();
      delete(subdoc.name);
      doc.datatypes[datatype.name] = subdoc;
    });
    if (kv.equals(doc.tables, EMPTY)) delete(doc.tables)
    if (kv.equals(doc.views, EMPTY)) delete(doc.views)
    if (kv.equals(doc.funcs, EMPTY)) delete(doc.funcs)
    if (kv.equals(doc.datatypes, EMPTY)) delete(doc.datatypes)
    return doc;
  }

}

module.exports = Schema;

class PropSet {

  constructor(schema, name) {
    this.schema = schema;
    this.name = name;
    this.props = array();
    this.props.index('name', {unique:true});
  }

}
Schema.PropSet = PropSet;

class Prop {

  constructor(name) {
    this.name = name;
  }

}
Schema.Prop = Prop;

class RowType extends PropSet {

  constructor(schema, name) {
    super(schema, name);
    this.pattern = 'list';
    this.columns = array();
    this.columns.index('name', {unique:true});
    this.indexes = array();
    this.indexes.index('name', {unique:true});
    this.joins = array();
  }
  toString() {
    return this.name || '(rowtype)';
  }

  parse(doc) {
    parse.value(this, doc, 'pattern');
    parse.items(this, doc, 'columns', Column);
    parse.items(this, doc, 'indexes', Index);
    parse.items(this, doc, 'joins', Join);

    // this.pattern = doc.pattern;
    // for (let name in doc.columns) {
    //   let subdoc = doc.columns[name];
    //   let column = new Column(this, name);
    //   column.parse(subdoc);
    //   this.columns.push(column);
    // }
    // for (let name in doc.indexes) {
    //   let subdoc = doc.indexes[name];
    //   let index = new Index(this, name);
    //   index.parse(subdoc);
    //   this.indexes.push(index);
    // }
    // for (let name in doc.joins) {
    //   let subdoc = doc.joins[name];
    //   let join = new Join(this, name);
    //   join.parse(subdoc);
    //   this.joins.push(join);
    // }
  }

  commit(phase) {
    switch (phase) {
      case 'types':
        if (!this.name)
          throw new Error("Name");
        break;
      case 'identity':
      case 'dependencies':
      case 'props':
      case 'joins':
      case 'generator':
    }
    this.columns.forEach((column) => {
      column.commit(phase);
    });
    this.indexes.forEach((index) => {
      index.commit(phase);
    });
    this.joins.forEach((join) => {
      join.commit(phase);
    });
  }

  format() {
    let doc = {
      name: this.name,
      pattern: this.pattern,
      columns: {},
      indexes: {},
      joins: {},
    };
    this.columns.forEach((column) => {
      let subdoc = column.format();
      delete(subdoc.name);
      doc.columns[column.name] = subdoc;
    });
    this.indexes.forEach((index) => {
      let subdoc = index.format();
      delete(subdoc.name);
      doc.indexes[index.name] = subdoc;
    });
    this.joins.forEach((join) => {
      let subdoc = join.format();
      delete(subdoc.name);
      doc.joins[join.name] = subdoc;
    });
    if (kv.equals(doc.indexes, EMPTY)) delete(doc.indexes)
    if (kv.equals(doc.joins, EMPTY)) delete(doc.joins)
    return doc;
  }
}
Schema.RowType = RowType;

class Table extends RowType {

  constructor(schema, name) {
    super(schema, name);
    this.triggers = array();
    this.triggers.index('name', {unique:true});
  }

  toString() {
    return this.name;
  }

  parse(doc) {
    super.parse(doc);

    parse.items(this, doc, 'triggers', Trigger);
    // for (let name in doc.triggers) {
    //   let subdoc = doc.triggers[name];
    //   let trigger = new Trigger(this, name);
    //   trigger.parse(subdoc);
    //   this.triggers.push(trigger);
    // }
  }

  commit(phase) {
    super.commit(phase);
    switch (phase) {
      case 'types':
        break;
      case 'identity':
      case 'dependencies':
      case 'props':
      case 'joins':
      case 'generator':
    }
    this.triggers.forEach((trigger) => {
      trigger.commit(phase);
    });
  }

  format() {
    let doc = super.format();


    // doc.joins = {};

    this.triggers.forEach((trigger) => {
      let subdoc = trigger.format();
      delete(subdoc.name);
      doc.triggers[trigger.name] = subdoc;
    });
    if (kv.equals(doc.triggers, EMPTY)) delete(doc.triggers)
    return doc;
  }
}
Schema.Table = Table;

class Column extends Prop {

  constructor(table, name) {
    super(name);
    this.table = table;
  }

  parse(doc) {
    parse.value(this, doc, 'type');
    parse.value(this, doc, 'one');
    parse.value(this, doc, 'primary');
    parse.value(this, doc, 'unique');

    // if (doc.type) {
    //   this.type = doc.type;
    // } else if (doc.one) {
    //   this.one = doc.one;
    // }
    // this.primary = doc.primary;
    // this.unique = doc.unique;
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
Schema.Column = Column;

class View extends RowType {

}
Schema.View = View;

class Func extends PropSet {

  constructor(schema, name) {
    super(schema, name);
    this.params = array();
    this.params.index('name', {unique:true});
    this.returns = null;
  }

  parse(doc) {
    parse.value(obj, doc, 'pattern');
    parse.value(obj, doc, 'pattern');

    this.pattern = doc.pattern;
    for (let name in doc.params) {
      let subdoc = doc.params[name];
      let param = new Param(this, name);
      param.parse(subdoc);
      this.params.push(param);
    }
    // log('info', "Calculate returns: #gr[%s]", doc.returns);
    this.returns = new Returns(this);
    this.returns.parse(doc.returns);
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
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }

    this.params.forEach((param) => {
      param.commit(phase);
    });
    this.returns.commit(phase);
  }

  format() {
    let doc = {
      name: this.name,
      params: {},
      returns: null,
    };
    this.params.forEach((param) => {
      let subdoc = param.format();
      delete(subdoc.name);
      doc.params[param.name] = subdoc;
    });
    doc.returns = this.returns.format();
    return doc;
  }

}
Schema.Func = Func;

class Param extends Prop {

  constructor(func, name) {
    super(name);
    this.func = func;
  }
  toString() {
    return this.func + '.' + this.name;
  }

  parse(doc) {
    this.type = doc.type;
  }

  commit(phase) {
    let schema = this.table.schema;
    switch (phase) {
      case 'types':
        if (!this.name)
          throw new Error("Name");
        if (!this.type)
          throw new Error(this + " type required");
        break;
      case 'identity':
      case 'dependencies':
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
  }

  format() {
    let doc = {
      name: this.name,
      type: this.type,
    };
    return doc;
  }

}
Schema.Param = Param;

class Returns extends Prop {

  constructor(func, name) {
    super(name);
    this.func = func;
  }

  parse(doc) {
    this.type = doc.type;
  }

  commit(phase) {
    let schema = this.table.schema;
    switch (phase) {
      case 'types':
        if (!this.type)
          throw new Error(this + " type required");
        break;
      case 'identity':
      case 'dependencies':
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
  }

  format() {
    let doc = {
      type: this.type,
    };
    return doc;
  }

}
Schema.Returns = Returns;

class Trigger {

  constructor(table, name) {
    this.table = table;
    this.name = name;
  }

  parse(doc) {
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
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
  }

  format() {
    let doc = {
      name: this.name,
    };
    return doc;
  }

}
Schema.Trigger = Trigger;

class Index {

  constructor(table, name) {
    this.table = table;
    this.name = name;
    this.columns = [];
  }

  parse(doc) {
    this.columns = doc.columns;
    this.unique = !('unique' in doc) || doc.unique;
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
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
  }

  format() {
    let doc = {
      name: this.name,
    };
    if (!this.unique)
      doc.unique = false;
    return doc;
  }

}
Schema.Index = Index;

class Join {

  constructor(table, name) {
    this.table = table;
    this.name = name;
    this.target = null;
    this.sourceColumns = [];
    this.targetColumns = [];
  }

  parse(doc) {
    log('info', "join doc: #gr[%s]", doc);
    if (typeof(doc) === 'string') {
      doc = { target:doc };
    }
    if (doc.target) {
      let match = doc.target.match(/^(?:(\w+)=)?(\w+)(?:.(\w+))?$/);
        // 1:source_column, 2:target_table, 3: target_column
      log('info', "match: #gr[%s]", match);
      doc.sourceColumn = match[1];
      doc.targetTable = match[2];
      doc.targetColumn = match[3];
    }

    parse.value(this, doc, 'name');
    parse.array(this, doc, 'sourceColumns');
    parse.value(this, doc, 'targetTable');
    parse.array(this, doc, 'targetColumns');
  }

  commit(phase) {
    let schema = this.table.schema;
    switch (phase) {
      case 'types':
        break;
      case 'identity':
      case 'dependencies':
        break;
      case 'props':
      case 'joins':
      case 'generator':
    }
  }

  format() {
    let doc = {
      name: this.name,
    };
    return doc;
  }

}
Schema.Join = Join;

const EMPTY = {};

