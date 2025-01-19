import React, { useState } from "react";
import { TextField, Chip, Box } from "@mui/material";

const MultiValueTextField = ({
  label = "Add Values",
  placeholder = "Type and press Enter",
  onChange,
  values = [],
  setValues,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleAddValue = (event) => {
    if (event.key === "Enter" && inputValue.trim()) {
      event.preventDefault();
      const newValues = [...values, inputValue.trim()];
      setValues(newValues);
      onChange && onChange(newValues);
      setInputValue("");
    }
  };

  const handleDeleteValue = (valueToDelete) => {
    const updatedValues = values.filter((value) => value !== valueToDelete);
    setValues(updatedValues);
    onChange && onChange(updatedValues);
  };

  return (
    <Box>
      <TextField
        size="small"
        label={label}
        placeholder={placeholder}
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleAddValue}
        fullWidth
      />
      {values.length > 0 && <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
        {values.map((value, index) => (
          <Chip
            key={index}
            label={value}
            onDelete={() => handleDeleteValue(value)}
          />
        ))}
      </Box>}
    </Box>
  );
};

export default MultiValueTextField;
