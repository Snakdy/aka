import React, {ReactElement, useContext, useState} from "react";
import {
	Button,
	Checkbox,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControlLabel,
	Typography
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {ValidatedTextField} from "jmp-coreui";
import {MODAL_GROUP_EDIT, setDialog} from "../../store/actions/Modal";
import {defaultState} from "../../store/reducers/modal";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import {AppContext} from "../../store/reducers/mono";
import {usePatchGroupMutation} from "../../generated/graphql";

const useStyles = makeStyles(() => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 20
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: "bold"
	},
	formControl: {
		marginTop: 1,
		minWidth: 250
	}
}));

const initialName = {
	value: "",
	error: "",
	regex: /^[a-zA-Z0-9_.-]{4,}$/
};

const initialOwner = {
	value: "",
	error: "",
	regex: /^[^\/]+\/[^\/]+$/
};

const GroupEditDialog: React.FC = (): ReactElement => {
	// hooks
	const {dispatch, state: {modal}} = useContext(AppContext);
	const [patchGroup, {loading, error}] = usePatchGroupMutation();
	const classes = useStyles();

	// selectors
	const {other, open} = modal[MODAL_GROUP_EDIT] || defaultState;

	const group = other?.group || {};


	const [name, setName] = useState(initialName);
	const [owner, setOwner] = useState(initialOwner);
	const [isPublic, setIsPublic] = useState(group.public || false);

	const [originalOwner, setOriginalOwner] = useState<string>(group.owner || "");

	const close = () => dispatch(setDialog(MODAL_GROUP_EDIT, false, null));

	const onOpen = () => {
		setName(ini => ({...ini, value: group.name}));
		setIsPublic(() => group.public || false);
		setOwner(ini => ({...ini, value: group.owner}));
		setOriginalOwner(() => group.owner);
	};

	const onSubmit = () => {
		patchGroup({
			variables: {
				id: group.id,
				public: isPublic,
				owner: owner.value === originalOwner ? "" : owner.value
			}
		}).then(r => {
			if (r.errors == null || r.errors.length === 0)
				close();
		});
	};

	return (
		<Dialog
			open={open}
			aria-labelledby="form-dialog-title"
			TransitionProps={{
				onEnter: () => onOpen(),
				onExited: () => close()
			}}
			maxWidth="sm"
			fullWidth>
			<DialogTitle id="form-dialog-title">
				<Typography className={classes.title}>Edit group</Typography>
			</DialogTitle>
			<DialogContent>
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
				<ValidatedTextField
					data={owner}
					setData={setOwner}
					invalidLabel="Owner must be in full issuer/subject format."
					fieldProps={{
						required: false,
						autoFocus: false,
						margin: "dense",
						id: "owner",
						label: "Owner",
						fullWidth: true,
						variant: "outlined",
						size: "small"
					}}
				/>
				<FormControlLabel
					style={{width: "100%"}}
					control={
						<Checkbox
							checked={group && isPublic}
							onChange={(e) => setIsPublic(e.target.checked)}
						/>
					}
					label="Public"
				/>
				{error && <Typography variant="caption" color="error">{getGraphErrorMessage(error)}</Typography>}
			</DialogContent>
			<DialogActions>
				<Button
					className={classes.button}
					color="secondary"
					onClick={() => close()}>
					Cancel
				</Button>
				<Button
					className={classes.button}
					color="primary"
					onClick={() => onSubmit()}
					disabled={name.error !== "" || loading || name.value.length === 0}>
					{owner.value === originalOwner ? "Update" : "Update and change owner"}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default GroupEditDialog;
