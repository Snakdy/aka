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

import {ADD_SNACKBAR, CLOSE_SNACKBAR, REMOVE_SNACKBAR, Snackbar, SnackbarActionType} from "../actions/snackbar";

export interface SnackbarState {
	notify: Array<Snackbar>;
}

const initialState: SnackbarState = {
	notify: []
};

const snackbar = (state = initialState, action: SnackbarActionType): SnackbarState => {
	switch (action.type) {
		case ADD_SNACKBAR:
			return {...state, notify: [...state.notify, action.payload]};
		case CLOSE_SNACKBAR:
			return {
				...state,
				notify: state.notify.map(n => (action.dismissAll || n.key === action.key) ? {
					...n,
					dismissed: true
				} : {...n})
			};
		case REMOVE_SNACKBAR:
			return {...state, notify: state.notify.filter(n => n.key !== action.key)};
		default:
			return state;
	}
}
export default snackbar;
