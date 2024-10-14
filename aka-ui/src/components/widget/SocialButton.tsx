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

import * as React from "react";
import {ReactElement, useMemo} from "react";
import {Button, Theme} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Icon from "@mdi/react";
import {useTheme} from "@mui/material/styles";

const useStyles = makeStyles((theme: Theme) => ({
	button: {
		fontFamily: "Manrope",
		fontWeight: 500,
		margin: 4,
		// the below 2 should be merged in some way
		backgroundColor: theme.palette.mode === "dark" ? theme.palette.secondary.main : theme.palette.background.default,
		color: theme.palette.getContrastText(theme.palette.mode === "dark" ? theme.palette.secondary.main : theme.palette.background.default),
		textTransform: "capitalize"
	},
	icon: {
		paddingLeft: 8,
		paddingRight: 8
	},
	text: {
		paddingLeft: 8
	}
}));

interface SocialButtonProps {
	url: string;
	colour: string;
	name: string;
	icon: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({url, colour, name, icon}: SocialButtonProps): ReactElement => {
	const {palette} = useTheme();
	const classes = useStyles();

	const variant = useMemo(() => palette.mode === "dark" ? "contained" : "text", [palette.mode]);

	return (
		<Button href={url} className={classes.button} variant={variant}>
			<Icon className={classes.icon} path={icon} size="1.5rem" color={colour}/>
			{name}
		</Button>
	);
};
export default SocialButton;
