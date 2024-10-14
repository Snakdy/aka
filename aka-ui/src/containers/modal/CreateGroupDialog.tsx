import React, {ReactElement, useContext, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {ValidatedTextField} from "jmp-coreui";
import {MODAL_GROUP_NEW, setDialog} from "../../store/actions/Modal";
import {defaultState} from "../../store/reducers/modal";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import {AppContext} from "../../store/reducers/mono";
import {useCreateGroupMutation} from "../../generated/graphql";

const useStyles = makeStyles(() => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 20
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: "bold"
	}
}));

const initialName = {
	value: "",
	error: "",
	regex: /^[a-zA-Z0-9_.-]{4,}$/
};

const CreateGroupDialog: React.FC = (): ReactElement => {
	// hooks
	const {dispatch, state: {modal}} = useContext(AppContext);
	const classes = useStyles();

	// global state
	const {open} = modal[MODAL_GROUP_NEW] || defaultState;

	const [createGroup, {loading, error}] = useCreateGroupMutation();

	// local state
	const [name, setName] = useState(initialName);

	const onOpen = () => {
		setName(initialName);
	};

	const close = (): void => {
		dispatch(setDialog(MODAL_GROUP_NEW, false, null));
	};

	const handleSubmit = () => {
		createGroup({
			variables: {
				name: name.value,
				public: false
			}
		}).then(r => {
			if (r.errors == null || r.errors.length === 0)
				close();
		});
	};

	return (
		<Dialog
			open={open}
			TransitionProps={{
				onEnter: () => onOpen()
			}}
			aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">
				<Typography className={classes.title}>Add group</Typography>
			</DialogTitle>
			<DialogContent>
				<DialogContentText>Please enter the name of the group you wish to create. This name must be unique and
					can only be changed by an admin.</DialogContentText>
				<ValidatedTextField
					data={name}
					setData={setName}
					invalidLabel="Name must be at least 4 characters or _.-"
					fieldProps={{
						required: true,
						autoFocus: true,
						margin: "dense",
						id: "name",
						label: "Name",
						fullWidth: true,
						variant: "outlined",
						size: "small"
					}}
				/>
				{error && <Typography variant="caption" color="error">{getGraphErrorMessage(error)}</Typography>}
			</DialogContent>
			<DialogActions>
				<Button
					className={classes.button}
					color="secondary"
					onClick={close}
					disabled={loading}>
					Cancel
				</Button>
				<Button
					className={classes.button}
					color="primary"
					onClick={handleSubmit}
					disabled={name.error !== "" || !name.value.length || loading}>
					Create
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default CreateGroupDialog;
