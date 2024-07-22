let assignetTo = document.getElementById("assignetTo");
let category = document.getElementById("category");
let priority;
let subArray = [];
let assignedContacts = [];
let standardContainer = "to-do-container";

/**
 * Initializes add-task variables and functions when the website loads.
 */
async function init() {
  changePriority(medium);
  getAllContacts();
  tasksId = await loadTaskIdFromFirebase();
}

/**
 * Upload TasksID to Database
 * 
 * @param {number} taskId 
 */
async function saveTaskIdToFirebase(taskId) {
  await upload("taskId", taskId);
}

/**
 * 
 * @returns 
 */
async function loadTaskIdFromFirebase() {
  let response = await loadRelevantData("taskId");
  if (response !== null && response !== undefined) {
    return response;
  }
  return 0;
}

/**
 * Marks the current Position in the Sidebar
 */
function taskMarker() {
  document.getElementById("addTask").classList.add("currentSection");
}

/**
 * add backroundcolor of the priority Buttons
 * 
 * @param {string} id 
 */
function changePriority(id) {
  removeBackground(id);
  if (id == urgent) {
    urgent.classList.add("backgroundUrgent");
    priority = "urgent";
  }
  if (id == medium) {
    medium.classList.add("backgroundMedium");
    priority = "medium";
  }
  if (id == low) {
    low.classList.add("backgroundLow");
    priority = "low";
  }
}

/**
 * add backroundcolor of the current id and remove it from all others
 * 
 * @param {string} id 
 */
function removeBackground(id) {
  if (id == urgent) {
    medium.classList.remove("backgroundMedium");
    low.classList.remove("backgroundLow");
  }
  if (id == medium) {
    urgent.classList.remove("backgroundUrgent");
    low.classList.remove("backgroundLow");
  }
  if (id == low) {
    urgent.classList.remove("backgroundUrgent");
    medium.classList.remove("backgroundMedium");
  }
}

/**
 * initializes functions to create and save Task
 * 
 * @param {string} side is used to initializes some funktion for special sides
 */
async function createTask(side) {
  await ensureAllTasksExists();
  await saveTask();
  if (side == "addTask") {
    startAnimation();
  }
  if (side != "addTask") {
    hideAddTaskPopUp();
    updateHTML();
  }
  clearTask();
}

/**
 * clear the add Task page and set the standart values
 */
function clearTask() {
  let inputTitle = document.getElementById("inputTitle");
  let inputDescription = document.getElementById("inputDescription");
  let date = document.getElementById("date");
  inputTitle.value = "";
  inputDescription.value = "";
  clearAssignedTo();
  date.value = "";
  category = changeCategory("Select task category");
  clearSubtask();
  changePriority(medium);
  hideRequiredText();
}

/**
 * show the DropDown for the category field
 */
function showDropDownCategory() {
  document.getElementById("categoryDropDown").classList.remove("d-none");
  document.getElementById("arrowb").classList.add("rotate");
  document.getElementById("categoryDropDown").innerHTML = /*html*/ `
            <div onclick="hideDropDownCategory(); changeCategory('Technical Task')"><span>Technical Task</span></div>
            <div onclick="hideDropDownCategory(); changeCategory('User Story')"><span>User Story</span></div>
  `;
}

/**
 * hide the DropDown
 */
function hideDropDownCategory() {
  document.getElementById("categoryDropDown").classList.add("d-none");
  document.getElementById("arrowb").classList.remove("rotate");
}

/**
 * change the text in Category
 * 
 * @param {string} text 
 */
function changeCategory(text) {
  document.getElementById("categoryText").innerHTML = `${text}`;
}

/**
 * check if the catetgory is not the default value
 * 
 * @returns ture or false
 */
function checkCategory() {
  let select = document.getElementById("categoryText").textContent;
  let standart = "Select task category";
  if (select == standart) {
    return false;
  } else {
    return true;
  }
}

/**
 * check if the required Fields are filled
 * 
 * @param {string} side 
 */
async function checkRequiredFields(side) {
  let title = document.getElementById("inputTitle").value;
  let date = document.getElementById("date").value;

  if (title.length <= 1) {
    document.getElementById("requiredTitle").classList.remove("d-none");
  }

  if (date.length <= 1) {
    document.getElementById("requiredDate").classList.remove("d-none");
  }

  if (checkCategory() == false) {
    document.getElementById("requiredCatergory").classList.remove("d-none");
  }

  if (checkDate() === false) {
    document.getElementById("requiredDate").classList.remove("d-none");
    document.getElementById("requiredDate").innerHTML = "Lorem I";
  }

  if (title.length <= 1 || date.length <= 1 || checkCategory() == false || checkDate() === false) {
    // showRequiredText();
  } else {
    showBoardLoadScreen();
    document.getElementById("requiredDate").classList.add("d-none");
    document.getElementById("requiredTitle").classList.add("d-none");
    document.getElementById("requiredCatergory").classList.add("d-none");
    await createTask(side);
    hideBoardLoadScreen();
  }
}

/**
 * show the container with the text message
 */
function showRequiredText() {
  let ids = ["requiredTitle", "requiredDate", "requiredCatergory"];
  ids.forEach(function (id) {
    let element = document.getElementById(id);
    element.classList.remove("d-none");
  });
}

/**
 * hide the container with the text message
 */
function hideRequiredText() {
  let ids = ["requiredTitle", "requiredDate", "requiredCatergory"];
  ids.forEach(function (id) {
    let element = document.getElementById(id);
    element.classList.add("d-none");
  });
}

/**
 * Uploading to the Database
 * 
 * @param {string} path 
 * @param {json} data 
 * @returns
 */
async function upload(path = "", data) {
  let response = await fetch(BASE_URL + path + ".json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return (responseToJson = await response.json());
}

/**
 * check if the folder exists if not it would be added
 */
async function ensureAllTasksExists() {
  let response = await loadRelevantData();
  if (!response || !response.hasOwnProperty("testRealTasks")) {
    await upload("testRealTasks", []);
  }
}

/**
 * 
 */
async function saveTask() {
  let newTask = createNewTask();
  tasksId++;
  tasks.push(newTask);
  console.log(tasks);
  console.log(newTask);
  await saveTaskIdToFirebase(tasksId);
  await uploadToAllTasks(newTask);
  updateCategories();
}

function createNewTask() {
  return {
    title: getInputValue("inputTitle"),
    description: getInputValue("inputDescription"),
    assigned: assignedContacts,
    date: getInputValue("date"),
    priority: priority,
    category: document.getElementById("categoryText").textContent,
    subtask: subArray,
    container: standardContainer,
    tasksIdentity: tasksId,
  };
}

function getInputValue(elementId) {
  return document.getElementById(elementId).value;
}

async function uploadToAllTasks(task) {
  try {
    let response = await loadRelevantData();
    let allTasks = response["testRealTasks"];
    if (!Array.isArray(allTasks)) {
      allTasks = [];
    }
    allTasks.push(task);
    await upload("testRealTasks", allTasks);
  } catch (error) {
    console.error("Fehler in uploadToAllTasks:", error);
  }
}

/**
 * check if the FropDown is open or closed
 * 
 * @param {*} id 
 */
function checkDropDown(id) {
  rot = document.getElementById(id);
  if (rot.classList.contains("rotate")) {
    if (id == "arrowa") {
      hideDropDownAssignedTo();
    } else {
      hideDropDownCategory();
    }
  } else {
    if (id == "arrowa") {
      showDropDownAssignedTo();
    } else {
      showDropDownCategory();
    }
  }
}


/**
 * 
 */
function hideAllAddTaskPopups() {
  hideDropDownAssignedTo();
  hideDropDownCategory();
  changeToInputfield();
  plus = document.getElementById("plusSymbole");
  subtask = document.getElementById("subtaskInputButtons");
  plus.classList.remove("d-none");
  subtask.classList.add("d-none");
}

async function loadRelevantData(path = "") {
  let response = await fetch(BASE_URL + path + ".json");
  let responseAsJson = await response.json();
  return responseAsJson;
}

async function deleteTask(taskId) {
  showBoardLoadScreen();
  tasks = tasks.filter((task) => task.tasksIdentity !== taskId);
  for (let i = taskId; i < tasks.length; i++) {
    tasks[i].tasksIdentity = i;
  }
  await upload("testRealTasks", tasks);
  // saveTasksToLocalStorage();
  tasksId = tasks.length;
  await saveTaskIdToFirebase(tasksId);
  updateCategories();
  updateHTML();
  hideBoardLoadScreen();
}

function startAnimation() {
  scrollTo(0, 0);
  document.getElementById("addedAnimation").classList.remove("d-none");
  document.getElementById("addedAnimation").classList.add("erase-in");
  document.getElementById("addTaskBody").classList.add("overflow-hidden");
  setTimeout(goToBoard, 1500);
}

function goToBoard() {
  window.location.href = "board.html";
}

function checkDate() {
  animation = document.getElementById("dateAnimation");
  let dateInput = document.getElementById("date");
  const dateString = dateInput.value;
  const dateObject = new Date(dateString);
  const millisecondsSinceEpoch = dateObject.getTime();
  const addDate = new Date();
  if (dateString.length >= 9) {
    if (millisecondsSinceEpoch < addDate) {
      animation.classList.remove("d-none");
      setTimeout(() => animation.classList.add("d-none"), 3000);
      dateInput.value = "";
      return false;
    } else {
      return true;
    }
  } else {
    return null;
  }
}
