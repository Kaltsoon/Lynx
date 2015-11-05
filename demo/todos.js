var LynxClient = require('../client/lynx-client');
var Handlebars = require('handlebars');

var client = new LynxClient({ host: 'localhost', port: '8080' });
var todoStore = client.getStore('todo');

var todos = [];
var todoList = Handlebars.compile(document.getElementById('todo-list-template').innerHTML);

todoStore.onChange(function(){
  todos = todoStore.getAll();

  document.getElementById('todos').innerHTML = todoList({ todos: todos });
});

document.getElementById('todos').addEventListener('click', function(e) {
	if(e.target && e.target.className.split(' ').indexOf('remove-todo') >= 0) {
		todoStore.remove(e.target.getAttribute('data-id'));
	}else if(e.target && e.target.className.split(' ').indexOf('toggle-todo') >= 0){
    todoStore.update(e.target.getAttribute('data-id'), { done: e.target.checked });
  }
});

document.getElementById('todo-form').addEventListener('submit', function(e){
  e.preventDefault();

  todoStore.create({ content: document.getElementById('new-todo').value, done: false });

  document.getElementById('new-todo').value = '';
});
