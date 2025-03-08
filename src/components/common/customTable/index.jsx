import React, { useState, useMemo, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  TextField,
  Box,
  IconButton,
  Autocomplete,
  Typography,
  CircularProgress,
  Skeleton,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import { Resizable } from "react-resizable";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import TooltipCustom from "../tooltip";

const CustomTable = ({ data, columns, onRowClick, isLoading, title }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState(columns[0]?.id || "");
  const [pagination, setPagination] = useState({ page: 0, rowsPerPage: 10 });
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisible, setFilterVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [columnWidths, setColumnWidths] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.width || 150 }), {})
  );

  const tableRef = useRef(null);

  const handleSort = (columnId) => {
    const isAsc = orderBy === columnId && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(columnId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleFilterChange = (columnId, value) => {
    setFilters((prev) => ({ ...prev, [columnId]: value || "" }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const handleResize = (columnId, event, { size }) => {
    setColumnWidths((prev) => ({ ...prev, [columnId]: size.width }));
  };

  const getValue = (obj, path) =>
    path.split(".").reduce((acc, part) => acc && acc[part], obj) || "-";

  const getColumnOptions = (columnId) =>
    Array.from(
      new Set(data.map((row) => getValue(row, columnId)?.toString() || "-"))
    );

  const filteredData = useMemo(() => {
    return data
      .filter((row) =>
        columns.some((col) => {
          const cellValue = getValue(row, col.id);
          return searchTerm
            ? cellValue
                ?.toString()
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            : true;
        })
      )
      .filter((row) =>
        Object.entries(filters).every(([key, value]) =>
          value
            ? getValue(row, key)
                ?.toString()
                .toLowerCase()
                .includes(value.toLowerCase())
            : true
        )
      )
      .sort((a, b) => {
        const aValue = getValue(a, orderBy);
        const bValue = getValue(b, orderBy);
        if (aValue < bValue) return order === "asc" ? -1 : 1;
        if (aValue > bValue) return order === "asc" ? 1 : -1;
        return 0;
      });
  }, [data, orderBy, order, searchTerm, filters]);

  const renderSkeleton = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TableRow key={index}>
        {columns.map((column) => (
          <TableCell key={column.id} width={columnWidths[column.id]}>
            <Skeleton animation="wave" sx={{ bgcolor: "background.default" }} />
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  return (
    <Paper
      sx={{
        width: "100%",
        maxHeight: fullScreen ? "100vh" : "90vh",
        minHeight: fullScreen ? "100vh" : "auto",
        overflow: "hidden",
        padding: 2,
        position: fullScreen ? "fixed" : "relative",
        top: 0,
        left: 0,
        zIndex: fullScreen ? 1000 : "auto",
        backgroundColor: fullScreen
          ? "background.defaultSolid"
          : "background.default",
        backgroundImage: "none",
        borderRadius: "0.5rem",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.5s",
        // "& .react-resizable": {
        //   display: "inline-block",
        //   position: "relative",
        //   width: "100%",
        // },
        // "& .react-resizable-handle": {
        //   position: "absolute",
        //   right: "0",
        //   top: "0",
        //   bottom: "0",
        //   width: "5px",
        //   cursor: "col-resize",
        //   background: "rgba(255, 255, 255, 0.3)",
        // },
      }}
      ref={tableRef}
    >
      {/* Toolbar */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap={"1rem"}
        mb={1}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {title}
          </Typography>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="flex-end"
          gap={"1rem"}
        >
          <TextField
            size="small"
            label="Search..."
            variant="outlined"
            margin="dense"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              width: searchVisible ? "20rem" : "0",
              transition: "all 0.5s",
              overflow: "hidden",
            }}
          />
          {/* )} */}
          <div className="flex gap-2 items-center py-2">
            <TooltipCustom title="Toggle Search">
              <IconButton onClick={() => setSearchVisible(!searchVisible)}>
                {!searchVisible ? (
                  <SearchIcon color="secondary" />
                ) : (
                  <SearchOffIcon color="secondary" />
                )}
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Toggle Filters">
              <IconButton onClick={() => setFilterVisible(!filterVisible)}>
                <FilterListIcon color="secondary" />
              </IconButton>
            </TooltipCustom>
            <TooltipCustom title="Toggle Fullscreen">
              <IconButton onClick={() => setFullScreen(!fullScreen)}>
                {fullScreen ? (
                  <FullscreenExitIcon color="secondary" />
                ) : (
                  <FullscreenIcon color="secondary" />
                )}
              </IconButton>
            </TooltipCustom>
          </div>
        </Box>
      </Box>

      <Divider className="w-[100%] mx-auto" />

      {/* Table */}
      <TableContainer
        sx={{
          width: "100%",
          maxHeight: "calc(100vh - 17rem)",
          overflow: "auto",
          marginTop: "0.5rem",
          "& .MuiTableRow-root": {
            borderBottom: "2px solid",
            borderColor: "divider",
          },
        }}
      >
        <Table sx={{ width: "100%", tableLayout: "fixed" }}>
          <TableHead
            className="sticky top-0 z-10"
            sx={{
              backgroundColor: "background.defaultSolid",
            }}
          >
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} width={columnWidths[column.id]}>
                  <Resizable
                    width={columnWidths[column.id]}
                    height={30}
                    onResizeStop={(e, data) => handleResize(column.id, e, data)}
                    axis="x"
                  >
                    <div
                      style={{
                        width: columnWidths[column.id],
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === column.id}
                        direction={orderBy === column.id ? order : "asc"}
                        onClick={() => handleSort(column.id)}
                      >
                        <Typography variant="h7" sx={{ fontWeight: "bold" }}>
                          {column.label}
                        </Typography>
                      </TableSortLabel>
                    </div>
                  </Resizable>
                  {filterVisible && (
                    <Autocomplete
                      options={getColumnOptions(column.id)}
                      value={filters[column.id] || ""}
                      onChange={(_, value) =>
                        handleFilterChange(column.id, value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="standard"
                          size="small"
                          placeholder="Filter"
                        />
                      )}
                    />
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? renderSkeleton()
              : filteredData
                  .slice(
                    pagination.page * pagination.rowsPerPage,
                    pagination.page * pagination.rowsPerPage +
                      pagination.rowsPerPage
                  )
                  .map((row, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => onRowClick(row)}
                      sx={{ cursor: "pointer" }}
                    >
                      {columns.map((column) => (
                        <TableCell
                          key={column.id}
                          width={columnWidths[column.id]}
                        >
                          {column.cell ? (
                            column.cell(row)
                          ) : (
                            <Typography variant="h7">
                              {getValue(row, column.id)}
                            </Typography>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredData.length}
        page={pagination.page}
        rowsPerPage={pagination.rowsPerPage}
        onPageChange={(_, newPage) =>
          setPagination((prev) => ({ ...prev, page: newPage }))
        }
        onRowsPerPageChange={(event) =>
          setPagination({
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
          })
        }
      />
    </Paper>
  );
};

export default CustomTable;
