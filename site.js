// Reveal on scroll, and the hero demo: a sentence is "spoken", then the
// reminder resolves under it. ?static reveals everything at once.
(function () {
  const all = new URLSearchParams(location.search).has('static');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => (all ? el.classList.add('in') : io.observe(el)));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || all;
  const prompt = document.getElementById('prompt');
  const mic = document.getElementById('mic');
  const hint = document.getElementById('hint');
  const wave = document.getElementById('wave');
  const card = document.getElementById('card');
  const title = document.getElementById('cardTitle');
  const meta = document.getElementById('cardMeta');
  if (!prompt || !mic || !card) return;

  const IDLE = 'What do you want to remember?';
  const EXAMPLES = [
    { said: 'Buy hot sauce next time I’m at Target', title: 'Buy hot sauce', meta: 'at Target · 0.4 mi' },
    { said: 'Record the next Texans game', title: 'Record the next Texans game', meta: 'Sun 12:00 PM' },
    { said: 'Umbrella when I leave the house', title: 'Umbrella', meta: 'when leaving home' },
    { said: 'Call the vet tomorrow at nine', title: 'Call the vet', meta: 'tomorrow 9:00 AM' },
  ];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function type(text) {
    prompt.classList.add('hearing');
    prompt.textContent = '';
    for (const ch of text) {
      prompt.textContent += ch;
      await wait(ch === ' ' ? 55 : 34 + Math.random() * 36);
    }
  }

  async function run() {
    if (reduce) return;
    let i = 0;
    await wait(1600);
    for (;;) {
      const ex = EXAMPLES[i++ % EXAMPLES.length];
      mic.classList.add('rec'); hint.classList.add('off'); wave.classList.add('on');
      await type(ex.said);
      await wait(650);
      mic.classList.remove('rec'); hint.classList.remove('off'); wave.classList.remove('on');
      prompt.classList.remove('hearing'); prompt.textContent = IDLE;
      card.classList.add('hidden');
      await wait(420);
      title.textContent = ex.title; meta.textContent = ex.meta; meta.classList.add('found');
      card.classList.remove('hidden');
      await wait(3000);
      meta.classList.remove('found');
      await wait(500);
    }
  }
  run();
  story();

  // Pinned story: the step that reaches mid-screen sets the phone's state.
  function story() {
    const phone = document.getElementById('storyPhone');
    const steps = [...document.querySelectorAll('.story-steps li')];
    const sp = document.getElementById('sPrompt');
    if (!phone || !steps.length) return;
    const SAID = 'Buy hot sauce next time I\u2019m at Target';
    let typed = false;
    async function typeOnce() {
      if (typed) return; typed = true;
      sp.textContent = '';
      for (const ch of SAID) { sp.textContent += ch; await wait(ch === ' ' ? 55 : 34 + Math.random() * 36); }
    }
    function set(n) {
      phone.dataset.state = String(n);
      steps.forEach((li) => li.classList.toggle('active', li.dataset.step === String(n)));
      if (n === 1 && !reduce) typeOnce(); else if (n === 1) sp.textContent = SAID;
    }
    const forced = new URLSearchParams(location.search).get('story');
    if (forced) { set(Number(forced)); document.documentElement.style.scrollBehavior = 'auto'; steps[Number(forced) - 1].scrollIntoView({ block: 'center' }); return; }
    const so = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) set(Number(e.target.dataset.step));
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    steps.forEach((li) => so.observe(li));
    set(1);
  }
})();
