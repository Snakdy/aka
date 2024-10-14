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

import {Chip, CircularProgress, Theme, Typography, useTheme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, {ReactElement, ReactNode, useEffect, useMemo, useState} from "react";
import Center from "react-center";
import Icon from "@mdi/react";
import {mdiArrowRight, mdiMagnify} from "@mdi/js";
import {Link, useNavigate} from "react-router-dom";
import getErrorMessage from "../../../selectors/getErrorMessage";
import {APP_NAME} from "../../../constants";
import JumpChip from "../../../components/content/jmp/JumpChip";
import {useGetSimilarQuery} from "../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	overlay: {
		position: "fixed",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "transparent",
		pointerEvents: "none"
	},
	content: {
		pointerEvents: "initial"
	},
	searchIcon: {
		backgroundColor: theme.palette.text.disabled,
		borderRadius: "50%",
		padding: theme.spacing(3),
		margin: theme.spacing(3)
	},
	searchText: {
		color: theme.palette.text.secondary,
		marginBottom: theme.spacing(3)
	}
}));

const Similar: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const navigate = useNavigate();

	const [query, setQuery] = useState<string>("");

	const {loading, error, data} = useGetSimilarQuery({
		variables: {
			query
		}
	});

	// local state
	const items: Array<ReactNode> = useMemo(() => {
		if (data == null) {
			return [];
		}
		return data.similar.map(j => <JumpChip key={j.id} jump={j}/>);
	}, [data]);

	const status: string = useMemo(() => {
		const length = data?.similar?.length ?? 0;
		switch (length) {
			case 0:
				return "We couldn't find any matches";
			case 1:
				return "We found 1 match";
			default:
				return `We found ${length} matches`;
		}
	}, [data]);

	const getMatches = (): void => {
		const url = new URL(window.location.href);
		const q = url.searchParams.get("query");
		setQuery(q ?? "");
	};

	useEffect(() => {
		window.document.title = `Similar - ${APP_NAME}`;
		getMatches();
	}, []);

	useEffect(() => {
		if (data == null)
			return;
		if (data.similar.length !== 1)
			return;
		const item = data.similar[0];
		if (item.name !== query && !item.alias.find(a => a === query))
			return;
		// todo determine a way of distinguishing back and forward navigation
		// const entries = performance.getEntriesByType("navigation");
		// if (entries.length > 0 && (entries[0] as PerformanceNavigationTiming).type === "back_forward") {
		// 	return;
		// }
		navigate(`/jmp?query=${item.name}&id=${item.id}`);
	}, [data?.similar]);

	return (<Center className={classes.overlay}>
		<div className={classes.content}>
			{!loading && <>
				<Center>
					<Icon
						className={classes.searchIcon}
						path={mdiMagnify}
						size={1.5}
						color={theme.palette.background.default}
					/>
				</Center>
				<Center>
					<Typography
						className={`${classes.title} ${classes.searchText}`}
						variant="h6">
						{query === "" ? "You must specify a query!" : error == null ? status : getErrorMessage(error)}
					</Typography>
				</Center>
				<Center>
					<Chip
						icon={<Icon path={mdiArrowRight} color={theme.palette.primary.main} size={0.85}/>}
						component={Link}
						to="/"
						variant="outlined"
						label={
							<Typography
								className={classes.title}
								style={{fontSize: 12, fontWeight: "bold"}}
								color="textSecondary">
								Explore jumps
							</Typography>
						}
						clickable
					/>
				</Center>
			</>}
			{loading && <Center>
				<CircularProgress/>
			</Center>}
			<Center style={{padding: 16}}>
				{items}
			</Center>
		</div>
	</Center>);
};

export default Similar;
