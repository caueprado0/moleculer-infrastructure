import { GenericObject, Validator, Errors } from 'moleculer'
import * as Joi from '@hapi/joi'
import Winston from 'winston'

export default class JoiValidator extends Validator {
  protected validator: any
  constructor() {
    super()
    this.validator = require('@hapi/joi')
  }
  compile(schema: GenericObject) {
    return (params: GenericObject) => this.validate(params, schema)
  }
  validate(params: GenericObject, schema: GenericObject): boolean {
    if (Joi.isSchema(schema) === false) {
      return true
    }

    const res = ((schema as unknown) as Joi.Schema).validate(params)
    if (res.error) {
      Winston.loggers.get('default').error(res.error.message, { ...res.error })
      throw new Errors.ValidationError(
        res.error.message,
        res.error.name,
        res.error.details
      )
    }

    return true
  }
}
