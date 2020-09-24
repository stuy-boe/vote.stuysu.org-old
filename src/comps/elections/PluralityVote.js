import React from 'react';
import { ElectionContext } from '../../pages/election';
import { Radio } from '@rmwc/radio';
import '@rmwc/radio/styles';
import { Button } from '@rmwc/button';
import DialogQueue from '../queues/DialogQueue';
import { gql, useMutation } from '@apollo/client';
import MessageQueue from '../queues/MessageQueue';

const VOTE = gql`
	mutation($electionId: String!, $choices: [String!]!) {
		votePlurality(choices: $choices, electionId: $electionId)
	}
`;

const PluralityVote = () => {
	const election = React.useContext(ElectionContext);
	const [selected, setSelected] = React.useState(null);
	const [vote] = useMutation(VOTE, {
		update: cache => {
			cache.reset().then(() => election.refetch());
		}
	});

	return (
		<div>
			<h3 style={{ textAlign: 'center' }}>Vote: {election.name}</h3>
			<p style={{ textAlign: 'center', color: 'grey' }}>
				Select one candidate to vote for.
			</p>

			<div style={{ margin: '0.5rem' }}>
				{election.candidates.map(candidate => (
					<>
						<Radio
							value="cookies"
							checked={selected?.id === candidate.id}
							onChange={() => setSelected(candidate)}
						>
							{candidate.name}
						</Radio>
						<br />
					</>
				))}
			</div>

			<Button
				outlined
				disabled={!selected}
				style={{ margin: '1rem' }}
				onClick={async () => {
					const confirm = await DialogQueue.confirm({
						body: (
							<div>
								<h3 style={{ textAlign: 'center' }}>
									Confirm your selection
								</h3>
								<p
									style={{
										textAlign: 'center',
										color: 'grey'
									}}
								>
									Are you sure you want to vote for{' '}
									<b>{selected.name}</b>. You will not be able
									to change your vote later.
								</p>
							</div>
						)
					});

					if (confirm) {
						try {
							await vote({
								variables: {
									electionId: election.id,
									choices: [selected.id]
								}
							});
						} catch (e) {
							MessageQueue.notify(e.message);
						}
					}
				}}
			>
				Submit
			</Button>
		</div>
	);
};

export default PluralityVote;
