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

import React, {useEffect, useState} from "react";
import {CircularProgress, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Center from "react-center";
import {ImageMessage} from "jmp-coreui";
import {useNavigate} from "react-router-dom";
import {APP_NAME} from "../../../constants";
import {useJumpToQuery} from "../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	text: {
		margin: theme.spacing(2)
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
	}
}));

const jumpImages = [
	"/draw/undraw_balloons_vxx5.svg",
	"/draw/undraw_i_can_fly_7egl.svg",
	"/draw/undraw_instant_support_elxh.svg"
];

const Token: React.FC = () => {
	// hooks
	const classes = useStyles();
	const navigate = useNavigate();

	const [target, setTarget] = useState<number>(0);
	const {loading, error, data} = useJumpToQuery({
		variables: {
			target
		},
		skip: target === 0
	})

	useEffect(() => {
		if (loading || error || data == null)
			return;
		// we need to use replace rather than assign here
		// as pressing "back" would put the user into a
		// "jump" loop
		window.location.replace(data.jumpTo.location);
	}, [loading, error, data]);

	const jumpUser = () => {
		const url = new URL(window.location.href);
		const id = url.searchParams.get("id");
		if (id != null) {
			setTarget(Number(id));
			return;
		}
		navigate(`/similar?query=${url.searchParams.get("query")}`);
	};


	useEffect(() => {
		window.document.title = `${APP_NAME}`;
		jumpUser();
	}, []);

	const message = error?.toString() ?? "Jumping... You can close this window if it stays open";
	return (
		<Center className={classes.overlay}>
			<div>
				<Center>
					<ImageMessage
						src={error ? "/draw/undraw_warning_cyit.svg" : jumpImages}
						message=""
						height={256}
					/>
				</Center>
				{loading ?
					<Center>
						<CircularProgress/>
					</Center>
					:
					<div>
						<Typography
							className={classes.text}
							color="textPrimary"
							align="center">
							{message}
						</Typography>
					</div>
				}
			</div>
		</Center>
	);
};
export default Token;
