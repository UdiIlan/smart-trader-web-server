import nodeConfigModule from 'node-config-module';

// Set process name
process.title = ['smart-trader-ws'];

const defaultConf = { serverPort : 3001 };
nodeConfigModule.init(defaultConf, null, ()=>{});
const conf = nodeConfigModule.getConfig();

import server from 'server';

server.start(conf);