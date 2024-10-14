package model

import "gitlab.com/go-prism/go-rbac-proxy/pkg/rbac"

func (v Verb) DAO() rbac.Verb {
	switch v {
	case VerbCreate:
		return rbac.Verb_CREATE
	case VerbRead:
		return rbac.Verb_READ
	case VerbUpdate:
		return rbac.Verb_UPDATE
	case VerbDelete:
		return rbac.Verb_DELETE
	case VerbSudo:
		return rbac.Verb_SUDO
	default:
		return -1
	}
}
