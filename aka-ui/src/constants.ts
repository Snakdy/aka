export const pageSize = 12;

interface WindowEnv {
	JMP_API_URL?: string;
	JMP_API_SECURE?: string;
	JMP_BRAND_NAME?: string;
	JMP_BRAND_MSG?: string;
	JMP_BRAND_NOUN?: string;
	JMP_BRAND_KEY?: string;
	JMP_ALLOW_PUBLIC_LINK_CREATION?: string;
	ICON_URL?: string;
	ICON_DISABLED?: string;
}

declare global {
	interface Window {
		_env_?: WindowEnv;
	}
}

export const API_URL = window._env_?.JMP_API_URL || "localhost:7000";
export const APP_NAME = window._env_?.JMP_BRAND_NAME || "JMP";
export const APP_MSG = window._env_?.JMP_BRAND_MSG || "";
export const APP_NOUN = window._env_?.JMP_BRAND_NOUN || "Jump";
export const APP_KEY = window._env_?.JMP_BRAND_KEY || "jmp";

const secure = (window._env_?.JMP_API_SECURE || "true") === "true";

export const BASE_URL = `http${secure ? "s" : ""}://${API_URL}`;
export const GRAPH_HTTP_URL = `http${secure ? "s" : ""}://${API_URL}/v4/query`;
export const GRAPH_WS_URL = `ws${secure ? "s" : ""}://${API_URL}/v4/query`;

export const ICON_URL = window._env_?.ICON_URL || "";
export const ICON_DISABLED = window._env_?.ICON_URL === "true";

export const getIconURL = (s: string): string => {
	if (ICON_DISABLED)
		return "";
	return `${ICON_URL}/icon?site=${s}`;
}
