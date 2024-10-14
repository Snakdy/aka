/*
 *    Copyright 2021 Django Cass
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

import {ApolloClient, ApolloError, HttpLink, InMemoryCache, split} from "@apollo/client";
import {getMainDefinition} from "@apollo/client/utilities";
import {GraphQLWsLink} from "@apollo/client/link/subscriptions";
import {createClient} from "graphql-ws";
import {GRAPH_HTTP_URL, GRAPH_WS_URL} from "../constants";

export interface GraphResponse<T> {
	loading: boolean;
	error?: ApolloError;
	data?: T;
}

const httpLink = new HttpLink({
	uri: GRAPH_HTTP_URL,
	credentials: "include",
	fetchOptions: {
		mode: "cors"
	}
});

const wsLink = new GraphQLWsLink(createClient({
	url: GRAPH_WS_URL,
	shouldRetry: () => true
}));

const splitLink = split(
	({query}) => {
		const definition = getMainDefinition(query);
		return (
			definition.kind === "OperationDefinition" && definition.operation === "subscription"
		);
	},
	wsLink,
	httpLink
);

const Client = new ApolloClient({
	link: splitLink,
	cache: new InMemoryCache()
});

export default Client;
