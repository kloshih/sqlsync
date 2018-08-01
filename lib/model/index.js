

class Model {

  constructor() {
  }

  parse(doc) {
    parse.value(this, doc, 'name');
    parse.value(this, doc, 'version');
    parse.array(this, doc, 'dependencies');
    parse.items(this, doc, 'types', Type);
  }

}

class Type {

  constructor(owner, name) {
    this.owner = owner;
    this.name = name;
    this.props = array();
    this.props.index('name', {unique:true});
    this.props.index('key', {unique:true});
    this.props.index('code', {unique:true});
  }

  parse(doc) {
    parse.value(this, doc, 'name');
    parse.value(this, doc, 'version');
    parse.array(this, doc, 'dependencies');
    parse.items(this, doc, 'props', Prop);
    parse.items(this, doc, 'annos', Anno);
  }

  commit(phase) {
    switch (phase) {
      case 'configure':
        
        break;
      case 'commit':
      case 'generate':
      case 'finalize':
    }
  }

  format(doc) {
    doc || (doc = {});
    format.value(this, doc, 'name');
    format.value(this, doc, 'version');
    format.array(this, doc, 'dependencies');
    format.items(this, doc, 'props');
    format.items(this, doc, 'annos');
    return doc;
  }

}

class Prop {
  
  constructor() {
  }

  parse(doc) {
    parse.value(this, doc, 'name');
    parse.value(this, doc, 'code');
    parse.value(this, doc, 'key');
  }
  
}

class ValueProp extends Prop {

  parse(doc) {
    super.parse(doc);
    parse.value(this, doc, 'code');
    parse.value(this, doc, 'key');
  }

}

class OneProp extends Prop {

  parse(doc) {
    super.parse(doc);
    parse.value(this, doc, 'code');
    parse.value(this, doc, 'key');
  }

}

class ManyProp extends Prop {

}


