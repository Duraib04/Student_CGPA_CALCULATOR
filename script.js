// Simple CGPA calculator
// - Add semesters
// - In each semester add subjects with credit and grade point
// - Calculate SGPA per semester and weighted cumulative CGPA

const semestersEl = document.getElementById('semesters');
const addSemesterBtn = document.getElementById('addSemesterBtn');
const calculateBtn = document.getElementById('calculateBtn');
const resetBtn = document.getElementById('resetBtn');
const resultsEl = document.getElementById('results');

let semCount = 0;

function createSubjectRow() {
  const row = document.createElement('div');
  row.className = 'subject-row';

  const code = document.createElement('input');
  code.placeholder = 'Subject code';

  const credit = document.createElement('input');
  credit.placeholder = 'Credits';
  credit.type = 'number';
  credit.min = '0';
  credit.step = '0.5';
  credit.className = 'small';
  credit.value = 3;

  const grade = document.createElement('input');
  grade.placeholder = 'Grade point (e.g. 10)';
  grade.type = 'number';
  grade.min = '0';
  grade.max = '10';
  grade.step = '0.01';
  grade.className = 'small';

  const remove = document.createElement('button');
  remove.textContent = 'Remove';
  remove.className = 'btn';
  remove.type = 'button';
  remove.addEventListener('click', () => row.remove());

  row.appendChild(code);
  row.appendChild(credit);
  row.appendChild(grade);
  row.appendChild(remove);

  return row;
}

function addSemester() {
  semCount += 1;
  const box = document.createElement('div');
  box.className = 'semester';

  const title = document.createElement('h3');
  title.textContent = 'Semester ' + semCount;

  const subjects = document.createElement('div');
  subjects.className = 'subjects';

  // default one subject
  subjects.appendChild(createSubjectRow());

  const actions = document.createElement('div');
  actions.className = 'actions';

  const addSubBtn = document.createElement('button');
  addSubBtn.textContent = 'Add Subject';
  addSubBtn.className = 'btn';
  addSubBtn.type = 'button';
  addSubBtn.addEventListener('click', () => subjects.appendChild(createSubjectRow()));

  const removeSemBtn = document.createElement('button');
  removeSemBtn.textContent = 'Remove Semester';
  removeSemBtn.className = 'btn';
  removeSemBtn.type = 'button';
  removeSemBtn.addEventListener('click', () => {
    box.remove();
    recalcSemesterTitles();
  });

  actions.appendChild(addSubBtn);
  actions.appendChild(removeSemBtn);

  box.appendChild(title);
  box.appendChild(subjects);
  box.appendChild(actions);

  semestersEl.appendChild(box);
}

function recalcSemesterTitles() {
  const sems = Array.from(document.querySelectorAll('.semester'));
  sems.forEach((s, i) => {
    const h = s.querySelector('h3');
    if (h) h.textContent = 'Semester ' + (i + 1);
  });
  semCount = sems.length;
}

function calculate() {
  const sems = Array.from(document.querySelectorAll('.semester'));
  if (sems.length === 0) {
    resultsEl.innerHTML = '<p class="muted">Add at least one semester.</p>';
    return;
  }

  let totalWeighted = 0;
  let totalCredits = 0;
  const perSemResults = [];

  sems.forEach((s, si) => {
    const rows = Array.from(s.querySelectorAll('.subject-row'));
    let semWeighted = 0;
    let semCredits = 0;
    rows.forEach(r => {
      const inputs = r.querySelectorAll('input');
      const credit = parseFloat(inputs[1].value) || 0;
      const grade = parseFloat(inputs[2].value) || 0;
      semWeighted += credit * grade;
      semCredits += credit;
    });

    const sgpa = semCredits > 0 ? (semWeighted / semCredits) : 0;
    perSemResults.push({ semester: si + 1, sgpa: sgpa, credits: semCredits });

    totalWeighted += semWeighted;
    totalCredits += semCredits;
  });

  const cgpa = totalCredits > 0 ? (totalWeighted / totalCredits) : 0;

  // Render results
  let html = '';
  perSemResults.forEach(r => {
    html += `<p>Semester ${r.semester} — SGPA: <strong>${r.sgpa.toFixed(3)}</strong> &nbsp; (<span class="muted">Credits: ${r.credits}</span>)</p>`;
  });
  html += `<hr>`;
  html += `<p>Cumulative CGPA: <span style="font-size:1.25rem"> <strong>${cgpa.toFixed(3)}</strong></span> &nbsp; (<span class="muted">Total credits: ${totalCredits}</span>)</p>`;

  resultsEl.innerHTML = html;
}

function resetAll() {
  semestersEl.innerHTML = '';
  semCount = 0;
  resultsEl.innerHTML = '<p>No calculations yet.</p>';
}

// initial state
addSemesterBtn.addEventListener('click', addSemester);
calculateBtn.addEventListener('click', calculate);
resetBtn.addEventListener('click', resetAll);

// add one semester by default
addSemester();

// --- KSRCEResults integration ---
const fetchResultBtn = document.getElementById('fetchResultBtn');
const regInput = document.getElementById('regInput');
const resultFrame = document.getElementById('resultFrame');
const openExternalBtn = document.getElementById('openExternalBtn');

fetchResultBtn.addEventListener('click', async () => {
  const reg = (regInput.value || '').trim();
  if (!reg) {
    alert('Please enter a Register Number');
    return;
  }

  fetchResultBtn.disabled = true;
  fetchResultBtn.textContent = 'Fetching...';

  try {
    const res = await fetch(`/api/results?reg=${encodeURIComponent(reg)}`);
    if (!res.ok) throw new Error('Network response not ok');
    const data = await res.json();
    if (!data || !data.html) {
      alert('No result returned from server');
      return;
    }

    // Show returned HTML in iframe using srcdoc
    resultFrame.style.display = 'block';
    resultFrame.srcdoc = data.html;
  } catch (err) {
    console.error(err);
    alert('Failed to fetch result. Open on KSRCEResults instead.');
  } finally {
    fetchResultBtn.disabled = false;
    fetchResultBtn.textContent = 'Fetch Result';
  }
});

openExternalBtn.addEventListener('click', () => {
  const reg = (regInput.value || '').trim();
  if (!reg) return alert('Please enter a Register Number');
  // Fallback: open the external site with the register number appended as a query parameter
  const url = `https://www.ksrceresults.com/?reg=${encodeURIComponent(reg)}`;
  window.open(url, '_blank');
});
