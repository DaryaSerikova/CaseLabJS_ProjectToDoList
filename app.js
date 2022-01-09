const todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
const form = document.querySelector('form');


let todos = [];
let users = [];

document.addEventListener('DOMContentLoaded', initApp);
form.addEventListener('submit', handlerSubmit);

function getUserName(userId){
    const user = users.find(u => u.id === userId);
    return user.name;
}

function printTodo({userId, id, title, completed}) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.dataset.id = id;
    if (completed) {
        li.innerHTML = `<span class="liText strikethroughText"> ${title} <i>by</i> <b>${getUserName(userId)}<b> </span>`;
    } else {
        li.innerHTML = `<span class="liText"> ${title} <i>by</i> <b>${getUserName(userId)}<b> </span>`;
    }


    const status = document.createElement('input');
    status.type = 'checkbox';
    status.checked = completed;
    status.addEventListener('change', handlerCheckboxChange)

    const close = document.createElement('span');
    close.innerHTML = '&times;';
    close.className = 'close';
    close.addEventListener('click', handleClose);

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


        todos.forEach((todo) => printTodo(todo));
        users.forEach((user) => createUserOption(user));
    })
}

function removeTodo(todoId) {
    todos = todos.filter( todo => todo.id !== todoId);

    const todo = todoList.querySelector(`[data-id="${todoId}"]`);
    todo.querySelector('input').removeEventListener('change', handlerCheckboxChange);
    todo.querySelector('.close').removeEventListener('click', handleClose);

    todo.remove();
}

function alertError(error) {
    alert(error.message);
}



function handlerSubmit(event) {
    event.preventDefault(); //иначе форма попробует отправиться синхронно с перезагрузкой страницы, приложение работать не будет
    createTodo({
        userId : Number(form.user.value),
        title : form.todo.value,
        completed : false
    });

}

function handlerCheckboxChange() {
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;
    console.log(completed);

    toggleTodoCompeted(todoId, completed);

    if(completed) {////////////////////////////////////////////////////////////////////
        this.nextElementSibling.classList.add('strikethroughText');
    } else {
        this.nextElementSibling.classList.remove('strikethroughText');
    }
}

function handleClose() {
    const todoId = this.parentElement.dataset.id;
    // console.log(todoId);
    deleteTodo(todoId);
}


async function getAllTodos() {
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=25');
        const data = await response.json();
    
        return data;
    } catch(error) {
        alertError(error);
    }

}

async function getAllUsers() {
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
    
        return data;
    } catch(error) {
        alertError(error);
    }

}

async function createTodo(todo) {
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
            method: 'POST',
            body: JSON.stringify(todo),
            headers : {
                'Content-Type' : 'application/json',
            },
        });
    
        const newTodo = await response.json();
        console.log(newTodo);
    
        printTodo(newTodo);
    } catch(error) {
        alertError(error);
    }

}

async function toggleTodoCompeted(todoId, completed) {
    try{
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'PATCH',
            body: JSON.stringify({completed: completed}),
            headers : {
                'Content-Type' : 'application/json',
            },
        });
    
        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            alert('Sorry, error with connecting...');
        }
    } catch(error) {
        alertError(error);
    }

}

async function deleteTodo(todoId) {
    try{
        const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`, {
            method: 'DELETE',
            headers : {
                'Content-Type' : 'application/json',
            },
        });
        const data = await response.json();
        //console.log(data);
        if(response.ok) {
            removeTodo(todoId);
        } else {
            alert('Sorry, error with connecting...');
        }
    } catch(error) {
        alertError(error);
    }

}