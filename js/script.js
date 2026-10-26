const STORAGE_KEY = "todoTasks";
const MIN_LENGTH = 2;
const MAX_LENGTH = 100;

const todoForm = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskError = document.getElementById("taskError");
const taskList = document.getElementById("taskList");
const taskCounter = document.getElementById("taskCounter");
const emptyMessage = document.getElementById("emptyMessage");
const filterButtons = document.querySelectorAll(".filter-button");

// In-memory list of tasks, where each task: {id, text, completed}
let tasks = [];
let currentFilter = "all";

// -------- Storage helper --------
function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === null) {
        tasks = [];
        return;
    }

    try {
        tasks = JSON.parse(saved);
    } catch (error) {
        tasks = [];
    }
}


function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// -------- Rendering --------
function render() {
    // Clear current list
    taskList.textContent = "";

    const visibleTasks = tasks.filter(function (task) {
        if (currentFilter === "active") {
            return !task.completed;
        }
        if (currentFilter === "completed") {
            return task.completed;
        }
        return true;
    });

    visibleTasks.forEach(function (task) {
        taskList.append(createTaskElement(task));
    });

    // Show message when the visible list is empty
    if (visibleTasks.length === 0) {
        emptyMessage.classList.add("visible");
        if (tasks.length === 0) {
            emptyMessage.textContent = "No tasks yet.";
        } else {
            emptyMessage.textContent = "No tasks match this filter.";
        }
    } else {
        emptyMessage.classList.remove("visible");
    }

    updateCounter();
}


function createTaskElement(task) {
    const item = document.createElement("li");
    item.className = "task-item";
    item.dataset.id = task.id;

    if (task.completed) {
        item.classList.add("completed");
    }

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark \"" + task.text + "\" as completed");

    checkbox.addEventListener("change", function() {
        toggleTask(task.id);
    });

    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-button";
    removeButton.textContent = "Remove";
    removeButton.setAttribute("aria-label", "Remove \"" + task.text + "\"");

    removeButton.addEventListener("click", function () {
        removeTask(task.id);
    });

    item.append(checkbox, text, removeButton);

    return item;
}


function updateCounter() {
    const openCount = tasks.filter(function (task) {
        return !task.completed;
    }).length;

    taskCounter.textContent = openCount + (openCount === 1 ? " open task" : " open tasks");
}

// -------- Task action --------
function addTask(text) {
    const newTask = {
        id: Date.now().toString(),
        text: text,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    render();
}


function toggleTask(id) {
    const task = tasks.find(function (item) {
        return item.id === id;
    });

    if (!task) {
        return;
    }

    task.completed = !task.completed;
    saveTasks();
    render();

    // Launch confetti when task becomes completted
    if (task.completed) {
        launchConfetti();
    }
}


// -------- Confetti experiment --------
const CONFETTI_COLORS = ["#2f6f5e", "#e9b44c", "#e5634d", "#4a90c2", "#9b6bb5", "#7bc47f"];
const CONFETTI_COUNT = 60;
 
function launchConfetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";
    container.setAttribute("aria-hidden", "true");
 
    for (let i = 0; i < CONFETTI_COUNT; i++) {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
 
        // Randomise position, colour, size, speed and delay for each piece
        piece.style.left = Math.random() * 100 + "%";
        piece.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        piece.style.width = 6 + Math.random() * 6 + "px";
        piece.style.height = 8 + Math.random() * 8 + "px";
        piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
        piece.style.animationDelay = Math.random() * 0.5 + "s";
        piece.style.setProperty("--drift", (Math.random() * 160 - 80) + "px");
        piece.style.setProperty("--spin", (360 + Math.random() * 720) + "deg");
 
        container.append(piece);
    }
 
    document.body.append(container);
 
    // Remove the container once all pieces have finished falling
    setTimeout(function () {
        container.remove();
    }, 4500);
}


function removeTask(id) {
    tasks = tasks.filter(function (item) {
        return item.id !== id;
    });

    saveTasks();
    render();
}


// -------- Validation --------
function clearError() {
    taskError.textContent = "";
    taskInput.classList.remove("invalid");
}


function showError(message) {
    taskError.textContent = message;
    taskInput.classList.add("invalid");
}


function validateTask(text) {
    if (text === "") {
        return "Please enter tasks.";
    }

    if (text.length < MIN_LENGTH) {
        return "Task must be at least " + MIN_LENGTH + " characters.";
    }

    if (text.length > MAX_LENGTH) {
        return "Task must be " + MAX_LENGTH + " characters or fewer.";
    }

    return null;
}


// -------- Event listeners --------
todoForm.addEventListener("submit", function(event) {
    event.preventDefault();

    clearError();

    const text = taskInput.value.trim();
    const errorMessage = validateTask(text);

    if (errorMessage) {
        showError(errorMessage);
        return;
    }

    addTask(text);
    todoForm.reset();
    taskInput.focus();
});

// Clear the error as soon as the field becomes valid again
taskInput.addEventListener("input", function() {
    if (taskInput.classList.contains("invalid") && validateTask(taskInput.value.trim()) === null) {
        clearError();
    }
});

// Handler for task-sorting buttons
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        filterButtons.forEach(function(otherButton) {
            otherButton.classList.remove("active");
        });

        button.classList.add("active");
        currentFilter = button.dataset.filter;
        render();
    });
});


// -------- Startup --------
loadTasks();
render();