/*
 *    Copyright 2020 Django Cass
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 *
 */

import React, {ReactElement, useMemo} from "react";
import {Avatar, Chip, Skeleton, Theme, Tooltip, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {Img} from "react-image";
import Icon from "@mdi/react";
import {Link} from "react-router-dom";
import {mdiAccountCircleOutline, mdiAccountGroupOutline, mdiEarth} from "@mdi/js";
import getAvatarFromPalette from "../../../selectors/getAvatarFromPalette";
import getHelpCardColour from "../../../selectors/getHelpCardColour";
import getColourFromHex from "../../../style/getColourFromHex";
import getSafeTextColour from "../../../selectors/getSafeTextColour";
import getAvatarScheme from "../../../style/getAvatarScheme";
import {ICON_URL} from "../../../constants";
import usePalette from "../../../hooks/usePalette";
import {Jump} from "../../../generated/graphql";
import {getJumpType, JumpType} from "../../../util/jump";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	chip: {
		margin: theme.spacing(0.5),
		fontFamily: "Manrope",
		fontWeight: 500
	}
}));

interface JumpChipProps {
	jump: Jump;
}

const JumpChip: React.FC<JumpChipProps> = ({jump}): ReactElement => {
	// hooks
	const theme = useTheme();
	const classes = useStyles();

	const jumpType = getJumpType(jump);
	const {data, loading, error} = usePalette(`${ICON_URL}/icon?site=${jump.location}`);
	// set the appropriate colours for the card-content
	const avatarPalette = getAvatarFromPalette(theme, "", data);

	const bg = useMemo(() => {
		let val: string | null = getHelpCardColour(theme);
		if (!loading && error == null) {
			try {
				val = getColourFromHex(data, 0.2);
			} catch (e) {
				// this will probably only be thrown by firefox, so just swallow it
				console.error(e);
			}
		}
		return val;
	}, [theme, loading, error, data]);

	const scheme = getAvatarScheme(theme, jumpType);
	const textStyle = {
		color: getSafeTextColour(theme, bg, theme.palette.getContrastText(scheme[0]))
	};
	const avatar = {
		icon: jumpType === JumpType.Global ? mdiEarth : jumpType === JumpType.Personal ? mdiAccountCircleOutline : mdiAccountGroupOutline,
		bg: scheme[0],
		fg: scheme[1]
	};

	return (
		<Tooltip
			disableFocusListener
			title={jump.location}
			placement="bottom"
			key={`${jump.id}${jump.name}`}>
			<Chip
				avatar={<Avatar style={{backgroundColor: bg ?? avatar.bg, color: avatarPalette.fg || avatar.fg}}>
					{/* Website icon or MDI icon fallback */}
					<Img
						src={`${ICON_URL}/icon?site=${jump.location}`}
						width={32}
						height={32}
						loader={<Skeleton animation="wave" variant="circular" width={32} height={32}/>}
						unloader={<Icon path={avatar.icon} color={avatar.fg} size={1}/>}
					/>
				</Avatar>}
				label={<span style={textStyle}>{jump.name}</span>}
				clickable
				component={Link}
				to={`/jmp?query=${jump.name}&id=${jump.id}`}
				style={{backgroundColor: bg ?? avatar.bg, color: avatar.fg}}
				className={classes.chip}/>
		</Tooltip>
	);
};
export default JumpChip;
