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

import React, {ReactElement} from "react";
import {Badge, Button, Theme, Typography, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Center from "react-center";
import Icon from "@mdi/react";
import {mdiCameraOutline} from "@mdi/js";
import UserAvatar from "../../../../components/identity/UserAvatar";
import {getSubjectName, parseUsername} from "../../../../util";
import {User} from "../../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	avatar: {
		padding: theme.spacing(2),
		margin: theme.spacing(1)
	},
	root: {
		width: "100%",
		minWidth: 350
	},
	displayName: {
		fontFamily: "Manrope",
		fontWeight: 600
	},
	username: {
		fontSize: 14
	},
	addButton: {
		borderRadius: theme.spacing(3),
		margin: theme.spacing(2),
		textTransform: "none",
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 13,
		height: 36
	},
	badge: {
		padding: theme.spacing(0.5),
		borderRadius: theme.spacing(10),
		backgroundColor: theme.palette.background.paper
	}
}));

interface UserProfileProps {
	user: User | null;
	isAdmin?: boolean;
	settingsProps?: object;
}

const UserProfile: React.FC<UserProfileProps> = ({user, isAdmin = false, settingsProps}): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();

	const getClaim = (s: string): string => {
		if (user == null)
			return "";
		Object.entries(user.claims).forEach(([key, value]) => {
			if (key.toLocaleLowerCase() === s.toLocaleLowerCase()) {
				return value;
			}
		});
		return "";
	}

	// local state
	const hasPicture = getClaim("picture");
	const displayName = getClaim("nickname") ?? getClaim("name") ?? parseUsername(user?.subject ?? "");
	const issuerName = parseUsername(user?.issuer ?? "");

	return (
		<div className={classes.root}>
			<Center>
				<Badge
					overlap="circular"
					anchorOrigin={{
						vertical: "bottom",
						horizontal: "right"
					}}
					badgeContent={
						<Icon
							className={classes.badge}
							path={mdiCameraOutline}
							size={0.75}
							color={theme.palette.text.disabled}
						/>
					}>
					<UserAvatar
						className={classes.avatar}
						text={displayName}
						src={hasPicture}
					/>
				</Badge>
			</Center>
			<Typography
				className={classes.displayName}
				color="textPrimary"
				align="center">
				{getSubjectName(displayName)}
			</Typography>
			<Typography
				className={classes.username}
				color="textSecondary"
				align="center">
				{getSubjectName(issuerName)}
			</Typography>
			<Center>
				<Button
					className={classes.addButton}
					variant="outlined"
					{...settingsProps}>
					{isAdmin ? "Account and configuration" : "Manage your account"}
				</Button>
			</Center>
		</div>
	);
};
export default UserProfile;