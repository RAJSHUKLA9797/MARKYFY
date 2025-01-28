let drawing = false;
let penEnabled = false;
let currentTool = null;
let toolbarVisible = false;
let textMode = false;

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

// Add text to the canvas
function addTextToCanvas(text, x, y) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.fillText(text, x, y);
}

// Mouse click handler for text tool
function handleMouseClick(e) {
  if (textMode) {
    const input = document.createElement("input");
    input.type = "text";
    input.style.color = "black";
    input.style.position = "absolute";
    input.style.top = `${e.clientY + window.scrollY}px`;
    input.style.left = `${e.clientX}px`;
    input.style.font = "16px Arial";
    input.style.border = "1px solid #ccc";
    input.style.padding = "2px";
    input.style.zIndex = "9999";

    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        addTextToCanvas(input.value, e.clientX, e.clientY + 16); // Add text to canvas
        document.body.removeChild(input); // Remove input box
        saveAnnotations(); // Save annotations
      }
    });

    input.addEventListener("blur", () => {
      if (input.value) {
        addTextToCanvas(input.value, e.clientX, e.clientY + 16); // Add text to canvas
      }
      document.body.removeChild(input); // Remove input box
      saveAnnotations(); // Save annotations
    });

    document.body.appendChild(input);
    input.focus();
  }
}

// Canvas event listeners for drawing tools
function handleMouseDown(e) {
  if (penEnabled && currentTool) {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.clientX, e.clientY + window.scrollY); // Account for page scroll
  }
}

function handleMouseMove(e) {
  if (drawing) {
    ctx.lineTo(e.clientX, e.clientY + window.scrollY); // Account for page scroll

    if (currentTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out"; // Enable erasing
      ctx.lineWidth = getToolWidth("eraser");
    } else {
      ctx.globalCompositeOperation = "source-over"; // Default drawing mode
      ctx.strokeStyle = getToolColor(currentTool);
      ctx.lineWidth = getToolWidth(currentTool);
    }
    ctx.stroke();
  }
}

function handleMouseUp() {
  if (drawing) {
    drawing = false;
    ctx.globalCompositeOperation = "source-over"; // Reset drawing mode
    saveAnnotations();
  }
}

// Attach event listeners
canvas.addEventListener("mousedown", handleMouseDown);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mouseup", handleMouseUp);
document.addEventListener("mousedown", handleMouseClick); // Listen for clicks on the webpage

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
const tools = ["Pen", "Pencil", "Highlighter", "Eraser", "Clear", "Text"];
tools.forEach((tool) => {
  const button = document.createElement("button");
  button.innerText = tool;
  button.style.margin = "5px";
  button.addEventListener("click", () => setActiveTool(tool.toLowerCase()));
  toolbar.appendChild(button);
});

// Append the toolbar to the webpage
document.body.appendChild(toolbar);
toolbar.style.display = toolbarVisible ? "block" : "none";

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

// Function to set the active tool
function setActiveTool(tool) {
  textMode = tool === "text";
  penEnabled = !textMode;

  if (tool === "clear") {
    clearCanvas();
  } else {
    currentTool = tool;
  }

  // Highlight the selected tool button
  const buttons = toolbar.querySelectorAll("button");
  buttons.forEach((button) => {
    if (button.innerText.toLowerCase() === tool) {
      button.style.backgroundColor = "#007bff"; // Highlight color
      button.style.color = "#fff"; // Change text color for better contrast
    } else {
      button.style.backgroundColor = ""; // Reset to default
      button.style.color = ""; // Reset text color
    }
  });
}


// Load annotations when the page loads
window.onload = loadAnnotations;
