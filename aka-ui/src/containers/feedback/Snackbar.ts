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

import React, {useContext, useEffect, useState} from "react";
import {useSnackbar} from "notistack";
import {closeSnackbar, removeSnackbar} from "../../store/actions/snackbar";
import {AppContext} from "../../store/reducers/mono";

const Snackbar: React.FC = (): null => {
	// hooks
	const {state: {snackbar: {notify}}, dispatch} = useContext(AppContext);
	const {enqueueSnackbar} = useSnackbar();

	// local state
	const [displayed, setDisplayed] = useState<Array<string | number>>([]);

	const storeDisplayed = (id: string | number): void => {
		setDisplayed([...displayed, id]);
	};

	const shouldComponentUpdate = (): boolean => {
		if (!notify.length) {
			setDisplayed([]);
			return false;
		}
		let notExists = false;
		for (const n of notify) {
			if (n.dismissed) {
				dispatch(closeSnackbar(n.key));
				dispatch(removeSnackbar(n.key));
			}
			notExists = notExists || !notify.filter(({key}) => n.key === key).length;
		}
		return notExists;
	};

	useEffect(() => {
		shouldComponentUpdate();
		notify.forEach(({key, message, options = {}}) => {
			// Do nothing if snackbar is already displayed
			if (displayed.includes(key)) return;
			// Display snackbar using notistack
			enqueueSnackbar(message, {
				...options,
				onClose: (event, reason, k) => {
					if (options.onClose)
						options.onClose(event, reason, k);
					// Dispatch action to remove snackbar from redux store
					k && dispatch(removeSnackbar(k));
				}
			});
			// Keep track of snackbars that we've displayed
			storeDisplayed(key);
		});
	}, [notify]);
	// we don't actually render anything, so just return null
	return null;
};
export default Snackbar;
