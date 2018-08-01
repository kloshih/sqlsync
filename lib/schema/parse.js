

const kv = require('keyvalues');

module.exports = {

  value(obj, doc, key, handler) {
    let val = doc[key];
    if (val !== undefined && obj[key] != val) {
      let override = handler ? handler.call(obj, val, key, doc) : undefined;
      obj[key] = override !== undefined ? override : val;
    }
  },

  array(obj, doc, key, addHandler, removeHandler) {
    this[key] || (this[key] = []);
    let singularKey = kv.singularize(key);
    let val = doc[singularKey] || doc[key];
    if (val === undefined || obj[key] == val)
      return false;
    
    var marked = [];
    for (let item of obj[key])
      marked.push(item);
    
    let ary = val == null ? [] : Array.isArray(val) ? val : [val];
    for (let item of ary) {
      if (addHandler) {
        let res = addHandler.call(obj, item, doc, key);
        if (res !== undefined) 
          item = res;
      }
      if (item == null)
        continue;
      let idx = marked.indexOf(item);
      if (idx < 0) {
        obj[key].push(item);
      } else {
        marked.splice(idx, 1);
      }
    }

    for (let item of marked) {
      if (removeHandler) {
        removeHandler.call(obj, item, doc, key);
      }
      let idx = obj[key].indexOf(item);
      if (idx >= 0) {
        obj[key].splice(idx, 1);
      }
    }
    return true;
  },

  arraymap(obj, doc, key, handler) {
    this[key] || (this[key] = {});
    let map = doc[key];
    if (map === undefined || obj[key] == map)
      return false;

    for (let name in map) {
      let item = map[name];
      item.name = name;
      if (handler) {
        let res = handler.call(obj, item, name, doc, key);
        if (res !== undefined) 
          item = res;
      }
      obj[key].push(item);
    }
    return true;
  },

  items(obj, doc, key, docClass) {
    return this.arraymap(obj, doc, key, (subdoc, name) => {
      let item = new docClass(obj, name);
      item.parse(subdoc);
      return item;
    });
  },

  item(obj, doc, key, docClass) {
    var subdoc = doc[key];
    if (subdoc !== undefined) {
      var item = new docClass(obj);
      item.parse(subdoc);
      this[key] = item;
    }
  }

};