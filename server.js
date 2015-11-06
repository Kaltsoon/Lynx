var lynx = require('./server/lynx-server');

lynx.registerStore('todo', { attributes: { content: String, done: Boolean }, authenticate: ['create', 'remove', 'update', 'fetch'] });
lynx.setAuthenticationSecret('lk7IqejFTEqaIep8guBE16Mg5JWpZtHj');
lynx.release();
