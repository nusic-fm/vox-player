import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { lensClient } from "../config";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

type Props = {};

const LoginModal = (props: Props) => {
  const [handles, setHandles] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConnect, setShowConnect] = useState(true);
  const [newHandleName, setNewHandleName] = useState("");
  const [showNewHandle, setShowNewHandle] = useState(false);
  const [newHandleLoading, setNewHandleLoading] = useState(false);


  return (
    <Dialog open={showConnect} fullWidth>
      <DialogTitle>Welcome</DialogTitle>
      {loading && <LinearProgress />}
      <DialogContent>
        {/* {!address && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              connect({ connector: injected() });
              // connectWallet();
            }}
          >
            Connect your wallet
          </Button>
        )} */}
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
