const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  gymName: Joi.string().required(),
  phone: Joi.string().allow('', null),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const memberSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  gender: Joi.string().valid('male', 'female', 'other'),
  goal: Joi.string().valid('weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness'),
  fitnessLevel: Joi.string().valid('beginner', 'intermediate', 'advanced'),
});

module.exports = { registerSchema, loginSchema, memberSchema };