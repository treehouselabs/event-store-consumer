import log from "loglevel";
import { NoopLogger, ProjectionsManager } from 'node-eventstore-client';

export default class Projection {
  constructor (name, query, credentials) {
    this.name = name;
    this.query = query;
    this.credentials = credentials;
  }

  create (httpEndpoint) {
    const manager = new ProjectionsManager(
      new NoopLogger(),
      httpEndpoint,
      1000 // timeout
    );

    return manager
      .listContinuous(this.credentials)
      .then(projections => {
        const exists = projections.find(projection => {
          return projection.name === this.name;
        });

        if (exists) {
          return log.info(`Projection ${this.name} already exists`);
        }

        return manager
          .createContinuous(
            this.name,
            this.query,
            true,
            this.credentials
          )
          .then(log.info(`Projection ${this.name} created`))
        ;
      })
    ;
  }
}
