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
import React, {ReactElement, ReactNode, useMemo, useState} from "react";
import {pageSize} from "../../../constants";
import JumpItemSkeleton from "../../../components/content/jmp/JumpItemSkeleton";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import UserGroupsDialog from "../../modal/UserGroupsDialog";
import {User, useWatchUsersSubscription} from "../../../generated/graphql";
import UserCard from "./profile/UserCard";

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

interface UsersProps {
	query: string;
}

const Users: React.FC<UsersProps> = ({query}): ReactElement => {
	// hooks
	const classes = useStyles();

	const limit = pageSize / 2;
	const [offset, setOffset] = useState(0);

	const {loading, error, data} = useWatchUsersSubscription({
		variables: {
			offset,
			limit,
			target: query
		}
	});

	// local state
	const loadingItems = useMemo((): Array<ReactNode> => {
		if (!loading)
			return [];
		const l = [];
		const size = data?.users?.count ?? 2;
		for (let i = 0; i < size; i++) {
			l.push(<JumpItemSkeleton key={i}/>);
		}
		return l;
	}, [loading]);

	const items = useMemo(() => {
		if (data == null) {
			return [];
		}
		// Loop-d-loop
		return data.users.results.map(u => <UserCard
			key={(u as User).id}
			user={u as User}
		/>);
	}, [data]);

	return (
		<div className={classes.root}>
			<div style={{display: "flex"}}>
				<Typography
					className={classes.title}>
					Users
				</Typography>
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
				No users could be found
			</Alert>}
			<Box
				sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
				{!loading && (data?.users.count ?? 0) > items.length && <Pagination
					variant="outlined"
					color="primary"
					sx={{mt: 2}}
					count={Math.ceil((data?.users.count ?? 0) / limit)}
					page={Math.floor(offset / limit) + 1}
					onChange={(_, page) => setOffset((page - 1) * limit)}
				/>}
			</Box>
			<UserGroupsDialog/>
		</div>
	);
}
export default Users;
