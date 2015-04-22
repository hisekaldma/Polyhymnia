---
---
MiniPlayer = function(element, context) {
  'use strict';

  // Elements
  var codeElement = element.querySelector('code');

  function parse() {
    // Parse rules
    var code = codeElement.innerText;
    var rules = context.parse(code);
    var symbols = rules.symbols;

    // Render the code
    renderCode(code, symbols);
  }

  function renderCode(code, symbols) {
    var html = '';
    var s = 0;
    for (var i = 0; i < code.length; i++) {
      if (s < symbols.length && symbols[s].start == i) {
        html += '<span class="' + symbols[s].type + '" data-start="' + symbols[s].start + '">';
      }

      html += code.charAt(i);

      if (s < symbols.length && symbols[s].end == i + 1) {
        html += '</span>';
        s++;
      }
    }
    codeElement.innerHTML = html;
  }

  // Rendering
  parse();
};