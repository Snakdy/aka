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

import {JumpsActionType, SET_JUMP_EXPAND, SET_JUMP_TOP_PICKS} from "../actions/jumps";

export interface JumpsState {
	expanded?: string | null;
	topPicks: number;
}

const initialState: JumpsState = {
	expanded: null,
	topPicks: 0
};

const jumps = (state = initialState, action: JumpsActionType): JumpsState => {
	switch (action.type) {
		case SET_JUMP_TOP_PICKS:
			return {...state, topPicks: action.payload};
		case SET_JUMP_EXPAND: {
			const {payload} = action;
			return {...state, expanded: state.expanded === payload ? null : payload};
		}
		default:
			return state;
	}
}
export default jumps;
