module.exports.Consumer = class {
  constructor(subscription, eventAppeared, subscriptionDropped = null, bufferSize = 10, autoAck = false) {
    if (!subscriptionDropped) {
      subscriptionDropped = (subscription, reason, error) => {
        log.error(`Subscription dropped: ${reason}`);
        if (error) {
          log.error(error);
        }
        process.exit(1);
      };
    }

    this.subscription = subscription;
    this.eventAppeared = eventAppeared;
    this.subscriptionDropped = subscriptionDropped;
    this.bufferSize = bufferSize;
    this.autoAck = autoAck;
  }

  start(connection) {
    connection
      .connectToPersistentSubscription(
        this.subscription.stream,
        this.subscription.groupName,
        this.eventAppeared,
        this.subscriptionDropped,
        null,
        this.bufferSize,
        this.autoAck
      )
      .then(subscription => {
        process.on('SIGINT', () => {
          subscription.stop();
          connection.close();
          process.exit(0);
        });
      })
      .catch(err => {
        log.error(`Error connecting to subscription: ${err}`);
        process.exit(1);
      })
    ;
  }
};

module.exports.createListener = (mapping, resolve, reject) => {
  const PersistentSubscriptionNakEventAction = require('node-eventstore-client/src/persistentSubscriptionNakEventAction');

  return (subscription, resolved) => {
    const event = resolved.event;
    const type = event.eventType;

    if (!mapping.hasOwnProperty(type)) {
      const err = `Unmapped event type ${type}`;
      log.warn(err);

      return subscription.fail(resolved, PersistentSubscriptionNakEventAction.Park, err);
    }

    mapping[type](event)
      .then(() => {
        log.debug(`Processed ${type} => ${event.eventStreamId}/${event.eventNumber.toNumber()}`);
        resolve(subscription, resolved);
      })
      .catch(err => {
        reject(subscription, resolved, err);
      })
    ;
  };
};
