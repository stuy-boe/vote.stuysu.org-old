import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Loading from '../utils/Loading';
import { ElectionContext } from '../../pages/election';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { Block } from '@material-ui/icons';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import cloudinaryCore from '../../utils/cloudinaryCore';
const RESULTS = gql`
	query($url: String!) {
		election(url: $url) {
			name
			runoffResults {
				rounds {
					number
					numVotes
					results {
						candidate {
							name
							profilePic {
								publicId
							}
						}
						numVotes
						percentage
						eliminated
					}
					eliminatedCandidates {
						name
					}
				}
				winner {
					id
					name
				}
				numPeopleVoted
				isTie
				numEligibleVoters
			}
		}
	}
`;

const RunoffResults = () => {
	const election = React.useContext(ElectionContext);
	const { data, loading } = useQuery(RESULTS, {
		variables: { url: election.url }
	});

	if (!data || loading) {
		return <Loading />;
	}

	const results = data?.election?.runoffResults;

	return (
		<div>
			<h2
				style={{
					textAlign: 'center'
				}}
			>
				Results:
			</h2>
			<div style={{ color: 'grey' }}>
				<p>Election Type: Runoff</p>
				<p>Number of Votes: {results?.numPeopleVoted}</p>
				{/*<p>Number of Eligible Voters: {results?.numEligibleVoters}</p>*/}
			</div>
			{results?.rounds?.map(round => {
				return (
					<div>
						<h3>Round {round.number}:</h3>
						<List>
							{round.results.map(roundRes => {
								return (
									<ListItem
										style={{ marginBottom: '0.5rem' }}
									>
										<ListItemAvatar>
											<Avatar
												src={cloudinaryCore.url(
													roundRes.candidate
														.profilePic.publicId,
													{
														secure: true
													}
												)}
											/>
										</ListItemAvatar>
										<div>
											<span>
												{roundRes.candidate.name}
											</span>
											<br />

											<span
												style={{
													color: 'grey',
													fontSize: 14
												}}
											>
												{roundRes.numVotes} Votes (
												{roundRes.percentage}%)
											</span>
											<br />
										</div>
										<ListItemSecondaryAction>
											{roundRes.eliminated && (
												<div
													style={{
														textAlign: 'center'
													}}
												>
													<Block
														style={{
															color: 'grey'
														}}
													/>
													<br />
													<span
														style={{
															color: 'grey',
															fontSize: 12
														}}
													>
														Eliminated
													</span>
												</div>
											)}
										</ListItemSecondaryAction>
									</ListItem>
								);
							})}
						</List>
					</div>
				);
			})}

			<h4>
				Winner:{' '}
				{results?.winner
					? results.winner.name
					: results?.isTie
					? 'Tie'
					: 'No Winner'}
			</h4>
		</div>
	);
};

export default RunoffResults;
