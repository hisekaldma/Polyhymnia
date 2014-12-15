describe('Notes', function() {
  'use strict';

  it('can be found by name', function() {
    var note = Polyhymnia.Notes.fromName('C');

    expect(note).toEqual(60);
  });

  it('can be found by midi numbers', function() {
    var note = Polyhymnia.Notes.toName(60);
    
    expect(note).toBe('C');
  });

  it('can be found by midi numbers in higher octave', function() {
    var note = Polyhymnia.Notes.toName(12);
    
    expect(note).toBe('C');
  });
});