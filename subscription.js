import log from "loglevel";
import { PersistentSubscriptionSettings, SystemConsumerStrategies } from 'node-eventstore-client';

export default class Subscription {
  constructor (stream, groupName, settings = null) {
    if (!settings) {
      settings = PersistentSubscriptionSettings.create();
      settings.resolveLinkTos = true;
      settings.startFrom = 0;
      settings.namedConsumerStrategy = SystemConsumerStrategies.Pinned;
    }

    this.stream = stream;
    this.groupName = groupName;
    this.settings = settings;
  }

  create(connection) {
    return connection
      .createPersistentSubscription(
        this.stream,
        this.groupName,
        this.settings
      )
      .then(result => {
        log.info(`Created subscription ${this.stream}/${this.groupName}`);
        log.info(result);
      })
      .catch(err => {
        if (!err.message.includes('already exists')) {
          return log.error(err);
        }

        log.info(`Subscription already exists: ${this.stream}/${this.groupName}`);
      })
    ;
  }
}
