import { check } from "express-validator";

export const validateProjectName = [
  check("projectName")
    .exists()
    .withMessage(`Project name is required`)
    .trim()
    .isString()
    .withMessage(`Project name should be a string`)
    .custom((value) => !/\s/.test(value))
    .withMessage(`No spaces are allowed in the project name`)
    .isAlphanumeric()
    .withMessage(`Only letters, numbers are allowed`)
    .custom((value) => isNaN(value))
    .withMessage(`It should contain alphabets`)
    .isLength({
      min: 2,
      max: 20,
    })
    .withMessage(`Project name should be between 2 and 20 characters`)
    .toLowerCase(),
];
