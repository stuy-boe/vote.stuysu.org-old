import '@material/layout-grid/dist/mdc.layout-grid.css';

import { Grid, GridCell } from '@rmwc/grid';
import React from 'react';
import { Helmet } from 'react-helmet';

import ElectionCard from '../comps/elections/ElectionCard';
import { gql, useQuery } from '@apollo/client';
import Loading from '../comps/utils/Loading';

const ELECTIONS_QUERY = gql`
	query {
		elections {
			name
			start
			end
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

	if (loading) {
		return <Loading />;
	}

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

			<Grid fixedColumnWidth align={'left'}>
				{data?.elections?.map(election => (
					<ElectionCell election={election} key={election.url} />
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
