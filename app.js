const BASE = location.hostname.includes('github.io')
  ? 'https://tajbouk-cmd.github.io/TON-play-code-tutorial/'
  : './';

const LESSONS_PATH = BASE + 'lessons/lessons.json';
const SOLUTIONS_PATH = BASE + 'lessons/solutions.json';

let lessons = [];
let solutions = {};
let current = 0;

// Theme toggle elements
const themeToggle = document.getElementById('themeToggle');
const themeIconSVG = document.getElementById('themeIcon');

function setThemeFromStorage(){
  const t = localStorage.getItem('theme');
  if(t === 'light'){ 
    document.body.classList.add('light'); 
    themeIconSVG.innerHTML = sunSVG(); 
  }
  else { 
    document.body.classList.remove('light'); 
    themeIconSVG.innerHTML = moonSVG(); 
  }
}

function moonSVG(){ 
  return '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>'; 
}
function sunSVG(){ 
  return '<circle cx="12" cy="12" r="4" fill="currentColor"/>'; 
}

themeToggle && themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('light');
  if(document.body.classList.contains('light')){ 
    themeIconSVG.innerHTML = sunSVG(); 
    localStorage.setItem('theme','light'); 
  }
  else { 
    themeIconSVG.innerHTML = moonSVG(); 
    localStorage.setItem('theme','dark'); 
  }
});

setThemeFromStorage();

async function init(){
  try{
    const [lRes, sRes] = await Promise.all([
      fetch(LESSONS_PATH),
      fetch(SOLUTIONS_PATH)
    ]);

    if(!lRes.ok) throw new Error('Failed to load lessons.json');
    if(!sRes.ok) throw new Error('Failed to load solutions.json');

    lessons = await lRes.json();
    solutions = await sRes.json();

    const list = document.getElementById('lessonList');
    lessons.forEach((ls, i)=>{
      const btn = document.createElement('button');
      btn.textContent = (i+1)+'. '+ls.title;
      btn.addEventListener('click', ()=>load(i));
      list.appendChild(btn);
    });

    document.getElementById('prevBtn').addEventListener('click', ()=>load(Math.max(0,current-1)));
    document.getElementById('nextBtn').addEventListener('click', ()=>load(Math.min(lessons.length-1,current+1)));
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('showSolutionBtn').addEventListener('click', showSolution);
    document.getElementById('clearBtn').addEventListener('click', ()=>{
      document.getElementById('editor').value='';
      document.getElementById('output').textContent='';
    });

    load(0);
  }catch(e){
    console.error(e);
    const content = document.getElementById('content');
    if(content) content.innerHTML = '<p style="color:#f88">⚠️ Error loading lessons — تأكد من وجود الملفات
