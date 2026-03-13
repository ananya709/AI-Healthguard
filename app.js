/* ===== AURA HEALTH — APP.JS ===== */

// ── THEME SWITCHER ───────────────────────────────────────────────────────────
function setTheme(theme, dotEl) {
  document.documentElement.dataset.theme = theme === 'aurora' ? '' : theme;
  document.body.dataset.theme = theme === 'aurora' ? '' : theme;
  document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
  if (dotEl) dotEl.classList.add('active');
  localStorage.setItem('aura-theme', theme);
  // Update chart colors to match theme
  updateChartColors(theme);
}

const themeColors = {
  aurora:  { primary: '#ff9a9e', secondary: '#c9b8f8' },
  ocean:   { primary: '#43e8d8', secondary: '#60c5f1' },
  sunset:  { primary: '#f9a04b', secondary: '#fc6a8a' },
  forest:  { primary: '#6bcb77', secondary: '#40916c' },
  galaxy:  { primary: '#b78aff', secondary: '#7f5af0' },
};

function updateChartColors(theme) {
  const c = themeColors[theme] || themeColors.aurora;
  // Re-init dashboard with new colors if already rendered
  if (window._dashInit) initDashboardCharts(c.primary, c.secondary);
}

// Restore saved theme on load
(function() {
  const saved = localStorage.getItem('aura-theme') || 'aurora';
  const dot = document.querySelector(`.theme-dot[data-t="${saved}"]`);
  if (saved !== 'aurora') setTheme(saved, dot);
  else if (dot) dot.classList.add('active');
})();


const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
  cursorDot.style.left = e.clientX + 'px';
  cursorDot.style.top  = e.clientY + 'px';
});

// ── LOADER ───────────────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => loader.style.display = 'none', 600);
  }, 2000);
});

// ── NAV SCROLL ───────────────────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 50);
});

// ── COUNTER ANIMATION ────────────────────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  let count = 0;
  const inc = target / 60;
  const timer = setInterval(() => {
    count = Math.min(count + inc, target);
    el.textContent = Math.floor(count);
    if (count >= target) clearInterval(timer);
  }, 25);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('.stat-num').forEach(animateCounter);
      observer.unobserve(e.target);
    }
  });
});
document.querySelector('.hero-stats') && observer.observe(document.querySelector('.hero-stats'));

// ── HELPERS ──────────────────────────────────────────────────────────────────
function scrollTo(id) { document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' }); }

function selectToggle(btn, inputId) {
  btn.closest('.toggle-group').querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(inputId).value = btn.dataset.val;
}

function toggleTag(el) { el.classList.toggle('active'); }

const selectedSymptoms = new Set();
function toggleSymptom(el, name) {
  el.classList.toggle('active');
  selectedSymptoms.has(name) ? selectedSymptoms.delete(name) : selectedSymptoms.add(name);
}

// ── AI RISK ANALYZER ─────────────────────────────────────────────────────────
function analyzeRisk() {
  const age     = parseFloat(document.getElementById('age').value) || 0;
  const chol    = parseFloat(document.getElementById('cholesterol').value) || 0;
  const bp      = parseFloat(document.getElementById('bp').value) || 0;
  const sugar   = parseFloat(document.getElementById('sugar').value) || 0;
  const hb      = parseFloat(document.getElementById('hb').value) || 0;
  const weight  = parseFloat(document.getElementById('weight').value) || 0;
  const height  = parseFloat(document.getElementById('height').value) || 0;
  const smoking = document.getElementById('smoking').checked;
  const alcohol = document.getElementById('alcohol').checked;
  const exercise= document.getElementById('exercise').checked;
  const family  = document.getElementById('family_history').checked;
  const gender  = document.getElementById('gender').value;

  const bmi = height > 0 ? weight / (height * height) : 0;

  // ── XAI Factors ──────────────────────────────────────────────────────────
  const factors = [];

  // Age risk
  let ageRisk = 0;
  if (age > 65) ageRisk = 30;
  else if (age > 50) ageRisk = 20;
  else if (age > 40) ageRisk = 10;
  else if (age > 30) ageRisk = 5;
  factors.push({ name: 'Age', value: ageRisk, max: 30, color: '#ff9a9e', icon: '🎂' });

  // Cholesterol
  let cholRisk = 0;
  if (chol > 240) cholRisk = 25;
  else if (chol > 200) cholRisk = 15;
  else if (chol > 180) cholRisk = 8;
  factors.push({ name: 'Cholesterol', value: cholRisk, max: 25, color: '#fecfef', icon: '🩸' });

  // BP
  let bpRisk = 0;
  if (bp > 160) bpRisk = 25;
  else if (bp > 140) bpRisk = 18;
  else if (bp > 130) bpRisk = 10;
  factors.push({ name: 'Blood Pressure', value: bpRisk, max: 25, color: '#c9b8f8', icon: '🩺' });

  // Sugar
  let sugarRisk = 0;
  if (sugar > 200) sugarRisk = 20;
  else if (sugar > 140) sugarRisk = 12;
  else if (sugar > 110) sugarRisk = 5;
  factors.push({ name: 'Blood Sugar', value: sugarRisk, max: 20, color: '#a8edea', icon: '💉' });

  // BMI
  let bmiRisk = 0;
  if (bmi > 35) bmiRisk = 20;
  else if (bmi > 30) bmiRisk = 15;
  else if (bmi > 25) bmiRisk = 8;
  else if (bmi < 18.5 && bmi > 0) bmiRisk = 5;
  factors.push({ name: 'BMI', value: bmiRisk, max: 20, color: '#b8f0c0', icon: '⚖️' });

  // Lifestyle
  let lifeRisk = 0;
  if (smoking)  lifeRisk += 15;
  if (alcohol)  lifeRisk += 8;
  if (!exercise) lifeRisk += 10;
  if (family)   lifeRisk += 12;
  factors.push({ name: 'Lifestyle', value: lifeRisk, max: 45, color: '#ffd6a5', icon: '🌿' });

  // Hemoglobin
  let hbRisk = 0;
  const hbLow = gender === 'female' ? 12 : 13.5;
  if (hb > 0 && hb < hbLow) hbRisk = 10;
  factors.push({ name: 'Hemoglobin', value: hbRisk, max: 10, color: '#ffb3c6', icon: '🔬' });

  const totalRisk = Math.min(100, factors.reduce((s, f) => s + f.value, 0));

  // ── Render ────────────────────────────────────────────────────────────────
  document.getElementById('resultsEmpty').style.display = 'none';
  document.getElementById('resultsContent').classList.remove('hidden');

  // Animate arc
  const arcPath = document.getElementById('arcPath');
  const riskNum = document.getElementById('riskNum');
  const arcLength = 251;
  const offset = arcLength - (arcLength * totalRisk / 100);
  setTimeout(() => {
    arcPath.style.transition = 'stroke-dashoffset 1.5s ease';
    arcPath.style.strokeDashoffset = offset;
  }, 100);

  let count = 0;
  const numTimer = setInterval(() => {
    count = Math.min(count + 2, totalRisk);
    riskNum.textContent = Math.floor(count);
    if (count >= totalRisk) clearInterval(numTimer);
  }, 30);

  // Risk badge
  const badge = document.getElementById('riskBadge');
  if (totalRisk < 30) { badge.textContent = '✦ Low Risk'; badge.className = 'risk-badge low'; }
  else if (totalRisk < 60) { badge.textContent = '⚡ Moderate Risk'; badge.className = 'risk-badge moderate'; }
  else { badge.textContent = '⚠ High Risk'; badge.className = 'risk-badge high'; }

  // XAI bars
  const xaiBars = document.getElementById('xaiBars');
  xaiBars.innerHTML = factors
    .filter(f => f.value > 0)
    .sort((a, b) => b.value - a.value)
    .map(f => {
      const pct = Math.round((f.value / f.max) * 100);
      return `
        <div class="xai-bar-item">
          <div class="xai-bar-label">
            <span>${f.icon} ${f.name}</span>
            <span>+${f.value} pts (${pct}% impact)</span>
          </div>
          <div class="xai-bar-track">
            <div class="xai-bar-fill" style="width:0%;background:${f.color}" data-w="${pct}%"></div>
          </div>
        </div>`;
    }).join('');

  // Animate XAI bars
  setTimeout(() => {
    document.querySelectorAll('.xai-bar-fill').forEach(bar => {
      bar.style.transition = 'width 1s ease';
      bar.style.width = bar.dataset.w;
    });
  }, 200);

  // Disease predictions
  renderDiseases(totalRisk, factors, smoking, family, age, bmi);

  // Recommendations
  renderRecos(factors, totalRisk, exercise, smoking, bmi, chol, bp, sugar);

  // Risk chart
  renderRiskChart(totalRisk);
}

function renderDiseases(total, factors, smoking, family, age, bmi) {
  const diseases = [
    {
      name: 'Cardiovascular Disease', icon: '❤️',
      risk: Math.min(95, Math.round(factors.find(f=>f.name==='Blood Pressure').value * 2.5 + factors.find(f=>f.name==='Cholesterol').value * 2 + (smoking?20:0) + (age>50?15:0))),
      color: '#ff6b6b', detail: 'Heart & blood vessel conditions'
    },
    {
      name: 'Type 2 Diabetes', icon: '🩸',
      risk: Math.min(95, Math.round(factors.find(f=>f.name==='Blood Sugar').value * 3.5 + (bmi>30?25:bmi>25?15:0) + (family?15:0))),
      color: '#ffd6a5', detail: 'Blood glucose regulation disorder'
    },
    {
      name: 'Hypertension', icon: '🩺',
      risk: Math.min(95, Math.round(factors.find(f=>f.name==='Blood Pressure').value * 3 + (smoking?15:0) + (age>45?10:0))),
      color: '#c9b8f8', detail: 'High blood pressure condition'
    },
    {
      name: 'Anemia', icon: '🔬',
      risk: Math.min(95, factors.find(f=>f.name==='Hemoglobin').value * 6),
      color: '#a8edea', detail: 'Low red blood cell count'
    },
    {
      name: 'Metabolic Syndrome', icon: '⚡',
      risk: Math.min(95, Math.round((bmi>25?20:0) + factors.find(f=>f.name==='Blood Sugar').value * 2 + factors.find(f=>f.name==='Blood Pressure').value + factors.find(f=>f.name==='Cholesterol').value)),
      color: '#b8f0c0', detail: 'Cluster of metabolic conditions'
    }
  ];

  document.getElementById('diseaseList').innerHTML = diseases
    .sort((a,b) => b.risk - a.risk)
    .map(d => `
      <div class="disease-item">
        <div class="dis-icon">${d.icon}</div>
        <div class="dis-info">
          <div class="dis-name">${d.name}</div>
          <div class="dis-detail">${d.detail}</div>
        </div>
        <div class="dis-bar">
          <div class="dis-track">
            <div class="dis-fill" style="width:${d.risk}%;background:${d.color}"></div>
          </div>
          <div class="dis-pct">${d.risk}%</div>
        </div>
      </div>`).join('');
}

function renderRecos(factors, total, exercise, smoking, bmi, chol, bp, sugar) {
  const recos = [];

  if (total < 30) {
    recos.push({ cat: 'Great News', text: 'Your overall health risk is low. Maintain your current healthy habits and schedule regular annual checkups.', dot: '#56ab2f' });
  }

  if (!exercise) recos.push({ cat: 'Physical Activity', text: 'Aim for at least 150 minutes of moderate aerobic exercise per week. Even brisk walking significantly lowers cardiovascular risk.', dot: '#a8edea' });
  if (smoking) recos.push({ cat: 'Smoking Cessation', text: 'Quitting smoking is the single most effective action to reduce heart disease risk. Consult your doctor about cessation programs.', dot: '#ff6b6b' });
  if (chol > 200) recos.push({ cat: 'Cholesterol Management', text: 'Reduce saturated fats and increase fiber intake. Foods like oats, beans, and fatty fish can significantly lower LDL cholesterol.', dot: '#fecfef' });
  if (bp > 130) recos.push({ cat: 'Blood Pressure', text: 'Follow the DASH diet: reduce sodium to under 2,300mg/day, increase potassium-rich foods, and manage stress with mindfulness.', dot: '#c9b8f8' });
  if (sugar > 110) recos.push({ cat: 'Blood Sugar', text: 'Limit refined carbohydrates and sugary beverages. Eat balanced meals with protein, healthy fats, and complex carbs to stabilize glucose.', dot: '#ffd6a5' });
  if (bmi > 25) recos.push({ cat: 'Weight Management', text: 'Even a 5-10% reduction in body weight significantly reduces diabetes and cardiovascular risk. Focus on sustainable lifestyle changes.', dot: '#b8f0c0' });
  recos.push({ cat: 'Preventive Screenings', text: 'Schedule lipid panel, blood glucose, and blood pressure checks every 6-12 months based on your risk profile.', dot: '#ff9a9e' });

  document.getElementById('recoList').innerHTML = recos
    .map(r => `
      <div class="reco-item">
        <div class="reco-dot" style="background:${r.dot}"></div>
        <div class="reco-text"><div class="reco-cat">${r.cat}</div>${r.text}</div>
      </div>`).join('');
}

function renderRiskChart(currentRisk) {
  const ctx = document.getElementById('riskChart').getContext('2d');
  if (window.riskChartInst) window.riskChartInst.destroy();

  // Simulate past + projection
  const labels = ['6mo ago','5mo ago','4mo ago','3mo ago','2mo ago','1mo ago','Now','+3mo','+6mo','+1yr'];
  const past    = [currentRisk + 15, currentRisk + 12, currentRisk + 10, currentRisk + 7, currentRisk + 5, currentRisk + 2, currentRisk];
  const projected = [null,null,null,null,null,null,currentRisk, currentRisk - 5, currentRisk - 10, currentRisk - 18];

  window.riskChartInst = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Historical Risk',
          data: [...past, null, null, null],
          borderColor: '#ff9a9e',
          backgroundColor: 'rgba(255,154,158,0.1)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#ff9a9e',
          pointRadius: 4,
        },
        {
          label: 'Projected (with treatment)',
          data: projected,
          borderColor: '#a8edea',
          borderDash: [5,5],
          backgroundColor: 'rgba(168,237,234,0.05)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#a8edea',
          pointRadius: 4,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: 'rgba(255,255,255,0.7)', font: { family: 'DM Sans' } } },
        tooltip: {
          backgroundColor: 'rgba(13,10,26,0.9)',
          titleColor: '#fff',
          bodyColor: 'rgba(255,255,255,0.7)',
          borderColor: 'rgba(255,154,158,0.3)',
          borderWidth: 1,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y}%` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', font:{size:10} } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.5)', callback: v => v + '%' }, min: 0, max: 100 }
      }
    }
  });
}

// ── BMI ───────────────────────────────────────────────────────────────────────
function calcBMI() {
  const w = parseFloat(document.getElementById('bmiW').value);
  const h = parseFloat(document.getElementById('bmiH').value);
  if (!w || !h) return;
  const bmi = w / (h * h);
  let label, pct;
  if (bmi < 18.5) { label = 'Underweight'; pct = 10; }
  else if (bmi < 25) { label = 'Normal Weight ✓'; pct = 35; }
  else if (bmi < 30) { label = 'Overweight'; pct = 62; }
  else { label = 'Obese'; pct = 87; }

  document.getElementById('bmiVal').textContent = bmi.toFixed(1);
  document.getElementById('bmiLabel').textContent = label;
  document.getElementById('bmiNeedle').style.left = pct + '%';
  document.getElementById('bmiResult').classList.remove('hidden');
}

// ── HEART RISK ────────────────────────────────────────────────────────────────
function calcHeartRisk() {
  const age  = parseFloat(document.getElementById('hrAge').value) || 0;
  const bp   = parseFloat(document.getElementById('hrBP').value) || 0;
  const chol = parseFloat(document.getElementById('hrChol').value) || 0;
  const smk  = document.getElementById('hrSmoke').checked;

  let risk = 0;
  if (age > 60) risk += 20;
  else if (age > 50) risk += 12;
  else if (age > 40) risk += 6;
  if (bp > 160) risk += 20;
  else if (bp > 140) risk += 12;
  else if (bp > 120) risk += 5;
  if (chol > 240) risk += 15;
  else if (chol > 200) risk += 8;
  if (smk) risk += 20;

  const label = risk < 10 ? 'Low Risk' : risk < 20 ? 'Moderate Risk' : 'High Risk';
  document.getElementById('hrVal').textContent = risk + '%';
  document.getElementById('hrLabel').textContent = `10-Year Heart Risk — ${label}`;
  document.getElementById('hrBar').style.width = Math.min(risk, 100) + '%';
  document.getElementById('hrResult').classList.remove('hidden');
}

// ── DIABETES ──────────────────────────────────────────────────────────────────
function calcDiabetes() {
  const sugar  = parseFloat(document.getElementById('diabSugar').value) || 0;
  const hba    = parseFloat(document.getElementById('diabHba').value) || 0;
  const family = document.getElementById('diabFamily').checked;

  let risk = 0;
  if (sugar > 180) risk += 40;
  else if (sugar > 140) risk += 25;
  else if (sugar > 110) risk += 10;
  if (hba > 6.5) risk += 35;
  else if (hba > 5.7) risk += 15;
  if (family) risk += 20;

  let label;
  if (risk >= 60) label = 'High Diabetes Risk ⚠️';
  else if (risk >= 25) label = 'Pre-diabetic Range';
  else label = 'Low Diabetes Risk ✓';

  document.getElementById('diabVal').textContent = risk + '%';
  document.getElementById('diabLabel').textContent = label;
  document.getElementById('diabResult').classList.remove('hidden');
}

// ── HEMOGLOBIN ────────────────────────────────────────────────────────────────
function calcHb() {
  const hb = parseFloat(document.getElementById('hbVal2').value) || 0;
  const g  = document.getElementById('hbGender').value;
  const low = g === 'female' ? 12 : 13.5;
  const high = g === 'female' ? 16 : 17.5;

  let label;
  if (hb < low) label = `Low Hemoglobin — Anemia risk`;
  else if (hb > high) label = `Elevated — Consult physician`;
  else label = `Normal Range ✓`;

  document.getElementById('hbVal3').textContent = hb + ' g/dL';
  document.getElementById('hbLabel').textContent = label + ` (Normal: ${low}–${high})`;
  document.getElementById('hbResult').classList.remove('hidden');
}

// ── BP ────────────────────────────────────────────────────────────────────────
function calcBP() {
  const sys = parseFloat(document.getElementById('bpSys').value) || 0;
  const dia = parseFloat(document.getElementById('bpDia').value) || 0;

  const cats = [
    { name: 'Normal', sys: [0,120], dia: [0,80], color: '#56ab2f' },
    { name: 'Elevated', sys: [120,130], dia: [0,80], color: '#f7971e' },
    { name: 'Stage 1 Hypertension', sys: [130,140], dia: [80,90], color: '#ff6b6b' },
    { name: 'Stage 2 Hypertension', sys: [140,999], dia: [90,999], color: '#e53e3e' },
  ];

  let active = cats[0];
  for (const c of cats) {
    if (sys >= c.sys[0] && dia >= c.dia[0]) active = c;
  }

  document.getElementById('bpVal').textContent = `${sys}/${dia}`;
  document.getElementById('bpLabel').textContent = active.name;
  document.getElementById('bpResult').classList.remove('hidden');

  document.getElementById('bpCats').innerHTML = cats.map(c =>
    `<div class="bp-cat ${c.name===active.name?'active':''}" style="${c.name===active.name?'color:'+c.color:''}">${c.name===active.name?'→ ':''} ${c.name}: ${c.sys[0]}–${c.sys[1]==='999'?'180+':c.sys[1]} / ${c.dia[0]}–${c.dia[1]==='999'?'110+':c.dia[1]} mmHg</div>`
  ).join('');
}

// ── CALORIES ──────────────────────────────────────────────────────────────────
function calcCalories() {
  const w   = parseFloat(document.getElementById('calW').value) || 0;
  const h   = parseFloat(document.getElementById('calH').value) || 0;
  const age = parseFloat(document.getElementById('calAge').value) || 0;
  const act = parseFloat(document.getElementById('calAct').value) || 1.2;
  const bmr = 10 * w + 6.25 * h - 5 * age + 5; // Mifflin-St Jeor (male)
  const tdee = Math.round(bmr * act);

  document.getElementById('calVal').textContent = tdee;
  document.getElementById('calResult').classList.remove('hidden');
}

// ── SYMPTOM CHECKER ───────────────────────────────────────────────────────────
function checkSymptoms() {
  const typed = document.getElementById('symptomText').value.toLowerCase();
  const all   = [...selectedSymptoms];
  if (typed) {
    const keywords = ['fever','headache','chest pain','fatigue','cough','nausea','dizziness','abdominal','vision','joint','rash','shortness'];
    keywords.forEach(k => { if (typed.includes(k)) all.push(k); });
  }

  if (!all.length) {
    document.getElementById('symptomResult').innerHTML = '<div class="results-empty"><div class="empty-icon">⚠️</div><p>Please select or type at least one symptom.</p></div>';
    return;
  }

  const duration = document.getElementById('duration').value;

  // Rule-based with weights
  const conditions = [];
  const s = (name) => all.some(a => a.toLowerCase().includes(name.toLowerCase()));

  if (s('Fever') || s('fever'))
    conditions.push({ name: 'Viral Infection', prob: 75, urgent: false, icon: '🦠', desc: 'Common viral illness such as flu or cold.' });
  if (s('Chest Pain') || s('chest'))
    conditions.push({ name: 'Cardiac Event', prob: 60, urgent: true, icon: '❤️', desc: 'Chest pain requires immediate medical evaluation.' });
  if (s('Shortness of Breath') || s('breath'))
    conditions.push({ name: 'Respiratory Distress', prob: 55, urgent: true, icon: '🫁', desc: 'May indicate pulmonary or cardiac conditions.' });
  if (s('Headache') || s('headache'))
    conditions.push({ name: 'Migraine / Tension Headache', prob: 65, urgent: false, icon: '🧠', desc: 'Most headaches are benign but persistent ones need evaluation.' });
  if (s('Fatigue') && s('Weight Loss'))
    conditions.push({ name: 'Metabolic Disorder', prob: 45, urgent: false, icon: '⚡', desc: 'Could indicate thyroid or metabolic issues.' });
  if (s('Dizziness') || s('dizziness'))
    conditions.push({ name: 'Vestibular / Cardiovascular', prob: 50, urgent: duration === 'chronic', icon: '💫', desc: 'Inner ear or blood pressure related.' });
  if (s('Nausea') || s('nausea'))
    conditions.push({ name: 'Gastrointestinal Issue', prob: 60, urgent: false, icon: '🤢', desc: 'May relate to GI tract, medication, or infection.' });
  if (s('Joint Pain') || s('joint'))
    conditions.push({ name: 'Arthritis / Inflammation', prob: 55, urgent: false, icon: '🦴', desc: 'Inflammatory or degenerative joint conditions.' });
  if (s('Abdominal Pain') || s('abdominal'))
    conditions.push({ name: 'GI Disorder', prob: 65, urgent: false, icon: '🫁', desc: 'Wide range of causes from gastritis to appendicitis.' });
  if (s('Memory Issues') || s('memory'))
    conditions.push({ name: 'Cognitive Concern', prob: 40, urgent: duration === 'chronic', icon: '🧠', desc: 'Consider neurological evaluation if persistent.' });

  if (!conditions.length)
    conditions.push({ name: 'Non-specific Symptoms', prob: 30, urgent: false, icon: '🩺', desc: 'Consult a healthcare professional for proper diagnosis.' });

  const hasUrgent = conditions.some(c => c.urgent);
  const urgencyLevel = hasUrgent ? 'high' : conditions.some(c => c.prob > 60) ? 'medium' : 'low';
  const urgencyText  = hasUrgent ? '🚨 Seek Immediate Care' : urgencyLevel === 'medium' ? '⚡ See Doctor Soon' : '✓ Monitor Symptoms';

  document.getElementById('symptomResult').innerHTML = `
    <h3>AI Symptom Analysis</h3>
    <div class="urgency-badge ${urgencyLevel}">${urgencyText}</div>
    <p style="color:var(--muted);font-size:13px;margin-bottom:15px;">Based on ${all.length} symptom(s) — ${duration} duration</p>
    <div class="condition-list">
      ${conditions.sort((a,b)=>b.prob-a.prob).map(c => `
        <div class="condition-item">
          <div>
            <div class="cond-name">${c.icon} ${c.name}</div>
            <div style="font-size:12px;color:var(--muted);margin-top:3px">${c.desc}</div>
          </div>
          <div class="cond-prob">${c.prob}%</div>
        </div>`).join('')}
    </div>
    <p style="font-size:11px;color:var(--muted);margin-top:20px;padding:12px;background:rgba(255,154,158,0.05);border-radius:8px;border:1px solid rgba(255,154,158,0.1)">
      ⚠️ This is an AI screening tool for educational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
    </p>`;
}

// ── DASHBOARD CHARTS ──────────────────────────────────────────────────────────
function initDashboardCharts(primary, secondary) {
  primary   = primary   || '#ff9a9e';
  secondary = secondary || '#c9b8f8';
  window._dashInit = true;
  const commonOpts = {
    responsive: true,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.6)', font:{family:'DM Sans',size:11} } }
    },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font:{size:10} } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: 'rgba(255,255,255,0.4)', font:{size:10} } }
    }
  };

  // Weekly health trend
  new Chart(document.getElementById('weekChart'), {
    type: 'line',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label: 'Heart Rate', data: [72,75,68,78,70,65,72], borderColor: primary, tension:0.4, fill:false, pointRadius:3 },
        { label: 'Steps (00s)', data: [80,65,90,55,100,70,85], borderColor: secondary, tension:0.4, fill:false, pointRadius:3 }
      ]
    },
    options: { ...commonOpts }
  });

  // Vitals radar
  new Chart(document.getElementById('vitalsChart'), {
    type: 'radar',
    data: {
      labels: ['Heart Health','BP','Blood Sugar','Cholesterol','Sleep','Exercise'],
      datasets: [{
        label: 'Your Vitals',
        data: [80, 70, 85, 65, 75, 60],
        borderColor: secondary,
        backgroundColor: secondary.replace(')', ',0.15)').replace('rgb', 'rgba'),
        pointBackgroundColor: secondary,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: 'rgba(255,255,255,0.6)', font:{family:'DM Sans',size:11} } } },
      scales: { r: { grid: { color: 'rgba(255,255,255,0.08)' }, ticks: { display: false }, angleLines: { color: 'rgba(255,255,255,0.08)' }, pointLabels: { color: 'rgba(255,255,255,0.6)', font:{size:11} } } }
    }
  });

  // Risk history bar
  new Chart(document.getElementById('riskHistChart'), {
    type: 'bar',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun'],
      datasets: [{
        label: 'Risk Score',
        data: [45, 42, 38, 35, 32, 28],
        backgroundColor: ['rgba(255,154,158,0.6)','rgba(255,154,158,0.55)','rgba(255,154,158,0.5)','rgba(201,184,248,0.5)','rgba(168,237,234,0.5)','rgba(184,240,192,0.6)'],
        borderRadius: 8,
      }]
    },
    options: { ...commonOpts }
  });
}

window.addEventListener('load', () => {
  setTimeout(initDashboardCharts, 2200);
});

// ── APPOINTMENT ───────────────────────────────────────────────────────────────
function bookAppointment() {
  const name  = document.getElementById('apptName').value;
  const email = document.getElementById('apptEmail').value;
  const date  = document.getElementById('apptDate').value;
  if (!name || !email || !date) {
    alert('Please fill in your name, email, and preferred date.');
    return;
  }
  const msg = document.getElementById('apptMsg');
  msg.textContent = `✓ Appointment confirmed for ${name} on ${date}. Confirmation will be sent to ${email}.`;
  msg.classList.remove('hidden');
  setTimeout(() => msg.classList.add('hidden'), 6000);
}

// ── AI CHATBOT ────────────────────────────────────────────────────────────────
const knowledgeBase = {
  'cholesterol': 'To lower cholesterol: eat more fiber (oats, beans, fruits), reduce saturated fats, exercise regularly, and consider omega-3 rich foods like salmon. Target total cholesterol below 200 mg/dL.',
  'blood pressure': 'To lower BP: reduce sodium to under 2,300mg/day, follow the DASH diet, exercise 30 mins daily, limit alcohol, manage stress with meditation or yoga, and maintain a healthy weight.',
  'diabetes': 'Signs of diabetes include increased thirst, frequent urination, fatigue, blurred vision, and slow wound healing. Fasting blood sugar above 126 mg/dL is diagnostic. Consult your doctor for HbA1c testing.',
  'heart': 'Heart disease prevention: don\'t smoke, control BP and cholesterol, maintain healthy weight, exercise regularly, eat a heart-healthy diet rich in fruits, vegetables, and whole grains.',
  'bmi': 'BMI is weight(kg) divided by height(m²). Under 18.5: Underweight, 18.5-24.9: Normal, 25-29.9: Overweight, 30+: Obese. It\'s a screening tool, not a definitive health measure.',
  'fever': 'For fever: rest, stay hydrated, use a cool compress, and take fever-reducing medications if needed. Seek medical care if fever exceeds 103°F (39.4°C) or lasts more than 3 days.',
  'headache': 'For headaches: rest in a quiet, dark room, stay hydrated, apply a cold or warm compress to your head. Consider stress reduction techniques. Severe or sudden headaches require immediate medical attention.',
  'exercise': 'The WHO recommends 150-300 minutes of moderate aerobic activity per week, plus muscle-strengthening activities on 2+ days per week. Start slowly and gradually increase intensity.',
  'sleep': 'Adults need 7-9 hours of sleep per night. Good sleep hygiene: consistent schedule, cool dark room, avoid screens before bed, limit caffeine after noon.',
  'diet': 'A balanced diet includes: plenty of vegetables and fruits, whole grains, lean proteins, healthy fats (olive oil, nuts, avocado), and limited processed foods and sugars.',
  'stress': 'Chronic stress increases cortisol, raising risk of heart disease, diabetes, and mental health issues. Techniques: deep breathing, meditation, regular exercise, social connection, adequate sleep.',
  'anemia': 'Anemia symptoms: fatigue, weakness, pale skin, shortness of breath. Eat iron-rich foods like lean meats, beans, spinach. Vitamin C enhances iron absorption. Consult a doctor for testing.',
};

function findAnswer(msg) {
  const m = msg.toLowerCase();
  for (const [key, val] of Object.entries(knowledgeBase)) {
    if (m.includes(key)) return val;
  }
  if (m.includes('hello') || m.includes('hi') || m.includes('hey')) return "Hello! I'm Aura AI, your health assistant 👋 Ask me about symptoms, nutrition, exercise, or any health concern!";
  if (m.includes('thank')) return "You're welcome! Remember, I'm here anytime you have health questions. Stay well! 🌸";
  if (m.includes('doctor') || m.includes('hospital')) return "For serious health concerns, always consult a qualified healthcare professional. Use our 'Find Care' section to locate nearby hospitals, or book an appointment above.";
  return "That's a great health question! While I specialize in common health topics, for specific medical advice please consult a qualified healthcare professional. Is there something else I can help with—like diet, exercise, or symptom information?";
}

function sendChat() {
  const input = document.getElementById('chatInput');
  const msg   = input.value.trim();
  if (!msg) return;

  const messages = document.getElementById('chatMessages');
  messages.innerHTML += `<div class="chat-msg user"><div class="msg-bubble">${msg}</div></div>`;
  input.value = '';

  setTimeout(() => {
    const reply = findAnswer(msg);
    messages.innerHTML += `<div class="chat-msg ai"><div class="msg-bubble">${reply}</div></div>`;
    messages.scrollTop = messages.scrollHeight;
  }, 600);
  messages.scrollTop = messages.scrollHeight;
}

function quickMsg(msg) {
  document.getElementById('chatInput').value = msg;
  sendChat();
}

function openChat() {
  document.getElementById('chatPanel').classList.add('open');
  document.getElementById('chatFab').style.display = 'none';
}

function closeChat() {
  document.getElementById('chatPanel').classList.remove('open');
  document.getElementById('chatFab').style.display = 'flex';
}

// ── SCROLL ANIMATIONS ─────────────────────────────────────────────────────────
const ioAnim = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card-glass, .tool-card, .dash-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  ioAnim.observe(el);
});
