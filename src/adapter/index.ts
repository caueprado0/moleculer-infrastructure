import {
  ServiceSchema as MoleculerServiceSchema,
  ServiceActionsSchema as MoleculerServiceActionsSchema,
  ServiceAction as MoleculerServiceAction,
  Context as MoleculerContext,
  ActionParams as MoleculerActionParams,
} from 'moleculer'
import MongooseAdapter from 'moleculer-db-adapter-mongoose'
import { ConnectionOptions, Types, Model } from 'mongoose'
import * as Joi from '@hapi/joi'
import Boom from '@hapi/boom'
import pickBy from 'lodash.pickby'
import objectHas from 'lodash.has'

const MongooseMoleculer = ({
  name: 'mongoose-moleculer',
  settings: {
    uris: process.env.MONGODB_URL
      ? process.env.MONGODB_URL
      : `mongodb://${process.env.MONGODB_HOST || 'mongodb'}:${
          process.env.MONGODB_PORT || 27017
        }/${process.env.MONGODB_DATABASE || 'octopus'}`,
    options: pickBy(
      {
        user: process.env.MONGODB_USERNAME || null,
        pass: process.env.MONGODB_PASSWORD || null,
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      },
      null
    ) as ConnectionOptions,
    get adapter() {
      return new MongooseAdapter(this.uris, this.options)
    },
  },
  actions: {
    convertObjectId: {
      name: 'convert-object-id',
      params: (Joi.object({}).unknown(
        true
      ) as unknown) as MoleculerActionParams,
      handler: async (
        ctx: MoleculerContext
      ): Promise<{ [key: string]: any } | null> => {
        const params = ctx.params as { [key: string]: any }
        for (const [key, value] of Object.entries(params)) {
          const keyFields = key.split('.')
          const lastFieldIsId =
            keyFields.length > 0 && keyFields[keyFields.length - 1] === '_id'
          if (lastFieldIsId) {
            params[key] = new Types.ObjectId(String(value))
          }
        }
        return params
      },
    },
    findOne: {
      name: 'find-one',
      params: (Joi.object({}).unknown(
        true
      ) as unknown) as MoleculerActionParams,
      handler: async (
        ctx: MoleculerContext
      ): Promise<{ [key: string]: any } | null> => {
        const service = ctx.broker.getLocalService(ctx.service.name)
        Joi.assert(
          service,
          Joi.object({
            adapter: Joi.object({
              model: Joi.any().required(),
            }).unknown(true),
          }).unknown(true),
          Boom.badImplementation('Não foi possível obter o model.')
        )
        const model = service.adapter.model as Model<any>
        const conditions = (await ctx.broker.call(
          `${ctx.service.name}.convert-object-id`,
          ctx.params
        )) as { [key: string]: any }

        const result = ((await model
          .findOne(conditions)
          .sort({
            updatedAt: -1,
            createdAt: -1,
          })
          .lean(true)) as unknown) as {
          [key: string]: any
        } | null

        ctx.service.logger.info(
          `A action ${ctx.action.name} do serviço ${ctx.service.name} foi executada com sucesso.`,
          {
            __dirname,
            __filename,
            result: {
              _id: objectHas(result, '_id') ? String(result._id) : null,
            },
          }
        )
        return result
      },
    },
    findOneAndSort: {
      name: 'find-one-and-sort',
      params: (Joi.object({
        conditions: Joi.object().unknown(true).required(),
        sort: Joi.object().unknown(true).optional(),
      }).unknown(false) as unknown) as MoleculerActionParams,
      handler: async (
        ctx: MoleculerContext
      ): Promise<{ [key: string]: any } | null> => {
        const service = ctx.broker.getLocalService(ctx.service.name)
        Joi.assert(
          service,
          Joi.object({
            adapter: Joi.object({
              model: Joi.any().required(),
            }).unknown(true),
          }).unknown(true),
          Boom.badImplementation('Não foi possível obter o model.')
        )
        const model = service.adapter.model as Model<any>
        const params = ctx.params as {
          conditions: { [key: string]: any }
          sort: { [key: string]: any }
        }

        const conditions = (await ctx.broker.call(
          `${ctx.service.name}.convert-object-id`,
          params.conditions
        )) as { [key: string]: any }

        const sort =
          Object.entries(params.sort).length > 0
            ? params.sort
            : {
                updatedAt: -1,
              }

        const result = ((await model
          .findOne(conditions)
          .sort(sort)
          .lean(true)) as unknown) as {
          [key: string]: any
        } | null

        ctx.service.logger.info(
          `A action ${ctx.action.name} do serviço ${ctx.service.name} foi executada com sucesso.`,
          {
            __dirname,
            __filename,
            result: {
              _id: objectHas(result, '_id') ? String(result._id) : null,
            },
          }
        )
        return result
      },
    },
    findOneAndUpdate: {
      name: 'find-one-and-update',
      params: (Joi.object({
        conditions: Joi.object().unknown(true).required(),
        update: Joi.object().unknown(true).required(),
        options: Joi.object({
          upsert: Joi.boolean(),
          setDefaultsOnInsert: Joi.boolean(),
          new: Joi.boolean(),
        })
          .unknown(false)
          .optional(),
      }).unknown(false) as unknown) as MoleculerActionParams,
      handler: async (
        ctx: MoleculerContext
      ): Promise<{ [key: string]: any } | null> => {
        const service = ctx.broker.getLocalService(ctx.service.name)
        Joi.assert(
          service,
          Joi.object({
            adapter: Joi.object({
              model: Joi.any().required(),
            }).unknown(true),
          }).unknown(true),
          Boom.badImplementation('Não foi possível obter o model.')
        )
        const model = service.adapter.model as Model<any>
        const { conditions, update, options = {} } = ctx.params as {
          conditions: { [key: string]: any }
          update: { [key: string]: any }
          options?: { [key: string]: any }
        }
        const conditionsFieldsUpdated = (await ctx.broker.call(
          `${ctx.service.name}.convert-object-id`,
          {
            ...conditions,
          }
        )) as { [key: string]: any }

        const result = ((await model
          .findOneAndUpdate(
            {
              ...conditionsFieldsUpdated,
            },
            {
              ...update,
            },
            {
              setDefaultsOnInsert: true,
              upsert: true,
              ...options,
            }
          )
          .lean(true)) as unknown) as {
          _id: string
          [key: string]: any
        } | null

        Joi.assert(
          result,
          Joi.object({
            _id: Joi.any().required(),
          }).unknown(true),
          Boom.badImplementation(`Falha ao criar/atualizar os dados.`, {
            conditions: {
              ...conditionsFieldsUpdated,
            },
            update: {
              ...update,
            },
            options: {
              setDefaultsOnInsert: true,
              upsert: true,
              ...options,
            },
          })
        )

        ctx.service.logger.info(
          `A action ${ctx.action.name} do serviço ${ctx.service.name} foi executada com sucesso.`,
          {
            __dirname,
            __filename,
            result: {
              _id: objectHas(result, '_id') ? String(result._id) : null,
            },
          }
        )
        ctx.emit(`${ctx.service.name}.update`, {
          ...result,
        })
        return (await ctx.broker.call(`${ctx.service.name}.find-one`, {
          _id: String(result._id),
        })) as {
          [key: string]: any
        } | null
      },
    },
  } as MoleculerServiceActionsSchema,
} as unknown) as MoleculerServiceSchema & {
  settings: {
    uris: string
    options: ConnectionOptions
    adapter: any
  }
}

export type Actions = {
  findOne: MoleculerServiceAction
}

export { MongooseMoleculer }
export default MongooseMoleculer
module.exports = MongooseMoleculer
