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

import {OptionsObject, SnackbarMessage} from "notistack";
import getRandomValue from "../../selectors/getRandomValue";

export const ADD_SNACKBAR = "ADD_SNACKBAR";
export const CLOSE_SNACKBAR = "CLOSE_SNACKBAR";
export const REMOVE_SNACKBAR = "REMOVE_SNACKBAR";

export interface CreateSnackbar {
	message: SnackbarMessage;
	options?: OptionsObject;
}

export interface Snackbar {
	message: SnackbarMessage;
	options?: OptionsObject;
	key: string | number;
	dismissed: boolean;
}

interface AddSnackbarActionType {
	type: typeof ADD_SNACKBAR;
	payload: Snackbar;
	key?: string | number;
}

interface CloseSnackbarActionType {
	type: typeof CLOSE_SNACKBAR;
	dismissAll: boolean;
	key?: string | number | null;
}

interface RemoveSnackbarActionType {
	type: typeof REMOVE_SNACKBAR;
	key: string | number;
}

export const addSnackbar = (snackbar: CreateSnackbar): AddSnackbarActionType => {
	const key = snackbar.options?.key;
	return {
		type: ADD_SNACKBAR,
		payload: {...snackbar, dismissed: false, key: key || new Date().getTime() + getRandomValue()}
	};
};

export const closeSnackbar = (key?: string | number | null): CloseSnackbarActionType => {
	return {
		type: CLOSE_SNACKBAR,
		key: key,
		dismissAll: !key // dismiss all if no key is given
	};
};

export const removeSnackbar = (key: string | number): RemoveSnackbarActionType => {
	return {
		type: REMOVE_SNACKBAR,
		key
	};
};

export type SnackbarActionType = AddSnackbarActionType | CloseSnackbarActionType | RemoveSnackbarActionType;