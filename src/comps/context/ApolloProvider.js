import React from 'react';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { createUploadLink } from 'apollo-upload-client';
import { ApolloProvider as Provider } from '@apollo/react-hooks';
import { GRAPHQL_URI } from '../../constants';
import { setContext } from '@apollo/client/link/context';

export const cache = new InMemoryCache();

const authLink = setContext((_, { headers }) => {
	const token = localStorage.getItem('auth-jwt');
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : ''
		}
	};
});

const uploadLink = createUploadLink({
	uri: GRAPHQL_URI
});

export const client = new ApolloClient({
	link: authLink.concat(uploadLink),
	cache
});

const ApolloProvider = props => {
	return <Provider client={client}>{props.children}</Provider>;
};

export default ApolloProvider;
