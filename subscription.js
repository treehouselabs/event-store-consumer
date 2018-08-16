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
        console.log(`Created subscription ${this.stream}/${this.groupName}`);
        console.log(result);
      })
      .catch(err => {
        if (!err.message.includes('already exists')) {
          return console.error(err);
        }

        console.log(`Subscription already exists: ${this.stream}/${this.groupName}`);
      })
    ;
  }
}
