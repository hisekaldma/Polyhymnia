describe('Scales', function() {
  'use strict';

  it('can be found by name', function() {
    var scale = Polyhymnia.Scales.fromName('major');

    expect(scale).toEqual([60, 62, 64, 65, 67, 69, 71]);
  });

  it('can be found by name and tonic', function() {
    var scale = Polyhymnia.Scales.fromName('major', 'D');

    expect(scale).toEqual([62, 64, 66, 67, 69, 71, 73]);
  });

  it('can be found by name, tonic and octave', function() {
    var scale = Polyhymnia.Scales.fromName('major', 'D', 4);

    expect(scale).toEqual([74, 76, 78, 79, 81, 83, 85]);
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