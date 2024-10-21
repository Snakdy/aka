/*
 *    Copyright 2019 Django Cass
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
 */

import {mdiAccountCircleOutline, mdiAccountGroupOutline, mdiEarth} from "@mdi/js";
import {Avatar, Skeleton, Theme, useTheme} from "@mui/material";
import Icon from "@mdi/react";
import React, {ReactElement, useMemo} from "react";
import {Img} from "react-image";
import makeStyles from "@mui/styles/makeStyles";
import getHelpCardColour from "../../../selectors/getHelpCardColour";
import getColourFromHex from "../../../style/getColourFromHex";
import getAvatarFromPalette from "../../../selectors/getAvatarFromPalette";
import getAvatarScheme from "../../../style/getAvatarScheme";
import {getIconURL} from "../../../constants";
import {Jump} from "../../../generated/graphql";
import {getJumpType, JumpType} from "../../../util/jump";

const useStyles = makeStyles((theme: Theme) => ({
	avatar: {
		margin: theme.spacing(1),
		marginRight: theme.spacing(2)
	},
	image: {
		margin: theme.spacing(0.5)
	}
}));

interface JumpAvatarProps {
	jump: Jump;
	colour: string;
	loading: boolean;
	error: Error | null;
	size?: number;
	iconSize?: number;
}

const JumpAvatar: React.FC<JumpAvatarProps> = ({
	jump,
	colour,
	loading,
	error,
	size = 40,
	iconSize = 1
}: JumpAvatarProps): ReactElement => {
	// hooks
	const theme = useTheme<Theme>();
	const classes = useStyles();

	const jumpType = getJumpType(jump);

	// set the appropriate colours for the card-content
	const avatarPalette = useMemo(() => {
		return getAvatarFromPalette(theme, getIconURL(jump.location), colour);
	}, [theme, jump.location, colour]);

	const bg = useMemo(() => {
		let val: string | null = getHelpCardColour(theme);
		if (!loading && error == null) {
			try {
				val = getColourFromHex(colour, 0.2);
			} catch (e) {
				// this will probably only be thrown by firefox, so just swallow it
				console.error(e);
			}
		}
		return val;
	}, [theme, loading, error, colour]);

	const scheme = getAvatarScheme(theme, jumpType);
	const avatar = {
		icon: jumpType === JumpType.Global ? mdiEarth : jumpType === JumpType.Personal ? mdiAccountCircleOutline : mdiAccountGroupOutline,
		bg: scheme[0],
		fg: scheme[1]
	};
	return (
		<Avatar
			className={classes.avatar}
			style={{backgroundColor: bg ?? avatar.bg, color: avatarPalette.fg || avatar.fg, width: size, height: size}}>
			<Img
				className={classes.image}
				src={getIconURL(jump.location)}
				width={iconSize * 32}
				height={iconSize * 32}
				loader={
					<Skeleton animation="wave" variant="circular" width={iconSize * 32} height={iconSize * 32}/>
				}
				unloader={
					<Icon path={avatar.icon} color={avatar.fg} size={iconSize}/>
				}
			/>
		</Avatar>
	);
};
export default JumpAvatar;
