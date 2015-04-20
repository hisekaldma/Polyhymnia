describe('Parser', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can parse sequences', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R3'));

    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].sequence[0].name).toBe('R2');
    expect(rules[0].definitions[0].sequence[1].name).toBe('R3');
  });

  it('can parse patterns', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C D E F'));
    
    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][2].note).toEqual('E');
    expect(rules[0].definitions[0].pattern[0][2].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][3].note).toEqual('F');
    expect(rules[0].definitions[0].pattern[0][3].type).toBe(noteType.NOTE);
  });

  it('can parse sequences with an instrument', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = Piano: R2 R3'));

    expect(rules[0].definitions[0].instrument.name).toBe('Piano');
  });

  it('can parse patterns with an instrument', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = Piano: C D E F'));

    expect(rules[0].definitions[0].instrument.name).toBe('Piano');
  });

  it('can parse multi bar patterns', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C D | E F'));
    
    expect(rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[1][0].note).toEqual('E');
    expect(rules[0].definitions[0].pattern[1][0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[1][1].note).toEqual('F');
    expect(rules[0].definitions[0].pattern[1][1].type).toBe(noteType.NOTE);
  });

  it('can parse anonymous patterns', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('C D E F'));

    expect(rules[0].name).toBe('');
    expect(rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(rules[0].definitions[0].pattern[0][2].note).toEqual('E');
    expect(rules[0].definitions[0].pattern[0][2].type).toBe(noteType.NOTE);
  });

  it('can parse anonymous sequences', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 R2 R3'));
    
    expect(rules[0].name).toBe('');
    expect(rules[0].definitions[0].sequence[0].name).toEqual('R1');
    expect(rules[0].definitions[0].sequence[1].name).toEqual('R2');
    expect(rules[0].definitions[0].sequence[2].name).toEqual('R3');
  });

  it('can parse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (var > 0.1) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (var < 1.0) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.5 < var < 1.0) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.5);
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse min conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < var) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse reverse max conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (1.0 > var) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse between conditions', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (1.0 > var > 0.5) C D E F'));

    expect(rules[0].definitions[0].condition.param).toBe('var');
    expect(rules[0].definitions[0].condition.min).toBe(0.5);
    expect(rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('doesn\'t parse mixed sequences and patterns', function() {
    var rules1 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = C R2')));
    var rules2 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = R1 C')));

    expect(rules1.errors[0].error).toBe('Expected a note, chord, drum hit or pause');
    expect(rules2.errors[0].error).toBe('Expected a rule name');
  });

  it('doesn\'t parse rule names that could be confused with notes', function() {
    var rules1 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('A = R1')));
    var rules2 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('Am = R1')));
    var rules3 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('IV = R1')));
    var rules4 = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('X = R1')));

    expect(rules1.errors[0].error).toBe('A is not a valid name, since it\'s a note');
    expect(rules2.errors[0].error).toBe('Am is not a valid name, since it\'s a chord');
    expect(rules3.errors[0].error).toBe('IV is not a valid name, since it\'s a degree chord');
    expect(rules4.errors[0].error).toBe('X is not a valid name, since it\'s a drum hit');
  });

  it('doesn\'t parse rules that don\'t have valid names' , function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('2 = R2 R3'));
    expect(rules.errors[0].error).toBe('2 is not a valid name');
  });

  it('doesn\'t parse conditions without numbers', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > y) R1 R2'));
    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x < y) R1 R2'));
    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x < y < z) R1 R2'));
    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > y > z) R1 R2'));

    expect(rules1.errors[0].error).toBe('Expected a condition');
    expect(rules2.errors[0].error).toBe('Expected a condition');
    expect(rules3.errors[0].error).toBe('Expected a condition');
    expect(rules4.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without parameters', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 > 0.2) R1 R2'));
    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < 0.2) R1 R2'));
    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < 0.2 < 0.3) R1 R2'));        
    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.3 > 0.2 > 0.1) R1 R2'));

    expect(rules1.errors[0].error).toBe('Expected a condition');
    expect(rules2.errors[0].error).toBe('Expected a condition');
    expect(rules3.errors[0].error).toBe('Expected a condition');
    expect(rules4.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without < or >', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x == 0.1) R1 R2'));
    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 == x) R1 R2'));

    expect(rules1.errors[0].error).toBe('Expected a condition');
    expect(rules2.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions that don\'t end with )', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > 0.1 R1 R2'));
    expect(rules.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions with other stuff than parameters or numbers', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (R1 > 0.1) R1 R2'));
    expect(rules.errors[0].error).toBe('Expected a condition');
  });

  it('doesn\'t parse invalid notes', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C / J Caug2'));
    expect(rules.errors[0].error).toBe('Expected a note, chord, drum hit or pause');
  });

  it('can parse incomplete rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1'));
    expect(rules.length).toBe(1);
  });

  it('can parse empty definitions', function() {
    var rules1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ='));
    expect(rules1.length).toBe(1);

    var rules2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\n'));
    expect(rules2.length).toBe(1);

    var rules3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2 = R3'));
    expect(rules3[0].name).toBe('R1');
    expect(rules3[1].name).toBe('R2');
    expect(rules3[1].definitions[0].sequence[0].name).toBe('R3');

    var rules4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\n\nR2 = R3'));
    expect(rules4[0].name).toBe('R1');
    expect(rules4[1].name).toBe('R2');
    expect(rules4[1].definitions[0].sequence[0].name).toBe('R3');
  });

  it('can parse empty definitions with condition', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > 0.3)'));
    expect(rules[0].definitions[0]).toEqual({});
  });

  it('ignores line breaks after equal sign', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2\nR3'));
    expect(rules[0].name).toBe('R1');
    expect(rules[0].definitions[0].sequence[0].name).toBe('R2');
    expect(rules[0].definitions[1].sequence[0].name).toBe('R3');
  });

  it('ignores line breaks before the first rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('\n\nR1 = R2 R1\n\nR2 = C'));
    expect(rules[0].name).toBe('R1');
  });

  it('ignores line breaks after the last rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R1\n\nR2 = C\n\n'));
    expect(rules[0].name).toBe('R1');
  });

  it('ignores extra line breaks between rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R2\n\n\n\nR2 = C'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });

  it('ignores comments before the first rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('* No comment\nR1 = R2 R1\n\nR2 = C'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });

  it('ignores comments after the last rule', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R1\n\nR2 = C\n* No comment'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });

  it('ignores comments between rules', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R2\n\n* No comment\nR2 = C'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });

  it('ignores comments at the end of line', function() {
    var rules = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2 R2 * No comment\nR2 R2\n\nR2 = C'));
    expect(rules[0].name).toBe('R1');
    expect(rules[1].name).toBe('R2');
  });
});