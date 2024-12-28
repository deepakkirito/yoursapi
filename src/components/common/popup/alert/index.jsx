import { forwardRef } from "react";

const {
  Box,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} = require("@mui/material");

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide ref={ref} {...props} />;
});

const Alert = ({
  open = false,
  title = "",
  content = "",
  handleClose = () => {},
  handleSuccess = () => {},
}) => {
  return (
    <Box>
      <Dialog
        open={open}
        variant="outlined"
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "1rem",
          },
        }}
      >
        <Box
          sx={{
            backgroundColor: "background.invert",
            border: "1rem solid",
            borderColor: "background.default",
            borderRadius: "1rem",
            padding: "0 0 1rem",
          }}
        >
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {content}
            </DialogContentText>
          </DialogContent>
          <DialogActions className="flex justify-around">
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                padding: "0.5rem 2rem",
                borderRadius: "2rem",
                fontSize: "1.2rem",
                fontWeight: "700",
                backgroundColor: "status.red",
                color: "common.button",
              }}
            >
              Disagree
            </Button>
            <Button
              variant="outlined"
              sx={{
                padding: "0.5rem 2rem",
                borderRadius: "2rem",
                fontSize: "1.2rem",
                fontWeight: "700",
                backgroundColor: "background.default",
              }}
              onClick={() => {
                handleClose();
                handleSuccess();
              }}
            >
              Agree
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default Alert;
