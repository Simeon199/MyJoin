function generateTaskHTML(id, variableClass, storyCategory, title, taskDescription, contactsHTML, category, oppositeCategory) {
    return `
      <div class="task" 
           draggable="true" 
           ondragstart="startDragging(${id})" 
           ondragend="checkIfEmpty('${category}', '${oppositeCategory}')" 
           ondragover="allowDrop(event)"
           ondrop="moveTo('${category}')"
      >
        <div class='${variableClass}'>${storyCategory}</div>
        <h3 class="task-title">${title}</h3>
        <p class="task-description">${taskDescription}</p>
        <div class="task-bar-container">
          <div class="task-bar">
            <div class="task-bar-content"></div>
          </div>
          <p class="task-bar-text">1/2 Subtasks</p>
        </div>
        <div class="task-contacts-container">
          <div class="task-contacts">
            ${contactsHTML}
          </div>
          <svg
            width="18"
            height="8"
            viewBox="0 0 18 8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.5685 7.16658L1.43151 7.16658C1.18446 7.16658 0.947523 7.06773 0.772832 6.89177C0.598141 6.71581 0.5 6.47716 0.5 6.22831C0.5 5.97947 0.598141 5.74081 0.772832 5.56485C0.947523 5.38889 1.18446 5.29004 1.43151 5.29004L16.5685 5.29004C16.8155 5.29004 17.0525 5.38889 17.2272 5.56485C17.4019 5.74081 17.5 5.97947 17.5 6.22831C17.5 6.47716 17.4019 6.71581 17.2272 6.89177C17.0525 7.06773 16.8155 7.16658 16.5685 7.16658Z"
              fill="#FFA800"
            />
            <path
              d="M16.5685 2.7098L1.43151 2.7098C1.18446 2.7098 0.947523 2.61094 0.772832 2.43498C0.598141 2.25902 0.5 2.02037 0.5 1.77152C0.5 1.52268 0.598141 1.28403 0.772832 1.10807C0.947523 0.932105 1.18446 0.833252 1.43151 0.833252L16.5685 0.833252C16.8155 0.833252 17.0525 0.932105 17.2272 1.10807C17.4019 1.28403 17.5 1.52268 17.5 1.77152C17.5 2.02037 17.4019 2.25902 17.2272 2.43498C17.0525 2.61094 16.8155 2.7098 16.5685 2.7098Z"
              fill="#FFA800"
            />
          </svg>
        </div>
      </div>
      <div id="${oppositeCategory}" class="no-task d-none">
        <p>No tasks in ${category}</p>
      </div>
    `;
  }