let drawing = false;
let penEnabled = false;
let currentTool = "pen";
let toolbarVisible = true;

// Create the canvas and context
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
canvas.style.zIndex = "9998";
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d");

// Function to get tool color
function getToolColor(tool) {
  switch (tool) {
    case "pen":
      return "black";
    case "pencil":
      return "gray";
    case "highlighter":
      return "yellow";
    case "eraser":
      return "white";
    default:
      return "black";
  }
}

// Function to get tool width
function getToolWidth(tool) {
  switch (tool) {
    case "pen":
      return 2;
    case "pencil":
      return 1;
    case "highlighter":
      return 5;
    case "eraser":
      return 10;
    default:
      return 2;
  }
}

// Clear the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.removeItem("annotations");
}

// Redefine canvas event listeners to ensure proper removal
function handleMouseDown(e) {
  if (penEnabled && currentTool !== "clear") {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY + window.scrollY); // Account for page scroll
  }
}

function handleMouseMove(e) {
  if (drawing) {
    ctx.lineTo(e.clientX, e.clientY + window.scrollY); // Account for page scroll
    ctx.strokeStyle = getToolColor(currentTool);
    ctx.lineWidth = getToolWidth(currentTool);
    ctx.stroke();
  }
}

function handleMouseUp() {
  drawing = false;
  saveAnnotations();
}

// Attach event listeners to the canvas
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);

// Function to save annotations
function saveAnnotations() {
  const dataURL = canvas.toDataURL();
  localStorage.setItem("annotations", dataURL);
}

// Function to load annotations
function loadAnnotations() {
  const dataURL = localStorage.getItem("annotations");
  if (dataURL) {
    const img = new Image();
    img.src = dataURL;
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
  }
}

// Create the floating toolbar
const toolbar = document.createElement("div");
toolbar.id = "annotation-toolbar";
toolbar.style.position = "fixed";
toolbar.style.top = "10px";
toolbar.style.left = "10px";
toolbar.style.zIndex = "9999";
toolbar.style.background = "#fff";
toolbar.style.border = "1px solid #ccc";
toolbar.style.padding = "10px";
toolbar.style.borderRadius = "5px";
toolbar.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";

// Add tool buttons
const tools = ["Pen", "Pencil", "Highlighter", "Eraser", "Clear"];
tools.forEach((tool) => {
  const button = document.createElement("button");
  button.innerText = tool;
  button.style.margin = "5px";
  button.addEventListener("click", () => setActiveTool(tool.toLowerCase()));
  toolbar.appendChild(button);
});

// Add toggle pen button
const togglePenButton = document.createElement("button");
togglePenButton.innerText = "Toggle Pen";
togglePenButton.style.margin = "5px";
togglePenButton.addEventListener("click", togglePen);
toolbar.appendChild(togglePenButton);

// // Add load webpage button
// const loadWebpageButton = document.createElement("button");
// loadWebpageButton.innerText = "Load Webpage";
// loadWebpageButton.style.margin = "5px";
// toolbar.appendChild(loadWebpageButton);

// Append the toolbar to the webpage
document.body.appendChild(toolbar);

// Add a button to toggle the toolbar visibility
const toggleToolbarButton = document.createElement("button");
toggleToolbarButton.innerText = "Toggle Toolbar";
toggleToolbarButton.style.position = "fixed";
toggleToolbarButton.style.top = "10px";
toggleToolbarButton.style.right = "10px";
toggleToolbarButton.style.zIndex = "10000";
toggleToolbarButton.addEventListener("click", toggleToolbar);
document.body.appendChild(toggleToolbarButton);

// Function to toggle the toolbar visibility
function toggleToolbar() {
  toolbarVisible = !toolbarVisible;
  toolbar.style.display = toolbarVisible ? "block" : "none";
}

// Function to toggle the pen
function togglePen() {
  penEnabled = !penEnabled;
  canvas.style.pointerEvents = penEnabled ? "auto" : "none";
  alert(`Pen is now ${penEnabled ? "enabled" : "disabled"}`);
}

// Function to set the active tool
function setActiveTool(tool) {
  currentTool = tool;
  if (tool === "clear") {
    clearCanvas();
  }
}

// Load annotations when the page loads
window.onload = loadAnnotations;