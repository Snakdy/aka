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

import {
	Chip,
	Grow,
	ListItemButton,
	ListItemSecondaryAction,
	ListItemText,
	Popover,
	Theme,
	Typography,
	useMediaQuery,
	useTheme
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {mdiAccount, mdiAccountGroup, mdiCallMerge} from "@mdi/js";
import React, {ReactElement, ReactNode, useContext, useState} from "react";
import {Link} from "react-router-dom";
import Icon from "@mdi/react";
import JumpAvatar from "../../../components/content/jmp/JumpAvatar";
import {setJumpExpand} from "../../../store/actions/jumps";
import {ICON_URL} from "../../../constants";
import Domain from "../../../components/widget/Domain";
import usePalette from "../../../hooks/usePalette";
import {AppContext} from "../../../store/reducers/mono";
import {Jump, ResourceOwner} from "../../../generated/graphql";
import JumpContent from "./JumpContent";

const useStyles = makeStyles((theme: Theme) => ({
	item: {
		borderRadius: 12
	},
	itemAction: {
		pointerEvents: "none"
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		color: theme.palette.text.primary
	},
	subtitle: {
		color: theme.palette.text.disabled
	},
	action: {
		float: "right"
	}
}));

interface JumpItemProps {
	jump: Jump;
}

const JumpItem: React.FC<JumpItemProps> = ({jump}: JumpItemProps): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme<Theme>();

	// global state
	const {state: {jumps: {expanded}}, dispatch} = useContext(AppContext);
	const [mouse, setMouse] = useState<boolean>(false);
	const {data, loading, error} = usePalette(`${ICON_URL}/icon?site=${jump.location}`);

	// local state
	const [mousePos, setMousePos] = useState<{
		x: number | null;
		y: number | null;
	}>({x: null, y: null});

	const contextOpen = (): boolean => {
		return mousePos.x != null && mousePos.y != null;
	}

	// misc data
	const selected = expanded === jump.id || contextOpen();
	const smallScreen = useMediaQuery(theme.breakpoints.down("md"));

	const getAliases = (): ReactElement => {
		if (jump.alias == null || jump.alias.length === 0) return <div/>;
		return <small
			className={classes.subtitle}>
			&nbsp;&bull;&nbsp;AKA&nbsp;{jump.alias.join(", ")}
		</small>;
	};

	const primary = (
		<>
			<span className={classes.title}>
				{jump.name}
			</span>
			<Grow
				in={selected || mouse}>
				{getAliases()}
			</Grow>
		</>
	);

	const getOwnerName = (owner: ResourceOwner): ReactNode => {
		if (owner.group !== "") {
			return <span>
				{owner.group}
				<Icon
					style={{marginLeft: 4}}
					path={mdiAccountGroup}
					size={0.5}
				/>
			</span>
		}
		return <span>
			{owner.user}
			<Icon
				style={{marginLeft: 4}}
				path={mdiAccount}
				size={0.5}
			/>
		</span>
	};

	// generate the secondary text and add the owner (if it exists)
	const secondary = (): ReactElement => {
		const isOwned = jump.owner.user !== "" || jump.owner.group !== "";
		return <span>
			<Domain text={jump.location}/>
			{isOwned && <span>
				&nbsp;&bull;&nbsp;{getOwnerName(jump.owner)}
			</span>}
		</span>;
	}

	// noinspection JSUnusedGlobalSymbols
	const focusProps = {
		onMouseEnter: () => setMouse(true),
		onMouseLeave: () => setMouse(false)
	};

	const onContext = (e: React.MouseEvent<HTMLElement>): void => {
		e.preventDefault();
		setMousePos({
			x: e.clientX - 2,
			y: e.clientY - 4
		});
	};

	const onClose = (): void => {
		setMousePos({x: null, y: null});
	}

	return (
		<div>
			<ListItemButton
				className={classes.item}
				selected={selected}
				onContextMenu={onContext}
				onClick={() => dispatch(setJumpExpand(jump.id))}
				{...focusProps}>
				<JumpAvatar
					jump={jump}
					colour={data}
					loading={loading}
					error={error || null}
				/>
				<ListItemText
					primary={primary}
					secondary={secondary()}
				/>
				<ListItemSecondaryAction>
					<Grow
						in={mouse || selected || smallScreen}>
						<Chip
							icon={<Icon path={mdiCallMerge} color={theme.palette.primary.main} size={0.85}/>}
							component={Link}
							to={`/jmp?query=${jump.name}&id=${jump.id}`}
							variant="outlined"
							label={
								<Typography
									className={classes.title}
									style={{fontSize: 12, fontWeight: "bold"}}
									color="textSecondary">
									Open
								</Typography>
							}
							clickable
							{...focusProps}
						/>
					</Grow>
				</ListItemSecondaryAction>
			</ListItemButton>
			<Popover
				anchorReference="anchorPosition"
				anchorPosition={
					contextOpen()
						? {top: mousePos.y ?? 0, left: mousePos.x ?? 0}
						: undefined
				}
				onClose={onClose}
				open={contextOpen()}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left"
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left"
				}}>
				<JumpContent
					focusProps={focusProps}
					jump={jump}
					colour={data}
					loading={loading}
					error={error}
				/>
			</Popover>
		</div>
	);
};
export default JumpItem;