import React, {ReactElement, useEffect} from "react";
import Center from "react-center";
import {Avatar, Paper, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {APP_NAME} from "../../constants";
import General from "./settings/General";
import Info from "./settings/Info";

const useStyles = makeStyles((theme: Theme) => ({
	name: {
		fontFamily: "Manrope",
		fontWeight: 500,
		color: theme.palette.secondary.main,
		margin: theme.spacing(2)
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 100,
		margin: 24,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
}));

const Settings: React.FC = (): ReactElement => {
	const classes = useStyles();

	useEffect(() => {
		window.document.title = `Settings - ${APP_NAME}`;
	}, []);

	return (
		<div>
			<Center>
				<Avatar
					className={classes.avatar}
					component={Paper}
					src="/jmp2.png"
					alt={APP_NAME}
				/>
			</Center>
			<Center>
				<img height={192} src="/draw/undraw_preferences_uuo2.svg" alt=""/>
			</Center>
			<Center>
				<Typography variant="h4" className={classes.name}>Settings</Typography>
			</Center>
			<General/>
			<Info/>
		</div>
	);
};

export default Settings;
