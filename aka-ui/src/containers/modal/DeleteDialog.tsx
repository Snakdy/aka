import React, {ChangeEvent, ReactElement, useContext, useEffect, useState} from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	FormControlLabel,
	Switch,
	Theme,
	Typography,
	useTheme
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Icon from "@mdi/react";
import {mdiAlert} from "@mdi/js";
import {alpha} from "@mui/material/styles";
import {DeleteItemPayload, MODAL_DELETE, setDialog} from "../../store/actions/Modal";
import {defaultState} from "../../store/reducers/modal";
import {AppContext} from "../../store/reducers/mono";
import {useDeleteJumpMutation} from "../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	dialogTitle: {
		backgroundColor: theme.palette.error.main
	},
	titleIcon: {
		float: "left",
		paddingRight: theme.spacing(1),
		paddingTop: theme.spacing(0.5)
	},
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 20,
		color: theme.palette.error.contrastText
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: "bold",
		textTransform: "none"
	},
	red: {
		color: theme.palette.error.main,
		backgroundColor: alpha(theme.palette.error.main, 0.18),
		"&:hover": {
			backgroundColor: alpha(theme.palette.error.main, 0.34),
		}
	},
	approval: {
		fontSize: 14
	},
	text: {
		fontSize: 14,
		color: theme.palette.text.primary
	},
	effectText: {
		fontSize: 13,
		color: theme.palette.text.secondary
	}
}));

const DeleteDialog: React.FC = (): ReactElement => {
	// hooks
	const {state: {modal}, dispatch} = useContext(AppContext);
	const theme = useTheme();
	const [deleteJump] = useDeleteJumpMutation();

	// global state
	const {open, other} = modal[MODAL_DELETE] || defaultState;

	// local state
	const [ack, setAck] = useState(false);

	const payload = other as DeleteItemPayload | null;
	const requireApproval = payload?.requireApproval || false;
	const deletable = payload?.deletable || null;

	useEffect(() => {
		setAck(false);
	}, [open]);

	/**
	 * Close the dialog and cleanup resources
	 * @param final when true, 'other' content is set to null. Only set this to true once the dialog is CLOSED (i.e. not visible to the user)
	 */
	const close = (final: boolean = false) => dispatch(setDialog(MODAL_DELETE, false, final ? null : other));

	const onSubmit = () => {
		// convert to a switch when there's more cases
		if (deletable !== true)
			return;
		deleteJump({
			variables: {
				id: other.item.id
			}
		}).then(r => {
			if (r.errors == null)
				close();
		});
	};

	const classes = useStyles();
	return (
		<Dialog
			open={open}
			TransitionProps={{
				onExited: () => close(true)
			}}
			aria-labelledby="form-dialog-title">
			<DialogTitle
				className={classes.dialogTitle}
				id="form-dialog-title">
				<Icon
					className={classes.titleIcon}
					path={mdiAlert}
					size={1}
					color={theme.palette.error.contrastText}
				/>
				<Typography className={classes.title}>Delete {payload?.itemClass?.toLocaleLowerCase()}</Typography>
			</DialogTitle>
			{payload != null && <DialogContent
				sx={{m: 3, p: 1}}>
				<DialogContentText className={classes.text}>
					When you delete an {payload.itemClass.toLocaleLowerCase()}, this immediately happens:
				</DialogContentText>
				<ul>
					{payload.effects?.map((i, idx) => <li
						key={`${idx}-${i}`}
						className={classes.effectText}>
						{i}
					</li>)}
				</ul>
				{requireApproval && <FormControlLabel
					classes={{label: `${classes.approval} ${classes.red}`}}
					control={
						<Switch
							color="primary"
							checked={ack}
							onChange={(e: ChangeEvent<HTMLInputElement>) => setAck(e.target.checked)}/>
					}
					label="Use admin power to override"
				/>}
			</DialogContent>}
			<DialogActions>
				<Button
					className={classes.button}
					color="secondary"
					onClick={() => close()}>
					Cancel
				</Button>
				<Button
					className={`${classes.button} ${classes.red}`}
					variant={(requireApproval && !ack) ? "text" : "contained"}
					disableElevation
					onClick={() => onSubmit()}
					disabled={requireApproval && !ack}>
					Delete {payload?.itemClass?.toLocaleLowerCase()}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default DeleteDialog;
