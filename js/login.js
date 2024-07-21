/**
 * Manages the login process. Validates the user's email and password.
 * 
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} - Redirects to the summary page if login is successful, otherwise throws an error.
 */

async function loginFunction(event) {
  event.preventDefault();
  let loginEmail = document.getElementById("loginEmail").value;
  let loginPassword = document.getElementById("loginPassword").value;
  let remember = document.getElementById("remember").checked;
  let response = await loadData((path = "/users"));
  for (let key in response) {
    let user = response[key];
    if (user["email"] && user["password"]) {
      if (loginEmail == user["email"] && loginPassword == user["password"]) {
        saveLoggedInStatus(user["name"], user["email"], remember);
        window.location.href = "summary.html";
        return;
      }
    }
  }
  throwLoginError();
}

/**
 * This function clears the input fields, highlights them in red and throws an error message. This function is executed in the case of a failed login attempt.
 * 
 * no function parameters are passed
 * @returns {void} no value is returned.
 */

function throwLoginError() {
  let loginPasswordInput = document.getElementById("loginPasswordInputField");
  let loginInput = document.getElementById("loginInput");
  let loginPassword = document.getElementById("loginPassword");
  loginPassword.value = "";
  loginPasswordInput.style.border = "1px solid red";
  let existingNotification = document.querySelector(".notification.error");
  if (existingNotification) {
    existingNotification.remove();
  }
  let notification = document.createElement("div");
  notification.classList.add("notification", "error");
  notification.innerHTML = `<p>Ups! Wrong Password or Email. Try again.</p>`;
  loginInput.appendChild(notification);
}

/**
 * Manages the sign-up process through validating user input, creating a user object, and sending it to the server in the case of a successfull validation.
 *
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} - validates the input, creates a user, and sends the user data to the server. Further execution of the code is stopped in the case of a failed resgitration.
 */

async function signUp(event) {
  showBoardLoadScreen();
  event.preventDefault();
  let name = document.getElementById("name").value;
  let email = document.getElementById("loginEmail").value;
  let password = document.getElementById("loginPassword").value;
  let passwordRepeat = document.getElementById("loginPasswordRepeat").value;
  let privacyPolicity = document.getElementById("privacyPolicity");
  let signUpValid = await checkSignInRequirements(name, email, password, passwordRepeat, privacyPolicity);
  if (!signUpValid) {
    hideBoardLoadScreen();
    return;
  }
  let user = buildUserFunction(name, email, password);
  await createUserAndShowPopup((path = "/users"), user);
  hideBoardLoadScreen();
}

/**
 * Checks if an error message notification already exists in the sign-up input section. 
 *
 * no function parameters are passed
 * @returns {boolean} True if an error message notification exists, otherwise false.
 */

function proveIfErrorMessageAlreadyExists() {
  let childrenElements = Array.from(document.getElementById("signUpInput").children);
  let messageExists = childrenElements.some((child) => child.classList.contains("notification") && child.classList.contains("error"));
  return messageExists;
}

/**
 * Checks all the the sign-up requirements including password strength, uniqueness of the nickname, password match, and acceptance of privacy policy.
 *
 * @param {string} name - The user's name.
 * @param {string} email - The user's email.
 * @param {string} password - The user's password.
 * @param {string} passwordRepeat - The repeated password for confirmation.
 * @param {HTMLInputElement} privacyPolicity - The checkbox element for the privacy policy agreement.
 * @returns {Promise<boolean>} - Is true if all sign-up requirements are met, otherwise false.
 */

async function checkSignInRequirements(name, email, password, passwordRepeat, privacyPolicity) {
  if (!checkPasswordWhenSignUp(password)) {
    return false;
  }
  if ((await nicknameAlreadyExists(name, email)) == true) {
    return false;
  }
  if (password !== passwordRepeat) {
    throwSignUpError();
    return false;
  }
  if (!privacyPolicity.checked) {
    return false;
  }
  return true;
}

/**
 * This function takes the user data from the server checks if the given nickname or email is already in use. If a match is found, a failed registration attempt is thrown as an error message.
 *
 * @param {string} name - The user's name to check.
 * @param {string} email - The user's email to check.
 * @returns {Promise<boolean>} - Is true if the nickname or email already exists, otherwise false.
 */

async function nicknameAlreadyExists(name, email) {
  let response = await loadData((path = "/users"));
  for (let key in response) {
    let user = response[key];
    let availabelNickname = user["name"];
    let availabelEmail = user["email"];
    if (availabelNickname == name || availabelEmail == email) {
      createReportDueToFailedRegistration();
      return true;
    }
  }
  return false;
}

function removeErrorMessageIfPresent() {
  document.getElementById("signUpPasswordRepeat").style.border = "1px solid #d1d1d1";
  let existingNotification = document.querySelector(".notification");
  if (existingNotification) {
    existingNotification.remove();
  }
}

function removeReportLogin(reportFailedLogin, allErrorMessagesLogin) {
  if (
    document.getElementById(allErrorMessagesLogin).classList.contains("d-none") &&
    document.getElementById(reportFailedLogin).classList.contains("d-none")
  ) {
    document.getElementById(allErrorMessagesLogin).classList.remove("d-none");
    document.getElementById(allErrorMessagesLogin).classList.add("d-flex");
    document.getElementById(reportFailedLogin).classList.remove("d-none");
  } else {
    document.getElementById(allErrorMessagesLogin).classList.remove("d-flex");
    document.getElementById(allErrorMessagesLogin).classList.add("d-none");
    document.getElementById(reportFailedLogin).classList.add("d-none");
  }
}

function createReportDueToFailedRegistration() {
  removeErrorMessageIfPresent();
  let allErrorMessages = document.getElementById("allErrorMessages");
  let reportFailedSignUp = document.getElementById("reportFailedSignUp");
  if (reportFailedSignUp.classList.contains("d-none") && allErrorMessages.classList.contains("d-none")) {
    allErrorMessages.classList.remove("d-none");
    allErrorMessages.classList.add("d-flex");
    reportFailedSignUp.classList.remove("d-none");
  } else {
    allErrorMessages.classList.remove("d-flex");
    allErrorMessages.classList.add("d-none");
    reportFailedSignUp.classList.add("d-none");
  }
}

function removeReport(id) {
  let report = document.getElementById(id);
  let allErrorMessages = document.getElementById("allErrorMessages");
  allErrorMessages.classList.remove("d-flex");
  allErrorMessages.classList.add("d-none");
  report.classList.add("d-none");
}

function throwSignUpError() {
  removeErrorMessageIfPresent();
  let signUpInput = document.getElementById("signUpInput");
  let signUpPasswordRepeat = document.getElementById("signUpPasswordRepeat");
  signUpPasswordRepeat.style.border = "1px solid red";
  let notification = document.createElement("div");
  notification.classList.add("notification");
  notification.innerHTML = `<p>Ups! Your passwords don't match</p>`;
  signUpInput.appendChild(notification);
}

function buildUserFunction(name, email, password) {
  let user = {
    name: name,
    email: email,
    password: password,
  };
  return user;
}

function checkPasswordWhenSignUp(password) {
  let passwordError = checkIfPasswordIsValid(password);
  if (passwordError) {
    return false;
  }
  return true;
}

async function createUserAndShowPopup(path, user) {
  try {
    let responseToJson = await postDataToDatabase(path, user);
    showRegisterPopup();
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
    return responseToJson;
  } catch (error) {
    console.error("Es gab ein Problem bei der Registrierung. Bitte versuchen Sie es später erneut");
  }
}

function checkIfPasswordIsValid(password) {
  let minLength = 6;
  let regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
  if (password.length < minLength) {
    return `Das Passwort muss mindestens ${minLength} Zeichen lang sein.`;
  }
  if (!regex.test(password)) {
    throwSignUpErrorWhenWrongPasswordSyntax();
    return true;
  }
  return null;
}

function throwSignUpErrorWhenWrongPasswordSyntax() {
  removeErrorMessageIfPresent();
  let allErrorMessages = document.getElementById("allErrorMessages");
  let reportFailedSignUp = document.getElementById("reportFailedSignUpWhenWeakPassword");
  if (reportFailedSignUp.classList.contains("d-none") && allErrorMessages.classList.contains("d-none")) {
    allErrorMessages.classList.remove("d-none");
    allErrorMessages.classList.add("d-flex");
    reportFailedSignUp.classList.remove("d-none");
  } else {
    allErrorMessages.classList.remove("d-flex");
    allErrorMessages.classList.add("d-none");
    reportFailedSignUp.classList.add("d-none");
  }
}

function addCheck() {
  let checkboxCheck = document.getElementById("checkbox-check");
  if (!checkboxCheck.classList.contains("d-none")) {
    checkboxCheck.classList.add("d-none");
  } else {
    checkboxCheck.classList.remove("d-none");
  }
}

function guestLogin() {
  sessionStorage.setItem("guestLoginStatus", "true");
  window.location.href = "summary.html";

  localStorage.setItem("firstTime", "true");
}

function goToSignUp() {
  window.location.href = "register.html";
}

function backToLogin() {
  window.location.href = "login.html";
}

function setStorageAttributes() {
  sessionStorage.removeItem("isLoggedIn");
  sessionStorage.removeItem("currentUser");
  sessionStorage.removeItem("guestLoginStatus");
}

function saveLoggedInStatus(name, email, remember) {
  if (remember) {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("currentUser", email);
    localStorage.setItem("userNickname", name);
  } else {
    sessionStorage.setItem("isLoggedIn", "true");
    sessionStorage.setItem("currentUser", email);
    sessionStorage.setItem("userNickname", name);
  }
  return;
}

async function postDataToDatabase(path, data) {
  try {
    let response = await fetch(BASE_URL + path + ".json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error("Network response was not ok: " + response.statusText);
    }
    return await response.json();
  } catch (error) {
    console.error("Es gab ein Problem mit der Registrierung:", error);
    throw error;
  }
}

function showRegisterPopup() {
  let registerPopup = document.getElementById("registerPopup");
  registerPopup.classList.remove("d-none");
}

function showPassword(variable) {
  let passwordContent = document.getElementById(variable);
  let visibilityInputImage = document.getElementById("visibilityInputImage");
  let visibilityInputImageRepeat = document.getElementById("visibilityInputImageRepeat");
  let visibility = document.getElementById("visibility");
  let visibilityRepeat = document.getElementById("visibilityRepeat");
  checkAllCasesForShowPassword(variable, visibilityInputImage, visibilityInputImageRepeat, visibility, visibilityRepeat);
  checkPasswordContentType(passwordContent);
}

function showLoginPassword(variable) {
  let passwordContent = document.getElementById(variable);
  let loginLock = document.getElementById("loginLock");
  let visibility = document.getElementById("visibility");
  let visibilityInputImage = document.getElementById("visibilityInputImage");
  if (visibility.classList.contains("d-none")) {
    visibility.classList.remove("d-none");
    visibilityInputImage.classList.add("d-none");
    loginLock.classList.add("d-none");
  } else if (visibilityInputImage.classList.contains("d-none")) {
    visibility.classList.add("d-none");
    visibilityInputImage.classList.remove("d-none");
  }
  checkPasswordContentType(passwordContent);
}

function loginPasswordFunction(loginPassword, loginLock, visibilityInputImage, visibility) {
  loginPassword.addEventListener("input", function () {
    loginLock.classList.add("d-none");
    if (loginPassword.value.length > 0 && loginPassword.type == "password") {
      visibilityInputImage.classList.remove("d-none");
      visibility.classList.add("d-none");
    } else if (loginPassword.value.length > 0 && loginPassword.type == "text") {
      visibilityInputImage.classList.add("d-none");
      visibility.classList.remove("d-none");
    } else if (loginPassword.value.length == 0) {
      loginLock.classList.remove("d-none");
      visibilityInputImage.classList.add("d-none");
      visibility.classList.add("d-none");
    }
  });
}

function checkAllCasesForShowPassword(variable, visibilityInputImage, visibilityInputImageRepeat, visibility, visibilityRepeat) {
  if (variable == "loginPassword" && visibilityInputImage.classList.contains("d-none")) {
    visibilityInputImage.classList.remove("d-none");
    visibility.classList.add("d-none");
  } else if (variable == "loginPassword" && inputLock.classList.contains("d-none")) {
    visibility.classList.remove("d-none");
    visibilityInputImage.classList.add("d-none");
  } else if (variable == "loginPasswordRepeat" && visibilityInputImageRepeat.classList.contains("d-none")) {
    visibilityInputImageRepeat.classList.remove("d-none");
    visibilityRepeat.classList.add("d-none");
  } else if (variable == "loginPasswordRepeat" && inputLockRepeat.classList.contains("d-none")) {
    visibilityRepeat.classList.remove("d-none");
    visibilityInputImageRepeat.classList.add("d-none");
  }
}

function checkPasswordContentType(passwordContent) {
  if (passwordContent.type == "password") {
    passwordContent.type = "text";
  } else {
    passwordContent.type = "password";
  }
}

// showLoadScreen
function showBoardLoadScreen() {
  console.log("h");
  document.getElementById("board-add_task-load-screen").classList.remove("d-none");
}

function hideBoardLoadScreen() {
  document.getElementById("board-add_task-load-screen").classList.add("d-none");
}
