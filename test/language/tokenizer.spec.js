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

    expect(tokens[1].note).toBe('C');
    expect(tokens[1].octave).toBe(undefined);
    expect(tokens[1].type).toBe(tokenType.NOTE);
    expect(tokens[2].note).toBe('D#');
    expect(tokens[2].octave).toBe(undefined);
    expect(tokens[2].type).toBe(tokenType.NOTE);
    expect(tokens[3].note).toBe('Eb');
    expect(tokens[3].octave).toBe(undefined);
    expect(tokens[3].type).toBe(tokenType.NOTE);
    expect(tokens[4].note).toBe('F');
    expect(tokens[4].octave).toBe(3);
    expect(tokens[4].type).toBe(tokenType.NOTE);
    expect(tokens[5].note).toBe('G#');
    expect(tokens[5].octave).toBe(3);
    expect(tokens[5].type).toBe(tokenType.NOTE);
    expect(tokens[6].note).toBe('A');
    expect(tokens[6].octave).toBe(-1);
    expect(tokens[6].type).toBe(tokenType.NOTE);
    expect(tokens[7].note).toBe('Bb');
    expect(tokens[7].octave).toBe(-1);
    expect(tokens[7].type).toBe(tokenType.NOTE);
  });
  
  it('can tokenize chords', function() {
    var tokens = Polyhymnia.tokenize('Piano: CM Dm E#dom Fbaug7 Gdim7 C3M D-1m E#4dom Fb-1aug7 G0dim7');
    
    expect(tokens[1].note).toBe('C');
    expect(tokens[1].chord).toBe('M');
    expect(tokens[1].octave).toBe(undefined);
    expect(tokens[1].type).toBe(tokenType.CHORD);
    expect(tokens[2].note).toBe('D');
    expect(tokens[2].chord).toBe('m');
    expect(tokens[2].octave).toBe(undefined);
    expect(tokens[2].type).toBe(tokenType.CHORD);
    expect(tokens[3].note).toBe('E#');
    expect(tokens[3].chord).toBe('dom');
    expect(tokens[3].octave).toBe(undefined);
    expect(tokens[3].type).toBe(tokenType.CHORD);
    expect(tokens[4].note).toBe('Fb');
    expect(tokens[4].chord).toBe('aug7');
    expect(tokens[4].octave).toBe(undefined);
    expect(tokens[4].type).toBe(tokenType.CHORD);
    expect(tokens[5].note).toBe('G');
    expect(tokens[5].chord).toBe('dim7');
    expect(tokens[5].octave).toBe(undefined);
    expect(tokens[5].type).toBe(tokenType.CHORD);

    expect(tokens[6].note).toBe('C');
    expect(tokens[6].chord).toBe('M');
    expect(tokens[6].octave).toBe(3);
    expect(tokens[6].type).toBe(tokenType.CHORD);
    expect(tokens[7].note).toBe('D');
    expect(tokens[7].chord).toBe('m');
    expect(tokens[7].octave).toBe(-1);
    expect(tokens[7].type).toBe(tokenType.CHORD);
    expect(tokens[8].note).toBe('E#');
    expect(tokens[8].chord).toBe('dom');
    expect(tokens[8].octave).toBe(4);
    expect(tokens[8].type).toBe(tokenType.CHORD);
    expect(tokens[9].note).toBe('Fb');
    expect(tokens[9].chord).toBe('aug7');
    expect(tokens[9].octave).toBe(-1);
    expect(tokens[9].type).toBe(tokenType.CHORD);
    expect(tokens[10].note).toBe('G');
    expect(tokens[10].chord).toBe('dim7');
    expect(tokens[10].octave).toBe(0);
    expect(tokens[10].type).toBe(tokenType.CHORD); 
  });
  
  it('can tokenize degree notes', function() {
    var tokens = Polyhymnia.tokenize('Piano: 1 2 3 4 5 6 7');
    
    expect(tokens[1].value).toEqual('1');
    expect(tokens[1].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[2].value).toEqual('2');
    expect(tokens[2].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[3].value).toEqual('3');
    expect(tokens[3].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[4].value).toEqual('4');
    expect(tokens[4].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[5].value).toEqual('5');
    expect(tokens[5].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[6].value).toEqual('6');
    expect(tokens[6].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[7].value).toEqual('7');
    expect(tokens[7].type).toBe(tokenType.DEGREE_NOTE);
  });

  it('can tokenize degree chords', function() {
    var tokens = Polyhymnia.tokenize('Piano: I ii iii° IV+ V7 vi7 vii°7 I+7');
    
    expect(tokens[1].value).toEqual('I');
    expect(tokens[1].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[2].value).toEqual('ii');
    expect(tokens[2].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[3].value).toEqual('iii°');
    expect(tokens[3].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[4].value).toEqual('IV+');
    expect(tokens[4].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[5].value).toEqual('V7');
    expect(tokens[5].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[6].value).toEqual('vi7');
    expect(tokens[6].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[7].value).toEqual('vii°7');
    expect(tokens[7].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[8].value).toEqual('I+7');
    expect(tokens[8].type).toBe(tokenType.DEGREE_CHORD);
  });

  it('can tokenize drums', function() {
    var tokens = Polyhymnia.tokenize('Kick: x X');
    
    expect(tokens[1].value).toBe('x');
    expect(tokens[1].type).toBe(tokenType.DRUM_HIT);
    expect(tokens[2].value).toBe('X');
    expect(tokens[2].type).toBe(tokenType.DRUM_HIT);
  });

  it('can tokenize numbers', function() {
    var tokens = Polyhymnia.tokenize('(1.0 0.2 3.14 100.001 0.0 1 0)');
    
    expect(tokens[1].value).toBe(1.0);
    expect(tokens[1].type).toBe(tokenType.NUMBER);
    expect(tokens[2].value).toBe(0.2);
    expect(tokens[2].type).toBe(tokenType.NUMBER);
    expect(tokens[3].value).toBe(3.14);
    expect(tokens[3].type).toBe(tokenType.NUMBER);
    expect(tokens[4].value).toBe(100.001);
    expect(tokens[4].type).toBe(tokenType.NUMBER);
    expect(tokens[5].value).toBe(0.0);
    expect(tokens[5].type).toBe(tokenType.NUMBER);
    expect(tokens[6].value).toBe(1);
    expect(tokens[6].type).toBe(tokenType.NUMBER);
    expect(tokens[7].value).toBe(0);
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