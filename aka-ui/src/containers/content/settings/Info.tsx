import React, {ReactElement} from "react";
import {
	Avatar,
	Card,
	Divider,
	ListItem,
	ListItemAvatar,
	ListItemText,
	ListSubheader,
	Theme,
	Typography
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {APP_NAME} from "../../../constants";

const useStyles = makeStyles((theme: Theme) => ({
	versionInfo: {
		padding: theme.spacing(1)
	}
}));

const Info: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();

	return (
		<div>
			<ListSubheader>About {APP_NAME}</ListSubheader>
			<Card>
				<ListItem className={classes.versionInfo}>
					<ListItemAvatar>
						<Avatar alt="App icon" src="/jmp2.png"/>
					</ListItemAvatar>
					<ListItemText
						primary={
							<Typography color="textPrimary" variant="h5">{APP_NAME}</Typography>
						}/>
				</ListItem>
				<Divider/>
				<ListItem>
					<ListItemText
						className={classes.versionInfo}
						secondary={<div>
							<p>Version:&nbsp;{import.meta.env.VITE_APP_VERSION || "unknown version"}</p>
							<p>Revision:&nbsp;{import.meta.env.VITE_APP_REVISION || "unknown revision"}</p>
						</div>}
					/>
				</ListItem>
			</Card>
		</div>
	);
};
export default Info;
