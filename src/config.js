import { createConnection, UserCredentials } from "node-eventstore-client";

export default class {
  constructor (host, tcpPort, httpPort, user, pass) {
    this.credentials = new UserCredentials(user, pass);
    this.tcpConnection = createConnection(
      {
        defaultUserCredentials: this.credentials
      },
      `tcp://${host}:${tcpPort}`
    );
    this.httpConnection = `http://${host}:${httpPort}`;
  }
}
