import { check } from "express-validator";

export const signupValidator = [
  check("username")
    .exists().withMessage("Please send username")
    .isString().withMessage("Username should be a string")
    .isLength({ min: 5, max: 30 }).withMessage("Username should be between 5-30 characters")
    .matches(/^[A-Za-z0-9_]+$/).withMessage("Only letters, numbers, and underscores allowed")
    .custom((value) => !/\s/.test(value)).withMessage("No spaces allowed in the username")
    .trim()
    .toLowerCase(),

  check("firstname")
    .exists().withMessage("Please send first name")
    .isString().withMessage("First name should be a string")
    .isLength({ min: 2, max: 20 }).withMessage("First name should be between 2-20 characters")
    .trim(),

  check("lastname")
    .exists().withMessage("Please send last name")
    .isString().withMessage("Last name should be a string")
    .isLength({ min: 2, max: 20 }).withMessage("Last name should be between 2-20 characters")
    .trim(),

  check("email")
    .exists().withMessage("Please send email")
    .isEmail().withMessage("Incorrect email format")
    .normalizeEmail(),

  check("password")
    .exists().withMessage("Please send password")
    .isStrongPassword().withMessage("Password must contain at least one uppercase, one lowercase, one special character, and one number."),

  check("referralCode")
    .optional()
    .isString().withMessage("Referral code should be a string"),
];

export const loginValidator = [
  check("email")
    .exists().withMessage("Email is required")
    .isString()
    .isEmail().withMessage("Invalid email")
    .toLowerCase(),

  check("password")
    .exists().withMessage("Password is required")
    .isString()
    .isLength({ min: 6, max: 30 }).withMessage("Password must be 6-30 characters long"),

  check("rememberMe")
    .optional()
    .isBoolean().withMessage("RememberMe should be a boolean"),
];

export const resetValidator = [
  check("newPassword")
    .exists().withMessage("New password is required")
    .isString()
    .isStrongPassword().withMessage("Password must be strong")
    .isLength({ min: 8, max: 30 }),
];
