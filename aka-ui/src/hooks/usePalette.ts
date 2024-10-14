/*
 *    Copyright 2022 Django Cass
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

import {useEffect, useState} from "react";
import FastAverageColor from "fast-average-color";

interface Palette {
	data: string;
	loading: boolean;
	error: Error | null;
}

const usePalette = (src: string): Palette => {
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<Error | null>(null);
	const [data, setData] = useState<string>("");

	useEffect(() => {
		setLoading(() => true);
		new FastAverageColor().getColorAsync(src).then(color => {
			setData(() => color.hex);
		}).catch(e => setError(() => e)).finally(() => setLoading(() => false));
	}, [src]);

	return {
		loading,
		error,
		data
	};
};
export default usePalette;
