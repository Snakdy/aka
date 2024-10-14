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

import {Alert, AlertTitle, Card, Divider, LinearProgress, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import List from "@mui/material/List";
import React, {ReactElement, useContext, useEffect} from "react";
import TopPick from "../../../components/content/jmp/TopPick";
import {getGraphErrorMessage} from "../../../selectors/getErrorMessage";
import {useGetTopPicksQuery} from "../../../generated/graphql";
import {AppContext} from "../../../store/reducers/mono";
import {setJumpTopPicks} from "../../../store/actions/jumps";

const useStyles = makeStyles((theme: Theme) => ({
	subheader: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 18,
		padding: theme.spacing(1),
		paddingLeft: theme.spacing(3)
	},
	picksCard: {
		margin: theme.spacing(3),
		borderRadius: theme.spacing(1.5)
	}
}));

const TopPicks: React.FC = (): ReactElement => {
	// hooks
	const {dispatch} = useContext(AppContext);
	const classes = useStyles();
	const {loading, error, data} = useGetTopPicksQuery({
		variables: {
			amount: 2
		}
	});

	const length = data?.topPicks?.length ?? 0;

	useEffect(() => {
		dispatch(setJumpTopPicks(length));
	}, [length]);

	return <div>
		{(length > 0 || error != null) && <Typography
			className={classes.subheader}
			color="textPrimary">
			Top picks
		</Typography>}
		{loading && <LinearProgress/>}
		{(data != null && data.topPicks.length > 0 && error == null) && <Card
			className={classes.picksCard}
			variant="outlined">
			<List>
				{data.topPicks.map((j, idx) => <React.Fragment key={j.id}>
					<TopPick
						key={j.id}
						jump={j}
					/>
					{idx < (length - 1) && <Divider id={`divider-${j.id}`}/>}
				</React.Fragment>)}
			</List>
		</Card>}
		{error != null && <Alert
			className={classes.picksCard}
			severity="error">
			<AlertTitle>
				Failed to load top picks
			</AlertTitle>
			{getGraphErrorMessage(error)}
		</Alert>}
	</div>;
};
export default TopPicks;
