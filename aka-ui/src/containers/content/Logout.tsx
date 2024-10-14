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
 *
 */

import React, {ReactElement, useEffect} from "react";
import Center from "react-center";
import {Link, useNavigate} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import {CircularProgress, Theme, Typography, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Icon from "@mdi/react";
import {mdiHomeOutline} from "@mdi/js";
import {APP_NAME} from "../../constants";
import useAuth from "../../hooks/useAuth";

const useStyles = makeStyles((theme: Theme) => ({
	overlay: {
		position: "fixed",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		pointerEvents: "none"
	},
	button: {
		pointerEvents: "initial"
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	progress: {
		margin: theme.spacing(2)
	}
}));

const Logout: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const navigate = useNavigate();
	const theme = useTheme();

	const {isLoggedIn} = useAuth();

	useEffect(() => {
		window.document.title = `Logout - ${APP_NAME}`;
	}, []);

	useEffect(() => {
		if (!isLoggedIn)
			navigate("/");
	}, [isLoggedIn]);


	return (
		<Center className={classes.overlay}>
			<div className={classes.button}>
				<Typography className={classes.title} variant="h4" color="textPrimary">
					Ensuring that you're logged out...
				</Typography>
				<Center>
					<CircularProgress className={classes.progress}/>
				</Center>
				<Center style={{paddingTop: 16}}>
					If you're not redirected in a few seconds, click below
				</Center>
				<Center>
					<IconButton
						component={Link}
						to="/"
						color="primary"
						centerRipple={false}
						aria-label="Return to home"
						size="large">
						<Icon path={mdiHomeOutline} color={theme.palette.text.secondary} size={1}/>
					</IconButton>
				</Center>
			</div>
		</Center>
	);
};

export default Logout;
