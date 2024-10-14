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

import React, {ReactElement, useContext} from "react";
import {Card, CardContent, MenuItem, MenuList, Theme, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {MODAL_JUMP_EDIT, setDelete, setDialog} from "../../../store/actions/Modal";
import {APP_NOUN} from "../../../constants";
import useAuth from "../../../hooks/useAuth";
import JumpAvatar from "../../../components/content/jmp/JumpAvatar";
import {AppContext} from "../../../store/reducers/mono";
import {ResourceNameJump} from "../../../graph/useCanI";
import {Jump, useCanIQuery, Verb} from "../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	titleContainer: {
		display: "flex",
		alignItems: "center"
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 400
	},
	subtitle: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 12,
		color: theme.palette.text.primary
	},
	deleteItem: {
		color: theme.palette.error.main
	}
}));

interface JumpContentProps {
	jump: Jump;
	focusProps: object;
	colour: string;
	loading?: boolean;
	error?: any | null;
}

const JumpContent: React.FC<JumpContentProps> = ({jump, colour, loading = false, error = null}): ReactElement => {
	// hooks
	const {dispatch} = useContext(AppContext);
	const classes = useStyles();

	const {isLoggedIn} = useAuth();
	const canEdit = useCanIQuery({variables: {action: Verb.Update, resource: `${ResourceNameJump}://${jump.id}`}});
	const canDelete = useCanIQuery({variables: {action: Verb.Delete, resource: `${ResourceNameJump}://${jump.id}`}});

	const canCopy = document.queryCommandSupported("copy");

	return (
		<div>
			<Card
				variant="outlined">
				<CardContent>
					<div
						className={classes.titleContainer}>
						<JumpAvatar jump={jump} colour={colour} loading={loading} error={error}/>
						<Typography
							className={classes.title}
							style={{color: colour}}
							variant="h5"
							component="h2">
							{jump.name}
						</Typography>
					</div>
					<Typography color="textSecondary">
						{jump.title}
					</Typography>
				</CardContent>
			</Card>
			<MenuList>
				<MenuItem
					disabled={!canCopy}
					onClick={() => navigator.clipboard.writeText(jump.location).then()}>
					Copy URL{!canCopy && " - Unsupported"}
				</MenuItem>
				{(isLoggedIn && canEdit.data?.authCanI) && <MenuItem
					onClick={() => dispatch(setDialog(
						MODAL_JUMP_EDIT,
						true,
						{jump}
					))}>
					Edit
				</MenuItem>}
				{(isLoggedIn && canDelete.data?.authCanI) && <MenuItem
					className={classes.deleteItem}
					onClick={() => dispatch(setDelete(
						true,
						{
							deletable: true,
							item: jump,
							requireApproval: jump.owner.user === "" && jump.owner.group === "",
							itemClass: APP_NOUN,
							effects: [
								`The ${APP_NOUN.toLocaleLowerCase()} is removed and cannot be restored`,
								"If it was shared to a group or made public, it is now inaccessible to all users"
							]
						}))}>
					Delete
				</MenuItem>}
			</MenuList>
		</div>
	);
};
export default JumpContent;
