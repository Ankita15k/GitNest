import { EventEmitter } from 'events';

class GitNestEventEmitter extends EventEmitter {}

const eventEmitter = new GitNestEventEmitter();

// Limit to prevent memory leaks if many subscribers are attached, but 20 is more than enough.
eventEmitter.setMaxListeners(20);

export default eventEmitter;
