import * as Joi from 'joi';

export const validateEnv = (config: Record<string, unknown>) => {
  const schema = Joi.object({
    NODE_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .required()
      .messages({ 'any.only': 'NODE_ENV must be development, production or test' }),

    APP_PORT: Joi.number().default(3000),

    POSTGRES_HOST: Joi.string().required(),
    POSTGRES_PORT: Joi.number().required(),
    POSTGRES_DB: Joi.string().required(),
    POSTGRES_USER: Joi.string().required(),
    POSTGRES_PASSWORD: Joi.string().required(),

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

    SUPER_ADMIN_USERNAME: Joi.string().required(),
    SUPER_ADMIN_PASSWORD: Joi.string().required(),
    SUPER_ADMIN_EMAIL: Joi.string().email().required(),
  });

  const { error, value } = schema.validate(config, { allowUnknown: true });

  if (error) {
    throw new Error(`Config validation error: ${error.message}`);
  }

  return value;
};
