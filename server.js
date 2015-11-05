var lynx = require('./server/lynx-server');

lynx.registerStore('todo', { attributes: { content: String, done: Boolean }, authenticate: ['create', 'remove', 'update', 'fetch'] });
lynx.release();
