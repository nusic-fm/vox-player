import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

type Props = { onUserChange: (uid: string) => void };

const UserSelection = ({ onUserChange }: Props) => {
  return (
    <FormControl size="small" sx={{ width: "180px" }}>
      <InputLabel>Change User</InputLabel>
      <Select
        label="Change User"
        onChange={(e) => onUserChange(e.target.value as string)}
      >
        <MenuItem value={"upsDmsN77H3AQgDBi3tQ"}>Pammy</MenuItem>
        <MenuItem value={"Hq075VWWLYVjnWdLhfah"}>Gr8Fairee</MenuItem>
        <MenuItem value={"4C8CrwUMB7k9Bst5FfWK"}>paradroid68</MenuItem>
        <MenuItem value={"LcCC807hUeGCLEV5Hscj"}>Emkatters</MenuItem>
        <MenuItem value={"38XkUcZIXTiJC51gjjzr"}>AstralVisions</MenuItem>
        <MenuItem value={"GC7KjOf6BS913nZM8apb"}>samUrI</MenuItem>
        <MenuItem value={"LtFqRMsmMZvZdf2AIERu"}>readi-playa</MenuItem>
        <MenuItem value={"826040837275910154"}>adamnusic</MenuItem>
      </Select>
    </FormControl>
  );
};

export default UserSelection;
