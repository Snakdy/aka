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
import {Button, Divider, MenuItem, Theme, Typography, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Center from "react-center";
import {Link, useNavigate} from "react-router-dom";
import Icon from "@mdi/react";
import {mdiAccountGroupOutline} from "@mdi/js";
import useAuth from "../../../../hooks/useAuth";
import {User} from "../../../../generated/graphql";
import UserProfile from "./UserProfile";

const useStyles = makeStyles((theme: Theme) => ({
	logoutButton: {
		borderRadius: theme.spacing(0.5),
		margin: theme.spacing(2),
		paddingLeft: theme.spacing(2),
		paddingRight: theme.spacing(2),
		textTransform: "none",
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 13
	},
	menuItem: {
		padding: theme.spacing(2)
	},
	menuIcon: {
		paddingLeft: theme.spacing(3),
		paddingRight: theme.spacing(1)
	},
	titleText: {
		fontFamily: "Manrope",
		fontWeight: 600,
		fontSize: 13
	},
	info: {
		padding: theme.spacing(2),
		fontSize: 13
	}
}));

interface UserMenuProps {
	user: User | null;
	onClose: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({user, onClose}): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const navigate = useNavigate();

	// global state
	const {isLoggedIn, isAdmin} = useAuth();

	const onPrivacyClicked = (): void => {
		onClose();
		navigate("/help#data-collection");
	};

	return (
		<div>
			<UserProfile
				user={user}
				isAdmin={isAdmin}
				settingsProps={{
					component: Link,
					to: "/settings",
					onClick: onClose
				}}/>
			{isLoggedIn && <>
				<Divider/>
				<MenuItem
					className={classes.menuItem}
					component={Link}
					to="/identity"
					onClick={onClose}>
					<Icon
						className={classes.menuIcon}
						path={mdiAccountGroupOutline}
						size={0.85}
						color={theme.palette.text.primary}
					/>
					<Typography
						className={classes.titleText}
						color="textPrimary">
						Users &amp; Groups
					</Typography>
				</MenuItem>
			</>}
			<Divider style={{marginTop: 0}}/>
			<Center>
				<Button
					className={classes.logoutButton}
					color={isLoggedIn ? "inherit" : "primary"}
					component="a"
					href="/oauth2/sign_in"
					rel="noopener noreferrer"
					onClick={onClose}
					variant="outlined">
					{isLoggedIn ? "Sign out" : "Sign in"}
				</Button>
			</Center>
			<Divider/>
			<Typography
				className={classes.info}
				color="textSecondary"
				align="center"
				onClick={onPrivacyClicked}>
				Privacy info&nbsp;&bull;&nbsp;Help
			</Typography>
		</div>
	);
};
export default UserMenu;
