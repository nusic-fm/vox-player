import axios from "axios";
import { useState } from "react";

export const useSession = () => {
  const [startLog, setStartLog] = useState<{
    uid?: string;
    coverId: string;
    voiceId: string;
    startTime: number;
    endTime: number;
  } | null>(null);

  const pushLog = (endTime: number) => {
    if (startLog) {
      try {
        axios.post(
          "https://api.nusic.kamu.dev/nusic/cover-playtimes/ingest",
          {
            user_id: startLog.uid,
            cover_id: startLog.coverId,
            voice_id: startLog.voiceId,
            start_time: startLog.startTime,
            end_time: endTime,
          },
          {
            headers: {
              "Content-Type": "application/x-ndjson",
              Authorization: `Bearer ${import.meta.env.VITE_KAMU_AUTH_TOKEN}`,
            },
          }
        );
      } catch (e: any) {
        console.error(e.message);
      }
    }
  };

  return {
    setStartLog,
    pushLog,
  };
};
