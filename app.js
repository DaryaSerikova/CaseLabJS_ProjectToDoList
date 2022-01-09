let todoList = document.getElementById('todo-list');
const userSelect = document.getElementById('user-todo');
const form = document.querySelector('form');
const buttonDeleteAllTodo = document.getElementById('deleteAllTodo');


let todos = [];
let users = [];
// let idForSubmit = 201;
// let idFlag = 0;

document.addEventListener('DOMContentLoaded', initApp);
form.addEventListener('submit', handlerSubmit);
buttonDeleteAllTodo.addEventListener('click', hundleDeleteAll);

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

    console.log(`${todoId} элемент удален`);
    todo.remove();
    //ВАЖНОЕ ЗАМЕЧАНИЕ! placeholder всегда при создании возвращает новый id=11 при POST, 
    //поэтому все новые элементы списка имеют одинаковый id => удаление происходит некорректно,
    //т.к. удалеяется только один 11ый элемент, а остальные остаются в списке
}

function alertError(error) {
    alert(error.message);
}




function handlerSubmit(event) {
    event.preventDefault(); //иначе форма попробует отправиться синхронно с перезагрузкой страницы, приложение работать не будет
    console.log(`form.todo.value = ${form.todo.value} title`); //обращаемся по name
    console.log(`form.user.value = ${form.user.value} userId`); // тут тоже

    console.log(idForSubmit);
    createTodo({
        userId : Number(form.user.value),
        // id : idForSubmit,////////////////////////////////////////////////////////////////////////////////
        title : form.todo.value,
        completed : false
    });
    // idForSubmit++;//////////////////////////////////////////////////////////////////////////////////
}

function handlerCheckboxChange() {
    const todoId = this.parentElement.dataset.id;
    const completed = this.checked;
    console.log(`${todoId} элемент изменил статус, завершен:${completed}`);

    toggleTodoCompeted(todoId, completed);

    if(completed) {
        this.nextElementSibling.classList.add('strikethroughText');
    } else {
        this.nextElementSibling.classList.remove('strikethroughText');
    }
}

function handleClose() {
    const todoId = this.parentElement.dataset.id;

    deleteTodo(todoId);
}

function hundleDeleteAll() {
    let elements = document.querySelectorAll('.strikethroughText');

    elements.forEach(elem => {
        const todoId = elem.parentElement.dataset.id;

        deleteTodo(todoId);
    })

}



async function getAllTodos() {
    try{
        const response = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=50');
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
        // console.log(data);
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
        // console.log(data);
        if(response.ok) {
            removeTodo(todoId);
        }
    } catch(error) {
        alertError(error);
    }
}