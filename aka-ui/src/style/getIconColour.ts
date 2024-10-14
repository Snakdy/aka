import {Theme} from "@mui/material";

const getIconColour = (theme: Theme): string => {
	return theme.palette.getContrastText(theme.palette.background.default);
};
export default getIconColour;
