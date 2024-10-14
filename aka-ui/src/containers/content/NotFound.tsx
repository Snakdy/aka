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
import {IconButton, Theme, Tooltip, Typography, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Center from "react-center";
import {Link, useNavigate} from "react-router-dom";
import Icon from "@mdi/react";
import {mdiArrowLeft, mdiHomeOutline} from "@mdi/js";
import {GenericIconButton} from "jmp-coreui";
import {APP_NAME} from "../../constants";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		color: theme.palette.text.primary,
		fontFamily: "Manrope",
		fontWeight: 400,
		fontSize: 24, marginTop: theme.spacing(2)
	},
	subtitle: {
		textAlign: "center",
		color: theme.palette.text.secondary,
		margin: theme.spacing(1)
	},
	overlay: {
		position: "fixed",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		pointerEvents: "none"
	}
}));

const NotFound: React.FC = (): ReactElement => {
	const classes = useStyles();
	const theme = useTheme<Theme>();
	const navigate = useNavigate();

	useEffect(() => {
		window.document.title = `404 - ${APP_NAME}`;
	}, []);

	return (
		<Center className={classes.overlay}>
			<div style={{pointerEvents: "initial"}}>
				<Center>
					<img height={256} src="/draw/undraw_lost_bqr2.svg" alt=""/>
				</Center>
				<Typography
					className={classes.title}
					align="center">
					Page not found.
				</Typography>
				<Typography
					className={classes.subtitle}
					align="center"
					variant="subtitle1">
					The page you're looking for doesn't exist or the server refused to disclose it.
				</Typography>
				<Center>
					<GenericIconButton
						title="Go back"
						icon={mdiArrowLeft}
						colour={theme.palette.secondary.main}
						onClick={() => navigate(-1)}
					/>
					<Tooltip title="Return to home">
						<IconButton
							component={Link}
							to="/"
							color="primary"
							centerRipple={false}
							aria-label="Return to home"
							size="large">
							<Icon path={mdiHomeOutline} size={1} color={theme.palette.primary.main}/>
						</IconButton>
					</Tooltip>
				</Center>
			</div>
		</Center>
	);
};
export default NotFound;
