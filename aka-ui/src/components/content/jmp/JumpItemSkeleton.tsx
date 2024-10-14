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
import {ListItem, ListItemIcon, ListItemText, Skeleton, Theme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		marginLeft: theme.spacing(1.25)
	},
	li: {
		height: 72
	},
	iconRoot: {
		minWidth: 48,
		marginRight: theme.spacing(1)
	}
}));

const JumpItemSkeleton: React.FC = (): ReactElement => {
	const classes = useStyles();
	return (
		<div className={classes.root}>
			<ListItem className={classes.li}>
				<ListItemIcon className={classes.iconRoot}>
					<Skeleton animation="wave" variant="circular" width={40} height={40}/>
				</ListItemIcon>
				<ListItemText
					primary={<Skeleton
						animation="wave"
						variant="text"
						width="15%"
						height={10}
						style={{marginBottom: 6}}
					/>}
					secondary={<Skeleton
						animation="wave"
						variant="text"
						width="60%"
						height={10}
					/>}
				/>
			</ListItem>
		</div>
	);
};
export default JumpItemSkeleton;