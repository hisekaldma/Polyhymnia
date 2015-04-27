describe('Generator', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  function parse(code) {
    return Polyhymnia.parse(Polyhymnia.tokenize(code)).rules;
  }

  it('can interpret simple sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = R1 R2 \n R1 = C \n R2 = D'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
  });

  it('can interpret nested sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = R1 R2 \n R1 = C \n R2 = R3 R3 \n R3 = D'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
    expect(output3.patterns[0].pattern[0].key).toBe(62);
  });

  it('can interpret parallel sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n R1 R2 \n R2 R1 \n\n R1 = C \n R2 = D'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output1.patterns[1].pattern[0].key).toBe(62);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
    expect(output2.patterns[1].pattern[0].key).toBe(60);
  });

  it('can interpret parallel sequences of different length', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n R1 R1 R2 \n R3 R4 \n\n R1 = C \n R2 = D \n R3 = E \n R4 = F'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1.patterns.length).toBe(2);
    expect(output2.patterns.length).toBe(2);
    expect(output3.patterns.length).toBe(2);
    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output1.patterns[1].pattern[0].key).toBe(64);
    expect(output2.patterns[0].pattern[0].key).toBe(60);
    expect(output2.patterns[1].pattern[0].key).toBe(65);
    expect(output3.patterns[0].pattern[0].key).toBe(62);
    expect(output3.patterns[1].pattern[0].key).toBe(64);
  });

  it('can interpret mixed patterns and sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n R1 R2 \n E \n\n R1 = C \n R2 = D'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output1.patterns[1].pattern[0].key).toBe(64);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
    expect(output2.patterns[1].pattern[0].key).toBe(64);
  });

  it('only chooses sequence definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (x > 0) R1 R2 \n (x > 5) R2 R1 \n\n R1 = C \n R2 = D'));

    generator.setParam('x', 2);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns.length).toBe(1);
    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output2.patterns.length).toBe(1);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
  });

  it('only chooses sequence definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (x < 5) R1 R2 \n (x < 9) R2 R1 \n\n R1 = C \n R2 = D'));

    generator.setParam('x', 7);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns.length).toBe(1);
    expect(output1.patterns[0].pattern[0].key).toBe(62);
    expect(output2.patterns.length).toBe(1);
    expect(output2.patterns[0].pattern[0].key).toBe(60);
  });

  it('only chooses sequence definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (3 > x > 0) R1 R1 \n (6 > x > 3) R1 R2 \n (9 > x > 6) R2 R2 \n\n R1 = C \n R2 = D'));

    generator.setParam('x', 5);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns.length).toBe(1);
    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output2.patterns.length).toBe(1);
    expect(output2.patterns[0].pattern[0].key).toBe(62);
  });

  it('can interpret simple patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = C D E F'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(62);
    expect(output.patterns[0].pattern[2].key).toBe(64);
    expect(output.patterns[0].pattern[3].key).toBe(65);
  });

  it('can interpret multi bar patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = C D | E F'));

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output1.patterns[0].pattern[1].key).toBe(62);
    expect(output2.patterns[0].pattern[0].key).toBe(64);
    expect(output2.patterns[0].pattern[1].key).toBe(65);
  });

  it('can interpret parallel patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n C D E F \n B A G F'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(62);
    expect(output.patterns[0].pattern[2].key).toBe(64);
    expect(output.patterns[0].pattern[3].key).toBe(65);
    expect(output.patterns[1].pattern[0].key).toBe(71);
    expect(output.patterns[1].pattern[1].key).toBe(69);
    expect(output.patterns[1].pattern[2].key).toBe(67);
    expect(output.patterns[1].pattern[3].key).toBe(65);
  });

  it('can interpret nested patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n C C \n P2 \n\n P2 = \n D D'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);
    expect(output.patterns[1].pattern[0].key).toBe(62);
    expect(output.patterns[1].pattern[1].key).toBe(62);
  });

  it('only chooses pattern definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (x > 0) C C \n (x > 5) D D'));

    generator.setParam('x', 2);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);
  });

  it('only chooses pattern definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (x < 5) C C \n (x < 9) D D'));

    generator.setParam('x', 7);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].pattern[0].key).toBe(62);
    expect(output.patterns[0].pattern[1].key).toBe(62);
  });

  it('only chooses pattern definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = \n (3 > x > 0) C C \n (6 > x > 3) D D \n (9 > x > 6) E E'));

    generator.setParam('x', 5);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].pattern[0].key).toBe(62);
    expect(output.patterns[0].pattern[1].key).toBe(62);
  });


  it('uses instruments defined on patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = Synth: C C'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Synth');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);    
  });

  it('uses instruments defined on sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = Synth: P1 \n P1 = C C'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Synth');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);
  });

  it('overrides instruments defined on referenced rules', function() {    
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('Play = Synth: P1 \n P1 = Marimba: C C'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Synth');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);
  });

  it('plays a single rule even if it isn\'t called Play', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules(parse('P1 = Synth: C C'));

    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Synth');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(60);
  });
});