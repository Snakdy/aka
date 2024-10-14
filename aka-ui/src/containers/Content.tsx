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

import React, {ReactElement, useContext, useEffect, useRef} from "react";
import {Grid, Theme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {Route, Routes} from "react-router-dom";
import {setGridWidth} from "../store/actions/Generic";
import useWindowSize from "../hooks/useWindowSize";
import {AppContext} from "../store/reducers/mono";
import NotFound from "./content/NotFound";
import Logout from "./content/Logout";
import Token from "./content/jmp/Token";
import Similar from "./content/jmp/Similar";
import Settings from "./content/Settings";
import Help from "./content/Help";
import Jumps from "./content/Jumps";
import JumpEditDialog from "./modal/JumpEditDialog";
import DeleteDialog from "./modal/DeleteDialog";
import Identity from "./content/Identity";
import JumpSearch from "./content/JumpSearch";
import CreateJumpForm from "./content/forms/CreateJumpForm";

const useStyles = makeStyles((theme: Theme) => ({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		marginTop: 64
	},
	centered: {
		flex: 1,
		justifyContent: "center"
	},
	padding: {
		display: "none",
		[theme.breakpoints.up("sm")]: {
			display: "initial"
		}
	}
}));

const Content: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const {dispatch} = useContext(AppContext);
	const dimensions = useWindowSize();
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!gridRef.current)
			return;
		dispatch(setGridWidth(gridRef.current.offsetWidth));
	}, [gridRef, gridRef.current?.offsetWidth, dimensions]);

	return (
		<div className={classes.container}>
			<Grid container spacing={0} className={classes.centered}>
				<Grid item xs={false} sm={3} lg={2} className={classes.padding}/>
				<Grid item xs={12} sm={6} lg={4} ref={gridRef}>
					<Routes>
						<Route path="/" element={<Jumps/>} key="jumps"/>
						<Route path="/search/:query" element={<JumpSearch/>}/>
						<Route path="/identity" element={<Identity/>} key="identity"/>
						<Route path="/identity/:query" element={<Identity/>} key="identity"/>
						<Route path="/jmp" element={<Token/>} key="token"/>
						<Route path="/similar" element={<Similar/>} key="similar"/>
						<Route path="/logout" element={<Logout/>} key="logout"/>
						<Route path="/settings" element={<Settings/>} key="settings"/>
						<Route path="/help" element={<Help/>} key="help"/>
						<Route path="/new/jump" element={<CreateJumpForm/>} key="new-jump"/>
						<Route path={"/*"} element={<NotFound/>} key="notfound"/>
					</Routes>
				</Grid>
				<Grid item xs={false} sm={3} lg={2} className={classes.padding}/>
			</Grid>
			<JumpEditDialog/>
			<DeleteDialog/>
		</div>
	);
};
export default Content;
