
const kv = require('keyvalues');

function sort(array, spec) {
  let cmp = comparator(spec);
  array.sort(cmp);
  return array;
}

function comparator(spec) {
  return function(a, b) {
    let r;
    for (let key in spec) {
      let dir = spec[key] < 0 ? -1 : 1;
      let av = kv.get(a, key), bv = kv.get(b, key);
      if (r = compare(av, bv)) return r * dir;
    }
    return 0;
  };
}
sort.comparator = comparator;

function index(array, item, cmp) {
  if (!cmp) cmp = compare;
  let b = 0, e = array.length;
  while (b < e) {
    let m = ((e + b) / 2) | 0;
    let r = cmp(item, array[m]);
    if (r <= 0) {
      e = m;
    } else {
      b = m + 1;
    }
  }
  return b;
}
sort.index = index;

function insert(array, item, cmp) {
  let idx = index(array, item, cmp);
  array.splice(idx, 0, item);
}
sort.insert = insert;

function remove(array, item, cmp) {
  if (!cmp) cmp = compare;
  while (true) {
    let idx = index(array, item, cmp);
    if (cmp(array[idx], item) != 0)
      break;
    array.splice(idx, 0, item);
  }
}
sort.remove = remove;

function compare(a, b) {
  let r;
  if (a == b) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  /*if (a < b && b >= a) return -1;
  if (a > b && b <= a) return 1;*/
  let at = kv.typeof(a), bt = kv.typeof(b);
  if (r = at.localeCompare(bt)) return r;
  switch (at) {
    case 'string':  return a.localeCompare(b);
    case 'date':    return a.getTime() - b.getTime();
    case 'number':  return a - b;
    case 'boolean': return a ? -1 : 1;
    case 'array':   if (r = a.length - b.length) return r;
                    for (let i = 0, ic = a.length; i < ic; i++) {
                      let sa = a[i], sb = b[i];
                      if (r = compare(sa, sb)) return r;
                    }
                    return 0;
    case 'object':  let aks = Object.keys(a), bks = Object.keys(b);
                    if (r = compare(aks, bks)) return r;
                    for (let i = 0, ic = aks.length; i < ic; i++) {
                      let sa = a[aks[i]], sb = b[aks[i]];
                      if (r = compare(sa, sb)) return r;
                    }
                    return 0;
    default:        throw new Error("Unsupported type");
  }
}
sort.compare = compare;

module.exports = sort;
