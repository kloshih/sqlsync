
const begin = require('begin');
const log = require('log');
const kv = require('keyvalues');
const array = require('array');

const Active = require('activesync');


/** The Result class provides an implementation of a thing.
 *
 *  @author Lo Shih <kloshih@gmail.com>
 *  @since  1.0
 */
class Result extends Active.EventEmitter {

  constructor(source, statement) {
    super();
    this.source = source;
    this.statement = statement;
    this.resultSets = [new ResultSet()];
    this.resultSetIndex = 0;
    this.resultSet = this.resultSets[this.resultSetIndex];
  }

  // get resultSet() { return this.resultSets[this.resultSetIndex] }
  get rows() { return this.resultSet.rows }

  next(creates) {
    let set = this.resultSets[++this.resultSetIndex];
    if (set == null && creates) {
      set = this.resultSets[this.resultSetIndex-1] = new ResultSet();
    }
    return this.resultSet = set;
  }
  prev() {
    if (this.resultSetIndex == 0)
      throw new Error("At the beginning");
    return this.resultSet = this.resultSets[--this.resultSetIndex];
  }

  rewind() {
    return this.resultSet = this.resultSets[this.resultSetIndex = 0];
  }

  describe(fields) {
    this.resultSet.fields = fields;
    this.emit('describe', fields, this)
    // event: fields(fields, result)
  }

  refresh() {
  }

  describe() {
  }

  read(rows) {
    let setRows = this.resultSet.rows;
    let start = setRows.length, length = rows.length;
    for (let r = 0, rc = rows.length; r < rc; r++)
      setRows.push(rows[r]);
    this.emit('rows', rows, this.resultSet.fields, this, start, length);
        // event: rows(rows, result, start, length)
  }

}

module.exports = Result;

class ResultSet {

  constructor() {
    this.fields = [];
    this.rows = [];
  }


}
