describe('Validator', function() {
  'use strict';

  it('flags missing rules', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2')));
    expect(rules.errors[0].error).toBe('There is no rule R2');
  });

  it('flags missing instruments', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 -> Piano: C')), {});
    expect(rules.errors[0].error).toBe('There is no instrument Piano');
  });

  it('flags circular references', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R1')));
    expect(rules.errors[0].error).toBe('R1 cannot reference itself');
  });

  it('flags deep circular references', function() {
    var rules = Polyhymnia.validate(Polyhymnia.parse(Polyhymnia.tokenize('R1 -> R2\nR2 -> R3\nR3 -> R1')));
    expect(rules.errors[0].error).toBe('R1 cannot reference itself');
  });
});