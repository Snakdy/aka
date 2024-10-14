/*
 *    Copyright 2021 Django Cass
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

import List from "@mui/material/List";
import {Alert, Box, Pagination, Theme} from "@mui/material";
import {ImageMessage} from "jmp-coreui";
import React, {ReactElement, ReactNode, useMemo} from "react";
import makeStyles from "@mui/styles/makeStyles";
import {pageSize} from "../../../constants";
import JumpItemSkeleton from "../../../components/content/jmp/JumpItemSkeleton";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {Jump, useGetJumpsSubscription} from "../../../generated/graphql";
import JumpItem from "./JumpItem";

const useStyles = makeStyles((theme: Theme) => ({
	alert: {
		marginLeft: theme.spacing(3),
		marginRight: theme.spacing(3),
		marginBottom: theme.spacing(1),
		borderRadius: theme.spacing(1.5)
	},
	list: {
		borderRadius: 12,
		marginBottom: 8
	}
}));

const emptyImages = [
	"/draw/undraw_no_data_qbuo.svg",
	"/draw/undraw_lost_bqr2.svg",
	"/draw/undraw_empty_xct9.svg"
];

interface JumpListProps {
	offset?: number;
	limit?: number;
	query?: string;
	onSetOffset?: (v: number) => void;
}

const JumpList: React.FC<JumpListProps> = ({
	offset = 0,
	limit = pageSize,
	query = "",
	onSetOffset
}): ReactElement => {
	// hooks
	const classes = useStyles();
	const {loading, error, data} = useGetJumpsSubscription({
		variables: {
			offset: offset,
			limit: limit,
			target: query
		}
	});

	const jumps: Array<ReactNode> = useMemo(() => {
		if (data == null)
			return [];
		// Loop-d-loop
		return data.jumps.results.map(i => <JumpItem jump={i as Jump} key={(i as Jump).id}/>);
	}, [data]);

	const lData: Array<ReactNode> = useMemo(() => {
		if (!loading)
			return [];
		const l = [];
		const size = data?.jumps?.results?.length ?? limit;
		for (let i = 0; i < size; i++) {
			l.push(<JumpItemSkeleton key={i}/>);
		}
		return l;
	}, [loading]);

	return <div className={classes.list}>
		<List>
			{error && <Alert
				className={classes.alert}
				severity="error">
				{getGraphErrorMessage(error)}
			</Alert>}
			{!loading && jumps}
			{loading && <>
				{lData}
			</>}
			{!error && jumps.length === 0 && !loading && <ImageMessage
				src={emptyImages}
				message="Nothing could be found"
			/>}
			<Box
				sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
				{!loading && (data?.jumps.count ?? 0) > jumps.length && <Pagination
					variant="outlined"
					color="primary"
					sx={{mt: 2}}
					count={Math.ceil((data?.jumps.count ?? 0) / limit)}
					page={Math.floor(offset / limit) + 1}
					onChange={(_, page) => onSetOffset?.((page - 1) * limit)}
				/>}
			</Box>
		</List>
	</div>;
};
export default JumpList;
