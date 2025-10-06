// ===== TON PlayCode - Professional Python Tutorials =====

const LESSONS_PATH = "lessons/lessons.json";
const SOLUTIONS_PATH = "lessons/solutions.json";

document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const lessonList = document.getElementById("lesson-list");
  const editor = document.getElementById("code-editor");
  const runBtn = document.getElementById("run-btn");
  const resultBox = document.getElementById("result");

  if (!output || !lessonList || !editor || !runBtn || !resultBox) {
    console.error("❌ Missing DOM elements");
    return;
  }

  output.textContent = "Loading Python environment...";

  let pyodide;
  try {
    pyodide = await loadPyodide();
    output.textContent = "✅ Python ready! Select a lesson to start.";
  } catch (err) {
    output.textContent = "❌ Failed to load Python.";
    console.error(err);
    return;
  }

  async function loadLessons() {
    try {
      const res = await fetch(LESSONS_PATH);
      if (!res.ok) throw new Error(`Could not load ${LESSONS_PATH}`);
      const lessons = await res.json();
      displayLessons(lessons);
    } catch (err) {
      console.error("Error fetching lessons", err);
      output.textContent = "❌ Could not load lessons.";
    }
  }

  function displayLessons(lessons) {
    lessonList.innerHTML = "";
    lessons.forEach((lesson, i) => {
      const btn = document.createElement("button");
      btn.textContent = `${i + 1}. ${lesson.title}`;
      btn.onclick = () => loadLesson(lesson);
      lessonList.appendChild(btn);
    });
  }

  async function loadLesson(lesson) {
    editor.value = lesson.code || "# Write your Python code here";
    resultBox.textContent = lesson.description || "No description available.";
  }

  runBtn.addEventListener("click", async () => {
    const code = editor.value;
    resultBox.textContent = "Running...";
    try {
      const result = await pyodide.runPythonAsync(code);
      resultBox.textContent = `✅ Result:\n${result}`;
    } catch (err) {
      resultBox.textContent = `❌ Error:\n${err}`;
    }
  });

  await loadLessons();
});
