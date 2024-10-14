import {Theme} from "@mui/material";

export interface Avatar {
	icon: string;
	bg: string;
	fg: string;
}

const getAvatarFromPalette = (theme: Theme, icon: string, colour: string): Avatar => {
	if (theme.palette.mode === "dark") {
		return {
			icon,
			bg: colour,
			fg: ""
		};
	} else {
		return {
			icon,
			bg: colour,
			fg: ""
		};
	}
};
export default getAvatarFromPalette;
