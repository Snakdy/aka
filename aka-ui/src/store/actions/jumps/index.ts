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

export const SET_JUMP_EXPAND = "SET_JUMP_EXPAND";
export const SET_JUMP_TOP_PICKS = "SET_JUMP_TOP_PICKS";

export interface SetJumpExpandActionType {
	type: typeof SET_JUMP_EXPAND;
	payload: string | null;
}

export interface SetJumpTopPicksActionType {
	type: typeof SET_JUMP_TOP_PICKS;
	payload: number;
}

export const setJumpExpand = (id: string | null): SetJumpExpandActionType => {
	return {
		type: SET_JUMP_EXPAND,
		payload: id
	};
};

export const setJumpTopPicks = (n: number): SetJumpTopPicksActionType => {
	return {
		type: SET_JUMP_TOP_PICKS,
		payload: n
	};
};

export type JumpsActionType =
	| SetJumpTopPicksActionType
	| SetJumpExpandActionType;