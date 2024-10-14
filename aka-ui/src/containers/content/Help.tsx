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

import React, {ReactElement, ReactNode, useEffect, useState} from "react";
import {Collapse, ListItemButton, ListItemSecondaryAction, Paper, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Center from "react-center";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import Icon from "@mdi/react";
import {mdiChevronDown, mdiChevronUp} from "@mdi/js";
import ListItemText from "@mui/material/ListItemText";
import {useTheme} from "@mui/material/styles";
import {useLocation, useNavigate} from "react-router-dom";
import getHelpCardColour from "../../selectors/getHelpCardColour";
import {APP_NAME, APP_NOUN} from "../../constants";
import BrowserGuide from "./help/BrowserGuide";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500
	},
	name: {
		fontFamily: "Manrope",
		fontWeight: 500,
		color: theme.palette.primary.main,
		margin: theme.spacing(2)
	},
	avatar: {
		width: 56,
		height: 56,
		borderRadius: 100,
		margin: 24,
		padding: 6,
		backgroundColor: theme.palette.background.default
	},
	content: {
		padding: 16,
		borderRadius: 12,
		color: theme.palette.text.primary
	},
	item: {
		borderRadius: 12
	},
	itemAction: {
		pointerEvents: "none"
	}
}));

interface QnA {
	id: string;
	q: string;
	a: string | ReactNode;
}

const Help: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme<Theme>();
	const navigate = useNavigate();
	const location = useLocation();

	// local state
	const [expand, setExpand] = useState<string | null>(null);
	const [data, setData] = useState<Array<ReactNode>>([]);
	const [qna] = useState<Array<QnA>>([
		{
			id: "browser-setup",
			q: "Browser setup guides",
			a: <BrowserGuide/>
		},
		{
			id: "http-urls",
			q: "Why are some URLs red?",
			a: <span>HTTP URLs are marked as red to communicate their lack of security. HTTP websites are being phased out all across the internet and your browser probably already shows warnings.<br/><br/>The red highlight is only a warning and doesn't interfere with your ability to access them, however the site wont be indexed and will likely be missing metadata (e.g. title and favicon).</span>
		},
		{
			id: "login-expiration",
			q: `Why can't I access my personal or group ${APP_NOUN}s sometimes?`,
			a: <span>Your login only persists for a set period of time, once it expires you won't be able to access your personal/group {APP_NOUN}s until you login again.</span>
		},
		{
			id: "global-jumps",
			q: `Why can't I create global ${APP_NOUN}s?`,
			a: <span>Creating global {APP_NOUN}s is a privilege given only to Admins. Contact your local SysAdmin if you need your account upgraded.</span>
		},
		{
			id: "group-jumps",
			q: `How do I share a ${APP_NOUN} with select users?`,
			a: <span>Create a Group! When you next create a {APP_NOUN}, set the type to <code>Group</code> and select the Group containing your users.<br/>The only people who will be able to use this {APP_NOUN} will be the users in the group.</span>
		}
	]);

	useEffect(() => {
		const {hash} = location;
		if (!hash) {
			setExpand(null);
			return;
		}
		setExpand(hash.substring(1, hash.length));
	}, [location]);

	useEffect(() => {
		// set the appropriate colours for the card-content
		const card = {
			backgroundColor: getHelpCardColour(theme)
		};
		setData(qna.map(i => {
			return (
				<div key={i.id}>
					<ListItemButton
						className={classes.item}
						value={i.id}
						onClick={() => toggleExpansion(i.id)}
						component="li">
						<ListItemText
							primary={<span
								className={classes.title}
								style={{color: theme.palette.text.primary}}>
								{i.q}
							</span>}
						/>
						<ListItemSecondaryAction className={classes.itemAction}>
							<Icon
								path={i.id === expand ? mdiChevronUp : mdiChevronDown} size={1}
								color={theme.palette.text.disabled}/>
						</ListItemSecondaryAction>
					</ListItemButton>
					<Collapse in={i.id === expand} unmountOnExit timeout="auto">
						<div
							className={classes.content}
							style={card}>
							{i.a}
						</div>
					</Collapse>
				</div>
			);
		}));
	}, [qna, expand]);

	const toggleExpansion = (id: string): void => {
		navigate(`#${id === expand ? "" : id}`);
	};

	return (
		<>
			<Center>
				<Avatar
					className={classes.avatar}
					component={Paper}
					src="/jmp2.png"
					alt={APP_NAME}
				/>
			</Center>
			<Center>
				<img height={192} src="/draw/undraw_circles_y7s2.svg" alt=""/>
			</Center>
			<Center>
				<Typography variant="h4" className={classes.name}>Need a hand?</Typography>
			</Center>
			<List component="ul">
				{data}
			</List>
		</>
	);
};
export default Help;
