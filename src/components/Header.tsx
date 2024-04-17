import {
  Box,
  Chip,
  Avatar,
  Button,
  Popper,
  Popover,
  Typography,
  Stack,
  Skeleton,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { User } from "../services/db/users.service";
import { useState } from "react";
import {
  getOnGoingProgress,
  RevoxProcessType,
} from "../services/db/revoxQueue.service";

type Props = { user?: User };

const baseUrl = "https://discord.com/api/oauth2/authorize";
const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
const redirectUri = import.meta.env.VITE_REDIRECT_URL as string;
const responseType = "token";
const scope = "identify+email";

const Header = ({ user }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingRevoxes, setPendingRevoxes] = useState<RevoxProcessType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Box my={2} display="flex" justifyContent={"center"}>
      {user ? (
        <Chip
          avatar={
            <Avatar
              src={`https://cdn.discordapp.com/avatars/${user.uid}/${user.avatar}`}
            />
          }
          deleteIcon={<ArrowDropDownIcon />}
          onDelete={async (e) => {
            setAnchorEl(e.currentTarget.parentElement);
            setIsLoading(true);
            const docs = await getOnGoingProgress(user.uid);
            setPendingRevoxes(docs);
            setIsLoading(false);
          }}
          label={user.name}
        />
      ) : (
        <Button
          size="small"
          variant="contained"
          // onClick={onSignInWithFb}
          href={`${baseUrl}?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`}
          startIcon={<img src="/discord.png" alt="" width={"22px"} />}
        >
          Sign in
        </Button>
      )}
      <Popover
        sx={{ mt: 1 }}
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Stack gap={1} p={2}>
          {isLoading ? (
            <Skeleton variant="rectangular" width={160} animation="wave" />
          ) : (
            !pendingRevoxes.length && (
              <Typography>No Pending Progress</Typography>
            )
          )}
          {pendingRevoxes.map((p) => (
            <Box display={"flex"} gap={2} alignItems="center">
              <Typography>
                {p.songName} - {p.voiceModelName}
              </Typography>
              <Chip
                size="small"
                label={p.status || "Processing"}
                color={p.status === "Failed" ? "error" : "default"}
              />
            </Box>
          ))}
          {/* <Button variant="contained" onClick={() => }>Logout</Button> */}
        </Stack>
      </Popover>
    </Box>
  );
};

export default Header;
