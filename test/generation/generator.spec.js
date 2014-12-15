describe('Generator', function() {
  'use strict';
  var ruleType = Polyhymnia.ruleType;
  var noteType = Polyhymnia.noteType;

  it('can interpret simple sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.PATTERN,  definitions: [] }
    ]);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();

    expect(rule1.name).toBe('R1');
    expect(rule2.name).toBe('R2');
  });

  it('can interpret nested sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions: [{ sequence: ['R1', 'R2'] }] },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.SEQUENCE, definitions: [{ sequence: ['R3', 'R3'] }] },
      { name: 'R3', type: ruleType.PATTERN,  definitions: [] }
    ]);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();
    var rule3 = generator.getNextRule();

    expect(rule1.name).toBe('R1');
    expect(rule2.name).toBe('R3');
    expect(rule2.name).toBe('R3');
  });

  it('can interpret recursive sequences', function() {
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions: [{ sequence: ['R1', 'Play'] }] },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] }
    ]);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();
    var rule3 = generator.getNextRule();

    expect(rule1.name).toBe('R1');
    expect(rule2.name).toBe('R1');
    expect(rule2.name).toBe('R1');
  });

  it('can choose randomly between sequence definitions', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions:
        [
          { sequence: ['R1', 'R2'] },
          { sequence: ['R2', 'R1'] }
        ]
      },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.PATTERN,  definitions: [] }
    ]);

    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();

    expect(rule1.name).toBe('R2');
    expect(rule2.name).toBe('R1');
  });

  it('only chooses sequence definitions whose min conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions:
        [
          { sequence: ['R1', 'R2'], condition: { param: 'x', min: 0.0 } },
          { sequence: ['R2', 'R1'], condition: { param: 'x', min: 0.5 } }
        ]
      },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.PATTERN,  definitions: [] }
    ]);

    generator.setParam('x', 0.2);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();

    expect(rule1.name).toBe('R1');
    expect(rule2.name).toBe('R2');
  });

  it('only chooses sequence definitions whose max conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.1);
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions:
        [
          { sequence: ['R1', 'R2'], condition: { param: 'x', max: 0.5 } },
          { sequence: ['R2', 'R1'], condition: { param: 'x', max: 1.0 } }
        ]
      },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.PATTERN,  definitions: [] }
    ]);

    generator.setParam('x', 0.7);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();

    expect(rule1.name).toBe('R2');
    expect(rule2.name).toBe('R1');
  });

  it('only chooses sequence definitions whose between conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.setRules([
      { name: 'Play', type: ruleType.SEQUENCE, definitions:
        [
          { sequence: ['R1', 'R1'], condition: { param: 'x', min: 0.0, max: 0.3 } },
          { sequence: ['R1', 'R2'], condition: { param: 'x', min: 0.3, max: 0.6 } },
          { sequence: ['R2', 'R2'], condition: { param: 'x', min: 0.6, max: 1.0 } }
        ]
      },
      { name: 'R1', type: ruleType.PATTERN,  definitions: [] },
      { name: 'R2', type: ruleType.PATTERN,  definitions: [] }
    ]);

    generator.setParam('x', 0.5);
    var rule1 = generator.getNextRule();
    var rule2 = generator.getNextRule();

    expect(rule1.name).toBe('R1');
    expect(rule2.name).toBe('R2');        
  });

  it('can interpret simple patterns', function() {
    var generator = new Polyhymnia.Generator();
    generator.instruments = { 'Piano': {} };
    generator.setRules([
      { name: 'Play', type: ruleType.PATTERN, definitions:
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
    var rule1 = generator.getNextRule();

    expect(rule1.name).toBe('Play');
    expect(rule1.patterns[0].instrument).toBe('Piano');
    expect(rule1.patterns[0].pattern[0].value).toBe('C');
    expect(rule1.patterns[0].pattern[1].value).toBe('D');
    expect(rule1.patterns[0].pattern[2].value).toBe('E');
    expect(rule1.patterns[0].pattern[3].value).toBe('F');
  });

  it('can interpret patterns with many definitions', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.instruments = { 'Piano': {}, 'Zoombasa': {} };
    generator.setRules([
      { name: 'Play', type: ruleType.PATTERN, definitions:
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

    var rule1 = generator.getNextRule();

    expect(rule1.name).toBe('Play');
    expect(rule1.patterns[0].instrument).toBe('Piano');
    expect(rule1.patterns[0].pattern[0].value).toBe('C');
    expect(rule1.patterns[0].pattern[1].value).toBe('D');
    expect(rule1.patterns[0].pattern[2].value).toBe('E');
    expect(rule1.patterns[0].pattern[3].value).toBe('F');
    expect(rule1.patterns[1].instrument).toBe('Zoombasa');
    expect(rule1.patterns[1].pattern[0].value).toBe('B');
    expect(rule1.patterns[1].pattern[1].value).toBe('A');
    expect(rule1.patterns[1].pattern[2].value).toBe('G');
    expect(rule1.patterns[1].pattern[3].value).toBe('F');
  });

  it('only chooses pattern definitions whose min conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.instruments = { 'Piano': {}, 'Conga': {} };
    generator.setRules([
      { name: 'Play', type: ruleType.PATTERN, definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', min: 0.5 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.2);
    var rule1 = generator.getNextRule();

    expect(rule1.name).toBe('Play');
    expect(rule1.patterns.length).toBe(1);
    expect(rule1.patterns[0].instrument).toBe('Piano');
  });

  it('only chooses pattern definitions whose max conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.1);
    var generator = new Polyhymnia.Generator();
    generator.instruments = { 'Piano': {}, 'Conga': {} };
    generator.setRules([
      { name: 'Play', type: ruleType.PATTERN, definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', max: 0.5 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', max: 1.0 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.7);
    var rule1 = generator.getNextRule();

    expect(rule1.name).toBe('Play');
    expect(rule1.patterns.length).toBe(1);
    expect(rule1.patterns[0].instrument).toBe('Conga');
  });

  it('only chooses pattern definitions whose between conditions apply', function() {
    spyOn(Math, 'random').and.returnValue(0.9);
    var generator = new Polyhymnia.Generator();
    generator.instruments = { 'Piano': {}, 'Synth': {}, 'Conga': {} };
    generator.setRules([
      { name: 'Play', type: ruleType.PATTERN, definitions:
        [
          { instrument: 'Piano', condition: { param: 'x', min: 0.0, max: 0.3 }, pattern: []},
          { instrument: 'Synth', condition: { param: 'x', min: 0.3, max: 0.6 }, pattern: []},
          { instrument: 'Conga', condition: { param: 'x', min: 0.6, max: 1.0 }, pattern: []}
        ]
      }
    ]);

    generator.setParam('x', 0.5);
    var rule1 = generator.getNextRule();

    expect(rule1.name).toBe('Play');
    expect(rule1.patterns.length).toBe(1);
    expect(rule1.patterns[0].instrument).toBe('Synth');
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
        { name: 'R0', type: ruleType.PATTERN, definitions:
          [
            { instrument: 'Piano', condition: { param: 'x', min: 0.0 }, pattern: []},
            { instrument: 'Conga', condition: { param: 'x', min: 0.5 }, pattern: []}
          ]
        }
      ]);
    }).toThrowError('There is no rule named \'Play\'');
  });

  it('checks that all instruments exist', function() {
    var generator = new Polyhymnia.Generator();

    expect(function() {
      generator.setRules([
        { name: 'Play', type: ruleType.PATTERN, definitions:
          [
            { instrument: 'Piano', pattern: []}
          ]
        }
      ]);
    }).toThrowError('There is no instrument named \'Piano\'');
  });  
});