import React, {ReactElement, ReactNode} from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import Icon from "@mdi/react";
import {mdiChevronDown} from "@mdi/js";
import {Theme} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	content: {
		fontSize: 14,
		flex: 1
	},
	errorIcon: {
		color: theme.palette.error.dark
	}
}));

interface InfoItemProps {
	title: ReactNode;
	open?: boolean;
	icon: ReactNode;
	content: ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({title, open = false, icon, content}: InfoItemProps): ReactElement => {
	const classes = useStyles();
	return (
		<Accordion defaultExpanded={open}>
			<AccordionSummary
				expandIcon={<Icon path={mdiChevronDown} size={1}/>} aria-controls="panel1bh-content"
				id="panel1bh-header">
				{icon}
				<Typography className={classes.title}>{title}</Typography>
			</AccordionSummary>
			<AccordionDetails>
				<div
					className={classes.content}>
					{content}
				</div>
			</AccordionDetails>
		</Accordion>
	);
};
export default InfoItem;
