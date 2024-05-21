import { LoadingButton } from "@mui/lab";
import { Button, Chip, Stack, Typography } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import {
  query,
  collection,
  orderBy,
  where,
  limit,
  or,
} from "firebase/firestore";
import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "./services/firebase.service";

type Props = {};

const Admin = (props: Props) => {
  const [noRVCSnapshot, ,] = useCollection(
    query(
      collection(db, "covers"),
      or(where("stemsReady", "==", false), where("sections", "==", [])),
      limit(10)
    )
  );
  const [machines, ,] = useCollection(
    query(collection(db, "machines"), limit(10))
  );
  const [progressIds, setProgressIds] = useState<string[]>([]);

  return (
    <Stack p={4} gap={2}>
      <Typography variant="h5">Admin Portal</Typography>
      {!noRVCSnapshot?.size && <Typography>No pending processes</Typography>}
      {noRVCSnapshot?.docs.map((d) => (
        <Box display={"flex"} key={d.id} gap={4} alignItems="center">
          <Typography>{d.data().title}</Typography>
          <LoadingButton
            loading={progressIds.includes(d.id)}
            variant="contained"
            onClick={async () => {
              const coverDoc = d.data();
              if (coverDoc.sections.length === 0) {
                const isAllInOneAvailable = machines?.docs.findIndex(
                  (d) => d.data().name === "all-in-1" && !!d.data().isAvailable
                );
                if (isAllInOneAvailable !== -1) {
                  try {
                    setProgressIds((ids) => [...ids, coverDoc.id]);
                    await axios.post(
                      `${import.meta.env.VITE_VOX_COVER_SERVER}/all-in-one`,
                      {
                        cover_doc_id: d.id,
                      }
                    );
                  } catch (e) {}
                } else alert("allin1 machine not available");
              }
              if (coverDoc.stemsReady === false) {
                const isMachineAvailable = machines?.docs.findIndex(
                  (d) => d.data().name === "no-rvc" && !!d.data().isAvailable
                );
                if (isMachineAvailable !== -1) {
                  try {
                    setProgressIds((ids) => [...ids, coverDoc.id]);
                    await axios.post(
                      `${import.meta.env.VITE_VOX_COVER_SERVER}/no-rvc`,
                      {
                        cover_doc_id: d.id,
                        voice_id: coverDoc.voices[0].id,
                      }
                    );
                  } catch (e) {}
                } else alert("no-rvc machine not available");
              }
            }}
          >
            Retry
          </LoadingButton>
        </Box>
      ))}
      <Typography>-----Machines-----</Typography>
      {!machines?.size && <Typography>No Available Machines</Typography>}
      {machines?.docs.map((d) => {
        const doc = d.data();
        return (
          <Box
            display={"flex"}
            key={d.id}
            gap={4}
            alignItems="center"
            width={"350px"}
            justifyContent="space-between"
          >
            <Typography>
              {doc.userId}/{doc.name}
            </Typography>
            <Chip
              color={doc.isAvailable ? "success" : "error"}
              label={doc.isAvailable ? "Available" : "Not Available"}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

export default Admin;
