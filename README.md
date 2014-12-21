Polyhymnia
==========

Polyhymnia is a programming language for generative, interactive music. It lets you write rules that evaluate to sequences and patterns of notes, chords and drums.

    Play -> A1 A2
    
    A1 ->
      Drums
      Pad: C C C C
    
    A2 ->
      Drums
      Pad: D D D D
    
    Drums ->
      Kick:            x _ _ _ _ _ x _ _ _ _ _ _ _ x _
      (x > 0.3) Hihat: _ _ _ _ x _ _ _ _ _ x _ x x x x
      (x > 0.6) Snare: _ _ _ x _ _ x _ _ _ _ _ x _ _ _

Polyhymnia is still in the design stage. You can [try it in the interactive playground](http://hisekaldma.github.io/Polyhymnia).
