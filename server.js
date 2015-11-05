var lynx = require('./server/lynx-server');

lynx.registerStore('todo', { content: String, done: Boolean });
lynx.release();
