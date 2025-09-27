// ---------- CONFIG ----------
const REPO_BASE = 'https://tajbouk-cmd.github.io/TON PlayCode — Professional Python Tutorials/'; // update if repo name changes
const LESSONS_PATH = (location.hostname.includes('github.io') ? REPO_BASE : './') + 'lessons/lessons.json';
const SOLUTIONS_PATH = (location.hostname.includes('github.io') ? REPO_BASE : './') + 'lessons/solutions.json';

let lessons = [], solutions = {}, current = 0, pyodide = null;
const statusEl = () => document.getElementById('status');
const editorEl = () => document.getElementById('editor');
const outputEl = () => document.getElementById('output');

// ---------- Pyodide loader ----------
async function loadPyodideAndInit(){
  statusEl().textContent = 'Pyodide: loading...';
  try{
    pyodide = await loadPyodide();
    // prepare small helper in pyodide to run and capture stdout
    await pyodide.runPythonAsync(`
import sys, io
def __run_capture(code):
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    try:
        exec(code, globals())
    finally:
        sys.stdout = old
    return buf.getvalue()
`);
    statusEl().textContent = 'Pyodide: ready';
  }catch(err){
    statusEl().textContent = 'Pyodide: failed to load';
    console.error('Pyodide load error', err);
  }
}
loadPyodideAndInit();

// ---------- Theme handling ----------
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
function moonSVG(){ return '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>'; }
function sunSVG(){ return '<circle cx="12" cy="12" r="5" fill="currentColor"/>'; }
function setTheme(){
  const t = localStorage.getItem('theme') || 'dark';
  if(t === 'light'){ document.body.classList.add('light'); themeIcon.innerHTML = sunSVG(); }
  else { document.body.classList.remove('light'); themeIcon.innerHTML = moonSVG(); }
}
themeToggle && themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  const now = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('theme', now);
  setTheme();
});
setTheme();

// ---------- Utilities: autosave & download ----------
function saveCode(index, code){ localStorage.setItem('ton_lesson_code_' + index, code); }
function loadSavedCode(index){ return localStorage.getItem('ton_lesson_code_' + index); }
function downloadCodeAsFile(filename, content){
  const blob = new Blob([content], {type: 'text/x-python'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
}

// ---------- Fetch lessons & wire UI ----------
async function init(){
  try{
    const [lr, sr] = await Promise.all([fetch(LESSONS_PATH), fetch(SOLUTIONS_PATH)]);
    if(!lr.ok) throw new Error('Could not fetch lessons');
    if(!sr.ok) throw new Error('Could not fetch solutions');
    lessons = await lr.json();
    solutions = await sr.json();

    const list = document.getElementById('lessonList');
    lessons.forEach((ls, i)=>{
      const b = document.createElement('button');
      b.textContent = `${i+1}. ${ls.title}`;
      b.addEventListener('click', ()=>loadLesson(i));
      list.appendChild(b);
    });

    document.getElementById('prevBtn').addEventListener('click', ()=>loadLesson(Math.max(0, current-1)));
    document.getElementById('nextBtn').addEventListener('click', ()=>loadLesson(Math.min(lessons.length-1, current+1)));
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('showSolutionBtn').addEventListener('click', showSolution);
    document.getElementById('clearBtn').addEventListener('click', ()=>{ editorEl().value=''; outputEl().textContent=''; saveCode(current, ''); });
    document.getElementById('downloadBtn').addEventListener('click', ()=> downloadCodeAsFile(`lesson-${current+1}.py`, editorEl().value || lessons[current].starter || ''));

    // auto-save as user types
    document.addEventListener('input', (e)=>{
      if(e.target === editorEl()){
        saveCode(current, e.target.value);
      }
    });

    loadLesson(0);
  }catch(err){
    console.error(err);
    const c = document.getElementById('content');
    if(c) c.innerHTML = `<p style="color:#f88">Error loading lessons or solutions. Check files and paths.</p>`;
  }
}

function markActive(index){
  const buttons = document.querySelectorAll('#lessonList button');
  buttons.forEach((b, i)=> b.classList.toggle('active', i === index));
}

// ---------- Load lesson ----------
function loadLesson(i){
  current = i;
  markActive(i);
  const l = lessons[i];
  document.getElementById('lessonTitle').textContent = l.title;
  document.getElementById('lessonDesc').textContent = l.description || '';
  const saved = loadSavedCode(i);
  editorEl().value = saved || l.starter || '';
  outputEl().textContent = '';
}

// ---------- Run code using Pyodide with capture ----------
async function runCode(){
  const code = editorEl().value || '';
  saveCode(current, code);
  if(!code.trim()){ outputEl().textContent = 'No code to run.'; return; }
  if(!pyodide){
    outputEl().textContent = 'Pyodide not loaded yet.';
    return;
  }
  statusEl().textContent = 'Running...';
  try{
    // Escape triple quotes inside user code to avoid string termination issues
    const wrapped = `
__run_capture("""${code.replace(/"""/g, '\\"""')}""")
`;
    const result = await pyodide.runPythonAsync(wrapped);
    // result is the captured stdout
    outputEl().textContent = result === undefined ? 'Code executed.' : String(result) || 'Code executed.';
  }catch(err){
    outputEl().textContent = 'Error: ' + (err && err.message ? err.message : String(err));
  }finally{
    statusEl().textContent = 'Ready';
  }
}

// ---------- Show solution ----------
function showSolution(){
  const key = lessons[current].id || String(current+1);
  const sol = solutions[key] || solutions[lessons[current].title] || 'No solution available';
  editorEl().value = sol;
  saveCode(current, sol);
}

// start
window.addEventListener('DOMContentLoaded', init);
