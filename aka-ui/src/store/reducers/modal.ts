import {DeleteItemPayload, GroupUserModPayload, ModalActionType, SET_DIALOG} from "../actions/Modal";
import {SimpleMap} from "../../types";

export interface Modal {
	open: boolean;
	other: DeleteItemPayload | GroupUserModPayload | any | null;
}

export const defaultState: Modal = {
	open: false,
	other: null
};

const initialState: SimpleMap<Modal> = {};

const modal = (state = initialState, action: ModalActionType): SimpleMap<Modal> => {
	if (action.type === SET_DIALOG) {
		const {name, open, other} = action.payload;
		return {...state, [name]: {open, other}};
	}
	return state;
};
export default modal;
