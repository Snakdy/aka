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

import {clone} from "../../util";
import {Group, Jump, User} from "../../generated/graphql";

export const MODAL_JUMP_NEW = "MODAL_JUMP_NEW";
export const MODAL_JUMP_EDIT = "MODAL_JUMP_EDIT";
export const MODAL_DELETE = "MODAL_DELETE";

export const MODAL_GROUP_NEW = "MODAL_GROUP_NEW";
export const MODAL_GROUP_EDIT = "MODAL_GROUP_EDIT";

export const MODAL_USER_GROUPS = "MODAL_USER_GROUPS";

export const SET_DIALOG = "SET_DIALOG";

interface SetDialogActionType {
	type: typeof SET_DIALOG;
	payload: {
		name: string;
		open: boolean;
		other: any | null
	}
}

export interface DeleteItemPayload {
	requireApproval: boolean;
	item: Jump | Group | User | null;
	itemClass: string;
	effects?: Array<string> | null;
	deletable: boolean;
}

export interface GroupUserModPayload {
	user: User;
}

export const setDelete = (open: boolean, payload: DeleteItemPayload): SetDialogActionType => {
	return setDialog(MODAL_DELETE, open, payload);
};

export const setDialog = (name: string, open: boolean, other: any | null): SetDialogActionType => {
	return {
		type: SET_DIALOG,
		payload: {name, open, other: other == null ? null : clone(other)}
	};
};

export type ModalActionType = SetDialogActionType;