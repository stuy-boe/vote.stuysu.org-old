import React from 'react';
import { gql, useQuery } from '@apollo/client';
import MazeErrorVector from '../../vectors/maze-loading-error.svg';
import Retry from '../utils/Retry';

export const DateContext = React.createContext();

const DATE_QUERY = gql`
	query {
		date
	}
`;

const DateProvider = ({ children }) => {
	const { data, error, refetch } = useQuery(DATE_QUERY);
	const [dateOffset, setDateOffset] = React.useState(0);

	React.useEffect(() => {
		if (data?.date) {
			const localTime = new Date();
			const serverTime = new Date(data?.date);

			setDateOffset(serverTime.getTime() - localTime.getTime());
		}
	}, [data]);

	const getNow = () => {
		const localTime = new Date().getTime();
		return new Date(localTime + dateOffset);
	};

	const value = { getNow };

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

	return <DateContext.Provider value={value} children={children} />;
};

export default DateProvider;
