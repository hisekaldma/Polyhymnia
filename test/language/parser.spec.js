describe('Parser', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can parse sequences', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R3'));

    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[0].definitions[0].sequence[0].name).toBe('R2');
    expect(result.rules[0].definitions[0].sequence[1].name).toBe('R3');
  });

  it('can parse patterns', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C D E F'));
    
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(result.rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(result.rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][2].note).toEqual('E');
    expect(result.rules[0].definitions[0].pattern[0][2].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][3].note).toEqual('F');
    expect(result.rules[0].definitions[0].pattern[0][3].type).toBe(noteType.NOTE);
  });

  it('can parse sequences with an instrument', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = Piano: R2 R3'));

    expect(result.rules[0].definitions[0].instrument.name).toBe('Piano');
  });

  it('can parse patterns with an instrument', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = Piano: C D E F'));

    expect(result.rules[0].definitions[0].instrument.name).toBe('Piano');
  });

  it('can parse multi bar patterns', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C D | E F'));
    
    expect(result.rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(result.rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(result.rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[1][0].note).toEqual('E');
    expect(result.rules[0].definitions[0].pattern[1][0].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[1][1].note).toEqual('F');
    expect(result.rules[0].definitions[0].pattern[1][1].type).toBe(noteType.NOTE);
  });

  it('can parse anonymous patterns', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('C D E F'));

    expect(result.rules[0].name).toBe('');
    expect(result.rules[0].definitions[0].pattern[0][0].note).toEqual('C');
    expect(result.rules[0].definitions[0].pattern[0][0].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][1].note).toEqual('D');
    expect(result.rules[0].definitions[0].pattern[0][1].type).toBe(noteType.NOTE);
    expect(result.rules[0].definitions[0].pattern[0][2].note).toEqual('E');
    expect(result.rules[0].definitions[0].pattern[0][2].type).toBe(noteType.NOTE);
  });

  it('can parse anonymous sequences', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 R2 R3'));
    
    expect(result.rules[0].name).toBe('');
    expect(result.rules[0].definitions[0].sequence[0].name).toEqual('R1');
    expect(result.rules[0].definitions[0].sequence[1].name).toEqual('R2');
    expect(result.rules[0].definitions[0].sequence[2].name).toEqual('R3');
  });

  it('can parse min conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (var > 0.1) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse max conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (var < 1.0) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse between conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.5 < var < 1.0) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.min).toBe(0.5);
    expect(result.rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse min conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < var) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.min).toBe(0.1);
  });
  
  it('can parse reverse max conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (1.0 > var) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('can parse reverse between conditions', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (1.0 > var > 0.5) C D E F'));

    expect(result.rules[0].definitions[0].condition.param).toBe('var');
    expect(result.rules[0].definitions[0].condition.min).toBe(0.5);
    expect(result.rules[0].definitions[0].condition.max).toBe(1.0);
  });

  it('doesn\'t parse mixed sequences and patterns', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C R2'));
    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R1 C'));

    expect(result1.errors[0].message).toBe('Expected a note, chord, drum hit or pause');
    expect(result2.errors[0].message).toBe('Expected a rule name');
  });

  it('doesn\'t parse rule names that could be confused with notes', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('A = R1'));
    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('Am = R1'));
    var result3 = Polyhymnia.parse(Polyhymnia.tokenize('IV = R1'));
    var result4 = Polyhymnia.parse(Polyhymnia.tokenize('X = R1'));

    expect(result1.errors[0].message).toBe('A is not a valid name, since it\'s a note');
    expect(result2.errors[0].message).toBe('Am is not a valid name, since it\'s a chord');
    expect(result3.errors[0].message).toBe('IV is not a valid name, since it\'s a degree chord');
    expect(result4.errors[0].message).toBe('X is not a valid name, since it\'s a drum hit');
  });

  it('doesn\'t parse rules that don\'t have valid names' , function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('2 = R2 R3'));
    expect(result.errors[0].message).toBe('2 is not a valid name');
  });

  it('doesn\'t parse conditions without numbers', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > y) R1 R2'));
    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x < y) R1 R2'));
    var result3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x < y < z) R1 R2'));
    var result4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > y > z) R1 R2'));

    expect(result1.errors[0].message).toBe('Expected a condition');
    expect(result2.errors[0].message).toBe('Expected a condition');
    expect(result3.errors[0].message).toBe('Expected a condition');
    expect(result4.errors[0].message).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without parameters', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 > 0.2) R1 R2'));
    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < 0.2) R1 R2'));
    var result3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 < 0.2 < 0.3) R1 R2'));        
    var result4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.3 > 0.2 > 0.1) R1 R2'));

    expect(result1.errors[0].message).toBe('Expected a condition');
    expect(result2.errors[0].message).toBe('Expected a condition');
    expect(result3.errors[0].message).toBe('Expected a condition');
    expect(result4.errors[0].message).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions without < or >', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x == 0.1) R1 R2'));
    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (0.1 == x) R1 R2'));

    expect(result1.errors[0].message).toBe('Expected a condition');
    expect(result2.errors[0].message).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions that don\'t end with )', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > 0.1 R1 R2'));
    expect(result.errors[0].message).toBe('Expected a condition');
  });

  it('doesn\'t parse conditions with other stuff than parameters or numbers', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (R1 > 0.1) R1 R2'));
    expect(result.errors[0].message).toBe('Expected a condition');
  });

  it('doesn\'t parse invalid notes', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = C / J Caug2'));
    expect(result.errors[0].message).toBe('Expected a note, chord, drum hit or pause');
  });

  it('can parse incomplete rules', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1'));
    expect(result.rules.length).toBe(1);
  });

  it('can parse empty definitions', function() {
    var result1 = Polyhymnia.parse(Polyhymnia.tokenize('R1 ='));
    expect(result1.rules.length).toBe(1);

    var result2 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\n'));
    expect(result2.rules.length).toBe(1);

    var result3 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2 = R3'));
    expect(result3.rules[0].name).toBe('R1');
    expect(result3.rules[1].name).toBe('R2');
    expect(result3.rules[1].definitions[0].sequence[0].name).toBe('R3');

    var result4 = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\n\nR2 = R3'));
    expect(result4.rules[0].name).toBe('R1');
    expect(result4.rules[1].name).toBe('R2');
    expect(result4.rules[1].definitions[0].sequence[0].name).toBe('R3');
  });

  it('can parse empty definitions with condition', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = (x > 0.3)'));
    expect(result.rules[0].definitions[0]).toEqual({});
  });

  it('ignores line breaks after equal sign', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2\nR3'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[0].definitions[0].sequence[0].name).toBe('R2');
    expect(result.rules[0].definitions[1].sequence[0].name).toBe('R3');
  });

  it('ignores line breaks before the first rule', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('\n\nR1 = R2 R1\n\nR2 = C'));
    expect(result.rules[0].name).toBe('R1');
  });

  it('ignores line breaks after the last rule', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R1\n\nR2 = C\n\n'));
    expect(result.rules[0].name).toBe('R1');
  });

  it('ignores extra line breaks between rules', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R2\n\n\n\nR2 = C'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[1].name).toBe('R2');
  });

  it('ignores comments before the first rule', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('* No comment\nR1 = R2 R1\n\nR2 = C'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[1].name).toBe('R2');
  });

  it('ignores comments after the last rule', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R1\n\nR2 = C\n* No comment'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[1].name).toBe('R2');
  });

  it('ignores comments between rules', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2 R2\n\n* No comment\nR2 = C'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[1].name).toBe('R2');
  });

  it('ignores comments at the end of line', function() {
    var result = Polyhymnia.parse(Polyhymnia.tokenize('R1 =\nR2 R2 * No comment\nR2 R2\n\nR2 = C'));
    expect(result.rules[0].name).toBe('R1');
    expect(result.rules[1].name).toBe('R2');
  });
});