

class Type {
}

/** 
 * 
 * 
 */
class Schema extends Record {

  static get props() {
    return {
      name:         {type:'string', unique:true},
      version:      {type:'string'},
      tables:       {many:Table, indexes:{name:true}},
      views:        {many:View, indexes:{name:true}},
      funcs:        {many:Func, indexes:{name:true}},
      datatypes:    {many:DataType, indexes:{name:true}},
    }
  }

  static get defs() {
    
  }
  
  static get definition() {
    return {
      version: '1.0',
      props: {
        name:         {type:'string', unique:true},
        version:      {type:'string'},
        tables:       {many:Table, indexes:{name:true}},
        views:        {many:View, indexes:{name:true}},
        funcs:        {many:Func, indexes:{name:true}},
        datatypes:    {many:DataType, indexes:{name:true}},
      },
      joins: {
      },
      indexes: {
      },
      sql: {table:'schemas'},
    }
  }

  constructor(config, owner) {
    super(config, owner);
  }

  table(name) {
    return this.tables.get('name', name);
  }

}



var types = {

  Schema: {props:{
    name:         {type:'string'},
    version:      {type:'string'},
    tables:       {many:'Table', indexes:{name:true}},
    views:        {many:'View', indexes:{name:true}},
    funcs:        {many:'Func', indexes:{name:true}},
    datatypes:    {many:'DataType', indexes:{name:true}},
  }}

  Schema: {props:{
    name:         {type:'string'},
    version:      {type:'string'},
    tables:       {many:'Table', indexes:{name:true}},
    views:        {many:'View', indexes:{name:true}},
    funcs:        {many:'Func', indexes:{name:true}},
    datatypes:    {many:'DataType', indexes:{name:true}},
  }}

}