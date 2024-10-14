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

import {Page} from "../generated/graphql";

/**
 * Converts an object to JSON and back
 * Fastest way to clone an object in JS
 */
export const clone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj)) as T;

export const plural = (count: number, text: string): string => {
	if (count === 1)
		return text;
	else
		return `${text}s`;
};

export const getInitials = (str: string): string => {
	// handle usernames such as oauth2/john.doe
	const text = str.includes("/") ? str.split("/")[1] : str;
	const separator = !str.includes(" ") ? "." : " ";
	return text.split(separator).map(s => s[0].toLocaleUpperCase()).join("");
};

export const getEmptyPage = (): Page => {
	return {
		results: [],
		count: 0,
		more: false
	};
};

export const getDisplayName = (name: string): string => {
	const [, sub] = name.split("/", 2);
	if (!sub)
		return name;
	return getSubjectName(sub);
};

export const getSubjectName = (sub: string): string => {
	const segments = sub.split(",");
	for (const element of segments) {
		if (element.startsWith("CN="))
			return element.substring(3);
	}
	return sub;
};

export const parseUsername = (username: string): string => {
	// workaround for OIDC issuers
	if (username.startsWith("https://")) {
		username = username.replace("https://", "")
	}
	const [iss, sub] = username.split("/");
	if (sub == null)
		return parseDN(iss);
	return parseDN(sub);
}

export const parseDN = (dn: string): string => {
	const bits = dn.split(",");
	for (const bit of bits) {
		if (bit.trimStart().startsWith("CN=")) {
			return bit.replace("CN=", "");
		}
	}
	return dn;
}
