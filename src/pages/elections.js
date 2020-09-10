import '@material/layout-grid/dist/mdc.layout-grid.css';

import { Grid, GridCell } from '@rmwc/grid';
import React from 'react';
import { Helmet } from 'react-helmet';

import ElectionCard from '../comps/elections/ElectionCard';
import { gql, useQuery } from '@apollo/client';
import Loading from '../comps/utils/Loading';
import UserContext from '../comps/context/UserContext';

const ELECTIONS_QUERY = gql`
	query {
		elections {
			id
			name
			start
			end
			allowedGradYears
			url
			picture {
				publicId
			}
			complete
		}
	}
`;

const Elections = () => {
	const { data, loading } = useQuery(ELECTIONS_QUERY);

	const user = React.useContext(UserContext);

	if (loading) {
		return <Loading />;
	}

	const elections = !user?.gradYear
		? data.elections
		: Array.from(data?.elections).sort((a, b) => {
				if (a.allowedGradYears.includes(user?.gradYear)) {
					return -1;
				}

				if (b.allowedGradYears.includes(user.gradYear)) {
					return 1;
				}
				return 0;
		  });
	return (
		<div>
			<Helmet>
				<title>Elections | Stuy BOE Voting Site</title>
				<meta
					property="og:title"
					content="Elections | Stuy BOE Voting Site"
				/>
				<meta
					property="og:description"
					content="View results of elections from the past as well as up to date information about current elections."
				/>
			</Helmet>

			<Grid align={'left'}>
				{elections?.map(election => (
					<ElectionCell election={election} key={election.id} />
				))}
			</Grid>
		</div>
	);
};

const ElectionCell = ({ election }) => (
	<GridCell span={4}>
		<ElectionCard to={'/election/:url'} {...election} />
	</GridCell>
);

export default Elections;
