describe('Scales', function() {
  'use strict';

  it('can be found by name', function() {
    var scale = Polyhymnia.Scales.fromName('major');

    expect(scale).toEqual([0, 2, 4, 5, 7, 9, 11]);
  });

  it('can be found by midi numbers', function() {
    var scale = Polyhymnia.Scales.toName([0, 2, 4, 5, 7, 9, 11]);
    
    expect(scale).toBe('major');
  });

  it('can be found by midi numbers in higher octave', function() {
    var scale = Polyhymnia.Scales.toName([12, 14, 16, 17, 19, 21, 23]);
    
    expect(scale).toBe('major');
  });

  it('can be found by midi numbers in separate octaves', function() {
    var scale = Polyhymnia.Scales.toName([0, 2, 4, 5, 7, 9, 23]);
    
    expect(scale).toBe('major');
  });  
});