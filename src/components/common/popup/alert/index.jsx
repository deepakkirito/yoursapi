import { CreateAlertContext } from "@/utilities/context/alert";
import { forwardRef, useContext } from "react";

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
  const { alert } = useContext(CreateAlertContext);
  return (
    <Box>
      <Dialog
        open={alert.open}
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
            border: "0.5rem solid",
            borderColor: "background.default",
            borderRadius: "1rem",
            padding: "0 0 1rem",
          }}
        >
          <DialogTitle>{alert.title}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              {alert.content}
            </DialogContentText>
          </DialogContent>
          <DialogActions className="flex justify-around">
            <Button
              onClick={alert.handleClose}
              variant="outlined"
              sx={{
                padding: "0.3rem 1.5rem",
                borderRadius: "2rem",
                fontSize: "14px",
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
                padding: "0.3rem 1.5rem",
                borderRadius: "2rem",
                fontSize: "14px",
                fontWeight: "700",
                backgroundColor: "background.default",
              }}
              onClick={() => {
                alert.handleSuccess();
                alert.handleClose();
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
