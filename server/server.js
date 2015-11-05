var lynx = require('./lynx-server');

lynx.registerStore('todo', { content: String, done: Boolean });
lynx.release();
