describe('Chords', function() {
  'use strict';

  it('can be found by name', function() {
    var chord = Polyhymnia.Chords.fromName('M');

    expect(chord).toEqual([0, 4, 7]);
  });

  it('can be found by midi numbers', function() {
    var chord = Polyhymnia.Chords.toName([0, 4, 7]);
    
    expect(chord).toBe('M');
  });

  it('can be found by midi numbers in higher octave', function() {
    var chord = Polyhymnia.Chords.toName([12, 16, 19]);
    
    expect(chord).toBe('M');
  });

  it('can be found by midi numbers in separate octaves', function() {
    var chord = Polyhymnia.Chords.toName([0, 16, 31]);
    
    expect(chord).toBe('M');
  });  
});