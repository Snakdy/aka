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
 */

import {Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import React, {ReactElement, useEffect} from "react";
import {useParams} from "react-router-dom";
import {APP_NAME, APP_NOUN} from "../../constants";
import JumpList from "./jmp/JumpList";

const useStyles = makeStyles((theme: Theme) => ({
	subheader: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 18,
		padding: theme.spacing(1),
		paddingLeft: theme.spacing(3)
	}
}));

const JumpSearch: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();

	// global state
	const params = useParams();

	useEffect(() => {
		window.document.title = `${APP_NAME} - "${params["query"]}"`;
	}, [params]);


	return (
		<div>
			<Typography
				className={classes.subheader}
				color="textPrimary">
				{APP_NOUN}s
			</Typography>
			<JumpList
				query={params["query"]}
			/>
		</div>
	);
};
export default JumpSearch;
