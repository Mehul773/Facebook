const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const handleFriendSchema = Joi.object({
  handleFriendRequest: Joi.string().valid("accept", "reject"),
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
      console.log(`From validation...\n${error}`);
      return res.status(400).json({ error: error.details[0].message });
    }
    if (value) {
      next();
    }
  };
};

module.exports = { validate, registerSchema, loginSchema, handleFriendSchema };
