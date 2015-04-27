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
  
  it('can tokenize equal sign', function() {
    var tokens = Polyhymnia.tokenize('=');
    expect(tokens[0].type).toBe(tokenType.EQUAL);
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

    expect(tokens[1].value.note).toBe('C');
    expect(tokens[1].value.octave).toBe(undefined);
    expect(tokens[1].type).toBe(tokenType.NOTE);
    expect(tokens[2].value.note).toBe('D#');
    expect(tokens[2].value.octave).toBe(undefined);
    expect(tokens[2].type).toBe(tokenType.NOTE);
    expect(tokens[3].value.note).toBe('Eb');
    expect(tokens[3].value.octave).toBe(undefined);
    expect(tokens[3].type).toBe(tokenType.NOTE);
    expect(tokens[4].value.note).toBe('F');
    expect(tokens[4].value.octave).toBe(3);
    expect(tokens[4].type).toBe(tokenType.NOTE);
    expect(tokens[5].value.note).toBe('G#');
    expect(tokens[5].value.octave).toBe(3);
    expect(tokens[5].type).toBe(tokenType.NOTE);
    expect(tokens[6].value.note).toBe('A');
    expect(tokens[6].value.octave).toBe(-1);
    expect(tokens[6].type).toBe(tokenType.NOTE);
    expect(tokens[7].value.note).toBe('Bb');
    expect(tokens[7].value.octave).toBe(-1);
    expect(tokens[7].type).toBe(tokenType.NOTE);
  });
  
  it('can tokenize chords', function() {
    var tokens = Polyhymnia.tokenize('Piano: CM Dm E#dom Fbaug7 Gdim7 C3M D-1m E#4dom Fb-1aug7 G0dim7');
    
    expect(tokens[1].value.note).toBe('C');
    expect(tokens[1].value.chord).toBe('M');
    expect(tokens[1].value.octave).toBe(undefined);
    expect(tokens[1].type).toBe(tokenType.CHORD);
    expect(tokens[2].value.note).toBe('D');
    expect(tokens[2].value.chord).toBe('m');
    expect(tokens[2].value.octave).toBe(undefined);
    expect(tokens[2].type).toBe(tokenType.CHORD);
    expect(tokens[3].value.note).toBe('E#');
    expect(tokens[3].value.chord).toBe('dom');
    expect(tokens[3].value.octave).toBe(undefined);
    expect(tokens[3].type).toBe(tokenType.CHORD);
    expect(tokens[4].value.note).toBe('Fb');
    expect(tokens[4].value.chord).toBe('aug7');
    expect(tokens[4].value.octave).toBe(undefined);
    expect(tokens[4].type).toBe(tokenType.CHORD);
    expect(tokens[5].value.note).toBe('G');
    expect(tokens[5].value.chord).toBe('dim7');
    expect(tokens[5].value.octave).toBe(undefined);
    expect(tokens[5].type).toBe(tokenType.CHORD);

    expect(tokens[6].value.note).toBe('C');
    expect(tokens[6].value.chord).toBe('M');
    expect(tokens[6].value.octave).toBe(3);
    expect(tokens[6].type).toBe(tokenType.CHORD);
    expect(tokens[7].value.note).toBe('D');
    expect(tokens[7].value.chord).toBe('m');
    expect(tokens[7].value.octave).toBe(-1);
    expect(tokens[7].type).toBe(tokenType.CHORD);
    expect(tokens[8].value.note).toBe('E#');
    expect(tokens[8].value.chord).toBe('dom');
    expect(tokens[8].value.octave).toBe(4);
    expect(tokens[8].type).toBe(tokenType.CHORD);
    expect(tokens[9].value.note).toBe('Fb');
    expect(tokens[9].value.chord).toBe('aug7');
    expect(tokens[9].value.octave).toBe(-1);
    expect(tokens[9].type).toBe(tokenType.CHORD);
    expect(tokens[10].value.note).toBe('G');
    expect(tokens[10].value.chord).toBe('dim7');
    expect(tokens[10].value.octave).toBe(0);
    expect(tokens[10].type).toBe(tokenType.CHORD); 
  });
  
  it('can tokenize degree notes', function() {
    var tokens = Polyhymnia.tokenize('Piano: 1 2 3 4 5 6 7');
    
    expect(tokens[1].value.str).toBe('1');
    expect(tokens[1].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[2].value.str).toBe('2');
    expect(tokens[2].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[3].value.str).toBe('3');
    expect(tokens[3].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[4].value.str).toBe('4');
    expect(tokens[4].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[5].value.str).toBe('5');
    expect(tokens[5].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[6].value.str).toBe('6');
    expect(tokens[6].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[7].value.str).toBe('7');
    expect(tokens[7].type).toBe(tokenType.DEGREE_NOTE);
  });

  it('can tokenize degree chords', function() {
    var tokens = Polyhymnia.tokenize('Piano: I ii iii° IV+ V7 vi7 vii°7 I+7');
    
    expect(tokens[1].value.str).toBe('I');
    expect(tokens[1].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[2].value.str).toBe('ii');
    expect(tokens[2].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[3].value.str).toBe('iii°');
    expect(tokens[3].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[4].value.str).toBe('IV+');
    expect(tokens[4].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[5].value.str).toBe('V7');
    expect(tokens[5].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[6].value.str).toBe('vi7');
    expect(tokens[6].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[7].value.str).toBe('vii°7');
    expect(tokens[7].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[8].value.str).toBe('I+7');
    expect(tokens[8].type).toBe(tokenType.DEGREE_CHORD);
  });

  it('can tokenize drums', function() {
    var tokens = Polyhymnia.tokenize('Kick: x X o O');
    
    expect(tokens[1].value.str).toBe('x');
    expect(tokens[1].type).toBe(tokenType.DRUM_HIT);
    expect(tokens[2].value.str).toBe('X');
    expect(tokens[2].type).toBe(tokenType.DRUM_HIT);
    expect(tokens[3].value.str).toBe('o');
    expect(tokens[3].type).toBe(tokenType.DRUM_HIT);
    expect(tokens[4].value.str).toBe('O');
    expect(tokens[4].type).toBe(tokenType.DRUM_HIT);
  });

  it('can tokenize velocities', function() {
    var tokens = Polyhymnia.tokenize('Piano: C4.f Dm.0 4.127 II.ppp x.115 X.67');

    expect(tokens[1].value.note).toBe('C');
    expect(tokens[1].value.velocity).toBe('f');
    expect(tokens[1].type).toBe(tokenType.NOTE);
    expect(tokens[2].value.note).toBe('D');
    expect(tokens[2].value.velocity).toBe(0);
    expect(tokens[2].type).toBe(tokenType.CHORD);
    expect(tokens[3].value.str).toBe('4');
    expect(tokens[3].value.velocity).toBe(127);
    expect(tokens[3].type).toBe(tokenType.DEGREE_NOTE);
    expect(tokens[4].value.str).toBe('II');
    expect(tokens[4].value.velocity).toBe('ppp');
    expect(tokens[4].type).toBe(tokenType.DEGREE_CHORD);
    expect(tokens[5].value.str).toBe('x');
    expect(tokens[5].value.velocity).toBe(115);
    expect(tokens[5].type).toBe(tokenType.DRUM_HIT);
    expect(tokens[6].value.str).toBe('X');
    expect(tokens[6].value.velocity).toBe(67);
    expect(tokens[6].type).toBe(tokenType.DRUM_HIT);
  });

  it('can\'t tokenize invalid velocities', function() {
    var tokens = Polyhymnia.tokenize('Piano: C.a Dm.128 4.01 II.pppp');

    expect(tokens[1].type).toBe(tokenType.ERROR);
    expect(tokens[2].type).toBe(tokenType.ERROR);
    expect(tokens[3].type).toBe(tokenType.ERROR);
    expect(tokens[4].type).toBe(tokenType.ERROR);
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
  
  it('can tokenize bar dividers', function() {
    var tokens = Polyhymnia.tokenize('Piano: |');
    expect(tokens[1].type).toBe(tokenType.BAR);
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

  it('can tokenize comments in the beginning', function() {
    var tokens = Polyhymnia.tokenize('* No comment\nPlay = C D E F');
    expect(tokens[0].value).toBe('* No comment');
    expect(tokens[0].type).toBe(tokenType.COMMENT);
  });

  it('can tokenize comments in the middle', function() {
    var tokens = Polyhymnia.tokenize('Play = C D E F\n* No comment\nA = C D E F');
    expect(tokens[7].value).toBe('* No comment');
    expect(tokens[7].type).toBe(tokenType.COMMENT);
  });

  it('can tokenize comments at the end', function() {
    var tokens = Polyhymnia.tokenize('Play = C D E F\n* No comment');
    expect(tokens[7].value).toBe('* No comment');
    expect(tokens[7].type).toBe(tokenType.COMMENT);
  });
});