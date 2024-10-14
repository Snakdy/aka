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

export interface SystemInfo {
	build?: BuildInfo;
}

interface BuildInfo {
	os: OsInfo;
	artifact: string;
	git: GitInfo;
	group: string;
	java: JavaInfo;
	version: string;
	name: string;
	time: number;
}

interface GitInfo {
	commit: string;
}

interface JavaInfo {
	version: string;
	vendor: string;
}

interface OsInfo {
	version: string;
	name: string;
	arch: string;
}