describe('Degrees', function() {
  'use strict';

  it('can be found by name, tonic and scale', function() {
    var degree = Polyhymnia.Degrees.fromName('vii°', 'C', 'major');

    expect(degree).toEqual([71, 74, 77]);
  });

  it('can be found by midi numbers', function() {
    var degree = Polyhymnia.Degrees.toName([64, 68, 72], 'C', 'major');
    
    expect(degree).toBe('III+');
  });
});