import * as Apollo from "@apollo/client";
import {gql} from "@apollo/client";

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type ApplicationSettings = {
  __typename?: "ApplicationSettings";
  allowPublicLinkCreation: Scalars["Boolean"]["output"];
};

export type EditGroup = {
  id: Scalars["Int"]["input"];
  owner: Scalars["String"]["input"];
  public: Scalars["Boolean"]["input"];
};

export type EditJump = {
  alias: Array<Scalars["String"]["input"]>;
  id: Scalars["Int"]["input"];
  location: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

export type Group = {
  __typename?: "Group";
  external: Scalars["Boolean"]["output"];
  id: Scalars["ID"]["output"];
  name: Scalars["String"]["output"];
  owner: Scalars["String"]["output"];
  public: Scalars["Boolean"]["output"];
  users: Array<Scalars["String"]["output"]>;
};

export type Jump = {
  __typename?: "Jump";
  alias: Array<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  location: Scalars["String"]["output"];
  name: Scalars["String"]["output"];
  owner: ResourceOwner;
  title: Scalars["String"]["output"];
  usage: Scalars["Int"]["output"];
};

export type JumpEvent = {
  __typename?: "JumpEvent";
  date: Scalars["Int"]["output"];
  id: Scalars["ID"]["output"];
  jumpID: Scalars["ID"]["output"];
  userID: Scalars["String"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  createGroup: Group;
  createJump: Jump;
  deleteJump: Scalars["Boolean"]["output"];
  patchGroup: Group;
  patchJump: Jump;
};


export type MutationCreateGroupArgs = {
  input: NewGroup;
};


export type MutationCreateJumpArgs = {
  input: NewJump;
};


export type MutationDeleteJumpArgs = {
  id: Scalars["Int"]["input"];
};


export type MutationPatchGroupArgs = {
  input: EditGroup;
};


export type MutationPatchJumpArgs = {
  input: EditJump;
};

export type NewGroup = {
  name: Scalars["String"]["input"];
  public?: Scalars["Boolean"]["input"];
};

export type NewJump = {
  alias: Array<Scalars["String"]["input"]>;
  group: Scalars["Int"]["input"];
  location: Scalars["String"]["input"];
  name: Scalars["String"]["input"];
};

export type Page = {
  __typename?: "Page";
  count: Scalars["Int"]["output"];
  more: Scalars["Boolean"]["output"];
  results: Array<Pageable>;
};

export type Pageable = Group | Jump | User;

export type Query = {
  __typename?: "Query";
  applicationSettings: ApplicationSettings;
  authCanI: Scalars["Boolean"]["output"];
  currentUser: User;
  groups: Page;
  groupsForUser: Array<Group>;
  jumpTo: Jump;
  jumps: Page;
  searchJumps: Page;
  similar: Array<Jump>;
  topPicks: Array<Jump>;
  users: Page;
};


export type QueryAuthCanIArgs = {
  action: Verb;
  resource: Scalars["String"]["input"];
};


export type QueryGroupsArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
};


export type QueryGroupsForUserArgs = {
  username: Scalars["String"]["input"];
};


export type QueryJumpToArgs = {
  target: Scalars["Int"]["input"];
};


export type QueryJumpsArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
};


export type QuerySearchJumpsArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  target: Scalars["String"]["input"];
};


export type QuerySimilarArgs = {
  query: Scalars["String"]["input"];
};


export type QueryTopPicksArgs = {
  amount?: Scalars["Int"]["input"];
};


export type QueryUsersArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
};

export type ResourceOwner = {
  __typename?: "ResourceOwner";
  group: Scalars["String"]["output"];
  user: Scalars["String"]["output"];
};

export type Subscription = {
  __typename?: "Subscription";
  groups: Page;
  jumps: Page;
  users: Page;
};


export type SubscriptionGroupsArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  target?: Scalars["String"]["input"];
};


export type SubscriptionJumpsArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  target: Scalars["String"]["input"];
};


export type SubscriptionUsersArgs = {
  limit?: Scalars["Int"]["input"];
  offset?: Scalars["Int"]["input"];
  target?: Scalars["String"]["input"];
};

export type User = {
  __typename?: "User";
  admin: Scalars["Boolean"]["output"];
  email: Scalars["String"]["output"];
  groups: Array<Scalars["String"]["output"]>;
  id: Scalars["ID"]["output"];
  subject: Scalars["String"]["output"];
  username: Scalars["String"]["output"];
};

export enum Verb {
  Create = "CREATE",
  Delete = "DELETE",
  Read = "READ",
  Sudo = "SUDO",
  Update = "UPDATE"
}

export type AppSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AppSettingsQuery = { __typename?: "Query", applicationSettings: { __typename?: "ApplicationSettings", allowPublicLinkCreation: boolean } };

export type GroupsForUserQueryVariables = Exact<{
  username: Scalars["String"]["input"];
}>;


export type GroupsForUserQuery = { __typename?: "Query", groupsForUser: Array<{ __typename?: "Group", id: string, name: string, owner: string, public: boolean, users: Array<string> }> };

export type WatchGroupsSubscriptionVariables = Exact<{
  offset: Scalars["Int"]["input"];
  limit: Scalars["Int"]["input"];
  target: Scalars["String"]["input"];
}>;


export type WatchGroupsSubscription = { __typename?: "Subscription", groups: { __typename?: "Page", count: number, more: boolean, results: Array<{ __typename: "Group", id: string, name: string, public: boolean, owner: string, users: Array<string>, external: boolean } | { __typename: "Jump" } | { __typename: "User" }> } };

export type CreateGroupMutationVariables = Exact<{
  name: Scalars["String"]["input"];
  public: Scalars["Boolean"]["input"];
}>;


export type CreateGroupMutation = { __typename?: "Mutation", createGroup: { __typename?: "Group", id: string } };

export type PatchGroupMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  public: Scalars["Boolean"]["input"];
  owner: Scalars["String"]["input"];
}>;


export type PatchGroupMutation = { __typename?: "Mutation", patchGroup: { __typename?: "Group", id: string } };

export type JumpToQueryVariables = Exact<{
  target: Scalars["Int"]["input"];
}>;


export type JumpToQuery = { __typename?: "Query", jumpTo: { __typename?: "Jump", location: string } };

export type GetJumpsSubscriptionVariables = Exact<{
  offset: Scalars["Int"]["input"];
  limit: Scalars["Int"]["input"];
  target: Scalars["String"]["input"];
}>;


export type GetJumpsSubscription = { __typename?: "Subscription", jumps: { __typename?: "Page", count: number, more: boolean, results: Array<{ __typename: "Group" } | { __typename: "Jump", id: string, name: string, location: string, title: string, usage: number, alias: Array<string>, owner: { __typename?: "ResourceOwner", group: string, user: string } } | { __typename: "User" }> } };

export type DeleteJumpMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
}>;


export type DeleteJumpMutation = { __typename?: "Mutation", deleteJump: boolean };

export type PatchJumpMutationVariables = Exact<{
  id: Scalars["Int"]["input"];
  name: Scalars["String"]["input"];
  location: Scalars["String"]["input"];
  alias: Array<Scalars["String"]["input"]> | Scalars["String"]["input"];
}>;


export type PatchJumpMutation = { __typename?: "Mutation", patchJump: { __typename?: "Jump", id: string } };

export type CreateJumpMutationVariables = Exact<{
  name: Scalars["String"]["input"];
  location: Scalars["String"]["input"];
  alias: Array<Scalars["String"]["input"]> | Scalars["String"]["input"];
  group: Scalars["Int"]["input"];
}>;


export type CreateJumpMutation = { __typename?: "Mutation", createJump: { __typename?: "Jump", id: string } };

export type CurrentUserQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentUserQuery = { __typename?: "Query", currentUser: { __typename?: "User", id: string, subject: string, email: string, username: string, admin: boolean, groups: Array<string> } };

export type CanIQueryVariables = Exact<{
  resource: Scalars["String"]["input"];
  action: Verb;
}>;


export type CanIQuery = { __typename?: "Query", authCanI: boolean };

export type WatchUsersSubscriptionVariables = Exact<{
  offset: Scalars["Int"]["input"];
  limit: Scalars["Int"]["input"];
  target: Scalars["String"]["input"];
}>;


export type WatchUsersSubscription = { __typename?: "Subscription", users: { __typename?: "Page", count: number, more: boolean, results: Array<{ __typename: "Group" } | { __typename: "Jump" } | { __typename: "User", id: string, subject: string, username: string, email: string, admin: boolean }> } };

export type GetSimilarQueryVariables = Exact<{
  query: Scalars["String"]["input"];
}>;


export type GetSimilarQuery = { __typename?: "Query", similar: Array<{ __typename?: "Jump", id: string, name: string, location: string, title: string, usage: number, alias: Array<string>, owner: { __typename?: "ResourceOwner", group: string, user: string } }> };

export type GetTopPicksQueryVariables = Exact<{
  amount: Scalars["Int"]["input"];
}>;


export type GetTopPicksQuery = { __typename?: "Query", topPicks: Array<{ __typename?: "Jump", id: string, name: string, location: string, title: string, usage: number, alias: Array<string>, owner: { __typename?: "ResourceOwner", user: string, group: string } }> };


export const AppSettingsDocument = gql`
    query appSettings {
  applicationSettings {
    allowPublicLinkCreation
  }
}
    `;

/**
 * __useAppSettingsQuery__
 *
 * To run a query within a React component, call `useAppSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAppSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAppSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAppSettingsQuery(baseOptions?: Apollo.QueryHookOptions<AppSettingsQuery, AppSettingsQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<AppSettingsQuery, AppSettingsQueryVariables>(AppSettingsDocument, options);
}
export function useAppSettingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AppSettingsQuery, AppSettingsQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<AppSettingsQuery, AppSettingsQueryVariables>(AppSettingsDocument, options);
}
export function useAppSettingsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<AppSettingsQuery, AppSettingsQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<AppSettingsQuery, AppSettingsQueryVariables>(AppSettingsDocument, options);
}
export type AppSettingsQueryHookResult = ReturnType<typeof useAppSettingsQuery>;
export type AppSettingsLazyQueryHookResult = ReturnType<typeof useAppSettingsLazyQuery>;
export type AppSettingsSuspenseQueryHookResult = ReturnType<typeof useAppSettingsSuspenseQuery>;
export type AppSettingsQueryResult = Apollo.QueryResult<AppSettingsQuery, AppSettingsQueryVariables>;
export const GroupsForUserDocument = gql`
    query groupsForUser($username: String!) {
  groupsForUser(username: $username) {
    id
    name
    owner
    public
    users
  }
}
    `;

/**
 * __useGroupsForUserQuery__
 *
 * To run a query within a React component, call `useGroupsForUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupsForUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupsForUserQuery({
 *   variables: {
 *      username: // value for 'username'
 *   },
 * });
 */
export function useGroupsForUserQuery(baseOptions: Apollo.QueryHookOptions<GroupsForUserQuery, GroupsForUserQueryVariables> & ({ variables: GroupsForUserQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<GroupsForUserQuery, GroupsForUserQueryVariables>(GroupsForUserDocument, options);
}
export function useGroupsForUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GroupsForUserQuery, GroupsForUserQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<GroupsForUserQuery, GroupsForUserQueryVariables>(GroupsForUserDocument, options);
}
export function useGroupsForUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GroupsForUserQuery, GroupsForUserQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<GroupsForUserQuery, GroupsForUserQueryVariables>(GroupsForUserDocument, options);
}
export type GroupsForUserQueryHookResult = ReturnType<typeof useGroupsForUserQuery>;
export type GroupsForUserLazyQueryHookResult = ReturnType<typeof useGroupsForUserLazyQuery>;
export type GroupsForUserSuspenseQueryHookResult = ReturnType<typeof useGroupsForUserSuspenseQuery>;
export type GroupsForUserQueryResult = Apollo.QueryResult<GroupsForUserQuery, GroupsForUserQueryVariables>;
export const WatchGroupsDocument = gql`
    subscription watchGroups($offset: Int!, $limit: Int!, $target: String!) {
  groups(offset: $offset, limit: $limit, target: $target) {
    results {
      __typename
      ... on Group {
        id
        name
        public
        owner
        users
        external
      }
    }
    count
    more
  }
}
    `;

/**
 * __useWatchGroupsSubscription__
 *
 * To run a query within a React component, call `useWatchGroupsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWatchGroupsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWatchGroupsSubscription({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      target: // value for 'target'
 *   },
 * });
 */
export function useWatchGroupsSubscription(baseOptions: Apollo.SubscriptionHookOptions<WatchGroupsSubscription, WatchGroupsSubscriptionVariables> & ({ variables: WatchGroupsSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useSubscription<WatchGroupsSubscription, WatchGroupsSubscriptionVariables>(WatchGroupsDocument, options);
}
export type WatchGroupsSubscriptionHookResult = ReturnType<typeof useWatchGroupsSubscription>;
export type WatchGroupsSubscriptionResult = Apollo.SubscriptionResult<WatchGroupsSubscription>;
export const CreateGroupDocument = gql`
    mutation createGroup($name: String!, $public: Boolean!) {
  createGroup(input: {name: $name, public: $public}) {
    id
  }
}
    `;
export type CreateGroupMutationFn = Apollo.MutationFunction<CreateGroupMutation, CreateGroupMutationVariables>;

/**
 * __useCreateGroupMutation__
 *
 * To run a mutation, you first call `useCreateGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createGroupMutation, { data, loading, error }] = useCreateGroupMutation({
 *   variables: {
 *      name: // value for 'name'
 *      public: // value for 'public'
 *   },
 * });
 */
export function useCreateGroupMutation(baseOptions?: Apollo.MutationHookOptions<CreateGroupMutation, CreateGroupMutationVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useMutation<CreateGroupMutation, CreateGroupMutationVariables>(CreateGroupDocument, options);
}
export type CreateGroupMutationHookResult = ReturnType<typeof useCreateGroupMutation>;
export type CreateGroupMutationResult = Apollo.MutationResult<CreateGroupMutation>;
export type CreateGroupMutationOptions = Apollo.BaseMutationOptions<CreateGroupMutation, CreateGroupMutationVariables>;
export const PatchGroupDocument = gql`
    mutation patchGroup($id: Int!, $public: Boolean!, $owner: String!) {
  patchGroup(input: {id: $id, public: $public, owner: $owner}) {
    id
  }
}
    `;
export type PatchGroupMutationFn = Apollo.MutationFunction<PatchGroupMutation, PatchGroupMutationVariables>;

/**
 * __usePatchGroupMutation__
 *
 * To run a mutation, you first call `usePatchGroupMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePatchGroupMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [patchGroupMutation, { data, loading, error }] = usePatchGroupMutation({
 *   variables: {
 *      id: // value for 'id'
 *      public: // value for 'public'
 *      owner: // value for 'owner'
 *   },
 * });
 */
export function usePatchGroupMutation(baseOptions?: Apollo.MutationHookOptions<PatchGroupMutation, PatchGroupMutationVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useMutation<PatchGroupMutation, PatchGroupMutationVariables>(PatchGroupDocument, options);
}
export type PatchGroupMutationHookResult = ReturnType<typeof usePatchGroupMutation>;
export type PatchGroupMutationResult = Apollo.MutationResult<PatchGroupMutation>;
export type PatchGroupMutationOptions = Apollo.BaseMutationOptions<PatchGroupMutation, PatchGroupMutationVariables>;
export const JumpToDocument = gql`
    query jumpTo($target: Int!) {
  jumpTo(target: $target) {
    location
  }
}
    `;

/**
 * __useJumpToQuery__
 *
 * To run a query within a React component, call `useJumpToQuery` and pass it any options that fit your needs.
 * When your component renders, `useJumpToQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useJumpToQuery({
 *   variables: {
 *      target: // value for 'target'
 *   },
 * });
 */
export function useJumpToQuery(baseOptions: Apollo.QueryHookOptions<JumpToQuery, JumpToQueryVariables> & ({ variables: JumpToQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<JumpToQuery, JumpToQueryVariables>(JumpToDocument, options);
}
export function useJumpToLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<JumpToQuery, JumpToQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<JumpToQuery, JumpToQueryVariables>(JumpToDocument, options);
}
export function useJumpToSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<JumpToQuery, JumpToQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<JumpToQuery, JumpToQueryVariables>(JumpToDocument, options);
}
export type JumpToQueryHookResult = ReturnType<typeof useJumpToQuery>;
export type JumpToLazyQueryHookResult = ReturnType<typeof useJumpToLazyQuery>;
export type JumpToSuspenseQueryHookResult = ReturnType<typeof useJumpToSuspenseQuery>;
export type JumpToQueryResult = Apollo.QueryResult<JumpToQuery, JumpToQueryVariables>;
export const GetJumpsDocument = gql`
    subscription getJumps($offset: Int!, $limit: Int!, $target: String!) {
  jumps(offset: $offset, limit: $limit, target: $target) {
    results {
      __typename
      ... on Jump {
        id
        name
        location
        title
        owner {
          group
          user
        }
        usage
        alias
      }
    }
    count
    more
  }
}
    `;

/**
 * __useGetJumpsSubscription__
 *
 * To run a query within a React component, call `useGetJumpsSubscription` and pass it any options that fit your needs.
 * When your component renders, `useGetJumpsSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetJumpsSubscription({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      target: // value for 'target'
 *   },
 * });
 */
export function useGetJumpsSubscription(baseOptions: Apollo.SubscriptionHookOptions<GetJumpsSubscription, GetJumpsSubscriptionVariables> & ({ variables: GetJumpsSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useSubscription<GetJumpsSubscription, GetJumpsSubscriptionVariables>(GetJumpsDocument, options);
}
export type GetJumpsSubscriptionHookResult = ReturnType<typeof useGetJumpsSubscription>;
export type GetJumpsSubscriptionResult = Apollo.SubscriptionResult<GetJumpsSubscription>;
export const DeleteJumpDocument = gql`
    mutation deleteJump($id: Int!) {
  deleteJump(id: $id)
}
    `;
export type DeleteJumpMutationFn = Apollo.MutationFunction<DeleteJumpMutation, DeleteJumpMutationVariables>;

/**
 * __useDeleteJumpMutation__
 *
 * To run a mutation, you first call `useDeleteJumpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteJumpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteJumpMutation, { data, loading, error }] = useDeleteJumpMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteJumpMutation(baseOptions?: Apollo.MutationHookOptions<DeleteJumpMutation, DeleteJumpMutationVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useMutation<DeleteJumpMutation, DeleteJumpMutationVariables>(DeleteJumpDocument, options);
}
export type DeleteJumpMutationHookResult = ReturnType<typeof useDeleteJumpMutation>;
export type DeleteJumpMutationResult = Apollo.MutationResult<DeleteJumpMutation>;
export type DeleteJumpMutationOptions = Apollo.BaseMutationOptions<DeleteJumpMutation, DeleteJumpMutationVariables>;
export const PatchJumpDocument = gql`
    mutation patchJump($id: Int!, $name: String!, $location: String!, $alias: [String!]!) {
  patchJump(input: {id: $id, name: $name, location: $location, alias: $alias}) {
    id
  }
}
    `;
export type PatchJumpMutationFn = Apollo.MutationFunction<PatchJumpMutation, PatchJumpMutationVariables>;

/**
 * __usePatchJumpMutation__
 *
 * To run a mutation, you first call `usePatchJumpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePatchJumpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [patchJumpMutation, { data, loading, error }] = usePatchJumpMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      location: // value for 'location'
 *      alias: // value for 'alias'
 *   },
 * });
 */
export function usePatchJumpMutation(baseOptions?: Apollo.MutationHookOptions<PatchJumpMutation, PatchJumpMutationVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useMutation<PatchJumpMutation, PatchJumpMutationVariables>(PatchJumpDocument, options);
}
export type PatchJumpMutationHookResult = ReturnType<typeof usePatchJumpMutation>;
export type PatchJumpMutationResult = Apollo.MutationResult<PatchJumpMutation>;
export type PatchJumpMutationOptions = Apollo.BaseMutationOptions<PatchJumpMutation, PatchJumpMutationVariables>;
export const CreateJumpDocument = gql`
    mutation createJump($name: String!, $location: String!, $alias: [String!]!, $group: Int!) {
  createJump(
    input: {name: $name, location: $location, alias: $alias, group: $group}
  ) {
    id
  }
}
    `;
export type CreateJumpMutationFn = Apollo.MutationFunction<CreateJumpMutation, CreateJumpMutationVariables>;

/**
 * __useCreateJumpMutation__
 *
 * To run a mutation, you first call `useCreateJumpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateJumpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createJumpMutation, { data, loading, error }] = useCreateJumpMutation({
 *   variables: {
 *      name: // value for 'name'
 *      location: // value for 'location'
 *      alias: // value for 'alias'
 *      group: // value for 'group'
 *   },
 * });
 */
export function useCreateJumpMutation(baseOptions?: Apollo.MutationHookOptions<CreateJumpMutation, CreateJumpMutationVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useMutation<CreateJumpMutation, CreateJumpMutationVariables>(CreateJumpDocument, options);
}
export type CreateJumpMutationHookResult = ReturnType<typeof useCreateJumpMutation>;
export type CreateJumpMutationResult = Apollo.MutationResult<CreateJumpMutation>;
export type CreateJumpMutationOptions = Apollo.BaseMutationOptions<CreateJumpMutation, CreateJumpMutationVariables>;
export const CurrentUserDocument = gql`
    query currentUser {
  currentUser {
    id
    subject
    email
    username
    admin
    groups
  }
}
    `;

/**
 * __useCurrentUserQuery__
 *
 * To run a query within a React component, call `useCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useCurrentUserQuery(baseOptions?: Apollo.QueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
}
export function useCurrentUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
}
export function useCurrentUserSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CurrentUserQuery, CurrentUserQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<CurrentUserQuery, CurrentUserQueryVariables>(CurrentUserDocument, options);
}
export type CurrentUserQueryHookResult = ReturnType<typeof useCurrentUserQuery>;
export type CurrentUserLazyQueryHookResult = ReturnType<typeof useCurrentUserLazyQuery>;
export type CurrentUserSuspenseQueryHookResult = ReturnType<typeof useCurrentUserSuspenseQuery>;
export type CurrentUserQueryResult = Apollo.QueryResult<CurrentUserQuery, CurrentUserQueryVariables>;
export const CanIDocument = gql`
    query canI($resource: String!, $action: Verb!) {
  authCanI(resource: $resource, action: $action)
}
    `;

/**
 * __useCanIQuery__
 *
 * To run a query within a React component, call `useCanIQuery` and pass it any options that fit your needs.
 * When your component renders, `useCanIQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCanIQuery({
 *   variables: {
 *      resource: // value for 'resource'
 *      action: // value for 'action'
 *   },
 * });
 */
export function useCanIQuery(baseOptions: Apollo.QueryHookOptions<CanIQuery, CanIQueryVariables> & ({ variables: CanIQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<CanIQuery, CanIQueryVariables>(CanIDocument, options);
}
export function useCanILazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CanIQuery, CanIQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<CanIQuery, CanIQueryVariables>(CanIDocument, options);
}
export function useCanISuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<CanIQuery, CanIQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<CanIQuery, CanIQueryVariables>(CanIDocument, options);
}
export type CanIQueryHookResult = ReturnType<typeof useCanIQuery>;
export type CanILazyQueryHookResult = ReturnType<typeof useCanILazyQuery>;
export type CanISuspenseQueryHookResult = ReturnType<typeof useCanISuspenseQuery>;
export type CanIQueryResult = Apollo.QueryResult<CanIQuery, CanIQueryVariables>;
export const WatchUsersDocument = gql`
    subscription watchUsers($offset: Int!, $limit: Int!, $target: String!) {
  users(offset: $offset, limit: $limit, target: $target) {
    results {
      __typename
      ... on User {
        id
        subject
        username
        email
        admin
      }
    }
    count
    more
  }
}
    `;

/**
 * __useWatchUsersSubscription__
 *
 * To run a query within a React component, call `useWatchUsersSubscription` and pass it any options that fit your needs.
 * When your component renders, `useWatchUsersSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWatchUsersSubscription({
 *   variables: {
 *      offset: // value for 'offset'
 *      limit: // value for 'limit'
 *      target: // value for 'target'
 *   },
 * });
 */
export function useWatchUsersSubscription(baseOptions: Apollo.SubscriptionHookOptions<WatchUsersSubscription, WatchUsersSubscriptionVariables> & ({ variables: WatchUsersSubscriptionVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useSubscription<WatchUsersSubscription, WatchUsersSubscriptionVariables>(WatchUsersDocument, options);
}
export type WatchUsersSubscriptionHookResult = ReturnType<typeof useWatchUsersSubscription>;
export type WatchUsersSubscriptionResult = Apollo.SubscriptionResult<WatchUsersSubscription>;
export const GetSimilarDocument = gql`
    query getSimilar($query: String!) {
  similar(query: $query) {
    id
    name
    location
    title
    owner {
      group
      user
    }
    usage
    alias
  }
}
    `;

/**
 * __useGetSimilarQuery__
 *
 * To run a query within a React component, call `useGetSimilarQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSimilarQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSimilarQuery({
 *   variables: {
 *      query: // value for 'query'
 *   },
 * });
 */
export function useGetSimilarQuery(baseOptions: Apollo.QueryHookOptions<GetSimilarQuery, GetSimilarQueryVariables> & ({ variables: GetSimilarQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<GetSimilarQuery, GetSimilarQueryVariables>(GetSimilarDocument, options);
}
export function useGetSimilarLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSimilarQuery, GetSimilarQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<GetSimilarQuery, GetSimilarQueryVariables>(GetSimilarDocument, options);
}
export function useGetSimilarSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSimilarQuery, GetSimilarQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<GetSimilarQuery, GetSimilarQueryVariables>(GetSimilarDocument, options);
}
export type GetSimilarQueryHookResult = ReturnType<typeof useGetSimilarQuery>;
export type GetSimilarLazyQueryHookResult = ReturnType<typeof useGetSimilarLazyQuery>;
export type GetSimilarSuspenseQueryHookResult = ReturnType<typeof useGetSimilarSuspenseQuery>;
export type GetSimilarQueryResult = Apollo.QueryResult<GetSimilarQuery, GetSimilarQueryVariables>;
export const GetTopPicksDocument = gql`
    query getTopPicks($amount: Int!) {
  topPicks(amount: $amount) {
    id
    name
    location
    title
    owner {
      user
      group
    }
    usage
    alias
  }
}
    `;

/**
 * __useGetTopPicksQuery__
 *
 * To run a query within a React component, call `useGetTopPicksQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTopPicksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTopPicksQuery({
 *   variables: {
 *      amount: // value for 'amount'
 *   },
 * });
 */
export function useGetTopPicksQuery(baseOptions: Apollo.QueryHookOptions<GetTopPicksQuery, GetTopPicksQueryVariables> & ({ variables: GetTopPicksQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useQuery<GetTopPicksQuery, GetTopPicksQueryVariables>(GetTopPicksDocument, options);
}
export function useGetTopPicksLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTopPicksQuery, GetTopPicksQueryVariables>) {
	const options = {...defaultOptions, ...baseOptions}
	return Apollo.useLazyQuery<GetTopPicksQuery, GetTopPicksQueryVariables>(GetTopPicksDocument, options);
}
export function useGetTopPicksSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTopPicksQuery, GetTopPicksQueryVariables>) {
	const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
	return Apollo.useSuspenseQuery<GetTopPicksQuery, GetTopPicksQueryVariables>(GetTopPicksDocument, options);
}
export type GetTopPicksQueryHookResult = ReturnType<typeof useGetTopPicksQuery>;
export type GetTopPicksLazyQueryHookResult = ReturnType<typeof useGetTopPicksLazyQuery>;
export type GetTopPicksSuspenseQueryHookResult = ReturnType<typeof useGetTopPicksSuspenseQuery>;
export type GetTopPicksQueryResult = Apollo.QueryResult<GetTopPicksQuery, GetTopPicksQueryVariables>;

export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
const result: PossibleTypesResultData = {
	"possibleTypes": {
		"Pageable": [
			"Group",
			"Jump",
			"User"
		]
	}
};
export default result;
    