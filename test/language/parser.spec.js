describe('Parser', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can parse a simple sequence rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2 R2\n\nR2 -> Piano: C'));

    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].sequence[0]).toBe('R2');
    expect(rules[0].definitions[0].sequence[1]).toBe('R2');
  });

  it('can parse a simple pattern rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C D E F'));
    
    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].instrument).toBe('Piano');
    expect(rules[0].definitions[0].pattern[0].value).toBe('C');
    expect(rules[0].definitions[0].pattern[0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[1].value).toBe('D');
    expect(rules[0].definitions[0].pattern[1].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[2].value).toBe('E');
    expect(rules[0].definitions[0].pattern[2].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[3].value).toBe('F');
    expect(rules[0].definitions[0].pattern[3].type).toBe(noteType.NOTE);
  });

  it('can parse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (var > 0.1) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe('0.1');
  });
  
  it('can parse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (var < 1.0) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe('1.0');
  });

  it('can parse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.5 < var < 1.0) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe('0.5');
    expect(rules[0].definitions[0].condition.max).toBe('1.0');
  });

  it('can parse reverse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < var) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe('0.1');
  });
  
  it('can parse reverse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (1.0 > var) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe('1.0');
  });

  it('can parse reverse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (1.0 > var > 0.5) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe('0.5');
    expect(rules[0].definitions[0].condition.max).toBe('1.0');
  });

  it('doesn\'t parse rules that don\'t start with a name' , function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('x -> R2 R3'));
    }).toThrowError('Rules must start with a name');
  });

  it('doesn\'t parse rules that don\'t have an arrow', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 R2 R3'));
    }).toThrowError('Expected ->');
  });

  it('doesn\'t parse conditions without numbers', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > y) R1 R2'));
    }).toThrowError('Expected a number');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x < y) R1 R2'));
    }).toThrowError('Expected a number');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x < y < z) R1 R2'));
    }).toThrowError('Expected a number');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > y > z) R1 R2'));
    }).toThrowError('Expected a number');
  });

  it('doesn\'t parse conditions without parameters', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 > 0.2) R1 R2'));
    }).toThrowError('Expected a parameter');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < 0.2) R1 R2'));
    }).toThrowError('Expected a parameter');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < 0.2 < 0.3) R1 R2'));
    }).toThrowError('Expected a parameter');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.3 > 0.2 > 0.1) R1 R2'));
    }).toThrowError('Expected a parameter');
  });

  it('doesn\'t parse conditions without < or >', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x == 0.1) R1 R2'));
    }).toThrowError('Expected < or >');

    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 == x) R1 R2'));
    }).toThrowError('Expected < or >');
  });

  it('doesn\'t parse conditions that don\'t end with )', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > 0.1 R1 R2'));
    }).toThrowError('Expected )');
  });

  it('doesn\'t parse conditions with other stuff than parameters or numbers', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (R1 > 0.1) R1 R2'));
    }).toThrowError('Expected a parameter or number');
  });

  it('doesn\'t parse patterns with invalid notes', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C / J Caug2'));
    }).toThrowError('Expected a note, chord, drum symbol or pause');
  });

  it('doesn\'t parse sequences with missing rules', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2'));
    }).toThrowError('There is no rule R2');
  });

  it('doesn\'t parse incomplete rules', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1'));
    }).toThrowError('Expected ->');
  });

  it('doesn\'t parse empty rules', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 ->'));
    }).toThrowError('Expected a sequence or pattern');
  });

  it('doesn\'t parse definitions with condition but without definition', function() {
    expect(function() {
      Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > 0.3)'));
    }).toThrowError('Expected a sequence or pattern');
  });

  it('ignores line breaks before the first rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('\n\nR1 -> R2 R1\n\nR2 -> Piano: C'));
    expect(rules[0].name).toBe('R1');
  });

  it('ignores line breaks after the last rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2 R1\n\nR2 -> Piano: C\n\n'));
    expect(rules[0].name).toBe('R1');
  });

  it('ignores extra line breaks between rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2 R2\n\n\n\nR2 -> Piano: C'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });
});