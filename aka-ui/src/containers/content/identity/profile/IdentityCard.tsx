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

import React, {ReactElement, ReactNode} from "react";
import {Card, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, Theme} from "@mui/material";

import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		marginTop: theme.spacing(1),
		borderRadius: theme.spacing(1.5)
	}
}));

interface UserCardProps {
	avatar: any;
	primary?: ReactNode;
	secondary?: ReactNode
	actions: ReactNode;
}

const IdentityCard: React.FC<UserCardProps> = ({avatar, primary, secondary, actions}): ReactElement => {
	// hooks
	const classes = useStyles();

	return (
		<Card
			className={classes.root}
			variant="outlined">
			<ListItem>
				<ListItemAvatar>
					{avatar}
				</ListItemAvatar>
				<ListItemText
					primary={primary}
					secondary={secondary}
				/>
				<ListItemSecondaryAction>
					{actions}
				</ListItemSecondaryAction>
			</ListItem>
		</Card>
	);
};
export default IdentityCard;