
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');
const sort = require('./sort.js');

/** The Rowset class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Rowset extends Array {

  constructor(type) {
    super()
    // if (!type) throw new Error("Type required");
    this.type = type;
    this.columns = this.type.columns;
    this._cmp = null;
    this.query = null;
    this.skip = 0;
    this.limit = -1;
    this.indexes = {};
    this.subsets = [];
  }

  sort(spec) {
    if (typeof(spec) === 'function')
      return super.sort(spec);
    if (spec) {
      this._cmp = sort.comparator(spec);
      this._cmp.spec = spec;
      log('info', "Sorting using comparator: #bbk[%s]", this._cmp);
      super.sort(this._cmp);
    } else {
      this._cmp = null;
    }
    return this;
  }

  insert(row) {
    if (this._cmp) {
      let idx = sort.index(this, row, this._cmp);
      // log('info', "Inserting sorted #byl[%s] at #bl[%s]", row, idx);
      super.splice(idx, 0, row);
    } else {
      this.push(row);
    }
    for (let key in this.indexes) {
      let index = this.indexes[key];
      index._insert(row);
    }
    return this;
  }
  update(row) {
    if (typeof(row) === 'string' && arguments.length > 1) {
      let item = this.get.apply(this, arguments);
      return this.update(item);
    } else if (row == null) {
      return this;
    }

    for (let key in this.indexes) {
      let index = this.indexes[key];
      index._update(row);
    }
    return this;
  }
  delete(row) {
    if (typeof(row) === 'string' && arguments.length > 1) {
      let item = this.get.apply(this, arguments);
      return this.delete(item);
    } else if (row == null) {
      return this;
    }

    let idx = this.indexOf(row);
    // log('info', "index #gr[%s]", idx);
    this.splice(idx, 1);
    for (let key in this.indexes) {
      let index = this.indexes[key];
      // log('info', "deleting row in index #gr[%s]", index);
      index._delete(row);
    }
    return this;
  }

  ensureIndex(key, opts) {
    let index = this.indexes[key];
    if (!index) {
      let keys = key.split(/\s*,/g);
      index = this.indexes[key] = Index.provider(this, keys, opts);
      // log('info', "Using strategy #gr[%s] for keys #gr[%s]", index, keys);
      for (let row of this) {
        index._insert(row);
      }
    }
    return this;
  }

  index(key) {
    let index = this.indexes[key];
    if (!index) {
      this.ensureIndex(key, {});
      index = this.indexes[key];
    }
    return index;
  }

  get(key, ...vals) {
    let index = this.index(key);
    return index.get(vals);
  }


}
module.exports = Rowset;

class Index {

  static use(provider) {
    let providers = this.providers || (this.providers = []);
    providers.push(provider);
  }
  static unuse(provider) {
    let providers = this.providers || (this.providers = []);
    kv.remove(providers, provider);
  }
  static provider(rowset, keys, opts) {
    // log('info', "#bbl[rowset index] #wh[looking for a strategy for type #gr[%s] keys #gr[%s]]", rowset.type, keys);
    let best;
    for (let key in this.providers) {
      let provider = this.providers[key];
      let impl = provider.provides(rowset, keys, opts);
      if (impl && impl.priority > 0 && (!best || impl.priority > best.priority))
        best = impl;
    }
    if (!best)
      throw new Error("No index strategy for type: " + rowset.type + ", keys: " + keys.join(','));
    // log('info', "best #gr[%s]", best);
    return new best.impl(rowset, keys);
  }

  static keyParts(key) {
    return key.split(',');
  }
  static normalizeKey(key) {
    return key;
  }

  constructor(rowset, keys) {
    this.rowset = rowset;
    this.keys = keys;
    let columns = this.rowset.type.columns, cc = columns.length;
    this.idxs = keys.map((key) => {
      for (let c = 0; c < cc; c++) {
        if (columns[c].name === key)
          return c;
      }
      return -1;
    });
    // log('info', "columns #gr[%s] for keys #gr[%s]", this.idxs, this.keys);
  }

  _insert(row) {
  }
  _update(row) {
  }
  _delete(row) {
  }

  get(val) {
  }

};
Rowset.Index = Index;

class ScanIndex extends Index {

  static provides(rowset, keys, opts) {
    return { impl:this, priority:3 };
  }

  get(val) {
    for (let row of this.rowset) {
    }
  }

}
Rowset.ScanIndex = Index.use(ScanIndex);

class SimpleUniqueIndex extends Index {

  static provides(rowset, keys, opts) {
    // log('info', "simple? keys=#gr[%s]", keys);
    if (keys.length !== 1 || opts && (opts.unique == false))
      return null
    return { impl:this, priority:10 };
  }

  constructor(index, keys) {
    super(index, keys);
    this.key = this.keys[0];
    this.idx = this.idxs[0];
    this.map = new Map();
  }

  _insert(row) {
    let val = row[this.idx];
    this.map.set(val, row);
  }
  _update(row) {
    for (let [val, item] of this.map) {
      if (row == item)
        this.map.delete(val)
    }
    let val = row[this.idx];
    this.map.set(val, row);
  }
  _delete(row) {
    let val = row[this.idx];
    // log('info', "#bbk[deleting val #bgr[%s] was #rd[%s]]", val, this.map.size);
    this.map.delete(val);
    // log('info', "#bbk[deleted val #bgr[%s] was #rd[%s] #byl[%s]]", val, this.map.size, log.dump(this.map));
  }

  get(vals) {
    let val = vals[0];
    if (Array.isArray(val)) {
      /* If val looks like a row, then extract our key from the row itself.
       * This allows a user to say, let row = rowset.get('status_id', rec) */
      val = val[this.idx];
    }
    let row = this.map.get(val);
    return row;
  }

}
Rowset.SimpleUniqueIndex = Index.use(SimpleUniqueIndex);

class CompoundUniqueIndex extends Index {

  static provides(rowset, keys, opts) {
    if (opts && opts.unique == false)
      return null;
    if (keys.length !== 1)
      return { impl:this, priority:5 };
    return { impl:this, priority:10 };
  }

  constructor(index, keys) {
    super(index, keys);
    this.width = this.idxs.length;
    this.map = new Map();
  }

  rowKey(row) {
    let width = this.width, idxs = this.idxs;
    let vals = Array(width);
    for (var i = 0; i < width; i++)
      vals[i] = row[idxs[i]];
    return this.valKey(vals);
  }
  valKey(vals) {
    return vals.join('\x01');
  }

  _insert(row) {
    let val = this.rowKey(row);
    this.map.set(val, row);
  }
  _update(row) {
    for (let [val, item] of this.map) {
      if (row == item)
        this.map.delete(val)
    }
    let val = this.rowKey(row);
    this.map.set(val, row);
  }
  _delete(row) {
    let val = this.rowKey(row);
    this.map.delete(val);
  }

  get(vals) {
    let val;
    if (vals.length == 1 && Array.isArray(vals[0])) {
      val = this.rowKey(vals[0]);
    } else {
      val = this.valKey(vals);
    }
    // log('info', "vals #gr[%s] val #gr[%s]", vals, val);
    let row = this.map.get(val);
    return row;
  }

}
Rowset.CompoundUniqueIndex = Index.use(CompoundUniqueIndex);
