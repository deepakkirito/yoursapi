import React from "react";
import { Autocomplete, TextField } from "@mui/material";

const AutocompleteSelect = ({
  options,
  label,
  placeholder,
  value,
  onChange,
  isMultiple = false,
  disabled = false,
  error = false,
  helperText = "",
  ...props
}) => {
  return (
    <Autocomplete
      multiple={isMultiple}
      options={options}
      getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
      value={value}
      onChange={(event, newValue) => onChange(newValue)}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
        />
      )}
      disableClearable={!isMultiple}
      {...props}
    />
  );
};

export default AutocompleteSelect;
