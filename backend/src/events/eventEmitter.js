import { EventEmitter } from 'events';

class GitNestEventEmitter extends EventEmitter {}

const eventEmitter = new GitNestEventEmitter();

eventEmitter.setMaxListeners(50);

export default eventEmitter;
