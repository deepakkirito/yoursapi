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
  const { alert, setAlert } = useContext(CreateAlertContext);
  return (
    <Box>
      <Dialog
        open={alert.open}
        variant="outlined"
        TransitionComponent={Transition}
        keepMounted
        onClose={() => {
          setAlert({ ...alert, open: false });
          handleClose();
        }}
        aria-describedby="alert-dialog-slide-description"
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "1rem",
          },
        }}
      >
        <Box
          sx={{
            background: "none",
            backgroundColor: "background.defaultSolid",
            border: "0.2rem solid",
            borderColor: "divider",
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
          {!alert?.hideButton && (
            <DialogActions className="flex justify-around">
              <Button
                onClick={alert.handleClose}
                variant="contained"
                color="error"
                sx={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "2rem",
                  fontSize: "14px",
                  fontWeight: "700",
                  // backgroundColor: "status.red",
                  // color: "common.button",
                }}
              >
                {alert?.cancelButton || "Disagree"}
              </Button>
              <Button
                variant="contained"
                color="success"
                sx={{
                  padding: "0.5rem 1.5rem",
                  borderRadius: "2rem",
                  fontSize: "14px",
                  fontWeight: "700",
                  // backgroundColor: "background.default",
                }}
                onClick={() => {
                  alert.handleSuccess();
                  alert.handleClose();
                }}
              >
                {alert?.agreeButton || "Agree"}
              </Button>
            </DialogActions>
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default Alert;
