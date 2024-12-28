import { FormControl, FormLabel, TextField } from "@mui/material";

const CustomInput = ({
  children,
  formLabel,
  formfullwidth = true,
  formError,
  formRequired,
  formClassName,
  type = "text",
  paddingLeft = "0rem",
  ...props
}) => {
  return (
    <FormControl
      required={props.required}
      fullWidth={formfullwidth}
      error={formError}
      className={formClassName}
      sx={{
        "& .MuiInputBase-input": {
          padding: "0.7rem 1rem 0.7rem " + paddingLeft,
        },
      }}
    >
      <FormLabel className="mb-1">{formLabel}</FormLabel>
      <TextField type={type} {...props} />
      {children}
    </FormControl>
  );
};

export default CustomInput;
