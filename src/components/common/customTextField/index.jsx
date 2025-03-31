import { FormControl, FormLabel, TextField, Tooltip } from "@mui/material";
import TooltipCustom from "../tooltip";
import { InfoOutlined } from "@mui/icons-material";

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
  tooltip = "",
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
      <div className="flex gap-2 items-center mb-2">
        <FormLabel htmlFor={name}>{formLabel}</FormLabel>
        {tooltip && (
          <TooltipCustom title={tooltip}>
            <InfoOutlined fontSize="small" className="mt-[0.1rem]" />
          </TooltipCustom>
        )}
      </div>

      {/* ✅ Pass autoComplete inside both TextField and inputProps */}
      <TextField
        id={name}
        name={name}
        type={type}
        // value={props.value || ""}
        autoComplete={autoComplete}
        sx={{
          ...props.sx,
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
