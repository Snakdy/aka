import React, {ReactElement, ReactNode, useState} from "react";
import {
	Alert,
	Box,
	Chip,
	Collapse,
	FormControl,
	FormLabel,
	LinearProgress,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Select,
	TextField,
	Theme,
	Typography
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import Button from "@mui/material/Button";
import {ValidatedTextField} from "jmp-coreui";
import {mdiAccountCircle, mdiAccountCircleOutline, mdiAccountGroup, mdiAccountGroupOutline, mdiEarth} from "@mdi/js";
import Icon from "@mdi/react";
import {useTheme} from "@mui/material/styles";
import {Link, useNavigate} from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import {APP_NOUN} from "../../../constants";
import useAuth from "../../../hooks/useAuth";
import {
	Group,
	useAppSettingsQuery,
	useCreateJumpMutation,
	useWatchGroupsSubscription
} from "../../../generated/graphql";

const useStyles = makeStyles((theme: Theme) => ({
	subheader: {
		fontFamily: "Manrope",
		fontWeight: 500,
		fontSize: 24,
		padding: theme.spacing(1)
	},
	button: {
		marginTop: theme.spacing(3),
		fontFamily: "Manrope",
		fontWeight: "bold",
		textTransform: "none"
	},
	textLabel: {
		color: theme.palette.text.secondary
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

const chipRegex = /(^[0-9a-zA-Z]+$)/

const TYPE_GLOBAL = 0;
const TYPE_PERSONAL = 1;
const TYPE_GROUP = 2;

const CreateJumpForm: React.FC = (): ReactElement => {
	// hooks
	const classes = useStyles();
	const theme = useTheme();
	const {isAdmin} = useAuth();
	const [createJump, {loading, error}] = useCreateJumpMutation();
	const navigate = useNavigate();

	// local state
	const [name, setName] = useState(initialName);
	const [url, setUrl] = useState(initialUrl);
	const [type, setType] = useState<number>(TYPE_PERSONAL);
	const [alias, setAlias] = useState<Set<string>>(new Set());
	const [groupId, setGroupId] = useState<Group | null>(null);

	const [currentAlias, setCurrentAlias] = useState<string>("");
	const [aliasError, setAliasError] = useState<boolean>(false);

	const groups = useWatchGroupsSubscription({
		variables: {
			offset: 0,
			limit: 20,
			target: "",
		},
		skip: type !== TYPE_GROUP
	});
	const applicationSettings = useAppSettingsQuery();

	const textLabel = (text: string): ReactNode => {
		return <span
			className={classes.textLabel}>
			{text}
		</span>;
	};

	const visibilities = () => {
		return [
			{
				value: 0,
				title: "Global",
				subtitle: `Everyone will be able to see and use this ${APP_NOUN}`,
				icon: mdiEarth,
				iconSelected: mdiEarth,
				disabled: !(isAdmin || applicationSettings.data?.applicationSettings.allowPublicLinkCreation)
			},
			{
				value: 1,
				title: "Personal",
				subtitle: `Only you can see and use this ${APP_NOUN}`,
				icon: mdiAccountCircleOutline,
				iconSelected: mdiAccountCircle
			},
			{
				value: 2,
				title: "Group",
				subtitle: `All users of the nominated group will be able to see and use this ${APP_NOUN}`,
				icon: mdiAccountGroupOutline,
				iconSelected: mdiAccountGroup
			}
		]
	}

	const disabled = (type === TYPE_GROUP && groupId == null) || name.error !== "" || url.error !== "" || groups.loading || loading || name.value.length === 0 || url.value.length === 0;

	const onSubmit = () => {
		let gid: number;
		switch (type) {
			case 2:
				gid = Number(groupId?.id ?? 0);
				break;
			case 0:
				gid = -1;
				break;
			default:
				gid = 0;
				break;
		}
		createJump({
			variables: {
				name: name.value,
				location: url.value,
				alias: [...alias.values()],
				group: gid
			}
		}).then(() => navigate("/"));
	};

	return <div>
		<Typography
			className={classes.subheader}
			color="textPrimary">
			New {APP_NOUN}
		</Typography>
		{applicationSettings.loading && <LinearProgress sx={{ml: 1, mr: 1}}/>}
		<Box
			sx={{padding: 1}}>
			<FormControl
				fullWidth
				sx={{mt: 2}}>
				<FormLabel>General</FormLabel>
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
						variant: "outlined"
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
						variant: "outlined"
					}}
				/>
			</FormControl>
			<FormControl
				fullWidth
				sx={{mt: 1}}>
				<FormLabel>Visibility</FormLabel>
				<List>
					{visibilities().map(v => {
						const selected = type === v.value;
						return <ListItemButton
							disabled={v.disabled}
							selected={selected}
							sx={{borderRadius: theme.spacing(1.5), mt: 1, mb: 1}}
							onClick={() => {
								setGroupId(() => null);
								setType(() => v.value);
							}}
							key={v.value}>
							<ListItemIcon>
								<Icon
									path={selected ? v.iconSelected : v.icon}
									size={1}
									color={selected ? theme.palette.primary.main : undefined}
								/>
							</ListItemIcon>
							<ListItemText
								primary={v.title}
								primaryTypographyProps={{color: "text.primary"}}
								secondary={v.subtitle}
							/>
						</ListItemButton>;
					})}
				</List>
				{groups.loading && <LinearProgress/>}
				<Collapse
					in={type === TYPE_GROUP}>
					<Select
						fullWidth
						variant="outlined"
						value={groupId?.id ?? ""}
						onChange={e => setGroupId(() => groups.data?.groups.results.map(v => v as Group).find(i => i.id === e.target.value) || null)}>
						{(groups.data?.groups.results || []).map(v => v as Group).map(v => <MenuItem
							key={v.id}
							value={v.id}>
							{v.name}
						</MenuItem>)}
					</Select>
				</Collapse>
				{groupId?.public && <Alert
					sx={{borderRadius: theme.spacing(1), mt: 1}}
					severity="warning">
					This {APP_NOUN} will be public as the owning group is also public.
				</Alert>}
				{groupId != null && !groupId.public && <Alert
					sx={{borderRadius: theme.spacing(1), mt: 1}}
					severity="info">
					This {APP_NOUN} will be accessible to {groupId?.users.length ?? 0} user(s).
				</Alert>}
			</FormControl>
			<FormControl
				fullWidth
				sx={{mt: 1}}>
				<FormLabel>Optional</FormLabel>
				<Typography
					variant="caption"
					sx={{color: "text.secondary"}}>
					Additional keywords that can be used to select {APP_NOUN}s.
					They are especially useful if the {APP_NOUN} name is common or likely to have duplicates.
				</Typography>
				<TextField
					sx={{mt: 2}}
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
						setAlias(a => a.add(currentAlias));
						setCurrentAlias(() => "");
					}}
				/>
				<List>
					{[...alias.values()].map(a => <Chip
						key={a}
						label={a}
						sx={{mr: 1}}
						onDelete={() => setAlias(p => {
							p.delete(a);
							return p;
						})}
					/>)}
				</List>
			</FormControl>
			{error != null && <Alert
				sx={{borderRadius: theme.spacing(1), mt: 1}}
				severity="error"
				title="Something went wrong.">
				{error.message}
			</Alert>}
			<Box
				sx={{display: "flex", width: "100%"}}>
				<Box sx={{flexGrow: 1}}/>
				<Button
					className={classes.button}
					sx={{mr: 1}}
					component={Link}
					to="/"
					rel="noopener noreferrer"
					color="primary"
					variant="outlined">
					Cancel
				</Button>
				<Button
					className={classes.button}
					color="primary"
					variant="outlined"
					disabled={disabled}
					onClick={onSubmit}>
					Create
				</Button>
			</Box>
		</Box>
	</div>
}
export default CreateJumpForm;
