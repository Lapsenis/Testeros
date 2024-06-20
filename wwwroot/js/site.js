let allTasks = [];
let page = 1;
const limit = 5;
let taskChartByPriority, taskChartByStatus;

function debounce(func, delay = 200) {
    let timeoutId;
    return function () {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(func, delay);
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    initializeCharts();
    fetchAndRenderAllTasksAndCharts();
});

window.addEventListener('scroll', debounce(() => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadMoreTasks();
    }
}));

async function fetchTasks() {
    try {
        const response = await fetch(`api/Tasks?page=${page}&limit=${limit}`);
        const tasksData = await response.json();

        if (tasksData.length !== 0)
            page++;

        return tasksData;
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }
}

async function fetchAndRenderAllTasksAndCharts() {
    try {
        allTasks = [];
        page = 1;
        cleanTaskTable();

        let allTasksLoaded = false;
        while (!allTasksLoaded) {
            const tasksData = await fetchTasks();
            if (tasksData.length === 0 || isOutOfWindow()) {
                allTasksLoaded = true;
            }
            storeAndRenderTasks(tasksData);
        }
    } catch (error) {
        console.error('Error fetching and rendering tasks:', error);
    }
}

function isOutOfWindow() {
    return window.innerHeight <= document.body.offsetHeight;
}


async function loadMoreTasks() {
    const taskData = await fetchTasks();

    if (taskData.length !== 0) {
        storeAndRenderTasks(taskData);
    }
}

function storeAndRenderTasks(tasksData) {
    allTasks = allTasks.concat(tasksData);
    renderAllWithFilter();
}

function getTaskTableElement() {
    return document.getElementById('taskTableBody');
}

function cleanTaskTable() {
    const tableBody = getTaskTableElement();
    tableBody.innerHTML = '';
}

async function renderTasks(tasks) {
    const tableBody = getTaskTableElement();
    cleanTaskTable();

    tasks.forEach(task => {
        const row = document.createElement('tr');

        const idCell = document.createElement('td');
        idCell.textContent = task.id;
        row.appendChild(idCell);

        const titleCell = document.createElement('td');
        titleCell.textContent = task.title;
        row.appendChild(titleCell);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = task.description;
        row.appendChild(descriptionCell);

        const priorityCell = document.createElement('td');
        priorityCell.textContent = task.priority;
        row.appendChild(priorityCell);

        const statusCell = document.createElement('td');
        statusCell.textContent = task.status;
        row.appendChild(statusCell);

        const dueCell = document.createElement('td');
        dueCell.textContent = new Date(task.due).toLocaleString();
        row.appendChild(dueCell);

        const actionCell = document.createElement('td');
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const editButton = document.createElement('button');
        editButton.classList.add('button');
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => openModal(task.id));
        buttonContainer.appendChild(editButton);

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('button', 'delete');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        buttonContainer.appendChild(deleteButton);

        actionCell.appendChild(buttonContainer);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}


function renderAllWithFilter() {
    const priorityFilter = document.getElementById('priorityFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredTasks = allTasks.filter(task => {
        return (priorityFilter === '' || task.priority === priorityFilter) &&
            (statusFilter === '' || task.status === statusFilter);
    });

    renderTasks(filteredTasks);
    updateCharts(filteredTasks);
}

// Function to open the modal for creating or editing a task
function openModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const modalTitle = document.getElementById('modalTitle');
    const submitBtn = document.getElementById('submitBtn');

    if (taskId) {
        const taskToEdit = allTasks.find(task => task.id === taskId);
        if (taskToEdit) {
            document.getElementById('taskId').value = taskToEdit.id;
            document.getElementById('title').value = taskToEdit.title;
            document.getElementById('description').value = taskToEdit.description;
            document.getElementById('due').value = taskToEdit.due;
            document.getElementById('priority').value = taskToEdit.priority;
            document.getElementById('status').value = taskToEdit.status;

            modalTitle.textContent = 'Edit Task';
            submitBtn.textContent = 'Update Task';
        }
    } else {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        modalTitle.textContent = 'Create New Task';
        submitBtn.textContent = 'Create Task';
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
}

document.getElementById('taskForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const taskId = document.getElementById('taskId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const due = document.getElementById('due').value;
    const priority = document.getElementById('priority').value;
    const status = document.getElementById('status').value;

    if (priority === 'High' && !confirm('Are you sure you want to set this task to High priority?')) {
        return;
    }

    try {
        if (taskId) {
            await fetch(`api/Tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, title, description,due, priority, status })
            });
        } else {
            await fetch('api/Tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, due, priority, status })
            });
        }

        closeModal();

        fetchAndRenderAllTasksAndCharts();
    } catch (error) {
        console.error('Error saving task:', error);
    }
});

async function deleteTask(taskId) {
    try {
        await fetch(`api/Tasks/${taskId}`, {
            method: 'DELETE'
        });

        tasks = allTasks.filter(task => task.id !== taskId);
        fetchAndRenderAllTasksAndCharts();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

function initializeCharts() {
    const ctxPriority = document.getElementById('taskChartByPriority').getContext('2d');
    taskChartByPriority = new Chart(ctxPriority, {
        type: 'pie',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Tasks by Priority',
                data: [0, 0, 0],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tasks by Priority'
                }
            }
        }
    });

    const ctxStatus = document.getElementById('taskChartByStatus').getContext('2d');
    taskChartByStatus = new Chart(ctxStatus, {
        type: 'pie',
        data: {
            labels: ['Pending', 'InProgress', 'Completed', 'Archived'],
            datasets: [{
                label: 'Tasks by Status',
                data: [0, 0, 0, 0],
                backgroundColor: ['#ff6384', '#36a2eb', '#4bc0c0', '#ffcd56']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Tasks by Status'
                }
            }
        }
    });
}

function updateCharts(tasks) {
    const priorityCounts = { 'High': 0, 'Medium': 0, 'Low': 0 };
    const statusCounts = { 'Pending': 0, 'InProgress': 0, 'Completed': 0, 'Archived': 0 };

    tasks.forEach(task => {
        priorityCounts[task.priority]++;
        statusCounts[task.status]++;
    });

    taskChartByPriority.data.datasets[0].data = [
        priorityCounts['High'],
        priorityCounts['Medium'],
        priorityCounts['Low']
    ];
    taskChartByPriority.update();

    taskChartByStatus.data.datasets[0].data = [
        statusCounts['Pending'],
        statusCounts['InProgress'],
        statusCounts['Completed'],
        statusCounts['Archived']
    ];
    taskChartByStatus.update();
}