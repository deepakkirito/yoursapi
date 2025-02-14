import { FormControl, FormLabel, TextField } from "@mui/material";

const CustomInput = ({
  children,
  formLabel,
  formfullwidth = true,
  formError,
  formRequired,
  formClassName,
  type = "text",
  formSX = {}, 
  autoComplete, 
  name,
  ...props
}) => {
  return (
    <FormControl
      required={formRequired}
      fullWidth={formfullwidth}
      error={formError}
      className={formClassName}
      sx={{
        ...formSX,
      }}
    >
      {/* Label for better association */}
      <FormLabel htmlFor={name} className="mb-1">
        {formLabel}
      </FormLabel>

      {/* ✅ Pass autoComplete inside both TextField and inputProps */}
      <TextField
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputProps={{ autoComplete }} // Ensures browser picks it up
        {...props}
      />

      {children}
    </FormControl>
  );
};

export default CustomInput;
