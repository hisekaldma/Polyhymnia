describe('Validator', function() {
  'use strict';

  it('flags missing rules', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2')));
    expect(rules.errors[0].message).toBe('There is no rule called R2');
  });

  it('flags missing instruments', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = Piano: C')), {});
    expect(rules.errors[0].message).toBe('There is no instrument called Piano');
  });

  it('flags circular references', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = R1')));
    expect(rules.errors[0].message).toBe('R1 cannot reference itself');
  });

  it('flags deep circular references', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 = R2\nR2 = R3\nR3 = R1')));
    expect(rules.errors[0].message).toBe('R1 cannot reference itself');
  });
});