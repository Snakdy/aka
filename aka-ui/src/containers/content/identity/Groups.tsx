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

import {Alert, Box, List, Pagination, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, {ReactElement, ReactNode, useContext, useMemo, useState} from "react";
import Button from "@mui/material/Button";
import CreateGroupDialog from "../../modal/CreateGroupDialog";
import {MODAL_GROUP_NEW, setDialog} from "../../../store/actions/Modal";
import GroupEditDialog from "../../modal/GroupEditDialog";
import useAuth from "../../../hooks/useAuth";
import {pageSize} from "../../../constants";
import JumpItemSkeleton from "../../../components/content/jmp/JumpItemSkeleton";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {AppContext} from "../../../store/reducers/mono";
import {Group, useWatchGroupsSubscription} from "../../../generated/graphql";
import GroupCard from "./profile/GroupCard";

const useStyles = makeStyles((theme: Theme) => ({
	root: {
		marginTop: theme.spacing(1)
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 400,
		fontSize: 22,
		color: theme.palette.text.primary,
		width: "100%"
	},
	addButton: {
		fontFamily: "Manrope",
		fontWeight: 600,
		minWidth: 128,
		textTransform: "none"
	}
}));

interface GroupsProps {
	query: string;
}

const Groups: React.FC<GroupsProps> = ({query}): ReactElement => {
	// hooks
	const {dispatch} = useContext(AppContext);
	const classes = useStyles();

	const {isLoggedIn} = useAuth();
	const limit = pageSize / 2;
	const [offset, setOffset] = useState<number>(0);

	const {loading, error, data} = useWatchGroupsSubscription({
		variables: {
			offset,
			limit,
			target: query
		},
	});

	const loadingItems = useMemo((): Array<ReactNode> => {
		if (!loading)
			return [];
		const l = [];
		const size = data?.groups.results?.length ?? 2;
		for (let i = 0; i < size; i++) {
			l.push(<JumpItemSkeleton key={i}/>);
		}
		return l;
	}, [loading]);

	// hook to rebuild the index when jumps change
	const items = useMemo(() => {
		if (data == null) {
			return [];
		}
		// Loop-d-loop
		return data.groups.results.map(v => v as Group).map(g => <GroupCard
			key={g.id}
			group={g}
		/>);
	}, [data]);

	return (
		<div className={classes.root}>
			<div style={{display: "flex"}}>
				<Typography
					className={classes.title}>
					Groups
				</Typography>
				<Button
					className={classes.addButton}
					color="primary"
					disableElevation
					disabled={!isLoggedIn}
					onClick={() => dispatch(setDialog(MODAL_GROUP_NEW, true, null))}
					variant="contained">
					New group
				</Button>
			</div>
			<List>
				{loadingItems}
				{!loading && items}
			</List>
			{error != null && <Alert
				severity="error">
				Something went wrong<br/>
				{getGraphErrorMessage(error)}
			</Alert>}
			{error == null && items.length === 0 && !loading && <Alert
				severity="info">
				No groups could be found
			</Alert>}
			<Box
				sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
				{!loading && (data?.groups.count ?? 0) > items.length && <Pagination
					variant="outlined"
					color="primary"
					sx={{mt: 2}}
					count={Math.ceil((data?.groups.count ?? 0) / limit)}
					page={Math.floor(offset / limit) + 1}
					onChange={(_, page) => setOffset((page - 1) * limit)}
				/>}
			</Box>
			<CreateGroupDialog/>
			<GroupEditDialog/>
		</div>
	)
};
export default Groups;
