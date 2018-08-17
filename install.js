import log from "loglevel";

export default {
  createSubscriptions: (connection, ...subscriptions) => {
    connection
      .once('connected', endPoint => {
        log.info(`Connected to eventstore at ${endPoint.host}:${endPoint.port}`);

        subscriptions.forEach(subscription => {
          subscription.create(connection);
        });
      })

      .on('error', error => {
        log.error(`Error occurred on connection: ${error}`);
        process.exit(1);
      })

      .on("closed", reason => {
        log.warn(`Connection closed, reason: ${reason}`);
        process.exit(1);
      })
    ;

    return connection.connect();
  }
};
