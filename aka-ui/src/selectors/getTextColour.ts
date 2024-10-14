import {Theme} from "@mui/material";

export const getDefault = (theme: Theme): string => {
	return theme.palette.getContrastText(theme.palette.background.default);
};
export const getPaper = (theme: Theme): string => {
	return theme.palette.getContrastText(theme.palette.background.paper);
};
