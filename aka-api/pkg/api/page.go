package api

import (
	"github.com/djcass44/go-utils/utilities/httputils"
	"github.com/go-logr/logr"
	"net/http"
	"strconv"
)

// https://cloud.google.com/apis/design/design_patterns#list_pagination

type PageRequest struct {
	PageSize   int
	PageOffset int
}

type PageResponse struct {
	NextPageOffset int         `json:"next_page_offset"`
	TotalItems     int64       `json:"total_items"`
	Content        interface{} `json:"content"`
}

func withPagedData(w http.ResponseWriter, r *http.Request, getData func(w http.ResponseWriter, r *http.Request, pr PageRequest) (PageResponse, int, error)) {
	log := logr.FromContextOrDiscard(r.Context())
	po := r.URL.Query().Get("page_offset")
	if po == "" {
		po = "0" // if no token is given, assume we want the 1st page
	}
	pageOffset, err := strconv.Atoi(po)
	if err != nil {
		log.Error(err, "failed to parse offset", "Value", po)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	ps := r.URL.Query().Get("page_size")
	if ps == "" {
		ps = "20" // use 20 items as a sensible default
	}
	pageSize, err := strconv.Atoi(ps)
	if err != nil {
		log.Error(err, "failed to parse page", "Value", ps)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	log = log.WithValues("Offset", pageOffset, "Size", pageSize)
	log.V(2).Info("handling paged request")
	response, code, err := getData(w, r, PageRequest{
		PageSize:   pageSize,
		PageOffset: pageOffset,
	})
	if err != nil {
		http.Error(w, err.Error(), code)
		return
	}
	httputils.ReturnJSON(r.Context(), w, code, &response)
}
