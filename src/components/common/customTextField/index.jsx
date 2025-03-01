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
  paddingLeft,
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
        sx={{
          ...props.sx,
          paddingLeft: paddingLeft || "0.5rem",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "divider",
          },
        }}
        {...props}
      />

      {children}
    </FormControl>
  );
};

export default CustomInput;
