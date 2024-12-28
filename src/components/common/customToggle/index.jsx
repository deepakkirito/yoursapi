import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

const CustomToggle = ({ options, value, handleChange = () => {} }) => {
  const [selected, setSelected] = useState(value);

  return (
    <ToggleButtonGroup
      value={selected}
      exclusive
      onChange={(event, newValue) => {
        setSelected(newValue);
        handleChange(newValue);
      }}
      sx={{
        borderRadius: "0.5rem",
        backgroundColor: "background.default",
      }}
    >
      {options.map((item, index) => (
        <ToggleButton
          key={index}
          value={item.value}
          sx={(theme) => ({
            borderRadius: "0.5rem",
            backgroundColor: "background.inactive",
            color: "text.primary",
            padding: "0.5rem",
            // boxShadow: `0 0 0.3rem ${theme.palette.background.invert}`,
            "&:hover": {
              backgroundColor: "background.inactive",
              color: "text.primary",
              boxShadow: `0 0 0.2rem grey inset`,
            },
            "&.Mui-selected": {
              backgroundColor: "background.defaultSolid",
              color: "text.primary",
              boxShadow: `0 0 0.3rem ${theme.palette.background.invert}`,
              "&:hover": {
                backgroundColor: "background.defaultSolid",
                color: "text.primary",
                boxShadow: `0 0 0.2rem ${theme.palette.background.invert}`,
              },
            },
          })}
        >
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

export default CustomToggle;
