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

import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import {BrowserRouter} from "react-router-dom";
import "typeface-roboto";
import App from "./App";
import {AppProvider} from "./store/reducers/mono";

ReactDOM.render(
	<React.StrictMode>
		<AppProvider>
			<BrowserRouter>
				<App/>
			</BrowserRouter>
		</AppProvider>
	</React.StrictMode>,
	document.getElementById("root")
);
