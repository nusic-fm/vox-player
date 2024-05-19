import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type Props = { onUserChange: (uid: string) => void; source: string[] };

const UserSelection = ({ onUserChange, source }: Props) => {
  return (
    <FormControl size="small" sx={{ width: "180px" }}>
      <InputLabel>Change User</InputLabel>
      <Select
        label="Change User"
        onChange={(e) => onUserChange(e.target.value as string)}
      >
        {source.map((s) => (
          <MenuItem key={s} value={s.split(" ")[0]}>
            {s.split(" ").slice(1).join(" ")}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default UserSelection;
// 3Cx4l7iMeFMKx2ywnaqS samUrI
// ugKfRzQqn6yUFitpPapN Pammy
// ENxvDxiBSsUy6TaupP3g AstralVisions
// JEIOJky1oU90XsMFnvAw Emkatters
// ZUKKbz0etLsdkGB2BUTM paradroid68
// yA7gbZ85WIGPalUn3BjJ Gr8Fairee
// OFBeiFrt6AvMNmbMScmz readi-playa

// dYCM8E7Wfz3JjyyRA17V Jason Voorhees
// I5ZljIvkolMOHOiJiYJ6 Cyber Monkey
// CAbXJvrMXAeV5r8kfbHA AI Audio Lab
// geEf5ZwcHOJNKZHR86Pv Frank Costello
// Z3IG8LHJK2S03L7BcZiD AI Mafia
// ve0Yg5v3jNLrxq6Ez3Zp Sad Cellist
// Mak3wXEn3OzrleoRx4hO The Thing
// rTU6Pbn3eEGhYjV4zgev Shut GPT
// fVbXnhQHPfK5Zy7n4a3b Queen Orchid
// DkcrmVEysfjfKAKeB6Fq Black Widow
