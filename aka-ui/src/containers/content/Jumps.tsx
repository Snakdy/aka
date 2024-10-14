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
import React, {ReactElement, useContext, useEffect, useMemo, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {APP_NAME, APP_NOUN, pageSize} from "../../constants";
import useAuth from "../../hooks/useAuth";
import {AppContext} from "../../store/reducers/mono";
import TopPicks from "./jmp/TopPicks";
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

const Jumps: React.FC = (): ReactElement => {
	// hooks
	const {state: {jumps: {topPicks}}} = useContext(AppContext);
	const classes = useStyles();
	const navigate = useNavigate();
	const location = useLocation();

	// global state
	const {isLoggedIn} = useAuth();

	const [offset, setOffset] = useState<number>(0);

	useEffect(() => {
		window.document.title = APP_NAME;
		setOffset(() => Number(new URLSearchParams(location.search).get("offset")) || 0);
	}, [location.search]);

	const handleOffset = (v: number): void => {
		navigate({
			...location,
			search: `offset=${v}`
		});
	}
	
	const jumpCount = useMemo(() => {
		if (topPicks <= 0)
			return pageSize;
		return pageSize - (topPicks * 2);
	}, [topPicks]);


	return (
		<div>
			{isLoggedIn && <TopPicks/>}
			<Typography
				className={classes.subheader}
				color="textPrimary">
				{APP_NOUN}s
			</Typography>
			<JumpList
				offset={offset}
				onSetOffset={handleOffset}
				limit={jumpCount}
			/>
		</div>
	);
}
export default Jumps;
