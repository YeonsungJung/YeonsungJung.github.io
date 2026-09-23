(() => {
  const page = document.querySelector('body.about-page');
  if (!page) return;

  function selectedPaper() {
    const paper = document.getElementById(window.location.hash.slice(1));
    return paper && paper.classList.contains('publication-title') ? paper : null;
  }

  function updateHighlight() {
    page.querySelectorAll('.publication-title.is-selected').forEach(paper => {
      paper.classList.remove('is-selected');
    });
    const paper = selectedPaper();
    page.classList.toggle('has-publication-selection', Boolean(paper));
    if (paper) paper.classList.add('is-selected');
  }

  page.addEventListener('click', event => {
    const link = event.target.closest('a[data-scroll-ignore][href^="#paper-"]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const paper = document.getElementById(link.hash.slice(1));
    if (!paper || !paper.classList.contains('publication-title')) return;

    event.preventDefault();
    const linkBox = link.getBoundingClientRect();
    // Keyboard activation uses the link's position; touch/mouse use the tap/click.
    const clickY = event.detail === 0 ? linkBox.top + linkBox.height / 2 : event.clientY;
    const row = paper.closest('li');
    const rowHeight = row ? row.getBoundingClientRect().height : paper.getBoundingClientRect().height;
    const anchorY = Math.max(16, Math.min(clickY, window.innerHeight - Math.min(rowHeight, window.innerHeight - 32) - 16));
    // Use the first title line, even when the title wraps onto multiple lines.
    const titleLine = paper.getClientRects()[0] || paper.getBoundingClientRect();
    const top = window.scrollY + titleLine.top + titleLine.height / 2 - anchorY;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

    if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
    updateHighlight();
    window.scrollTo({ top: Math.max(0, Math.min(top, maxTop)), behavior: 'instant' });
    if (event.detail === 0) {
      paper.setAttribute('tabindex', '-1');
      paper.focus({ preventScroll: true });
    }
  });

  window.addEventListener('hashchange', updateHighlight);
  window.addEventListener('popstate', updateHighlight);
  updateHighlight();
})();
