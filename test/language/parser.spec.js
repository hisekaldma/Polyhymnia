describe('Parser', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can parse a simple sequence rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2 R3'));

    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].sequence[0]).toBe('R2');
    expect(rules[0].definitions[0].sequence[1]).toBe('R3');
  });

  it('can parse a simple pattern rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C D E F'));
    
    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].instrument).toBe('Piano');
    expect(rules[0].definitions[0].pattern[0].note).toEqual('C');
    expect(rules[0].definitions[0].pattern[0].octave).toEqual(undefined);    
    expect(rules[0].definitions[0].pattern[0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[1].note).toEqual('D');
    expect(rules[0].definitions[0].pattern[1].octave).toEqual(undefined);    
    expect(rules[0].definitions[0].pattern[1].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[2].note).toEqual('E');
    expect(rules[0].definitions[0].pattern[2].octave).toEqual(undefined);    
    expect(rules[0].definitions[0].pattern[2].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[3].note).toEqual('F');
    expect(rules[0].definitions[0].pattern[3].octave).toEqual(undefined);    
    expect(rules[0].definitions[0].pattern[3].type).toBe(noteType.NOTE);
  });

  it('can parse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (var > 0.1) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (var < 1.0) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.5 < var < 1.0) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.5);
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < var) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse reverse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (1.0 > var) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (1.0 > var > 0.5) Piano: C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.5);
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('doesn\'t parse rules that don\'t start with a name' , function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('x -> R2 R3'));
    expect(rules.errors[0].error).toBe('Rules must start with a name');
  });

  it('doesn\'t parse rules that don\'t have an arrow', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 R2 R3'));
    expect(rules.errors[0].error).toBe('Expected ->');
  });

  it('doesn\'t parse conditions without numbers', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > y) R1 R2'));
    expect(rules1.errors[0].error).toBe('Expected a condition');

    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x < y) R1 R2'));
    expect(rules2.errors[0].error).toBe('Expected a condition');

    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x < y < z) R1 R2'));
    expect(rules3.errors[0].error).toBe('Expected a condition');

    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > y > z) R1 R2'));
    expect(rules4.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without parameters', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 > 0.2) R1 R2'));
    expect(rules1.errors[0].error).toBe('Expected a condition');

    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < 0.2) R1 R2'));
    expect(rules2.errors[0].error).toBe('Expected a condition');

    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 < 0.2 < 0.3) R1 R2'));
    expect(rules3.errors[0].error).toBe('Expected a condition');

    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.3 > 0.2 > 0.1) R1 R2'));
    expect(rules4.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without < or >', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x == 0.1) R1 R2'));
    expect(rules1.errors[0].error).toBe('Expected a condition');

    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (0.1 == x) R1 R2'));
    expect(rules2.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions that don\'t end with )', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > 0.1 R1 R2'));
    expect(rules.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions with other stuff than parameters or numbers', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (R1 > 0.1) R1 R2'));
    expect(rules.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse invalid notes', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C / J Caug2'));
    expect(rules.errors[0].error).toBe('Expected a note, chord, drum symbol or pause');
  });

  it('can parse incomplete rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1'));
    expect(rules.length).toBe(1);
  });

  it('can parse empty definitions', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ->'));
    expect(rules1.length).toBe(1);

    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ->\n'));
    expect(rules2.length).toBe(1);

    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ->\nR2 -> R3'));
    expect(rules3[0].name).toBe('R1');
    expect(rules3[1].name).toBe('R2');
    expect(rules3[1].definitions[0].sequence[0]).toBe('R3');

    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ->\n\nR2 -> R3'));
    expect(rules4[0].name).toBe('R1');
    expect(rules4[1].name).toBe('R2');
    expect(rules4[1].definitions[0].sequence[0]).toBe('R3');
  });

  it('can parse empty definitions with condition', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> (x > 0.3)'));
    expect(rules[0].definitions[0]).toEqual({});
  });

  it('ignores line breaks after arrow', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 ->\nR2\nR3'));
    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].sequence[0]).toBe('R2');
    expect(rules[0].definitions[1].sequence[0]).toBe('R3');
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

  it('flags missing rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2'));
    expect(rules.errors[0].error).toBe('There is no rule R2');
  });

  it('flags missing instruments', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C'), {});
    expect(rules.errors[0].error).toBe('There is no instrument Piano');
  });
});