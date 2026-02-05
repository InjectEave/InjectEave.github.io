const revealElements = document.querySelectorAll('[data-reveal]');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealElements.forEach(el => observer.observe(el));

const impactMap = {
  Medical: 'Physical Harm',
  Financial: 'Financial Loss',
  Logistics: 'Operational Delay',
  Navigation: 'Intentional Misdirection',
  Governance: 'Forced Consensus'
};

function createAudioRow(label, src) {
  const wrapper = document.createElement('div');
  wrapper.className = 'audio-row';

  const span = document.createElement('span');
  span.textContent = label;

  const audio = document.createElement('audio');
  audio.controls = true;
  audio.preload = 'none';
  audio.src = src;

  wrapper.appendChild(span);
  wrapper.appendChild(audio);
  return wrapper;
}

function renderCaseStudy(container, data) {
  const header = document.createElement('div');
  header.className = 'case-card';
  header.innerHTML = `<h3>${data.title}</h3><p class="case-meta">${data.subtitle}</p>`;
  container.appendChild(header);

  data.sentences.forEach(sentence => {
    const card = document.createElement('div');
    card.className = 'case-card';

    const title = document.createElement('h3');
    title.textContent = sentence.text;
    card.appendChild(title);

    const voiceGrid = document.createElement('div');
    voiceGrid.className = 'voice-grid';

    sentence.voices.forEach(voice => {
      const voiceCard = document.createElement('div');
      voiceCard.className = 'voice-card';
      const voiceTitle = document.createElement('h4');
      voiceTitle.textContent = voice.label;
      voiceCard.appendChild(voiceTitle);
      voiceCard.appendChild(createAudioRow('Original', voice.original));
      voiceCard.appendChild(createAudioRow('Received (through-wall)', voice.received));
      voiceGrid.appendChild(voiceCard);
    });

    card.appendChild(voiceGrid);
    container.appendChild(card);
  });
}

function renderCase3Table(container, scenarios) {
  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>Context Type</th>
        <th>Bob's Query</th>
        <th>Intended Reply</th>
        <th>Injected Reply</th>
        <th>Attack Impact</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');
  scenarios.forEach(scenario => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${scenario.context}</td>
      <td>${scenario.query}</td>
      <td>${scenario.intended}</td>
      <td>${scenario.injected}</td>
      <td>${impactMap[scenario.context] || ''}</td>
    `;
    tbody.appendChild(row);
  });

  container.appendChild(table);
  const note = document.createElement('p');
  note.className = 'table-note';
  note.textContent = 'Injected replies are synthesized and transmitted over the active EM injection channel.';
  container.appendChild(note);
}

function renderCase3Audio(container, scenarios) {
  scenarios.forEach(scenario => {
    const card = document.createElement('div');
    card.className = 'case-card';

    const title = document.createElement('h3');
    title.textContent = scenario.context;
    card.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'case-meta';
    meta.textContent = scenario.query;
    card.appendChild(meta);

    const grid = document.createElement('div');
    grid.className = 'voice-grid';

    const labels = [
      { key: 'speaker', label: 'Speaker (ground truth)' },
      { key: 'received', label: 'Received leakage' },
      { key: 'denoised', label: 'Denoised output' },
      { key: 'injected', label: 'Injected response' }
    ];

    labels.forEach(item => {
      const audioCard = document.createElement('div');
      audioCard.className = 'voice-card';
      const h4 = document.createElement('h4');
      h4.textContent = item.label;
      audioCard.appendChild(h4);
      audioCard.appendChild(createAudioRow('Audio', scenario.audio[item.key]));
      grid.appendChild(audioCard);
    });

    card.appendChild(grid);

    const scenarioGrid = document.createElement('div');
    scenarioGrid.className = 'scenario-grid';
    const intended = document.createElement('div');
    intended.className = 'scenario-card';
    intended.innerHTML = `<strong>Intended reply</strong><p>${scenario.intended}</p>`;
    const injected = document.createElement('div');
    injected.className = 'scenario-card';
    injected.innerHTML = `<strong>Injected reply</strong><p>${scenario.injected}</p>`;
    scenarioGrid.appendChild(intended);
    scenarioGrid.appendChild(injected);

    card.appendChild(scenarioGrid);
    container.appendChild(card);
  });
}

fetch('assets/data/audio.json')
  .then(res => res.json())
  .then(data => {
    const case1 = document.getElementById('case1-audio');
    const case2 = document.getElementById('case2-audio');
    const case3Table = document.getElementById('case3-table');
    const case3Audio = document.getElementById('case3-audio');

    const scenarioOrder = ['Medical', 'Financial', 'Logistics', 'Navigation', 'Governance'];
    const scenarios = [...data.case3.scenarios].sort(
      (a, b) => scenarioOrder.indexOf(a.context) - scenarioOrder.indexOf(b.context)
    );

    renderCaseStudy(case1, data.case1);
    renderCaseStudy(case2, data.case2);
    renderCase3Table(case3Table, scenarios);
    renderCase3Audio(case3Audio, scenarios);
  })
  .catch(err => {
    console.error('Failed to load audio data', err);
  });

