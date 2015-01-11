describe('Tokenizer', function() {
  'use strict';
  var tokenType = Polyhymnia.tokenType;

  it('can tokenize an empty string', function() {
    var tokens = Polyhymnia.tokenize('');
    expect(tokens.length).toBe(0);
  });

  it('can tokenize names', function() {
    var tokens = Polyhymnia.tokenize('R1 R2');

    expect(tokens[0].value).toBe('R1');
    expect(tokens[0].type).toBe(tokenType.NAME);
    expect(tokens[1].value).toBe('R2');
    expect(tokens[1].type).toBe(tokenType.NAME);
  });
  
  it('can tokenize arrow', function() {
    var tokens = Polyhymnia.tokenize('->');
    expect(tokens[0].type).toBe(tokenType.ARROW);
  });
  
  it('can tokenize symbols', function() {
    var tokens = Polyhymnia.tokenize('( < > )');
    expect(tokens[0].type).toBe(tokenType.LEFT_PAREN);
    expect(tokens[1].type).toBe(tokenType.LESS_THAN);
    expect(tokens[2].type).toBe(tokenType.GREATER_THAN);
    expect(tokens[3].type).toBe(tokenType.RIGHT_PAREN);
  });
  
  it('can tokenize notes', function() {
    var tokens = Polyhymnia.tokenize('Piano: C D# Eb F3 G#3 A-1 Bb-1');

    expect(tokens[1].value).toEqual({ note: 'C', octave: undefined });
    expect(tokens[1].type).toBe(tokenType.NOTE);
    expect(tokens[2].value).toEqual({ note: 'D#', octave: undefined });
    expect(tokens[2].type).toBe(tokenType.NOTE);
    expect(tokens[3].value).toEqual({ note: 'Eb', octave: undefined });
    expect(tokens[3].type).toBe(tokenType.NOTE);
    expect(tokens[4].value).toEqual({ note: 'F', octave: 3 });
    expect(tokens[4].type).toBe(tokenType.NOTE);
    expect(tokens[5].value).toEqual({ note: 'G#', octave: 3 });
    expect(tokens[5].type).toBe(tokenType.NOTE);
    expect(tokens[6].value).toEqual({ note: 'A', octave: -1 });
    expect(tokens[6].type).toBe(tokenType.NOTE);
    expect(tokens[7].value).toEqual({ note: 'Bb', octave: -1 });
    expect(tokens[7].type).toBe(tokenType.NOTE);
  });
  
  it('can tokenize chords', function() {
    var tokens = Polyhymnia.tokenize('Piano: CM Dm E#dom Fbaug7 Gdim7 C3M D-1m E#4dom Fb-1aug7 G0dim7');
    
    expect(tokens[1].value).toEqual({ note: 'C', octave: undefined, chord: 'M' });
    expect(tokens[1].type).toBe(tokenType.CHORD);
    expect(tokens[2].value).toEqual({ note: 'D', octave: undefined, chord: 'm' });
    expect(tokens[2].type).toBe(tokenType.CHORD);
    expect(tokens[3].value).toEqual({ note: 'E#', octave: undefined, chord: 'dom' });
    expect(tokens[3].type).toBe(tokenType.CHORD);
    expect(tokens[4].value).toEqual({ note: 'Fb', octave: undefined, chord: 'aug7' });
    expect(tokens[4].type).toBe(tokenType.CHORD);
    expect(tokens[5].value).toEqual({ note: 'G', octave: undefined, chord: 'dim7' });
    expect(tokens[5].type).toBe(tokenType.CHORD);

    expect(tokens[6].value).toEqual({ note: 'C', octave: 3, chord: 'M' });
    expect(tokens[6].type).toBe(tokenType.CHORD);
    expect(tokens[7].value).toEqual({ note: 'D', octave: -1, chord: 'm' });
    expect(tokens[7].type).toBe(tokenType.CHORD);
    expect(tokens[8].value).toEqual({ note: 'E#', octave: 4, chord: 'dom' });
    expect(tokens[8].type).toBe(tokenType.CHORD);
    expect(tokens[9].value).toEqual({ note: 'Fb', octave: -1, chord: 'aug7' });
    expect(tokens[9].type).toBe(tokenType.CHORD);
    expect(tokens[10].value).toEqual({ note: 'G', octave: 0, chord: 'dim7' });
    expect(tokens[10].type).toBe(tokenType.CHORD);    
  });

  it('can tokenize drums', function() {
    var tokens = Polyhymnia.tokenize('Kick: x X');
    
    expect(tokens[1].value).toBe('x');
    expect(tokens[1].type).toBe(tokenType.DRUM_TRIGGER);
    expect(tokens[2].value).toBe('X');
    expect(tokens[2].type).toBe(tokenType.DRUM_TRIGGER);
  });

  it('can tokenize numbers', function() {
    var tokens = Polyhymnia.tokenize('(1.0 0.2 3.14 100.001 0.0 1 0)');
    
    expect(tokens[1].value).toBe('1.0');
    expect(tokens[1].type).toBe(tokenType.NUMBER);
    expect(tokens[2].value).toBe('0.2');
    expect(tokens[2].type).toBe(tokenType.NUMBER);
    expect(tokens[3].value).toBe('3.14');
    expect(tokens[3].type).toBe(tokenType.NUMBER);
    expect(tokens[4].value).toBe('100.001');
    expect(tokens[4].type).toBe(tokenType.NUMBER);
    expect(tokens[5].value).toBe('0.0');
    expect(tokens[5].type).toBe(tokenType.NUMBER);
    expect(tokens[6].value).toBe('1');
    expect(tokens[6].type).toBe(tokenType.NUMBER);
    expect(tokens[7].value).toBe('0');
    expect(tokens[7].type).toBe(tokenType.NUMBER);
  });

  it('can\'t tokenize invalid numbers', function() {
    var tokens = Polyhymnia.tokenize('(00 00.2 001.0 1.0.0)');

    expect(tokens[1].type).toBe(tokenType.ERROR);
    expect(tokens[2].type).toBe(tokenType.ERROR);
    expect(tokens[3].type).toBe(tokenType.ERROR);
    expect(tokens[4].type).toBe(tokenType.ERROR);
  });
  
  it('can tokenize line breaks', function() {
    var tokens = Polyhymnia.tokenize('\n');
    expect(tokens[0].type).toBe(tokenType.EOL);
  });

  it('names start with uppercase', function() {
    var tokens = Polyhymnia.tokenize('TestName1');
    expect(tokens[0].type).toBe(tokenType.NAME);
  });

  it('names can be one letter', function() {
    var tokens = Polyhymnia.tokenize('T');
    expect(tokens[0].type).toBe(tokenType.NAME);
  });

  it('params start with lowercase', function() {
    var tokens = Polyhymnia.tokenize('(testName1)');
    expect(tokens[1].type).toBe(tokenType.PARAM);
  });

  it('params can be one letter', function() {
    var tokens = Polyhymnia.tokenize('(a x o i v)');
    expect(tokens[0].type).toBe(tokenType.LEFT_PAREN);
    expect(tokens[1].type).toBe(tokenType.PARAM);
    expect(tokens[2].type).toBe(tokenType.PARAM);
    expect(tokens[3].type).toBe(tokenType.PARAM);
    expect(tokens[4].type).toBe(tokenType.PARAM);
    expect(tokens[5].type).toBe(tokenType.PARAM);
    expect(tokens[6].type).toBe(tokenType.RIGHT_PAREN);
  });
});