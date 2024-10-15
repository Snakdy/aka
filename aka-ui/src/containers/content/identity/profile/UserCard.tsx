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

import React, {ReactElement, useContext, useMemo} from "react";
import {Typography, useTheme} from "@mui/material";
import {GenericIconButton} from "jmp-coreui";
import {mdiAccountGroupOutline} from "@mdi/js";
import {getSubjectName} from "../../../../util";
import UserAvatar from "../../../../components/identity/UserAvatar";
import {MODAL_USER_GROUPS, setDialog} from "../../../../store/actions/Modal";
import useAuth from "../../../../hooks/useAuth";
import {AppContext} from "../../../../store/reducers/mono";
import {User} from "../../../../generated/graphql";
import IdentityCard from "./IdentityCard";

interface UserCardProps {
	user: User;
}

const UserCard: React.FC<UserCardProps> = ({user}): ReactElement => {
	// hooks
	const {dispatch} = useContext(AppContext);
	const theme = useTheme();
	const auth = useAuth();

	// local state
	const displayName = useMemo(() => getSubjectName(user.subject), [user]);

	const avatar = (
		<UserAvatar
			text={displayName}
			src=""
		/>
	);

	const primary = (
		<Typography
			color="textPrimary">
			{displayName}
		</Typography>
	);

	const actions = (<>
		{auth.user?.subject !== user.subject && <GenericIconButton
			title="View or modify Groups"
			icon={mdiAccountGroupOutline}
			colour={theme.palette.text.secondary}
			onClick={() => dispatch(setDialog(MODAL_USER_GROUPS, true, user.subject))}
		/>}
	</>);

	return (
		<IdentityCard
			avatar={avatar}
			primary={primary}
			secondary={"TODO"}
			actions={actions}
		/>
	);
};
export default UserCard;
