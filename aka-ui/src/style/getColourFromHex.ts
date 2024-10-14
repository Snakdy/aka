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
 */

const getColourFromHex = (hex: string | null, alpha = 1): string | null => {
	if (hex == null)
		return null;
	const colour = hex.match(/\w\w/g)?.map(x => parseInt(x, 16));
	if (colour == null)
		return null;
	const [r, g, b] = colour;
	return `rgba(${r},${g},${b},${alpha})`;
};
export default getColourFromHex;
