// ===== DADOS INICIAIS =====
const initialPeople = [
  "Adelina Gomes Da Silva",
  "Aldeci De Araujo Mesquita",
  "Alex Rodrigues De Lima",
  "Arthur Israel Santos De Oliveira",
  "Caroline Siebra Vieira",
  "Cristina Oliveira De Souza",
  "Danillo Fernando De Oliveira Vieira",
  "Derick Miguel Da Silva",
  "Iago Goncalves Onelio Da Silva",
  "Ingrid Lilian Silva Dias",
  "Jhonatas Gomes Dos Santos",
  "Jose Celso De Lucas",
  "Lucas Cabral Leo Da Silva",
  "João Gabriel Cruz",
  "Fabio Silas Do Espirito Santo",
  "Bianca Ferreira Dos Santos",
  "Erasmo Pereira",
  "Rosizela Alves Avelino",
  "Matheus Perciliano Da Silva",
  "Mauricio Dos Santos Alves",
  "Michell De Los Angeles Bravo Hernandez",
  "Rafael Alves Da Silva",
  "Renata Willa Santos",
  "Vagner Vieira Santos",
  "Wadson Costa Marques",
  "Wanderson Paulino",
  "Jonatas Luz"
];

function makeMetric() {
  return new Array(initialPeople.length).fill("");
}

const initialData = {
  people: [...initialPeople],
  dates: [
    { label: "10/11/2025", caixas: makeMetric(), apanhas: makeMetric() },
    { label: "11/11/2025", caixas: makeMetric(), apanhas: makeMetric() },
    { label: "12/11/2025", caixas: makeMetric(), apanhas: makeMetric() },
    { label: "13/11/2025", caixas: makeMetric(), apanhas: makeMetric() }
  ]
};

const STORAGE_KEY = "painel-equipe-tiburcio-v1";
let state = loadState();
let lockNames = true;

// elementos
const headerRowDates = document.getElementById("headerRowDates");
const headerRowMetrics = document.getElementById("headerRowMetrics");
const bodyRows = document.getElementById("bodyRows");
const rankingBox = document.getElementById("rankingBox");

const addDateBtn = document.getElementById("addDateBtn");
const addPersonBtn = document.getElementById("addPersonBtn");
const toggleNamesBtn = document.getElementById("toggleNamesBtn");
const resetBtn = document.getElementById("resetBtn");

let totalsRow = null;

// ===== LOAD / SAVE =====
function loadState() {
  const txt = localStorage.getItem(STORAGE_KEY);
  if (!txt) return structuredClone(initialData);
  try {
    const parsed = JSON.parse(txt);
    if (!parsed.people || !parsed.dates) throw new Error();
    return parsed;
  } catch {
    return structuredClone(initialData);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ===== RENDER =====
function render() {
  renderHeader();
  renderBody();
  renderDayTotals();
  renderRanking();
}

function renderHeader() {
  headerRowDates.innerHTML = "";
  headerRowMetrics.innerHTML = "";

  const thName = document.createElement("th");
  thName.textContent = "NOME";
  thName.rowSpan = 2;
  headerRowDates.appendChild(thName);

  state.dates.forEach((d, index) => {
    const th = document.createElement("th");
    th.colSpan = 2;

    const wrap = document.createElement("div");
    wrap.className = "date-header";

    const span = document.createElement("span");
    span.textContent = d.label;
    wrap.appendChild(span);

    const renameBtn = document.createElement("button");
    renameBtn.className = "small-icon";
    renameBtn.textContent = "✏️";
    renameBtn.title = "Renomear data";
    renameBtn.onclick = () => renameDate(index);
    wrap.appendChild(renameBtn);

    const delBtn = document.createElement("button");
    delBtn.className = "small-icon";
    delBtn.textContent = "🗑";
    delBtn.title = "Remover data";
    delBtn.onclick = () => removeDate(index);
    wrap.appendChild(delBtn);

    th.appendChild(wrap);
    headerRowDates.appendChild(th);
  });

  const thTotalCx = document.createElement("th");
  thTotalCx.textContent = "TOTAL CAIXAS";
  thTotalCx.rowSpan = 2;
  headerRowDates.appendChild(thTotalCx);

  const thTotalAp = document.createElement("th");
  thTotalAp.textContent = "TOTAL APANHAS";
  thTotalAp.rowSpan = 2;
  headerRowDates.appendChild(thTotalAp);

  state.dates.forEach(() => {
    const th1 = document.createElement("th");
    th1.textContent = "Caixas";
    const th2 = document.createElement("th");
    th2.textContent = "Apanhas";
    headerRowMetrics.appendChild(th1);
    headerRowMetrics.appendChild(th2);
  });
}

function renderBody() {
  bodyRows.innerHTML = "";

  state.people.forEach((person, rowIndex) => {
    const tr = document.createElement("tr");

    const nameTd = document.createElement("td");
    nameTd.className = "name-cell";
    nameTd.textContent = person;

    if (!lockNames) {
      const editBtn = document.createElement("button");
      editBtn.className = "small-icon name-edit-btn";
      editBtn.textContent = "✏️";
      editBtn.title = "Editar nome";
      editBtn.onclick = () => editName(rowIndex);
      nameTd.appendChild(editBtn);
    }

    tr.appendChild(nameTd);

    state.dates.forEach((d, dateIndex) => {
      tr.appendChild(createMetricCell(rowIndex, dateIndex, "caixas"));
      tr.appendChild(createMetricCell(rowIndex, dateIndex, "apanhas"));
    });

    const totalCx = totalForPerson(rowIndex, "caixas");
    const totalAp = totalForPerson(rowIndex, "apanhas");

    const tdTotalCx = document.createElement("td");
    tdTotalCx.className = "number-cell";
    tdTotalCx.textContent = totalCx;

    const tdTotalAp = document.createElement("td");
    tdTotalAp.className = "number-cell";
    tdTotalAp.textContent = totalAp;

    tr.appendChild(tdTotalCx);
    tr.appendChild(tdTotalAp);

    bodyRows.appendChild(tr);
  });
}

function createMetricCell(rowIndex, dateIndex, metric) {
  const td = document.createElement("td");
  td.className = "number-cell editable";
  td.dataset.row = rowIndex;
  td.dataset.date = dateIndex;
  td.dataset.metric = metric;
  td.textContent = state.dates[dateIndex][metric][rowIndex] || "";
  td.onclick = () => enterEditMode(td);
  return td;
}

// ===== EDIÇÃO DE CÉLULA =====
function enterEditMode(td) {
  const row = Number(td.dataset.row);
  const date = Number(td.dataset.date);
  const metric = td.dataset.metric;
  const oldVal = state.dates[date][metric][row] || "";

  td.innerHTML = "";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "cell-input";
  input.value = oldVal;
  td.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener("blur", save);
  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") { ev.preventDefault(); save(); }
    if (ev.key === "Escape") { ev.preventDefault(); cancel(); }
  });

  function save() {
    state.dates[date][metric][row] = input.value.trim();
    saveState();
    render();
  }

  function cancel() {
    td.textContent = oldVal;
  }
}

// ===== TOTAIS =====
function totalForPerson(rowIndex, metric) {
  return state.dates.reduce((sum, d) => {
    const v = parseFloat(d[metric][rowIndex]);
    return sum + (isNaN(v) ? 0 : v);
  }, 0);
}

function renderDayTotals() {
  if (totalsRow) totalsRow.remove();

  totalsRow = document.createElement("tr");
  totalsRow.style.background = "rgba(0,0,0,0.35)";
  totalsRow.style.fontWeight = "bold";

  const labelCell = document.createElement("td");
  labelCell.textContent = "TOTAL DO DIA";
  totalsRow.appendChild(labelCell);

  state.dates.forEach((d) => {
    const totCx = d.caixas.reduce((a, v) => a + (parseFloat(v) || 0), 0);
    const totAp = d.apanhas.reduce((a, v) => a + (parseFloat(v) || 0), 0);

    const tdCx = document.createElement("td");
    tdCx.textContent = totCx;
    const tdAp = document.createElement("td");
    tdAp.textContent = totAp;

    totalsRow.appendChild(tdCx);
    totalsRow.appendChild(tdAp);
  });

  // colunas de total por pessoa (não se aplicam aqui)
  totalsRow.appendChild(document.createElement("td"));
  totalsRow.appendChild(document.createElement("td"));

  bodyRows.prepend(totalsRow);
}

// ===== RANKING =====
function renderRanking() {
  const cxTotals = state.people.map((name, i) => ({
    name,
    total: totalForPerson(i, "caixas")
  }));
  const apTotals = state.people.map((name, i) => ({
    name,
    total: totalForPerson(i, "apanhas")
  }));

  cxTotals.sort((a, b) => b.total - a.total);
  apTotals.sort((a, b) => b.total - a.total);

  const topCx = cxTotals.slice(0, 3);
  const topAp = apTotals.slice(0, 3);

  rankingBox.innerHTML = `
    <h2>🏆 Ranking da Produção</h2>

    <h3>📦 Caixas</h3>
    <ol>
      ${topCx.map(p => `<li>${p.name} — ${p.total}</li>`).join("")}
    </ol>

    <h3>🟣 Apanhas</h3>
    <ol>
      ${topAp.map(p => `<li>${p.name} — ${p.total}</li>`).join("")}
    </ol>
  `;
}

// ===== CONTROLES =====
function renameDate(index) {
  const novo = prompt("Nova data:", state.dates[index].label);
  if (!novo) return;
  state.dates[index].label = novo.trim();
  saveState();
  render();
}

function removeDate(index) {
  if (!confirm("Remover esta data (Caixas e Apanhas)?")) return;
  state.dates.splice(index, 1);
  saveState();
  render();
}

function editName(rowIndex) {
  const novo = prompt("Editar nome:", state.people[rowIndex]);
  if (!novo) return;
  state.people[rowIndex] = novo.trim();
  saveState();
  render();
}

// botões
addDateBtn.addEventListener("click", () => {
  const label = prompt("Digite a nova data (ex.: 14/11/2025):");
  if (!label) return;

  const len = state.people.length;
  state.dates.push({
    label: label.trim(),
    caixas: new Array(len).fill(""),
    apanhas: new Array(len).fill("")
  });

  saveState();
  render();
});

addPersonBtn.addEventListener("click", () => {
  const name = prompt("Nome da nova pessoa:");
  if (!name) return;

  state.people.push(name.trim());
  state.dates.forEach(d => {
    d.caixas.push("");
    d.apanhas.push("");
  });

  saveState();
  render();
});

toggleNamesBtn.addEventListener("click", () => {
  lockNames = !lockNames;
  toggleNamesBtn.textContent = lockNames
    ? "🔒 Nomes bloqueados"
    : "🔓 Editar nomes";
  render();
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Resetar tudo para o padrão inicial?")) return;
  state = structuredClone(initialData);
  saveState();
  lockNames = true;
  render();
});

// ===== INICIA =====
render();
