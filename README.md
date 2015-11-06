# Lynx

Lynx framework lets users easily handle data in real time. Lynx server's offer Lynx client's access to defined data stores and will emit changes made to the stores back to the clients. Each data store contains an array of objects which can be manipulated with `create`, `update` and `remove` actions. All the actions can be authenticated before being performed.

Start by running `npm install`.

## Set up the Lynx server

```javascript
var lynx = require('./server/lynx-server');

// Register a data store named "todo" and define what kind of objects it stores
lynx.registerStore('todo', { attributes: { content: String, done: Boolean }, authenticate: ['fetch', 'create', 'update', 'remove'] });
// Set a secret for authentication (required if any authentication set!)
lynx.setAuthenticationSecret('lk7IqejFTEqaIep8guBE16Mg5JWpZtHj');
// Start the Lynx server
lynx.release();
```

### Methods

* **registerStore(name, options)**, register a data store which contains objects with given properties
 * **options.attributes**, attributes of the store's items
 * **options.authenticate**, actions to authenticate
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

// Let's fetch all the data from the store (required for connecting to the store!)
todoStore.fetch();

// Let's add some data to the store
todoStore.create({ content: 'Set up the Lynx client', done: false });

// Let's update some data at the store
todoStore.update(todos[0]._id, { done: true });

// Let's remove some data from the store
todoStore.remove(todos[0]._id);
```

### Authentication

Store's actions can require authentication. Authenticated actions can be set while registering a store:

```javascript
// ...
lynx.registerStore('todo', { attributes: { content: String, done: Boolean }, authenticate: ['fetch', 'create', 'update', 'remove'] });
// Don't forget the secret!
lynx.setAuthenticationSecret('lk7IqejFTEqaIep8guBE16Mg5JWpZtHj');
```

A new user can be created by calling the `createUser` method of the `LynxClient`:

```javascript
// ...
client.createUser({ username: 'bobcat', password: 'bobcat123' })
 .then(function(data){
  console.log('We have a new user!'); 
 });
```

User will be automatically authenticated after creating a new user.

After user has been created, user can authenticate herself by calling the `authenticate` method:

```javascript
// ...
client.authenticate({ username: 'bobcat', password: 'bobcat123' })
 .then(function(data){
  console.log('Bobcat has been authenticated!'); 
 });
```

To notice unauthorized use of a store, a `onUnAuthorized` callback can be defined:

```javascript
// ...
todoStore.onUnAuthorized(function(){
  console.log('We have a trouble maker over here!');
});
```

Users can unauthenticate themselves by calling the `unauthenticate` method:

```javascript
// ...
client.unauthenticate();
```

## Check out the demo

Start `mongod` and after that the demo server by running `node server` in the folder with the source code. Then install [http-server](https://www.npmjs.com/package/http-server). Run `bower install ` and after that `http-server .` in the folder with the source code.
