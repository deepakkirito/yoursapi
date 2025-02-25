import { check } from "express-validator";

export const updateUserValidator = [
  check("username")
    .optional()
    .trim()
    .isString()
    .withMessage("Username should be a string")
    .isLength({ min: 5, max: 30 })
    .withMessage("Username should be between 5 to 30 characters")
    .matches(/^[A-Za-z0-9]+$/)
    .withMessage("Username can only contain letters, numbers"),

  check("name")
    .optional()
    .isString()
    .withMessage("Name should be a string")
    .isLength({ min: 2, max: 40 })
    .withMessage("Name should be between 2 to 40 characters"),

  check("newPassword")
    .optional()
    .isLength({ min: 8, max: 30 })
    .withMessage("Password must be between 8 to 30 characters")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least one special character and one number"
    ),
];
