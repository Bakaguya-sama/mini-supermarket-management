/**
 * jest global setup – runs before every test file
 * Mocks Redis so integration tests don't need a live Redis server
 */

// Mock the ioredis module with a no-op client so redis.js never opens a TCP socket
jest.mock('ioredis', () => {
  const EventEmitter = require('events');

  class RedisMock extends EventEmitter {
    constructor() { super(); }
    get()         { return Promise.resolve(null); }
    set()         { return Promise.resolve('OK'); }
    setex()       { return Promise.resolve('OK'); }
    del()         { return Promise.resolve(1); }
    keys()        { return Promise.resolve([]); }
    expire()      { return Promise.resolve(1); }
    ping()        { return Promise.resolve('PONG'); }
    quit()        { return Promise.resolve('OK'); }
    disconnect()  { return Promise.resolve(); }
  }

  return RedisMock;
});
