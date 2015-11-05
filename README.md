# Lynx

Lynx framework allows users to easily handle data in real time. Lynx server's offer Lynx client's access to defined data stores and will emit changes made to the stores back to the clients. Each data store contains an array of objects which can be manipulated with `create`, `update` and `remove` methods. 

Start by running `npm install`.

## Set up the Lynx server

```javascript
var lynx = require('./server/lynx-server');

// Register a data store named "todo" and define what kind of objects it stores
lynx.registerStore('todo', { content: String, done: Boolean });
// Start the Lynx server
lynx.release();
```

### Methods

* **registerStore(name, itemAttributes)**, register a data store which contains objects with given properties
* **release(options)**, start the Lynx server
  * **options.port** (number), port to listen to (default: 8080)
  * **options.mongo** (string), MongoDB URI (default: "mongodb://localhost/lynx")
  
## Set up the Lynx client

```javascript
var LynxClient = require('./client/lynx-client');

// Connect Lynx client to the server
var client = new LynxClient({ host: 'localhost', port: '8080' });
// Get a link to a data store
var todoStore = client.getStore('todo');
var todos = [];

// Add a change listener to the todo store
todoStore.onChange(function(){
  console.log('Todo store has changed!');
  var todos = todoStore.getAll();
  console.log(todos);
});

todoStore.onRemove(function(event, itemId){
  console.log('Item with id ' + itemId + ' was removed!');
});

todoStore.onCreate(function(event, item){
  console.log('New item has been added to the store!');
  console.log(item);
});

todoStore.onUpdate(function(event, target){
  console.log('Item with id ' + target.itemId + ' has been updated!');
  console.log(target.attributes);
});

// Let's add some data to the store
todoStore.create({ content: 'Set up the Lynx client', done: false });

// Let's update some data at the store
todoStore.update(todos[0]._id, { done: true });

// Let's remove some data from the store
todoStore.remove(todos[0]._id);
```

## Check out the demo

Install (http-server)[https://www.npmjs.com/package/http-server]. Run `http-server .` in the folder with the source code.
