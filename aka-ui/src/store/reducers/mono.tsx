/*
 *    Copyright 2022 Django Cass
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

import React, {createContext, Dispatch, useReducer} from "react";
import {SimpleMap} from "../../types";
import {ModalActionType} from "../actions/Modal";
import {GenericActionType} from "../actions/Generic";
import {SnackbarActionType} from "../actions/snackbar";
import {JumpsActionType} from "../actions/jumps";
import modal, {Modal} from "./modal";
import generic, {GenericState, WANTED_THEME} from "./generic";
import snackbar, {SnackbarState} from "./snackbar";
import jumps, {JumpsState} from "./jumps";

interface State {
	modal: SimpleMap<Modal>;
	generic: GenericState;
	jumps: JumpsState;
	snackbar: SnackbarState;
}

const initialState: State = {
	modal: {},
	generic: {
		themeMode: WANTED_THEME,
		version: "",
		gridWidth: 0
	},
	jumps: {
		topPicks: 0
	},
	snackbar: {
		notify: []
	}
};

type RootActionType =
	ModalActionType |
	JumpsActionType |
	SnackbarActionType |
	GenericActionType;

const AppContext = createContext<{
	state: State,
	dispatch: Dispatch<RootActionType>
}>({
	state: initialState,
	dispatch: () => null
});

const AppProvider: React.FC = ({children}) => {
	const {Provider} = AppContext;

	const [state, dispatch] = useReducer((state: State, action: RootActionType): State => {
		return {
			modal: modal(state.modal, action as ModalActionType),
			generic: generic(state.generic, action as GenericActionType),
			jumps: jumps(state.jumps, action as JumpsActionType),
			snackbar: snackbar(state.snackbar, action as SnackbarActionType)
		};
	}, initialState);

	return <Provider
		value={{state, dispatch}}>
		{children}
	</Provider>;
};

export {
	AppContext,
	AppProvider
};