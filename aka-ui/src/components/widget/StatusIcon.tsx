import {IconButton, Skeleton, Theme, Tooltip} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import Icon from "@mdi/react";
import React, {ReactElement} from "react";

const useStyles = makeStyles((theme: Theme) => ({
	skeleton: {
		margin: theme.spacing(1.5),
		float: "left"
	}
}));

interface StatusIconProps {
	active: string | null;
	title: string;
	icon: string;
	loading?: boolean;
}

const StatusIcon: React.FC<StatusIconProps> = ({active = null, title, icon, loading = false}): ReactElement => {
	// hooks
	const classes = useStyles();
	const {palette} = useTheme();

	const ok = active === "UP";
	const colour = active == null ? palette.text.disabled : (ok ? palette.success.main : palette.error.main);
	const colourName = ok ? "primary" : "secondary";
	return <>
		{loading ? <Skeleton
			className={classes.skeleton}
			variant="circular"
			width={24}
			height={24}
			animation="wave"
		/> :
			<Tooltip title={`${title}: ${active ?? "UNKNOWN"}`}>
				<IconButton color={colourName} size="large">
					<Icon path={icon} size={1} color={colour}/>
				</IconButton>
			</Tooltip>}
	</>;
};

export default StatusIcon;
