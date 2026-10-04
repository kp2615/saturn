// Wild card colour.
//
// A small dot, the "wild card", sits beside a title (on work cards it
// appears on hover). This takes the dot's colour from an image: for each
// element marked data-wildcard, it takes the first image inside, shrinks it to
// a tiny grid, sorts the pixels into coarse colour buckets, picks the
// bucket with the most pixels (the dominant colour), and averages the
// pixels in it. The result goes in that element's --wildcard; if anything
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

  function apply(el, img) {
    try {
      var colour = dominant(img);
      if (colour) el.style.setProperty("--wildcard", colour);
    } catch (e) {
      // e.g. an image from another site that won't let us read its pixels
    }
  }

  document.querySelectorAll("[data-wildcard]").forEach(function (el) {
    var img = el.querySelector("img");
    if (!img) return;
    if (img.complete && img.naturalWidth) apply(el, img);
    else img.addEventListener("load", function () { apply(el, img); });
  });
})();
