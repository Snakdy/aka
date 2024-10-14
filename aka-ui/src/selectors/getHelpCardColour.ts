import {Theme} from "@mui/material";

const getHelpCardColour = (theme: Theme): string => {
	return theme.palette.mode === "dark" ? theme.palette.secondary.dark : theme.palette.primary.light;
};
export default getHelpCardColour;

