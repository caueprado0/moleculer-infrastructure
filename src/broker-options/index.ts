import { BrokerOptions as MoleculerBrokerOptions } from 'moleculer'
import uuid from 'uuid-random'
import pjson from 'pjson'

import RabbitmqTransporter from '../transporter/rabbitmq'
import { LoggerConfig, LogLevelConfig } from '../logger'
import JoiValidator from '../validator'

const BrokerOptions = {
  nodeID: `${pjson.name}-${uuid()}`,
  namespace: `orchestra-${process.env.NODE_ENV || 'local'}`,
  transporter: RabbitmqTransporter,
  logger: LoggerConfig,
  logLevel: LogLevelConfig,
  validator: new JoiValidator(),
} as MoleculerBrokerOptions

export { BrokerOptions }
export default BrokerOptions
