document.addEventListener('click', function (e) {
  var anchor = e.target.closest('a.heading-anchor');
  if (!anchor) return;
  e.preventDefault();
  var href = anchor.getAttribute('href');
  if (!href || href.charAt(0) !== '#') return;
  var id = href.slice(1);
  var target = document.getElementById(id);
  if (!target) return;
  history.replaceState(null, '', href);
  target.scrollIntoView({ behavior: 'smooth' });
});

if (location.hash) {
  var id = location.hash.slice(1);
  var el = document.getElementById(id);
  if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth' }); }, 100);
}
