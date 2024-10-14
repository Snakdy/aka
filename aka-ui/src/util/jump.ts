import {Jump} from "../generated/graphql";

export enum JumpType {
	Global = 0,
	Personal = 1,
	Group = 2
}

export const getJumpType = (jump: Jump): JumpType => {
	if (jump.owner.user !== "")
		return JumpType.Personal;
	return jump.owner.group !== "" ? JumpType.Group : JumpType.Global;
}