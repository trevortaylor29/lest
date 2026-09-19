// Reveal on scroll, and the live strip under the hero: a sentence is
// "spoken", then the chip shows what Lest made of it. ?static in the URL
// reveals everything at once (for screenshots).
(function () {
  const all = new URLSearchParams(location.search).has('static');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach((el) => (all ? el.classList.add('in') : io.observe(el)));

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || all;
  const prompt = document.getElementById('prompt');
  const mic = document.getElementById('mic');
  const chip = document.getElementById('chip');
  if (!prompt || !mic || !chip) return;

  const EXAMPLES = [
    { said: 'Buy hot sauce next time I’m at Target', chip: 'at Target · 0.4 mi' },
    { said: 'Record the next Texans game', chip: 'Sun 12:00 PM · looked up' },
    { said: 'Take the bins out when I get home', chip: 'at home' },
    { said: 'Umbrella when I leave the house', chip: 'when leaving home' },
    { said: 'Call the vet tomorrow at nine', chip: 'tomorrow 9:00 AM' },
  ];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  async function type(text) {
    prompt.textContent = '';
    for (const ch of text) {
      prompt.textContent += ch;
      await wait(ch === ' ' ? 55 : 34 + Math.random() * 36);
    }
  }

  async function run() {
    if (reduce) return;
    let i = 0;
    await wait(2200);
    for (;;) {
      const ex = EXAMPLES[i++ % EXAMPLES.length];
      chip.classList.add('hidden');
      mic.classList.add('rec');
      await type(ex.said);
      await wait(500);
      mic.classList.remove('rec');
      await wait(350);
      chip.textContent = ex.chip;
      chip.classList.remove('hidden');
      await wait(3200);
    }
  }
  run();
})();
