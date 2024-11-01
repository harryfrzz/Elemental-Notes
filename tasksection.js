const tasksInput = document.getElementById('tasksInput');
const checkList = document.getElementById('sortable');
const taskAddBtn = document.getElementById('addBtn');
const taskPill = document.getElementById('statusPill');
const taskStatus = document.getElementById('statusName');
const taskEditPill = document.getElementById('taskEditPill');
const taskEditDone = document.getElementById('taskEditDone');
const taskEditCancel = document.getElementById('taskEditCancel');



var uniqueTaskKey = 0;
let statusTimeout, statusDisplayTimeout;

//function for adding task using enter key
document.addEventListener('keydown',event =>{
    if(event.key === 'Enter'){
        addTask();
    }
})

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTaskToDOM(task.id, task.name, task.completed);
        uniqueTaskKey = Math.max(uniqueTaskKey, parseInt(task.id.split('-')[1]));
    });
    updateEmptyView(tasks.length === 0);
}

//Function to Add task
function addTask() {
    const taskName = tasksInput.value.trim();
    if (taskName) {
        uniqueTaskKey++;
        const taskObj = { id: `task-${uniqueTaskKey}`, name: taskName, completed: false };
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(taskObj);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        addTaskToDOM(taskObj.id, taskObj.name, taskObj.completed);
        tasksInput.value = '';
        updateEmptyView(false);
        showtaskPill();
    }

}

//Function for task added pill animation
function showtaskPill() {
    clearTimeout(statusTimeout);
    clearTimeout(statusDisplayTimeout);

    taskPill.style.opacity = '1';
    taskPill.style.display = 'flex';
    taskPill.style.animation = 'dynamicFileStatus 0.3s';
    taskStatus.textContent = 'Task Added';

    statusTimeout = setTimeout(removetaskPill, 1000);
    statusDisplayTimeout = setTimeout(removetaskPillDisplay, 1500);
}

//Function for task edit pill animation
function showTaskEditPill() {
    clearTimeout(statusTimeout);
    clearTimeout(statusDisplayTimeout);

    taskEditPill.style.opacity = '1';
    taskEditPill.style.display = 'flex';
    taskEditPill.style.animation = 'dynamicEditText 0.3s';
}
function removetaskEditPill() {
    taskEditPill.style.animation = 'fade-out 0.5s';
    taskEditPill.style.opacity = '0';
}
function removetaskPill() {
    taskPill.style.animation = 'fade-out 0.5s';
    taskPill.style.opacity = '0';
}
function removetaskPillDisplay() {
    taskPill.style.display = 'none';
}

//Function to add task element to the DOM and localstorage
function addTaskToDOM(taskId, taskName, completed) {
    const li = document.createElement('li');
    li.classList.add('taskItem');
    li.setAttribute('draggable', 'true');
    li.setAttribute('data-task-id', taskId);


    const dragElement = document.createElement('img');
    dragElement.src = 'res/drag.png';
    dragElement.height = '25';
    const dragDiv = document.createElement('div');
    dragDiv.style.display = 'flex';
    dragDiv.style.alignItems = 'center';
    dragDiv.style.gap = '15px';
    const taskNameElement = document.createElement('p');
    taskNameElement.style.fontFamily = 'Poppins, sans-serif';
    taskNameElement.textContent = taskName;
    if (completed) {
        taskNameElement.style.textDecoration = 'line-through';
    }
    dragDiv.appendChild(dragElement);
    dragDiv.appendChild(taskNameElement);

    const toolsDiv = document.createElement('div');
    toolsDiv.id = 'toolsDiv';
    const deleteDiv = document.createElement('div');
    deleteDiv.id = 'deleteDiv';
    const deleteBtn = document.createElement('img');
    deleteBtn.src = 'res/delete-white.png';
    deleteBtn.height = '25';
    deleteBtn.classList.add('deleteBtn');
    deleteBtn.onclick = () => deleteTask(taskId);
    deleteDiv.appendChild(deleteBtn);
    toolsDiv.appendChild(deleteDiv);

    const editDiv = document.createElement('div');
    editDiv.id = 'editDiv';
    const editBtn = document.createElement('img');
    editBtn.classList.add('editBtn');
    editBtn.src = 'res/edit.png';
    editBtn.height = '25';
    editDiv.appendChild(editBtn);
    toolsDiv.appendChild(editDiv);
    editBtn.addEventListener('click',event =>{
        editTask(taskId);
        showTaskEditPill();
    })
    editBtn.onclick = () => editTask(taskId);

    const includeDiv = document.createElement('div');
    includeDiv.style.display = 'flex';
    includeDiv.style.gap = '30px';

    includeDiv.appendChild(toolsDiv);

    li.appendChild(dragDiv);
    li.appendChild(includeDiv);
    checkList.appendChild(li);
    li.addEventListener('dragstart', () => {
        li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        saveTaskOrder();
    });
}

//Function for editing task
function deleteTask(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== taskId);
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
    if (taskElement) {
        taskElement.remove();
    }
    updateEmptyView(tasks.length === 0);
}

function editTask(taskId) {
    const taskElement = document.querySelector(`[data-task-id='${taskId}']`);
    const taskNameElement = taskElement.querySelector('p');
    const taskEditField =  document.getElementById('editTaskText');


    const taskName =  taskNameElement.textContent;
    taskEditField.value = taskName;
    const newTaskName = taskEditField.value;


    if (newTaskName) {
        const isCompleted = taskNameElement.style.textDecoration === 'line-through';
        taskEditDone.onclick =function(){
            const newTaskName = taskEditField.value;
            taskNameElement.textContent = newTaskName;
            removetaskEditPill();
            let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
            const task = tasks.find(task => task.id === taskId);
            if (task) {
                task.name = newTaskName;
                localStorage.setItem('tasks', JSON.stringify(tasks));
            }
        }
        taskEditCancel.onclick = function(){
            removetaskEditPill();
        }
        if (isCompleted) {
            taskNameElement.style.textDecoration = 'line-through';
        } else {
            taskNameElement.style.textDecoration = 'none'; 
        }
        
    }
}
function updateEmptyView(isEmpty) {
    const emptyView = document.getElementById('emptyView');
    emptyView.style.display = isEmpty ? 'flex' : 'none';
}

//Click listener for adding task
checkList.addEventListener('click', (event) => {
    const taskItem = event.target.closest('.taskItem');
    const isToolsDiv = event.target.closest('#toolsDiv'); 
    if (taskItem && !isToolsDiv) { 
        const taskId = taskItem.getAttribute('data-task-id');
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            localStorage.setItem('tasks', JSON.stringify(tasks));

            const taskNameElement = taskItem.querySelector('p');
            if (task.completed) {
                taskNameElement.style.textDecoration = 'line-through';
            } else {
                taskNameElement.style.textDecoration = 'none';
            }
        }
    }
});


// Drag and Drop functionality for tasks
checkList.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(checkList, e.clientY);
    const draggingElement = document.querySelector('.dragging');
    if (afterElement == null) {
        checkList.appendChild(draggingElement);
    } else {
        checkList.insertBefore(draggingElement, afterElement);
    }
});

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.taskItem:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

//Saving tasks Order in localstorage
function saveTaskOrder() {
    const taskItems = [...checkList.children];
    const tasks = taskItems.map(taskItem => {
        const taskId = taskItem.getAttribute('data-task-id');
        const taskName = taskItem.querySelector('p').textContent;
        const completed = taskItem.querySelector('p').style.textDecoration === 'line-through';
        return { id: taskId, name: taskName, completed };
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

//Delete button listener for tasks
checkList.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteBtn')) {
        const targetDelBtn = event.target.id;
        deleteTask(targetDelBtn);
    }
});

//To see if input is provided in the task field
taskAddBtn.addEventListener('click', (event) => {
    if(tasksInput.value.trim() === ''){
        console.error('No Input');
    }else{
        addTask();
    }
});
loadTasks();



