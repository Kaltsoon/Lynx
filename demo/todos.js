var LynxClient = require('../client/lynx-client');
var Handlebars = require('handlebars');

var client = new LynxClient({ host: 'localhost', port: '8080' });
var todoStore = client.getStore('todo');
var todos = [];

todoStore.onChange(function(){
  todos = todoStore.getAll();
  renderTodos();
});

todoStore.onUnAuthorized(function(){
  hideTodos();
  showLogin();
});

showTodos();

todoStore.fetch();

function renderTodos(){
  var todoList = Handlebars.compile(document.getElementById('todo-list-template').innerHTML);
  document.getElementById('todos').innerHTML = todoList({ todos: todos });
}

function show(elem){
  elem.style.display = 'block';
}

function hide(elem){
  elem.style.display = 'none';
}

function showTodos(){
  show(document.getElementById('todos-container'))
}

function hideTodos(){
  hide(document.getElementById('todos-container'))
}

function showLogin(){
  show(document.getElementById('login-container'));
}

function hideLogin(){
  hide(document.getElementById('login-container'));
}

document.getElementById('todos').addEventListener('click', function(e) {
	if(e.target && e.target.className.split(' ').indexOf('remove-todo') >= 0) {
		todoStore.remove(e.target.getAttribute('data-id'));
	}else if(e.target && e.target.className.split(' ').indexOf('toggle-todo') >= 0){
    todoStore.update(e.target.getAttribute('data-id'), { done: e.target.checked });
  }
});

document.getElementById('login-form').addEventListener('submit', function(e){
  e.preventDefault();

  client.authenticate({ username: document.getElementById('login-username').value, password: document.getElementById('login-password').value })
    .then(function(user){
      showTodos();
      hideLogin();

      todoStore.fetch();
    });
});

document.getElementById('logout').addEventListener('click', function(){
  client.unauthenticate();
  hideTodos();
  showLogin();
});

document.getElementById('todo-form').addEventListener('submit', function(e){
  e.preventDefault();

  todoStore.create({ content: document.getElementById('new-todo').value, done: false });

  document.getElementById('new-todo').value = '';
});
