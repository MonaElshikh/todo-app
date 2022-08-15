"use strict";
const rootElement = document.documentElement;
const toggleIcon = document.querySelector("header > img");
const toDoApp = document.querySelector(".to-do-app");
const divTasks = document.querySelector(".tasks");
const divInfo = document.querySelector(".info");
const itemsLeftH2 = document.querySelector(".info > h2");
const divActions = document.querySelector(".actions");
const txtAddNewTask = document.querySelector("#txtadd");
const dragParagraph = document.querySelector("p");
const clearCompletedlink = document.querySelector(".info > a");
const actionLinks = Array.from(document.querySelectorAll(".actions > ul > li > a"));
const addTaskBtn = document.querySelector(".add-task");
let tasks = [];
let filtteredTasks = [];
let selectedItem;
class Task {
    constructor(id, task, status) {
        this.id = id;
        this.task = task;
        this.status = status;
    }
}
const themes = {
    light: {
        "--container-bg-color": "hsl(240deg 42% 95%)",
        "--content-bg-color": "hsl(0, 0%, 98%)",
        "--VeryDarkGrayishBlue": "hsl(235, 19%, 35%)",
        "--VeryLightGrayishBlue": "hsl(236, 33%, 92%)",
    },
    dark: {
        "--container-bg-color": "hsl(240,19%,10%)",
        "--content-bg-color": "hsl(235,24%,19%)",
        "--VeryDarkGrayishBlue": "hsl(231,38%,90%)",
        "--VeryLightGrayishBlue": "hsl(236,19%,64%)",
    },
};
function loadDefaults() {
    let preferedTheme = localStorage.getItem("theme");
    if (preferedTheme) {
        toggleIcon.setAttribute("data-theme", preferedTheme);
    }
    else {
        toggleIcon.setAttribute("data-theme", "light");
    }
    setPreferedThem(toggleIcon.dataset.theme);
    if (getTasksFromLocalStorage()) {
        tasks = getTasksFromLocalStorage();
        addTasksToPage(tasks);
        updateTasksInfoBox();
    }
}
function setPreferedThem(themeName) {
    if (themeName == "light") {
        toggleIcon ? (toggleIcon.src = "images/icon-moon.svg") : "";
        toDoApp.classList.remove("dark");
    }
    else {
        toggleIcon.src = "images/icon-sun.svg";
        toDoApp.classList.add("dark");
    }
    rootElement.style.setProperty("--container-bg-color", themes[themeName]["--container-bg-color"]);
    rootElement.style.setProperty("--content-bg-color", themes[themeName]["--content-bg-color"]);
    rootElement.style.setProperty("--VeryDarkGrayishBlue", themes[themeName]["--VeryDarkGrayishBlue"]);
    rootElement.style.setProperty("--VeryLightGrayishBlue", themes[themeName]["--VeryLightGrayishBlue"]);
}
function toggleTheme() {
    toggleIcon.addEventListener("click", () => {
        if (toggleIcon.dataset.theme == "light") {
            toggleIcon.setAttribute("data-theme", "dark");
            toggleIcon.src = "images/icon-sun.svg";
        }
        else {
            toggleIcon.setAttribute("data-theme", "light");
            toggleIcon.src = "images/icon-moon.svg";
        }
        localStorage.setItem("theme", toggleIcon.dataset.theme);
        setPreferedThem(toggleIcon.dataset.theme);
    });
}
function addTasksToLocalStorage(tasks) {
    localStorage.setItem("todo-list", JSON.stringify(tasks));
}
function getTasksFromLocalStorage() {
    let todoList = localStorage.getItem("todo-list")
        ? JSON.parse(localStorage.getItem("todo-list") || "")
        : null;
    return todoList;
}
function addTasksToPage(tasks) {
    divTasks.innerHTML = "";
    tasks.forEach((task) => {
        let taskDiv = document.createElement("div");
        taskDiv.className = "task";
        taskDiv.setAttribute("data-id", task.id);
        taskDiv.setAttribute("draggable", "true");
        taskDiv.style.cursor = "move";
        let checkDiv = document.createElement("div");
        checkDiv.className = "check-box";
        task.status == "completed" ? checkDiv.classList.add("completed") : "";
        let checkInput = document.createElement("input");
        checkInput.setAttribute("type", "checkbox");
        checkInput.className = "check";
        let checkLabel = document.createElement("label");
        checkLabel.setAttribute("for", "task");
        checkLabel.className = "check";
        checkLabel.innerHTML = task.task;
        checkDiv.appendChild(checkInput);
        checkDiv.appendChild(checkLabel);
        let closeSpan = document.createElement("span");
        closeSpan.className = "close";
        let closeImg = document.createElement("img");
        closeImg.src = "images/icon-cross.svg";
        closeImg.alt = "close";
        closeImg.setAttribute("id", "close");
        closeSpan.appendChild(closeImg);
        taskDiv.appendChild(checkDiv);
        taskDiv.appendChild(closeSpan);
        divTasks.appendChild(taskDiv);
    });
    updateTasksInfoBox();
}
function updateTasksInfoBox() {
    if (tasks.length > 0) {
        divTasks.classList.remove("empty");
        divInfo.style.display = "flex";
        divActions.style.display = "block";
        dragParagraph.style.display = "block";
        dragParagraph.style.display = "block";
        itemsLeftH2.innerHTML = `${tasks.filter((task) => task.status == "active").length} items left.`;
    }
    else {
        divTasks.classList.add("empty");
        divInfo.style.display = "none";
        divActions.style.display = "none";
        dragParagraph.style.display = "none";
    }
}
function addTasks() {
    addTaskBtn.addEventListener("click", () => {
        if (txtAddNewTask.value) {
            let task = new Task(Date.now(), txtAddNewTask.value, "active");
            tasks.push(task);
            addTasksToPage(tasks);
            addTasksToLocalStorage(tasks);
            updateTasksInfoBox();
            txtAddNewTask.value = "";
            dragDropTasks("touch");
            dragDropTasks("desktop");
            return true;
        }
        else {
            return false;
        }
    });
}
function updateTask(e) {
    let taskDiv = e.target.className == "check"
        ? e.target.parentElement.parentElement
        : e.target.parentElement;
    tasks.forEach((task) => {
        if (task.id == taskDiv.getAttribute("data-id")) {
            taskDiv.querySelector(".check-box").classList.toggle("completed");
            taskDiv.querySelector(".check-box").classList.contains("completed")
                ? (task.status = "completed")
                : (task.status = "active");
        }
    });
}
function deleteTask(e) {
    let closeBtn = e.target;
    let taskId = e.target.parentElement.parentElement.getAttribute("data-id");
    tasks = tasks.filter((task) => task.id != taskId);
    closeBtn.parentElement.parentElement.remove();
}
function taskDivClickEventHandler() {
    divTasks.addEventListener("click", (e) => {
        if (e.target.id == "close") {
            deleteTask(e);
        }
        else {
            updateTask(e);
        }
        addTasksToLocalStorage(tasks);
        updateTasksInfoBox();
        dragDropTasks("desktop");
    });
}
function taskDivTouchEventHandler() {
    divTasks.addEventListener("touchstart", (e) => {
        if (e.target.id == "close") {
            deleteTask(e);
        }
        else {
            updateTask(e);
        }
        addTasksToLocalStorage(tasks);
        updateTasksInfoBox();
        dragDropTasks("touch");
    });
}
function filterTasks() {
    actionLinks.forEach((action) => {
        action.addEventListener("click", () => {
            actionLinks.forEach((link) => link.classList.remove("active"));
            action.classList.add("active");
            switch (action.innerHTML.toLowerCase()) {
                case "all":
                    filtteredTasks = tasks;
                    break;
                case "active":
                    filtteredTasks = tasks.filter((task) => task.status == "active");
                    break;
                case "completed":
                    filtteredTasks = tasks.filter((task) => task.status == "completed");
                    break;
            }
            addTasksToPage(filtteredTasks);
        });
    });
}
function clearCompleted() {
    clearCompletedlink.addEventListener("click", (e) => {
        e.preventDefault();
        if (tasks != undefined &&
            tasks.length > 0 &&
            tasks.filter((task) => task.status == "completed").length > 0) {
            tasks.forEach((task) => {
                if (task.status == "completed") {
                    task.status = "active";
                }
            });
            addTasksToLocalStorage(tasks);
            addTasksToPage(tasks);
            updateTasksInfoBox();
            return true;
        }
        else {
            return false;
        }
    });
}
function touchStartHandler(event) {
    event.preventDefault();
    selectedItem = event.target;
    selectedItem.classList.add("drag-sort-active");
}
function touchMoveHandler(event) {
    event.preventDefault();
    selectedItem = event.target;
    let list = selectedItem.parentNode;
    let x = event.touches[0].clientX;
    let y = event.touches[0].clientY;
    let swapItem = document.elementFromPoint(x, y) === null
        ? selectedItem
        : document.elementFromPoint(x, y);
    if (list === swapItem.parentNode) {
        swapItem =
            swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
        list.insertBefore(selectedItem, swapItem);
    }
}
function dragHandler(event) {
    event.preventDefault();
    selectedItem = event.target;
    let list = selectedItem.parentNode;
    let x = event.clientX;
    let y = event.clientY;
    selectedItem.classList.add("drag-sort-active");
    let swapItem = document.elementFromPoint(x, y) === null
        ? selectedItem
        : document.elementFromPoint(x, y);
    if (list === swapItem.parentNode) {
        swapItem =
            swapItem !== selectedItem.nextSibling ? swapItem : swapItem.nextSibling;
        list.insertBefore(selectedItem, swapItem);
    }
}
function dropHandler(event) {
    event.preventDefault();
    selectedItem = event.target;
    selectedItem.classList.remove("drag-sort-active");
    reArrangeTasks();
}
function reArrangeTasks() {
    const tasksDivs = Array.from(document.querySelectorAll(".task"));
    let reArrangedTasks = [];
    tasksDivs.forEach((task) => {
        reArrangedTasks.push(new Task(task.dataset.id, task.querySelector(".task > div > label").innerHTML, task.querySelector(".task > div").classList.contains("completed")
            ? "completed"
            : "active"));
    });
    console.log(reArrangedTasks);
    addTasksToLocalStorage(reArrangedTasks);
}
function dragDropTasks(device) {
    const tasksDivs = document.querySelectorAll(".task");
    if (tasksDivs.length > 0) {
        switch (device) {
            case "touch":
                tasksDivs.forEach((task) => {
                    task.ontouchstart = touchStartHandler;
                    task.ontouchmove = touchMoveHandler;
                    task.ontouchend = dropHandler;
                });
                break;
            case "desktop":
                tasksDivs.forEach((task) => {
                    task.ondrag = dragHandler;
                    task.ondragend = dropHandler;
                });
                break;
            default:
                tasksDivs.forEach((task) => {
                    task.ontouchstart = touchStartHandler;
                    task.ontouchmove = touchMoveHandler;
                    task.ontouchend = dropHandler;
                });
                break;
        }
    }
}
loadDefaults();
dragDropTasks("touch");
dragDropTasks("desktop");
taskDivClickEventHandler();
taskDivTouchEventHandler();
toggleTheme();
addTasks();
clearCompleted();
filterTasks();
//# sourceMappingURL=main.js.map