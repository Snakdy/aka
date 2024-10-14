import React, {ReactElement, useContext, useState} from "react";
import {
	Button,
	Checkbox,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemSecondaryAction,
	ListItemText,
	Typography
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {MODAL_USER_GROUPS, setDialog} from "../../store/actions/Modal";
import {defaultState} from "../../store/reducers/modal";
import {getGraphErrorMessage} from "../../selectors/getErrorMessage";
import {AppContext} from "../../store/reducers/mono";
import {Group, useWatchGroupsSubscription} from "../../generated/graphql";

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

const UserGroupsDialog: React.FC = (): ReactElement => {
	// hooks
	const {dispatch, state: {modal}} = useContext(AppContext);
	const classes = useStyles();

	// global state
	const {open, other} = modal[MODAL_USER_GROUPS] || defaultState;

	// local state
	const [username, setUsername] = useState<string>("");

	const {data, error, loading} = useWatchGroupsSubscription({
		variables: {
			offset: 0,
			limit: 10,
			target: ""
		}
	});

	const close = (): void => {
		dispatch(setDialog(MODAL_USER_GROUPS, false, null));
	};

	const onOpen = (): void => {
		setUsername(() => other as string);
	};

	return (
		<Dialog
			open={open}
			TransitionProps={{
				onEnter: onOpen
			}}
			aria-labelledby="form-dialog-title">
			<DialogTitle id="form-dialog-title">
				<Typography
					className={classes.title}>
					User groups
				</Typography>
			</DialogTitle>
			<DialogContent>
				{loading && <CircularProgress/>}
				{data && <List
					sx={{minWidth: 300}}>
					{data.groups.results.map(v => v as Group).map(g => <ListItem
						dense
						key={g.id}>
						<ListItemText
							primary={g.name}
							secondary={`${g.users.length} user(s)`}
						/>
						<ListItemSecondaryAction>
							<Checkbox
								disabled
							/>
						</ListItemSecondaryAction>
					</ListItem>)}
				</List>}
				{error && <Typography
					variant="caption"
					color="error">
					{getGraphErrorMessage(error)}
				</Typography>}
			</DialogContent>
			<DialogActions>
				<Button
					className={classes.button}
					color="primary"
					onClick={close}
					disabled={loading}>
					Done
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default UserGroupsDialog;
