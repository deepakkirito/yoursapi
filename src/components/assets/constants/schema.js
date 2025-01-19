const choiceOptions = [
  {
    label: "True",
    value: "true",
  },
  {
    label: "False",
    value: "false",
  },
];

export const schemaOptions = [
  {
    label: "Type",
    value: "type", // Specifies the data type of the field
    type: "select",
    description: "Specifies the data type of the field",
    default: "String",
    options: [
      {
        label: "String",
        value: "String",
      },
      {
        label: "Number",
        value: "Number",
      },
      {
        label: "Boolean",
        value: "Boolean",
      },
      {
        label: "Array",
        value: "Array",
      },
      {
        label: "ObjectId", //used for referencing other documents
        value: "ObjectId",
      },
      {
        label: "Date",
        value: "Date",
      },
      {
        label: "Buffer",
        value: "Buffer",
      },
      {
        label: "Mixed", //a flexible data type for any value
        value: "Mixed",
      },
      {
        label: "Map", //for storing key-value pairs
        value: "Map",
      },
    ],
  },
  {
    label: "Default",
    value: "default", // Sets the default value for the field
    type: "text",
    description: "Sets the default value for the field",
    default: "",
  },
  {
    label: "Required",
    value: "required", // Marks the field as mandatory
    type: "select",
    options: choiceOptions,
    description: "Marks the field as mandatory",
    default: "false",
  },
  {
    label: "Min",
    value: "min", // Specifies the minimum value for numbers
    type: "number",
    description: "Specifies the minimum value for numbers",
    default: "",
  },
  {
    label: "Max",
    value: "max", // Specifies the maximum value for numbers
    type: "number",
    description: "Specifies the maximum value for numbers",
    default: "",
  },
  {
    label: "Unique",
    value: "unique", // Ensures unique values in the field
    type: "select",
    options: choiceOptions,
    description: "Ensures unique values in the field",
    default: "false",
  },
  {
    label: "Enum",
    value: "enum", // Specifies a list of valid values for the field
    type: "text",
    description: "Specifies a list of valid values for the field",
    default: [],
  },
  {
    label: "Description",
    value: "description", // Optional: Additional metadata for the field
    type: "text",
    description: "Optional: Additional metadata for the field",
    default: "",
  },
  // {
  //   label: "Validate",
  //   value: "validate", // Custom validation function for the field
  //   type: "text",
  //   description: "Custom validation function for the field",
  //   default: "",
  // },
  {
    label: "Index",
    value: "index", // Creates an index on the field
    type: "select",
    options: choiceOptions,
    description: "Creates an index on the field",
    default: "false",
  },
  {
    label: "Immutable",
    value: "immutable", // Prevents the field from being changed after creation
    type: "select",
    options: choiceOptions,
    description: "Prevents the field from being changed after creation",
    default: "false",
  },
  {
    label: "Trim",
    value: "trim", // Trims whitespace for strings
    type: "select",
    options: choiceOptions,
    description: "Trims whitespace for strings",
    default: "false",
  },
  {
    label: "Match",
    value: "match", // Specifies a regular expression to validate strings
    type: "text",
    description: "Specifies a regular expression to validate strings",
    default: "",
  },
  {
    label: "Sparse",
    value: "sparse", // Ensures unique fields can have null values
    type: "select",
    options: choiceOptions,
    description: "Ensures unique fields can have null values",
    default: "false",
  },
  {
    label: "Lowercase",
    value: "lowercase", // Converts strings to lowercase
    type: "select",
    options: choiceOptions,
    description: "Converts strings to lowercase",
    default: "false",
  },
  {
    label: "Uppercase",
    value: "uppercase", // Converts strings to uppercase
    type: "select",
    options: choiceOptions,
    description: "Converts strings to uppercase",
    default: "false",
  },
  // {
  //   label: "Set",
  //   value: "set", // Custom function to transform field values
  //   type: "text",
  //   description: "Custom function to transform field values",
  //   default: "",
  // },
  // {
  //   label: "Get",
  //   value: "get", // Custom function to transform field values when retrieved
  //   type: "text",
  //   description: "Custom function to transform field values when retrieved",
  //   default: "",
  // },
  {
    label: "Select",
    value: "select", // Includes or excludes the field in queries
    type: "select",
    options: choiceOptions,
    description: "Includes or excludes the field in queries",
    default: "true",
  },
  {
    label: "Alias",
    value: "alias", // Defines an alternate name for the field
    type: "text",
    description: "Defines an alternate name for the field",
    default: "",
  },
];
