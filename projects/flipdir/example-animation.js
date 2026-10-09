(() => {
  const player = document.querySelector('[data-trajectory-player]');
  if (!player) return;

  const CYCLE = 32000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const phaseDisplay = player.querySelector('.trajectory-phase');
  const toggle = player.querySelector('.trajectory-toggle');
  const stageButtons = [...player.querySelectorAll('[data-go-phase]')];
  const phases = [
    { start: 0, number: '01', label: 'Same generation' },
    { start: 7000, number: '02', label: 'Near-equivalent token shift' },
    { start: 9000, number: '03', label: 'Differences accumulate' },
    { start: 15000, number: '04', label: 'Meaning diverges' },
    { start: 22000, number: '05', label: 'Final answer changes' }
  ];

  const streamTiming = [
    { selector: '.trajectory-prefix [data-reveal-text]', start: 900, step: 170 },
    { selector: '.clean-branch [data-reveal-text]', start: 9700, step: 250 },
    { selector: '.shift-branch [data-reveal-text]', start: 10100, step: 330 }
  ];

  streamTiming.forEach(({ selector, start, step }) => {
    const stream = player.querySelector(selector);
    if (!stream) return;
    const words = stream.dataset.revealText.trim().split(/\s+/);
    stream.replaceChildren();
    words.forEach((word, index) => {
      const token = document.createElement('span');
      token.className = 'word';
      token.style.setProperty('--reveal-at', `${start + index * step}ms`);
      token.textContent = word;
      stream.append(token);
      if (index < words.length - 1) stream.append(document.createTextNode(' '));
    });
  });

  let elapsed = 0;
  let startedAt = performance.now();
  let userPaused = false;
  let visible = false;
  let frame = 0;
  let currentPhase = -1;

  function phaseFor(time) {
    for (let i = phases.length - 1; i >= 0; i -= 1) {
      if (time >= phases[i].start) return i;
    }
    return 0;
  }

  function updatePhase(force = false) {
    const next = phaseFor(elapsed);
    if (!force && next === currentPhase) return;
    currentPhase = next;
    phaseDisplay.querySelector('span').textContent = phases[next].number;
    phaseDisplay.querySelector('b').textContent = phases[next].label;
    stageButtons.forEach((button, index) => {
      const selected = index === next;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-current', selected ? 'step' : 'false');
    });
  }

  function restartAt(time = 0) {
    elapsed = Math.max(0, Math.min(time, CYCLE - 1));
    startedAt = performance.now() - elapsed;
    player.style.setProperty('--seek', `${elapsed}ms`);
    player.classList.remove('is-running');
    void player.offsetWidth;
    player.classList.add('is-running');
    updatePhase(true);
  }

  function updatePlaybackState() {
    const stopped = userPaused || !visible || reducedMotion.matches;
    player.classList.toggle('is-paused', stopped);
    toggle.innerHTML = userPaused
      ? '<span aria-hidden="true">▶</span> Play'
      : '<span aria-hidden="true">Ⅱ</span> Pause';
    toggle.setAttribute('aria-label', userPaused ? 'Play generation animation' : 'Pause generation animation');
    toggle.setAttribute('aria-pressed', userPaused ? 'true' : 'false');
  }

  function tick(now) {
    if (visible && !userPaused && !reducedMotion.matches) {
      elapsed = now - startedAt;
      if (elapsed >= CYCLE) restartAt(0);
      updatePhase();
    }
    frame = requestAnimationFrame(tick);
  }

  toggle.addEventListener('click', () => {
    userPaused = !userPaused;
    if (!userPaused) startedAt = performance.now() - elapsed;
    updatePlaybackState();
  });

  stageButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      userPaused = false;
      restartAt(phases[index].start);
      updatePlaybackState();
    });
  });

  const observer = new IntersectionObserver((entries) => {
    const wasVisible = visible;
    visible = entries[0].isIntersecting;
    if (visible && !wasVisible) startedAt = performance.now() - elapsed;
    updatePlaybackState();
  }, { threshold: 0.25 });
  observer.observe(player);

  function applyMotionPreference() {
    if (reducedMotion.matches) {
      player.classList.add('is-reduced');
      toggle.hidden = true;
      elapsed = phases[4].start;
      currentPhase = 4;
      updatePhase(true);
    } else {
      player.classList.remove('is-reduced');
      toggle.hidden = false;
      restartAt(0);
    }
    updatePlaybackState();
  }

  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', applyMotionPreference);
  restartAt(0);
  updatePlaybackState();
  applyMotionPreference();
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(tick);
})();
