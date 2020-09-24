import React from 'react';
import UserContext from '../../comps/context/UserContext';
import { ElectionContext } from './index';
import layout from '../../styles/Layout.module.css';
import rejected from '../../vectors/marginalia-rejected.svg';
import UnstyledLink from '../../comps/utils/UnstyledLink';
import { generatePath } from 'react-router-dom';
import { Button } from '@rmwc/button';
import RunoffResults from '../../comps/elections/RunoffResults';
import PluralityResults from '../../comps/elections/PluralityResults';

const Results = ({ match }) => {
	const user = React.useContext(UserContext);

	const election = React.useContext(ElectionContext);

	if (!election.complete && !user?.adminRoles?.includes('elections')) {
		return (
			<div className={layout.container}>
				<main className={layout.main} style={{ textAlign: 'center' }}>
					<h2 className={layout.title}>Results</h2>
					<img
						src={rejected}
						alt={'Someone next to an x'}
						style={{ maxHeight: '40vh' }}
					/>
					<p>
						Results are not yet publicly visible for this election.
					</p>
					<UnstyledLink
						to={generatePath('/election/:url', match.params)}
					>
						<Button outlined>Go Back</Button>
					</UnstyledLink>
				</main>
			</div>
		);
	}

	if (election.type === 'runoff') {
		return <RunoffResults />;
	}

	if (election.type === 'plurality') {
		return <PluralityResults />;
	}

	return null;
};

export default Results;
