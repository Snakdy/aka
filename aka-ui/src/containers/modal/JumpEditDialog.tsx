import React, {ReactElement, ReactNode, useContext, useState} from "react";
import {
	Button,
	Chip,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	TextField,
	Theme,
	Typography
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import {ValidatedTextField} from "jmp-coreui";
import {APP_NOUN} from "../../constants";
import {MODAL_JUMP_EDIT, setDialog} from "../../store/actions/Modal";
import {defaultState} from "../../store/reducers/modal";
import {AppContext} from "../../store/reducers/mono";
import {usePatchJumpMutation} from "../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	title: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 20
	},
	button: {
		fontFamily: "Manrope",
		fontWeight: "bold",
		textTransform: "none"
	},
	actions: {
		marginRight: theme.spacing(1.5)
	},
	textLabel: {
		color: theme.palette.text.secondary
	},
	field: {
		marginTop: theme.spacing(1)
	}
}));

const initialName = {
	value: "",
	error: "",
	regex: /^[a-zA-Z0-9_.-]+$/
};
const initialUrl = {
	value: "",
	error: "",
	regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/
};

const chipRegex = /(^[0-9a-zA-Z]+$)/;

const JumpEditDialog: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const {dispatch, state: {modal}} = useContext(AppContext);
	const [patchJump, {loading, error}] = usePatchJumpMutation();

	// global state
	const {other, open} = modal[MODAL_JUMP_EDIT] || defaultState;

	const jump = other?.jump;


	const [name, setName] = useState(initialName);
	const [url, setUrl] = useState(initialUrl);
	const [alias, setAlias] = useState<Array<string>>([]);

	const [currentAlias, setCurrentAlias] = useState<string>("");
	const [aliasError, setAliasError] = useState<boolean>(false);

	const close = (final: boolean = false) => dispatch(setDialog(MODAL_JUMP_EDIT, false, final ? null : other));

	const onOpen = () => {
		setName({...initialName, value: jump.name});
		setUrl({...initialUrl, value: jump.location});
		setAlias(jump.alias);
	};

	const onSubmit = () => {
		const aliases: string[] = [];
		alias.forEach(item => {
			let i = -1;
			for (let j = 0; j < jump.alias.length; j++) {
				if (jump.alias[j].name === item) {
					i = j;
					break;
				}
			}
			if (i >= 0) {
				// keep an existing alias
				aliases.push(jump.alias[i]);
			} else {
				// create a new alias
				aliases.push(item);
			}
		});
		patchJump({
			variables: {
				id: jump.id,
				name: name.value,
				location: url.value,
				alias: aliases
			}
		}).then(r => {
			if (r.errors == null) {
				close();
			}
		});
	};

	const textLabel = (text: string): ReactNode => {
		return <span
			className={classes.textLabel}>
			{text}
		</span>;
	};

	const disabled = name.error !== "" || url.error !== "" || loading || name.value.length === 0 || url.value.length === 0;
	return (
		<Dialog
			open={open}
			maxWidth="xs"
			fullWidth
			aria-labelledby="form-dialog-title"
			TransitionProps={{
				onExited: () => close(true),
				onEnter: () => onOpen()
			}}>
			<DialogTitle id="form-dialog-title">
				<Typography className={classes.title}>
					Edit {APP_NOUN}
				</Typography>
			</DialogTitle>
			<DialogContent style={{overflowY: "initial"}}>
				<ValidatedTextField
					data={name}
					setData={setName}
					invalidLabel="Name must be at least 1 character or _.-"
					fieldProps={{
						required: true,
						autoFocus: true,
						margin: "dense",
						id: "name",
						label: textLabel("Name"),
						fullWidth: true,
						variant: "outlined",
						size: "small"
					}}
				/>
				<ValidatedTextField
					data={url}
					setData={setUrl}
					invalidLabel="Must be a valid URL"
					fieldProps={{
						required: true,
						margin: "dense",
						id: "url",
						label: textLabel("URL"),
						fullWidth: true,
						autoComplete: "url",
						variant: "outlined",
						size: "small"
					}}
				/>
				<TextField
					className={classes.field}
					label={textLabel("Aliases")}
					fullWidth
					variant="outlined"
					size="small"
					helperText="An alias must be letters and digits only."
					error={aliasError}
					value={currentAlias}
					onChange={e => setCurrentAlias(() => e.target.value)}
					onKeyUp={e => {
						if (e.key !== "Enter" && e.key !== " ")
							return;
						e.preventDefault();
						if (!chipRegex.test(currentAlias)) {
							setAliasError(() => true);
							return;
						}
						setAliasError(() => false);
						setAlias(a => a.concat([currentAlias]));
						setCurrentAlias(() => "");
					}}
				/>
				<List>
					{alias.map(a => <Chip
						key={a}
						label={a}
						sx={{mr: 1}}
						onDelete={() => setAlias(p => p.filter(i => i !== a))}
					/>)}
				</List>
			</DialogContent>
			<DialogActions className={classes.actions}>
				{error && <Typography
					color="error">
					Something went wrong.
				</Typography>}
				{loading && <CircularProgress size={15} thickness={8}/>}
				<Button
					className={classes.button}
					color="secondary"
					onClick={() => close()}
					disabled={loading}>
					Cancel
				</Button>
				<Button
					className={classes.button}
					color="primary"
					variant={disabled ? "text" : "contained"}
					disableElevation
					onClick={() => onSubmit()}
					disabled={disabled}>
					Edit {APP_NOUN.toLocaleLowerCase()}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
export default JumpEditDialog;
