// ===== TON PlayCode - Professional Python Tutorials =====

// ✅ تعريف المسارات (بدون رموز أو فراغات)
const LESSONS_PATH = "lessons/lessons.json";
const SOLUTIONS_PATH = "lessons/solutions.json";

// ✅ تحميل Pyodide بعد أن يجهز الـ DOM
document.addEventListener("DOMContentLoaded", async () => {
  const output = document.getElementById("output");
  const lessonList = document.getElementById("lesson-list");
  const editor = document.getElementById("code-editor");
  const runBtn = document.getElementById("run-btn");
  const resultBox = document.getElementById("result");

  // تأكيد وجود العناصر
  if (!output || !lessonList || !editor || !runBtn || !resultBox) {
    console.error("❌ Missing one or more DOM elements. Check your HTML IDs!");
    return;
  }

  output.textContent = "Loading Python environment...";

  // ✅ تحميل Pyodide
  let pyodide;
  try {
    pyodide = await loadPyodide();
    output.textContent = "✅ Python ready! Select a lesson to start.";
  } catch (err) {
    output.textContent = "❌ Failed to load Python environment.";
    console.error(err);
    return;
  }

  // ✅ تحميل الدروس
  async function loadLessons() {
    try {
      const res = await fetch(LESSONS_PATH);
      if (!res.ok) throw new Error(`Could not load ${LESSONS_PATH}`);
      const lessons = await res.json();
      displayLessons(lessons);
    } catch (err) {
      console.error("Error: Could not fetch lessons", err);
      output.textContent = "❌ Could not load lessons.";
    }
  }

  // ✅ عرض الدروس في القائمة
  function displayLessons(lessons) {
    lessonList.innerHTML = "";
    lessons.forEach((lesson, i) => {
      const btn = document.createElement("button");
      btn.className =
        "block w-full text-left px-4 py-2 bg-gray-800 text-white hover:bg-blue-600 rounded-lg mb-2 transition";
      btn.textContent = `${i + 1}. ${lesson.title}`;
      btn.onclick = () => loadLesson(lesson);
      lessonList.appendChild(btn);
    });
  }

  // ✅ عند اختيار درس
  async function loadLesson(lesson) {
    editor.value = lesson.code || "# Write your Python code here";
    resultBox.textContent = lesson.description || "No description available.";
  }

  // ✅ تشغيل الكود في المحرر
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

  // ✅ تشغيل التحميل
  await loadLessons();
});
