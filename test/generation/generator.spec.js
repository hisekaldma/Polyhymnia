describe('Generator', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can interpret simple sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output2[0].instrument).toBe('Conga');
  });

  it('can interpret nested sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2',   definitions: [{ sequence: ['R3', 'R3'] }] },
      { name: 'R3',   definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output2[0].instrument).toBe('Conga');
    expect(output3[0].instrument).toBe('Conga');
  });

  it('can interpret parallel sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }, { sequence: ['R2', 'R1'] }]},
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output1[1].instrument).toBe('Conga');
    expect(output2[0].instrument).toBe('Conga');
    expect(output2[1].instrument).toBe('Piano');
  });

  it('can interpret nested parallel sequences of different length', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R5'] }] },
      { name: 'R1',   definitions: [{ sequence: ['R2', 'R3'] }, { sequence: ['R4'] }] },
      { name: 'R2',   definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R3',   definitions: [{ instrument: 'Conga', pattern: [[]]}] },
      { name: 'R4',   definitions: [{ instrument: 'Viola', pattern: [[]]}] },
      { name: 'R5',   definitions: [{ instrument: 'Synth', pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar(); generator.step();
    var output3 = generator.getCurrentBar();

    expect(output1.length).toBe(2);
    expect(output2.length).toBe(2);
    expect(output3.length).toBe(1);
    expect(output1[0].instrument).toBe('Piano');
    expect(output1[1].instrument).toBe('Viola');
    expect(output2[0].instrument).toBe('Conga');
    expect(output2[1].instrument).toBe('Viola');
    expect(output3[0].instrument).toBe('Synth');
  });

  it('can interpret mixed output and sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }, { instrument: 'Viola', pattern: [[]]}] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);

    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output1[1].instrument).toBe('Viola');
    expect(output2[0].instrument).toBe('Conga');
    expect(output2[1].instrument).toBe('Viola');
  });

  it('only chooses sequence definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: ['R1', 'R2'], condition: { param: 'x', min: 0.0 } },
          { sequence: ['R2', 'R1'], condition: { param: 'x', min: 0.5 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.2);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output2[0].instrument).toBe('Conga');
  });

  it('only chooses sequence definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: ['R1', 'R2'], condition: { param: 'x', max: 0.5 } },
          { sequence: ['R2', 'R1'], condition: { param: 'x', max: 1.0 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.7);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Conga');
    expect(output2[0].instrument).toBe('Piano');
  });

  it('only chooses sequence definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { sequence: ['R1', 'R1'], condition: { param: 'x', min: 0.0, max: 0.3 } },
          { sequence: ['R1', 'R2'], condition: { param: 'x', min: 0.3, max: 0.6 } },
          { sequence: ['R2', 'R2'], condition: { param: 'x', min: 0.6, max: 1.0 } }
        ]
      },
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: [[]]}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: [[]]}] }
    ]);

    generator.setParam('x', 0.5);
    var output1 = generator.getCurrentBar(); generator.step();
    var output2 = generator.getCurrentBar();

    expect(output1[0].instrument).toBe('Piano');
    expect(output2[0].instrument).toBe('Conga');
  });

  it('can interpret simple patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern:
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

    expect(output[0].instrument).toBe('Piano');
    expect(output[0].pattern[0].key).toBe(60);
    expect(output[0].pattern[1].key).toBe(62);
    expect(output[0].pattern[2].key).toBe(64);
    expect(output[0].pattern[3].key).toBe(65);
  });

  it('can interpret multi bar patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern:
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

    expect(output1[0].instrument).toBe('Piano');
    expect(output1[0].pattern[0].key).toBe(60);
    expect(output1[0].pattern[1].key).toBe(62);
    expect(output2[0].instrument).toBe('Piano');    
    expect(output2[0].pattern[0].key).toBe(64);
    expect(output2[0].pattern[1].key).toBe(65);
  });

  it('can interpret parallel patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern:
            [[
              { type: noteType.NOTE, note: 'C' },
              { type: noteType.NOTE, note: 'D' },
              { type: noteType.NOTE, note: 'E' },
              { type: noteType.NOTE, note: 'F' }
            ]]
          },
          { instrument: 'Zoombasa', pattern:
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

    expect(output[0].instrument).toBe('Piano');
    expect(output[0].pattern[0].key).toBe(60);
    expect(output[0].pattern[1].key).toBe(62);
    expect(output[0].pattern[2].key).toBe(64);
    expect(output[0].pattern[3].key).toBe(65);
    expect(output[1].instrument).toBe('Zoombasa');
    expect(output[1].pattern[0].key).toBe(71);
    expect(output[1].pattern[1].key).toBe(69);
    expect(output[1].pattern[2].key).toBe(67);
    expect(output[1].pattern[3].key).toBe(65);
  });

  it('can interpret nested patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern: [[{ type: noteType.NOTE, note: 'C' }]] },
          { sequence: ['Drums'] }
        ]
      },
      { name: 'Drums', definitions:
        [
          { instrument: 'Kick',  pattern: [[{ type: noteType.DRUM, value: 'x' }]] },
          { instrument: 'Snare', pattern: [[{ type: noteType.DRUM, value: 'x' }]] }
        ]
      }
    ]);
    var output = generator.getCurrentBar();

    expect(output[0].instrument).toBe('Piano');
    expect(output[0].pattern[0].key).toBe(60);
    expect(output[1].instrument).toBe('Kick');
    expect(output[1].pattern[0].key).toBe(60);
    expect(output[2].instrument).toBe('Snare');
    expect(output[2].pattern[0].key).toBe(60);
  });

  it('only chooses pattern definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0 }, pattern: [[]]},
          { instrument: 'Conga', condition: { param: 'x', min: 0.5 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.2);
    var output = generator.getCurrentBar();

    expect(output.length).toBe(1);
    expect(output[0].instrument).toBe('Piano');
  });

  it('only chooses pattern definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', max: 0.5 }, pattern: [[]]},
          { instrument: 'Conga', condition: { param: 'x', max: 1.0 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.7);
    var output = generator.getCurrentBar();

    expect(output.length).toBe(1);
    expect(output[0].instrument).toBe('Conga');
  });

  it('only chooses pattern definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0, max: 0.3 }, pattern: [[]]},
          { instrument: 'Synth', condition: { param: 'x', min: 0.3, max: 0.6 }, pattern: [[]]},
          { instrument: 'Conga', condition: { param: 'x', min: 0.6, max: 1.0 }, pattern: [[]]}
        ]
      }
    ]);

    generator.setParam('x', 0.5);
    var output = generator.getCurrentBar();

    expect(output.length).toBe(1);
    expect(output[0].instrument).toBe('Synth');
  });
});