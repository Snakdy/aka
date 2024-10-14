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

export const SET_THEME_MODE = "SET_THEME_MODE";
export const SET_GRID_WIDTH = "SET_GRID_WIDTH";

interface SetThemeModeActionType {
	type: typeof SET_THEME_MODE;
	payload: string;
}

interface SetGridWidthActionType {
	type: typeof SET_GRID_WIDTH;
	payload: number;
}

export const setThemeMode = (theme: string): SetThemeModeActionType => {
	return {
		type: SET_THEME_MODE,
		payload: theme
	};
};

export const setGridWidth = (width: number): SetGridWidthActionType => {
	return {
		type: SET_GRID_WIDTH,
		payload: width
	};
};

export type GenericActionType = SetThemeModeActionType
	| SetGridWidthActionType;