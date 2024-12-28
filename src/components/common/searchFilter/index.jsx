import { Box, Grid2, IconButton, TextField, Typography } from "@mui/material";
import CustomSelect from "../customSelect";
import { ArrowDownward } from "@mui/icons-material";
import TooltipCustom from "../tooltip";
import { useState } from "react";

const SearchFilter = ({
  options,
  handleChange,
  value,
  label,
  getSearch,
  getSort = () => {},
}) => {
  const [sort, setSort] = useState("lth");

  return (
    <Grid2
      container
      spacing={2}
      sx={{
        backgroundColor: "background.default",
        borderRadius: "0.5rem",
        padding: "0.5rem 1rem",
        alignItems: "center",
      }}
    >
      <Grid2
        item
        size={{ xs: 12, md: 6 }}
        sx={{
          "& .MuiInputBase-input": {
            padding: "0.5rem 1rem",
          },
        }}
      >
        <TextField
          fullWidth
          type="search"
          variant="outlined"
          placeholder="Search projects"
          onChange={(event) => getSearch(event.target.value)}
        />
      </Grid2>
      <Grid2 item size={{ xs: 12, md: 6 }} className="flex justify-end items-center">
        <CustomSelect
          label={label}
          options={options}
          value={value}
          handleChange={handleChange}
        />
        <Box>
          <TooltipCustom title={sort === "lth" ? "Low to High" : "High to low"}>
            <IconButton
              onClick={() => {
                setSort(sort === "lth" ? "htl" : "lth");
                getSort(sort === "lth" ? "htl" : "lth");
              }}
            >
              <ArrowDownward
                color="secondary"
                sx={{
                  rotate: sort === "lth" ? "0deg" : "180deg",
                  transition: "rotate 500ms",
                }}
              />
            </IconButton>
          </TooltipCustom>
        </Box>
      </Grid2>
    </Grid2>
  );
};

export default SearchFilter;
