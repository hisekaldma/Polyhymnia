describe('Generator', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can interpret simple sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }, { name: 'R2' }] }] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output2.patterns[0].instrument).toBe('Conga');
  });

  it('can interpret nested sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }, { name: 'R2' }] }] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2',   definitions: [{ sequence: [{ name: 'R3' }, { name: 'R3' }] }] },
      { name: 'R3',   definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output2.patterns[0].instrument).toBe('Conga');
    expect(output3.patterns[0].instrument).toBe('Conga');
  });

  it('can interpret parallel sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }, { name: 'R2' }] }, { sequence: [{ name: 'R2' }, { name: 'R1' }] }] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output1.patterns[1].instrument).toBe('Conga');
    expect(output2.patterns[0].instrument).toBe('Conga');
    expect(output2.patterns[1].instrument).toBe('Piano');
  });

  it('can interpret nested parallel sequences of different length', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }, { name: 'R5' }] }] },
      { name: 'R1',   definitions: [{ sequence: [{ name: 'R2' }, { name: 'R3' }] }, { sequence: [{ name: 'R4' }] }] },
      { name: 'R2',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R3',   definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] },
      { name: 'R4',   definitions: [{ instrument: { name: 'Viola' }, pattern: [[]]}] },
      { name: 'R5',   definitions: [{ instrument: { name: 'Synth' }, pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1.patterns.length).toBe(2);
    expect(output2.patterns.length).toBe(2);
    expect(output3.patterns.length).toBe(1);
    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output1.patterns[1].instrument).toBe('Viola');
    expect(output2.patterns[0].instrument).toBe('Conga');
    expect(output2.patterns[1].instrument).toBe('Viola');
    expect(output3.patterns[0].instrument).toBe('Synth');
  });

  it('can interpret mixed output and sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }, { name: 'R2' }] }, { instrument: { name: 'Viola' }, pattern: [[]]}] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output1.patterns[1].instrument).toBe('Viola');
    expect(output2.patterns[0].instrument).toBe('Conga');
    expect(output2.patterns[1].instrument).toBe('Viola');
  });

  it('only chooses sequence definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: [{ name: 'R1' }, { name: 'R2' }], condition: { param: 'x', min: 0.0 } },
          { sequence: [{ name: 'R2' }, { name: 'R1' }], condition: { param: 'x', min: 0.5 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.2);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output2.patterns[0].instrument).toBe('Conga');
  });

  it('only chooses sequence definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: [{ name: 'R1' }, { name: 'R2' }], condition: { param: 'x', max: 0.5 } },
          { sequence: [{ name: 'R2' }, { name: 'R1' }], condition: { param: 'x', max: 1.0 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.7);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Conga');
    expect(output2.patterns[0].instrument).toBe('Piano');
  });

  it('only chooses sequence definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: [{ name: 'R1' }, { name: 'R1' }], condition: { param: 'x', min: 0.0, max: 0.3 } },
          { sequence: [{ name: 'R1' }, { name: 'R2' }], condition: { param: 'x', min: 0.3, max: 0.6 } },
          { sequence: [{ name: 'R2' }, { name: 'R2' }], condition: { param: 'x', min: 0.6, max: 1.0 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: { name: 'Piano' }, pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.5);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output2.patterns[0].instrument).toBe('Conga');
  });

  it('can interpret simple patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, pattern:
            [[
              { type: noteType.NOTE, note: 'C' },
              { type: noteType.NOTE, note: 'D' },
              { type: noteType.NOTE, note: 'E' },
              { type: noteType.NOTE, note: 'F' }
            ]]
          }
        ]
      }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(62);
    expect(output.patterns[0].pattern[2].key).toBe(64);
    expect(output.patterns[0].pattern[3].key).toBe(65);
  });

  it('can interpret multi bar patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, pattern:
            [
              [
                { type: noteType.NOTE, note: 'C' },
                { type: noteType.NOTE, note: 'D' }
              ],
              [
                { type: noteType.NOTE, note: 'E' },
                { type: noteType.NOTE, note: 'F' }
              ]
            ]
          }
        ]
      }
    ]);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1.patterns[0].instrument).toBe('Piano');
    expect(output1.patterns[0].pattern[0].key).toBe(60);
    expect(output1.patterns[0].pattern[1].key).toBe(62);
    expect(output2.patterns[0].instrument).toBe('Piano');    
    expect(output2.patterns[0].pattern[0].key).toBe(64);
    expect(output2.patterns[0].pattern[1].key).toBe(65);
  });

  it('can interpret parallel patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, pattern:
            [[
              { type: noteType.NOTE, note: 'C' },
              { type: noteType.NOTE, note: 'D' },
              { type: noteType.NOTE, note: 'E' },
              { type: noteType.NOTE, note: 'F' }
            ]]
          },
          { instrument: { name: 'Zoombasa' }, pattern:
            [[
              { type: noteType.NOTE, note: 'B' },
              { type: noteType.NOTE, note: 'A' },
              { type: noteType.NOTE, note: 'G' },
              { type: noteType.NOTE, note: 'F' }
            ]]
          }
        ]
      }
    ]);

    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[0].pattern[1].key).toBe(62);
    expect(output.patterns[0].pattern[2].key).toBe(64);
    expect(output.patterns[0].pattern[3].key).toBe(65);
    expect(output.patterns[1].instrument).toBe('Zoombasa');
    expect(output.patterns[1].pattern[0].key).toBe(71);
    expect(output.patterns[1].pattern[1].key).toBe(69);
    expect(output.patterns[1].pattern[2].key).toBe(67);
    expect(output.patterns[1].pattern[3].key).toBe(65);
  });

  it('can interpret nested patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, pattern: [[{ type: noteType.NOTE, note: 'C' }]] },
          { sequence: [{ name: 'Drums' }] }
        ]
      },
      { name: 'Drums', definitions:
        [
          { instrument: { name: 'Kick' },  pattern: [[{ type: noteType.DRUM, value: 'x' }]] },
          { instrument: { name: 'Snare' }, pattern: [[{ type: noteType.DRUM, value: 'x' }]] }
        ]
      }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
    expect(output.patterns[1].instrument).toBe('Kick');
    expect(output.patterns[1].pattern[0].key).toBe(60);
    expect(output.patterns[2].instrument).toBe('Snare');
    expect(output.patterns[2].pattern[0].key).toBe(60);
  });

  it('only chooses pattern definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, condition: { param: 'x', min: 0.0 }, pattern: [[]]},
          { instrument: { name: 'Conga' }, condition: { param: 'x', min: 0.5 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.2);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].instrument).toBe('Piano');
  });

  it('only chooses pattern definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, condition: { param: 'x', max: 0.5 }, pattern: [[]]},
          { instrument: { name: 'Conga' }, condition: { param: 'x', max: 1.0 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.7);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].instrument).toBe('Conga');
  });

  it('only chooses pattern definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: { name: 'Piano' }, condition: { param: 'x', min: 0.0, max: 0.3 }, pattern: [[]]},
          { instrument: { name: 'Synth' }, condition: { param: 'x', min: 0.3, max: 0.6 }, pattern: [[]]},
          { instrument: { name: 'Conga' }, condition: { param: 'x', min: 0.6, max: 1.0 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.5);
    var output = generator.getCurrentBar();

    expect(output.patterns.length).toBe(1);
    expect(output.patterns[0].instrument).toBe('Synth');
  });


  it('uses instruments defined on patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: [{ name: 'R1' }] }] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Piano' }, pattern: [[{ type: noteType.NOTE, note: 'C' }]] }] }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
  });

  it('uses instruments defined on sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ instrument: { name: 'Piano' }, sequence: [{ name: 'R1' }] }] },
      { name: 'R1',   definitions: [{ pattern: [[{ type: noteType.NOTE, note: 'C' }]] }] }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
  });

  it('overrides instruments defined on referenced rules', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ instrument: { name: 'Piano' }, sequence: [{ name: 'R1' }] }] },
      { name: 'R1',   definitions: [{ instrument: { name: 'Marimba' }, pattern: [[{ type: noteType.NOTE, note: 'C' }]] }] }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Piano');
    expect(output.patterns[0].pattern[0].key).toBe(60);
  });

  it('plays a single rule even if it isn\'t called Play', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'R1', definitions: [{ instrument: { name: 'Conga' }, pattern: [[]]}] }
    ]);
    var output = generator.getCurrentBar();

    expect(output.patterns[0].instrument).toBe('Conga');
  });
});