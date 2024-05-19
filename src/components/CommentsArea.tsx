import { Stack, Box, Tooltip, Avatar, Typography } from "@mui/material";
import { query, collection, where, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { getUserAvatar } from "../helpers";
import { db } from "../services/firebase.service";

type Props = { coverDocId: string };

const CommentsArea = ({ coverDocId }: Props) => {
  const [collectionSs] = useCollection(
    query(
      collection(db, "covers", coverDocId, "comments"),
      orderBy("createdAt")
    )
  );
  return (
    <Stack gap={0.5}>
      {collectionSs?.docs.map((doc) => {
        const id = doc.id;
        const c = doc.data();

        return (
          <Box display={"flex"} gap={1} alignItems="center" key={id}>
            <Tooltip title={c.shareInfo.name} placement="top">
              <Avatar
                src={getUserAvatar(c.shareInfo.id, c.shareInfo.avatar)}
                sx={{ width: 24, height: 24 }}
              />
            </Tooltip>
            <Box display={"flex"} justifyContent="space-between" width={"100%"}>
              <Typography variant="caption" sx={{ fontStyle: "italic" }}>
                {c.content}
              </Typography>
              <Typography variant="caption" color={"#c3c3c3"}>
                #{c.voiceId} 🎧
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
};

export default CommentsArea;
