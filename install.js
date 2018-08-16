export default {
  createSubscriptions: (connection, ...subscriptions) => {
    connection
      .once('connected', endPoint => {
        console.log(`Connected to eventstore at ${endPoint.host}:${endPoint.port}`);

        subscriptions.forEach(subscription => {
          subscription.create(connection);
        });
      })

      .on('error', error => {
        console.error(`Error occurred on connection: ${error}`);
        process.exit(1);
      })

      .on("closed", reason => {
        console.warn(`Connection closed, reason: ${reason}`);
        process.exit(1);
      })
    ;

    return connection.connect();
  }
};
