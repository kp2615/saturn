// Optical alignment.
//
// Every letter carries a little built-in space before its ink (its left
// side bearing), and it differs by font and by letter: a Trispace "I" has
// far more than a Newsreader "P". So text that starts on the same line in
// CSS doesn't *look* like it starts on the same line.
//
// For each element marked data-optical, this finds where the ink of its
// first letter actually begins and sets --optical to that distance; the
// CSS then pulls the element left by exactly that much, so the ink sits
// on the edge. It measures by drawing the letter at its real size (so
// size-dependent fonts like Newsreader use the right design), scaled up
// 20x for precision, and scanning for the first inked column.
(function () {
  var SCALE = 20;
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d", { willReadFrequently: true });

  function bearing(el) {
    var text = el.textContent.trim();
    if (!text) return 0;
    var style = getComputedStyle(el);
    var size = parseFloat(style.fontSize);

    // Room for the letter plus a full em either side of its origin.
    canvas.width = Math.ceil(size * 3 * SCALE);
    canvas.height = Math.ceil(size * 2 * SCALE);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.font = style.fontStyle + " " + style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#000";
    ctx.fillText(text[0], size, size * 1.5);

    var data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (var x = 0; x < canvas.width; x++) {
      for (var y = 0; y < canvas.height; y++) {
        if (data[(y * canvas.width + x) * 4 + 3] > 127) {
          return x / SCALE - size;
        }
      }
    }
    return 0;
  }

  function align() {
    document.querySelectorAll("[data-optical]").forEach(function (el) {
      el.style.setProperty("--optical", bearing(el).toFixed(3) + "px");
    });
  }

  // Wait for the web fonts, or we'd measure the fallback font.
  document.fonts.ready.then(align);
})();
