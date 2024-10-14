import {Theme} from "@mui/material";
import {JumpType} from "../util/jump";

const getAvatarScheme = (theme: Theme, type: JumpType): string[] => {
	const {palette} = theme;
	if (palette.mode === "dark") {
		switch (type) {
			case JumpType.Personal:
				return [palette.success.dark, palette.success.light];
			case JumpType.Group:
				return [palette.info.dark, palette.info.light];
			default:
				return [palette.primary.dark, palette.primary.light];
		}
	}
	else {
		switch (type) {
			case JumpType.Personal:
				return [palette.success.light, palette.success.main];
			case JumpType.Group:
				return [palette.info.light, palette.info.main];
			default:
				return [palette.primary.light, palette.primary.main];
		}
	}
}
export default getAvatarScheme;
