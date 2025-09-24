
const LESSONS_PATH = "lessons/lessons.json";
const SOLUTIONS_PATH = "lessons/solutions.json";

let lessons = [];
let solutions = {};
let current = 0;
let pyodide = null;

// Load Pyodide
async function loadPyodideAndPackages() {
  pyodide = await loadPyodide();
  console.log("✅ Pyodide loaded!");
}
loadPyodideAndPackages();

// Theme
const themeToggle = document.getElementById("themeToggle");
const themeIconSVG = document.getElementById("themeIcon");

function moonSVG(){ return '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>' }
function sunSVG(){ return '<circle cx="12" cy="12" r="5" fill="currentColor"/>' }

function setThemeFromStorage(){
  const t = localStorage.getItem("theme");
  if(t === "light"){ document.body.classList.add("light"); themeIconSVG.innerHTML = sunSVG(); }
  else { document.body.classList.remove("light"); themeIconSVG.innerHTML = moonSVG(); }
}
themeToggle && themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  if(document.body.classList.contains("light")){ themeIconSVG.innerHTML = sunSVG(); localStorage.setItem("theme","light"); }
  else { themeIconSVG.innerHTML = moonSVG(); localStorage.setItem("theme","dark"); }
});
setThemeFromStorage();

// Init lessons
async function init(){
  try{
    const [lRes, sRes] = await Promise.all([fetch(LESSONS_PATH), fetch(SOLUTIONS_PATH)]);
    if(!lRes.ok) throw new Error("Failed to load lessons.json");
    if(!sRes.ok) throw new Error("Failed to load solutions.json");
    lessons = await lRes.json();
    solutions = await sRes.json();

    const list = document.getElementById("lessonList");
    lessons.forEach((ls, i)=>{
      const btn = document.createElement("button");
      btn.textContent = (i+1)+". "+ls.title;
      btn.addEventListener("click", ()=>load(i));
      list.appendChild(btn);
    });

    document.getElementById("prevBtn").addEventListener("click", ()=>load(Math.max(0,current-1)));
    document.getElementById("nextBtn").addEventListener("click", ()=>load(Math.min(lessons.length-1,current+1)));
    document.getElementById("runBtn").addEventListener("click", runCode);
    document.getElementById("showSolutionBtn").addEventListener("click", showSolution);
    document.getElementById("clearBtn").addEventListener("click", ()=>{
      document.getElementById("editor").value="";
      document.getElementById("output").textContent="";
      saveCode(current, ""); // clear saved code
    });

    load(0);
  }catch(e){
    console.error(e);
    const content = document.querySelector(".content");
    if(content) content.innerHTML = '<p style="color:#f88">Error loading lessons — check lessons/ folder and filenames.</p>';
  }
}

function load(i){
  current = i;
  const lesson = lessons[i];
  const buttons = document.querySelectorAll(".sidebar button");
  buttons.forEach((b,idx)=>b.classList.toggle("active", idx===i));
  document.getElementById("lessonTitle").textContent = lesson.title;
  document.getElementById("lessonDesc").textContent = lesson.description || "";

  // Load saved code or starter
  const saved = getSavedCode(i);
  document.getElementById("editor").value = saved || lesson.starter || "";
  document.getElementById("output").textContent = "";
}

// Run code
async function runCode(){
  const code = document.getElementById("editor").value;
  saveCode(current, code); // auto-save before running
  if(!code.trim()){ document.getElementById("output").textContent = "No code to run."; return; }
  try{
    const result = await pyodide.runPythonAsync(code);
    document.getElementById("output").textContent = result === undefined ? "Code executed." : String(result);
  }catch(e){
    document.getElementById("output").textContent = "Error: "+e.message;
  }
}

function showSolution(){
  const key = lessons[current].id || String(current+1);
  const sol = solutions[key] || solutions[lessons[current].title] || "No solution available";
  document.getElementById("editor").value = sol;
  saveCode(current, sol);
}

/* 🔥 LocalStorage: Save/Load Code */
function saveCode(index, code){
  localStorage.setItem("lesson_code_"+index, code);
}

function getSavedCode(index){
  return localStorage.getItem("lesson_code_"+index);
}

// Auto-save while typing
document.addEventListener("input", e=>{
  if(e.target.id === "editor"){
    saveCode(current, e.target.value);
  }
});

window.addEventListener("DOMContentLoaded", init);
