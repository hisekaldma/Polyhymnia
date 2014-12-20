describe('Generator', function() {
  'use strict';
  var noteType = Polyhymnia.noteType;

  it('can interpret simple sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);
    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns2[0].instrument).toBe('Conga');
  });

  it('can interpret nested sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2',   definitions: [{ sequence: ['R3', 'R3'] }] },
      { name: 'R3',   definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);
    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns(); generator.step();
    var patterns3 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns2[0].instrument).toBe('Conga');
    expect(patterns3[0].instrument).toBe('Conga');
  });

  it('can interpret parallel sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }, { sequence: ['R2', 'R1'] }]},
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);

    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns1[1].instrument).toBe('Conga');
    expect(patterns2[0].instrument).toBe('Conga');
    expect(patterns2[1].instrument).toBe('Piano');
  });

  it('can interpret nested parallel sequences of different length', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R5'] }] },
      { name: 'R1',   definitions: [{ sequence: ['R2', 'R3'] }, { sequence: ['R4'] }] },
      { name: 'R2',   definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R3',   definitions: [{ instrument: 'Conga', pattern: []}] },
      { name: 'R4',   definitions: [{ instrument: 'Viola', pattern: []}] },
      { name: 'R5',   definitions: [{ instrument: 'Synth', pattern: []}] }
    ]);

    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns(); generator.step();
    var patterns3 = generator.getPatterns();

    expect(patterns1.length).toBe(2);
    expect(patterns2.length).toBe(2);
    expect(patterns3.length).toBe(1);
    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns1[1].instrument).toBe('Viola');
    expect(patterns2[0].instrument).toBe('Conga');
    expect(patterns2[1].instrument).toBe('Viola');
    expect(patterns3[0].instrument).toBe('Synth');
  });

  it('can interpret mixed patterns and sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions: [{ sequence: ['R1', 'R2'] }, { instrument: 'Viola', pattern: []}] },
      { name: 'R1',   definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2',   definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);

    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns1[1].instrument).toBe('Viola');
    expect(patterns2[0].instrument).toBe('Conga');
    expect(patterns2[1].instrument).toBe('Viola');
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
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);

    generator.setParam('x', 0.2);
    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns2[0].instrument).toBe('Conga');
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
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);

    generator.setParam('x', 0.7);
    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Conga');
    expect(patterns2[0].instrument).toBe('Piano');
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
      { name: 'R1', definitions: [{ instrument: 'Piano', pattern: []}] },
      { name: 'R2', definitions: [{ instrument: 'Conga', pattern: []}] }
    ]);

    generator.setParam('x', 0.5);
    var patterns1 = generator.getPatterns(); generator.step();
    var patterns2 = generator.getPatterns();

    expect(patterns1[0].instrument).toBe('Piano');
    expect(patterns2[0].instrument).toBe('Conga');
  });

  it('can interpret simple patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern:
            [
              { value: 'C', type: noteType.NOTE },
              { value: 'D', type: noteType.NOTE },
              { value: 'E', type: noteType.NOTE },
              { value: 'F', type: noteType.NOTE }
            ]
          }
        ]
      }
    ]);
    var patterns = generator.getPatterns();

    expect(patterns[0].instrument).toBe('Piano');
    expect(patterns[0].pattern[0].value).toBe('C');
    expect(patterns[0].pattern[1].value).toBe('D');
    expect(patterns[0].pattern[2].value).toBe('E');
    expect(patterns[0].pattern[3].value).toBe('F');
  });

  it('can interpret parallel patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern:
            [
              { value: 'C', type: noteType.NOTE },
              { value: 'D', type: noteType.NOTE },
              { value: 'E', type: noteType.NOTE },
              { value: 'F', type: noteType.NOTE }
            ]
          },
          { instrument: 'Zoombasa', pattern:
            [
              { value: 'B', type: noteType.NOTE },
              { value: 'A', type: noteType.NOTE },
              { value: 'G', type: noteType.NOTE },
              { value: 'F', type: noteType.NOTE }
            ]
          }
        ]
      }
    ]);

    var patterns = generator.getPatterns();

    expect(patterns[0].instrument).toBe('Piano');
    expect(patterns[0].pattern[0].value).toBe('C');
    expect(patterns[0].pattern[1].value).toBe('D');
    expect(patterns[0].pattern[2].value).toBe('E');
    expect(patterns[0].pattern[3].value).toBe('F');
    expect(patterns[1].instrument).toBe('Zoombasa');
    expect(patterns[1].pattern[0].value).toBe('B');
    expect(patterns[1].pattern[1].value).toBe('A');
    expect(patterns[1].pattern[2].value).toBe('G');
    expect(patterns[1].pattern[3].value).toBe('F');
  });

  it('can interpret nested patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', pattern: [{ value: 'C', type: noteType.NOTE }] },
          { sequence: ['Drums'] }
        ]
      },
      { name: 'Drums', definitions:
        [
          { instrument: 'Kick',  pattern: [{ value: 'x', type: noteType.DRUM }] },
          { instrument: 'Snare', pattern: [{ value: 'x', type: noteType.DRUM }] }
        ]
      }
    ]);
    var patterns = generator.getPatterns();

    expect(patterns[0].instrument).toBe('Piano');
    expect(patterns[0].pattern[0].value).toBe('C');
    expect(patterns[1].instrument).toBe('Kick');
    expect(patterns[1].pattern[0].value).toBe('x');
    expect(patterns[2].instrument).toBe('Snare');
    expect(patterns[2].pattern[0].value).toBe('x');
  });

  it('only chooses pattern definitions whose min conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', min: 0.5 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.2);
    var patterns = generator.getPatterns();

    expect(patterns.length).toBe(1);
    expect(patterns[0].instrument).toBe('Piano');
  });

  it('only chooses pattern definitions whose max conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', max: 0.5 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', max: 1.0 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.7);
    var patterns = generator.getPatterns();

    expect(patterns.length).toBe(1);
    expect(patterns[0].instrument).toBe('Conga');
  });

  it('only chooses pattern definitions whose between conditions apply', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0, max: 0.3 }, pattern: []},
          { instrument: 'Synth', condition: { param: 'x', min: 0.3, max: 0.6 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', min: 0.6, max: 1.0 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.5);
    var patterns = generator.getPatterns();

    expect(patterns.length).toBe(1);
    expect(patterns[0].instrument).toBe('Synth');
  });

  it('needs rules', function() {
    var generator = new Polyhymnia.Generator();

    expect(function() {
      generator.setRules([]);
    }).toThrowError('No rules to play');
  });

  it('needs a start rule', function() {
    var generator = new Polyhymnia.Generator();

    expect(function() {
      generator.setRules([
        { name: 'R0', definitions:
          [
            { instrument: 'Piano', condition: { param: 'x', min: 0.0 }, pattern: []},
            { instrument: 'Conga', condition: { param: 'x', min: 0.5 }, pattern: []}
          ]
        }
      ]);
    }).toThrowError('There is no rule named \'Play\'');
  });
});