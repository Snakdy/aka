/*
 *    Copyright 2019 Django Cass
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

import React, {ReactElement, useContext, useMemo} from "react";
import {StyledEngineProvider, ThemeProvider, useTheme} from "@mui/material/styles";
import {Helmet} from "react-helmet";
import {SnackbarProvider} from "notistack";
import {createTheme} from "@mui/material";
import {ApolloProvider} from "@apollo/client";
import Body from "./containers/Body";
import Snackbar from "./containers/feedback/Snackbar";
import {dark, light} from "./style/palette";
import Client from "./graph";
import {AppContext} from "./store/reducers/mono";

const App: React.FC = (): ReactElement => {
	// hooks
	const {palette} = useTheme();
	const {state: {generic: {themeMode}}} = useContext(AppContext);

	// update the theme dynamically
	const theme = useMemo(() => {
		document.documentElement.setAttribute("data-theme", themeMode);
		return createTheme({
			palette: themeMode === "dark" ? dark : light,
			components: {
				MuiTooltip: {
					styleOverrides: {
						tooltip: {
							fontSize: "0.9rem"
						}
					}
				},
				MuiListSubheader: {
					styleOverrides: {
						root: {
							backgroundColor: "transparent"
						}
					}
				},
				MuiOutlinedInput: {
					styleOverrides: {
						root: {
							borderRadius: 8
						},
					}
				},
				MuiInputLabel: {
					styleOverrides: {
						shrink: {
							color: "text.primary",
							fontWeight: 500
						}
					}
				},
				MuiButton: {
					styleOverrides: {
						root: {
							borderRadius: 8
						}
					}
				}
			}
		});
	}, [themeMode]);

	return (
		<div>
			<ApolloProvider
				client={Client}>
				<StyledEngineProvider injectFirst>
					<ThemeProvider
						theme={theme}>
						<SnackbarProvider
							maxSnack={3}
							autoHideDuration={3500}
							preventDuplicate>
							<Helmet>
								<meta
									name="theme-color"
									content={palette.primary.main}
								/>
							</Helmet>
							<Body/>
							<Snackbar/>
						</SnackbarProvider>
					</ThemeProvider>
				</StyledEngineProvider>
			</ApolloProvider>
		</div>
	);
};
export default App;
