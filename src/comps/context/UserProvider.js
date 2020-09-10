import React from 'react';

import { gql, useQuery } from '@apollo/client';
import Loading from '../utils/Loading';
import Retry from '../utils/Retry';

import UserContext from './UserContext';
import MazeErrorVector from '../../vectors/maze-loading-error.svg';

const USER_QUERY = gql`
	query {
		authenticatedUser {
			id
			name
			email
			grade
			gradYear
			adminRoles
		}
	}
`;

const UserProvider = ({ children }) => {
	const { data, error, loading, refetch } = useQuery(USER_QUERY);

	if (loading) {
		return <Loading />;
	}

	if (error) {
		return (
			<Retry
				onRetry={refetch}
				message={`Couldn't get latest information from the server.`}
				image={MazeErrorVector}
				buttonText={'Continue Offline'}
			/>
		);
	}

	const value = { refetch };

	if (data?.authenticatedUser) {
		value.signedIn = true;
		Object.assign(value, data.authenticatedUser);
	} else {
		value.signedIn = false;
	}

	return <UserContext.Provider value={value} children={children} />;
};

export default UserProvider;
