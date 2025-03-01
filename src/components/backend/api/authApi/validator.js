import { check } from "express-validator";

export const validateAuthApi = [
  check("name")
    .exists()
    .withMessage("Api name is required")
    .trim()
    .isString()
    .withMessage("Api name should be a string")
    .custom((value) => !/\s/.test(value))
    .withMessage("No spaces are allowed in the api name")
    .isAlphanumeric()
    .withMessage("Only letters, numbers are allowed")
    .custom((value) => isNaN(value))
    .withMessage("It should contain alphabets")
    .isLength({
      min: 2,
      max: 20,
    })
    .withMessage("Api name should be between 2 to 20 characters")
    .toLowerCase(),
];
