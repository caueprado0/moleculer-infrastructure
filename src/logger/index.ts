import {
  LoggerConfig as MoleculerLoggerConfig,
  LogLevelConfig as MoleculerLogLevelConfig,
} from 'moleculer'
import * as Winston from 'winston'
import Moment from 'moment'

const LoggerConfig = {
  type: 'Winston',
  options: {
    winston: {
      transports: [
        new Winston.transports.Console({
          format: Winston.format.combine(
            Winston.format.colorize(),
            Winston.format.prettyPrint(),
            Winston.format.timestamp(),
            Winston.format.align(),
            Winston.format.printf(
              (info) =>
                `${Moment(info.timestamp)
                  .utcOffset('America/Sao_Paulo')
                  .format('DD/MM/YYYY HH:mm:ss')} [${info.level}]: ${
                  info.message
                }. Metadata: ${JSON.stringify(info)}`
            )
          ),
        }),
      ],
    },
  },
} as MoleculerLoggerConfig

const LogLevelConfig = {
  TRANSIT:
    process.env.LOG_LEVEL_TRANSIT ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL ||
    'warn',
  TRANSPORTER:
    process.env.LOG_LEVEL_TRANSPORTER ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL ||
    'warn',
  BROKER:
    process.env.LOG_LEVEL_BROKER ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL ||
    'warn',
  $NODE:
    process.env.LOG_LEVEL_$NODE ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL ||
    'warn',
  REGISTRY:
    process.env.LOG_LEVEL_REGISTRY ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL_SERVICES ||
    process.env.LOG_LEVEL ||
    'warn',
  '**': process.env.LOG_LEVEL || 'info',
} as MoleculerLogLevelConfig

export { LoggerConfig, LogLevelConfig }
