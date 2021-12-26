const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
let todos = [];
let users = [];

document.addEventListener('DOMContentLoaded', initApp);

function getUserName(userId){
    const user = users.find(u => u.id === userId);
    return user.name;
}

function printTodo({userId, id, title, completed}) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    li.innerHTML = `<span> ${title} <i>by</i> <b>${getUserName(userId)}<b> </span>`;

    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';

    li.append(close);
    li.prepend(status);
    todoList.prepend(li);
}

function createUserOption(user) {
    const option = document.createElement('option');
    option.value = user.id; //       на сервер будет уходить id, 
    option.innerHTML = user.name; // а для пользователей выбор будет по имени

    userSelect.append(option);
}

function initApp() {
    Promise.all([getAllTodos(), getAllUsers()]).then (values => {
        [todos, users] = values;
        console.log(todos);
        console.log(users);


        todos.forEach((todo) => printTodo(todo));
        users.forEach((user) => createUserOption(user));
    })
}

async function getAllTodos() {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos');
    const data = await response.json();

    return data;
}

async function getAllUsers() {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await response.json();

    return data;
}