/*
 *    Copyright 2020 Django Cass
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

import React, {ReactElement, useContext} from "react";
import {Avatar, Typography, useTheme} from "@mui/material";
import Icon from "@mdi/react";
import {mdiAccountGroupOutline, mdiEarth, mdiEyeOff, mdiPencilOutline} from "@mdi/js";
import {GenericIconButton} from "jmp-coreui";
import getAvatarScheme from "../../../../style/getAvatarScheme";
import {MODAL_GROUP_EDIT, setDialog} from "../../../../store/actions/Modal";
import getIconColour from "../../../../style/getIconColour";
import {AppContext} from "../../../../store/reducers/mono";
import {getDisplayName, plural} from "../../../../util";
import useAuth from "../../../../hooks/useAuth";
import {ResourceNameGroup} from "../../../../graph/useCanI";
import {Group, useCanIQuery, Verb} from "../../../../generated/graphql";
import IdentityCard from "./IdentityCard";

interface GroupCardProps {
	group: Group;
}

const GroupCard: React.FC<GroupCardProps> = ({group}): ReactElement => {
	// hooks
	const theme = useTheme();
	const {dispatch} = useContext(AppContext);
	const {user} = useAuth();
	const canEdit = useCanIQuery({variables: {action: Verb.Update, resource: `${ResourceNameGroup}://${group.id}`}});

	// get the colour scheme
	const scheme = getAvatarScheme(theme, 0);
	const isOwner = group.owner === `${user?.issuer ?? ""}/${user?.subject ?? ""}`;


	const avatar = (
		<Avatar
			sx={{backgroundColor: scheme[0], color: scheme[1]}}>
			<Icon
				path={mdiAccountGroupOutline}
				size={1}
				color={scheme[1]}
			/>
		</Avatar>
	);

	const secondary = group.public ?
		["Public", mdiEarth, theme.palette.primary.main]
		: ["Private", mdiEyeOff, theme.palette.secondary.main];

	const primary = (
		<Typography
			color="textPrimary">
			{group.name}
		</Typography>
	);

	const actions = (<>
		<GenericIconButton
			title={secondary[0]}
			icon={secondary[1]}
			colour={secondary[2]}
			disabled
		/>
		{canEdit.data?.authCanI && !group.name.startsWith("_") && !group.external && <GenericIconButton
			title="Edit group"
			icon={mdiPencilOutline}
			colour={getIconColour(theme)}
			onClick={() => dispatch(setDialog(MODAL_GROUP_EDIT, true, {group}))}
		/>}
	</>);

	return <IdentityCard
		avatar={avatar}
		primary={primary}
		secondary={`Owned by ${isOwner ? "you" : getDisplayName(group.owner)} • ${group.users.length} ${plural(group.users.length, "user")}`}
		actions={actions}
	/>;
};
export default GroupCard;
