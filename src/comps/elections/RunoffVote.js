import React from 'react';
import { ElectionContext } from '../../pages/election';
import { List, SimpleListItem } from '@rmwc/list';
import '@rmwc/list/styles';

import { ChipSet, Chip } from '@rmwc/chip';
import '@rmwc/chip/styles';

import shuffleArray from '../../utils/shuffleArray';
import { IconButton } from '@rmwc/icon-button';
import MessageQueue from '../queues/MessageQueue';
import { Button } from '@rmwc/button';
import DialogQueue from '../queues/DialogQueue';
import { gql, useMutation } from '@apollo/client';

const RUNOFF_VOTE = gql`
	mutation($electionId: String!, $choices: [String!]!) {
		voteRunoff(electionId: $electionId, choices: $choices)
	}
`;

const RunoffVote = () => {
	const election = React.useContext(ElectionContext);
	const [vote] = useMutation(RUNOFF_VOTE, {
		variables: {
			electionId: election.id
		},
		update: cache => {
			cache.reset().then(() => {
				election.refetch();
			});
		}
	});

	const ref = React.createRef();
	const [seed] = React.useState(Math.floor(Math.random() * 1000));
	const [candidates, setCandidates] = React.useState(
		shuffleArray(Array.from(election.candidates), seed)
	);

	const [eliminatedCandidates, setEliminatedCandidates] = React.useState([]);

	React.useEffect(() => {
		if (ref.current) {
			const list = ref.current;
			new window.Slip(list);

			let notified = false;
			const onSwipe = function (e) {
				if (candidates.length > 1) {
					const id = e.target.getAttribute('data-candidate');
					const candidateIndex = candidates.findIndex(
						c => c.id === id
					);

					const newCandidates = Array.from(candidates);
					const removed = newCandidates.splice(candidateIndex, 1);
					setEliminatedCandidates([
						...eliminatedCandidates,
						...removed
					]);
					setCandidates(newCandidates);
				} else if (!notified) {
					notified = true;
					MessageQueue.notify({
						body: 'You must rank at least one candidate'
					});
				}
				e.preventDefault();
			};

			list.addEventListener('slip:swipe', onSwipe);

			const onReorder = function (e) {
				// e.target list item reordered.
				let newLocationIndex = e.detail.insertBefore
					? candidates.findIndex(
							c =>
								c.id ===
								e.detail.insertBefore?.getAttribute(
									'data-candidate'
								)
					  )
					: candidates.length;

				const movedCandidateIndex = candidates.findIndex(
					c => c.id === e.target?.getAttribute('data-candidate')
				);

				const newCandidates = [...candidates];
				const moved = newCandidates.splice(movedCandidateIndex, 1)[0];

				if (
					newLocationIndex > 0 &&
					newLocationIndex < candidates.length
				) {
					newLocationIndex--;
				}

				newCandidates.splice(newLocationIndex, 0, moved);
				setCandidates(newCandidates);
				e.preventDefault();
			};

			list.addEventListener('slip:reorder', onReorder);

			return () => {
				list.removeEventListener('slip:swipe', onSwipe);
				list.removeEventListener('slip:reorder', onReorder);
			};
		}
	}, [ref, candidates, eliminatedCandidates]);

	return (
		<div>
			<h3 style={{ textAlign: 'center' }}>Vote: {election.name}</h3>
			<p style={{ color: 'grey', textAlign: 'center' }}>
				Drag and drop the candidates in your order of preference. Swipe
				away a candidate to remove your vote for them.
			</p>
			<List ref={ref}>
				{candidates.map((candidate, i) => {
					return (
						<SimpleListItem
							selected={false}
							activated={false}
							text={candidate.name}
							meta={
								<div className={'desktop-only'}>
									<IconButton
										icon={'arrow_downward'}
										disabled={i === candidates.length - 1}
										onClick={() => {
											const newCandidates = Array.from(
												candidates
											);

											newCandidates[i] =
												newCandidates[i + 1];
											newCandidates[i + 1] = candidate;

											setCandidates(newCandidates);
										}}
									/>

									<IconButton
										icon={'close'}
										disabled={candidates.length <= 1}
										onClick={() => {
											const newCandidates = Array.from(
												candidates
											);

											const removed = newCandidates.splice(
												i,
												1
											);

											setCandidates(newCandidates);
											setEliminatedCandidates(
												eliminatedCandidates.concat(
													removed
												)
											);
										}}
									/>
								</div>
							}
							key={candidate.id}
							data-candidate={candidate.id}
						/>
					);
				})}
			</List>

			{eliminatedCandidates.length > 0 && (
				<>
					<h4 style={{ textAlign: 'center' }}>Removed Candidates</h4>
					<p style={{ color: 'grey', textAlign: 'center' }}>
						You've decided not to rank these candidates. Click on
						any of them to add them back to your rankings.
					</p>
					<ChipSet>
						{eliminatedCandidates.map((candidate, i) => {
							return (
								<Chip
									label={candidate.name}
									onClick={() => {
										setCandidates(
											candidates.concat(candidate)
										);
										const newEliminated = Array.from(
											eliminatedCandidates
										);
										newEliminated.splice(i, 1);

										setEliminatedCandidates(newEliminated);
									}}
								/>
							);
						})}
					</ChipSet>
				</>
			)}
			<Button
				outlined
				style={{ margin: '1rem' }}
				onClick={async () => {
					const confirm = await DialogQueue.confirm({
						body: (
							<div>
								<h3 style={{ textAlign: 'center' }}>
									Confirm your choices.
								</h3>
								<p
									style={{
										color: 'grey',
										textAlign: 'center'
									}}
								>
									Make sure the order of the selections
									matches what you previously ranked. Once you
									vote you will not be able to edit your
									choices.
								</p>
								<List>
									{candidates.map((candidate, i) => {
										const rank = i + 1;
										return (
											<SimpleListItem
												key={candidate.id}
												text={
													rank + '. ' + candidate.name
												}
												disabled
											/>
										);
									})}
								</List>
							</div>
						)
					});

					if (confirm) {
						try {
							await vote({
								variables: {
									choices: candidates.map(c => c.id),
									electionId: election.id
								}
							});
						} catch (er) {
							MessageQueue.notify({ body: er.message });
						}
					}
				}}
			>
				Submit Vote
			</Button>
		</div>
	);
};

export default RunoffVote;
