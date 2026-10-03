// Measurement grid toggle (see css/grid.css). Press G to show/hide.
(function () {
  var root = document.documentElement;
  var key = "saturn-grid";

  try {
    if (localStorage.getItem(key) === "on") root.classList.add("show-grid");
  } catch (e) {}

  document.addEventListener("keydown", function (event) {
    if (event.key !== "g" && event.key !== "G") return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    var target = event.target;
    if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;

    var on = root.classList.toggle("show-grid");
    try {
      localStorage.setItem(key, on ? "on" : "off");
    } catch (e) {}
  });
})();
