// Reveal-on-scroll, and the hero demo: a sentence is "spoken", then the
// reminder resolves under it. Three examples, one per trigger kind.
(function () {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prompt = document.getElementById('prompt');
  const mic = document.getElementById('mic');
  const hint = document.getElementById('hint');
  const card = document.getElementById('card');
  const title = document.getElementById('cardTitle');
  const meta = document.getElementById('cardMeta');
  if (!prompt || !mic) return;

  const EXAMPLES = [
    { said: 'Buy hot sauce next time I’m at Target', title: 'Buy hot sauce', meta: 'at Target · 0.4 mi' },
    { said: 'Record the next Texans game', title: 'Record the next Texans game', meta: 'Sun 12:00 PM' },
    { said: 'Take the bins out when I get home', title: 'Take the bins out', meta: 'at home' },
    { said: 'Call the vet tomorrow at nine', title: 'Call the vet', meta: 'tomorrow 9:00 AM' },
  ];
  const IDLE = 'What do you want to remember?';
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function type(text) {
    prompt.classList.add('hearing');
    prompt.textContent = '';
    for (const ch of text) {
      prompt.textContent += ch;
      await wait(ch === ' ' ? 60 : 38 + Math.random() * 40);
    }
  }

  async function run() {
    let i = 0;
    // Show the first card immediately so the screen never looks empty.
    await wait(1200);
    for (;;) {
      const ex = EXAMPLES[i % EXAMPLES.length];
      i++;
      if (reduce) {
        prompt.textContent = ex.said; title.textContent = ex.title; meta.textContent = ex.meta;
        await wait(3500);
        continue;
      }
      // Listening
      mic.classList.add('rec'); hint.textContent = 'Tap to stop';
      await type(ex.said);
      await wait(600);
      // Stop, think
      mic.classList.remove('rec'); hint.textContent = 'Tap to capture';
      prompt.classList.remove('hearing'); prompt.textContent = IDLE;
      card.classList.add('hidden');
      await wait(450);
      // Resolve
      title.textContent = ex.title;
      meta.textContent = ex.meta;
      meta.classList.add('found');
      card.classList.remove('hidden');
      await wait(2600);
      meta.classList.remove('found');
      await wait(400);
    }
  }
  run();
})();
