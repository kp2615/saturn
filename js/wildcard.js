// Wild card colour.
//
// Each work card shows a small dot (the "wild card") on hover. This takes
// the dot's colour from the card's own thumbnail: it shrinks the image to
// a tiny grid, sorts the pixels into coarse colour buckets, picks the
// bucket with the most pixels (the dominant colour), and averages the
// pixels in it. The result goes in the card's --wildcard; if anything
// fails, the dot falls back to the site's magenta.
(function () {
  var W = 48;
  var H = 27;
  var canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  var ctx = canvas.getContext("2d", { willReadFrequently: true });

  function dominant(img) {
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(img, 0, 0, W, H);
    var data = ctx.getImageData(0, 0, W, H).data;

    var buckets = {};
    var best = null;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue; // ignore transparent pixels
      // 8 levels per channel: close shades count as the same colour.
      var key = (data[i] >> 5) + "," + (data[i + 1] >> 5) + "," + (data[i + 2] >> 5);
      var b = buckets[key] || (buckets[key] = { n: 0, r: 0, g: 0, b: 0 });
      b.n++;
      b.r += data[i];
      b.g += data[i + 1];
      b.b += data[i + 2];
      if (!best || b.n > best.n) best = b;
    }
    if (!best) return null;
    return "rgb(" + Math.round(best.r / best.n) + " " + Math.round(best.g / best.n) + " " + Math.round(best.b / best.n) + ")";
  }

  function apply(card, img) {
    try {
      var colour = dominant(img);
      if (colour) card.style.setProperty("--wildcard", colour);
    } catch (e) {
      // e.g. an image from another site that won't let us read its pixels
    }
  }

  document.querySelectorAll(".card").forEach(function (card) {
    var img = card.querySelector("img");
    if (!img) return;
    if (img.complete && img.naturalWidth) apply(card, img);
    else img.addEventListener("load", function () { apply(card, img); });
  });
})();
