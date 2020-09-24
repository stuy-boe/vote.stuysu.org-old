import React from 'react';
import { generatePath } from 'react-router-dom';
import layout from './../../styles/Layout.module.css';
import UnstyledLink from '../../comps/utils/UnstyledLink';
import { Button } from '@rmwc/button';
import rejected from '../../vectors/marginalia-rejected.svg';
import { DateContext } from '../../comps/context/DateProvider';
import UserContext from '../../comps/context/UserContext';
import { ElectionContext } from './index';
import RunoffVote from '../../comps/elections/RunoffVote';
import PluralityVote from '../../comps/elections/PluralityVote';
import success from './../../vectors/pablo-success-2.svg';

const Vote = ({ match }) => {
	const date = React.useContext(DateContext);
	const user = React.useContext(UserContext);
	const election = React.useContext(ElectionContext);

	const now = date.getNow();
	const start = new Date(election.start);
	const end = new Date(election.end);

	if (now < start || now > end) {
		return (
			<div className={layout.container}>
				<main className={layout.main} style={{ textAlign: 'center' }}>
					<h2 className={layout.title}>Voting</h2>
					<img
						src={rejected}
						alt={'Someone next to an x'}
						style={{ maxHeight: '40vh' }}
					/>
					<p>This election isn't open for voting.</p>
					<UnstyledLink
						to={generatePath('/election/:url', match.params)}
					>
						<Button outlined>Go Back</Button>
					</UnstyledLink>
				</main>
			</div>
		);
	}

	if (!election.allowedGradYears.includes(user.gradYear)) {
		return (
			<div className={layout.container}>
				<main className={layout.main} style={{ textAlign: 'center' }}>
					<h2 className={layout.title}>Voting</h2>
					<img
						src={rejected}
						alt={'Someone next to an x'}
						style={{ maxHeight: '40vh' }}
					/>
					<p>
						Your grade isn't allowed to vote for this election.
						<br />
						Contact us if this is a mistake
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

	if (election.hasVoted) {
		return (
			<div className={layout.container}>
				<main className={layout.main} style={{ textAlign: 'center' }}>
					<h2 className={layout.title}>Voting</h2>
					<img
						src={success}
						alt={'People High Fiving'}
						style={{
							width: '400px',
							maxWidth: '100%'
						}}
					/>
					<p>You've voted for this election!</p>
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
		return <RunoffVote />;
	}

	if (election.type === 'plurality') {
		return <PluralityVote />;
	}

	return null;
};

export default Vote;
