import React from 'react';
import { GridCell, GridRow } from '@rmwc/grid';
import { Icon } from '@rmwc/icon';
import poll from '../../img/icons/poll.svg';
import vote from '../../vectors/vote-grass.svg';
import moment from 'moment-timezone';
import UnstyledLink from '../utils/UnstyledLink';
import { Button } from '@rmwc/button';
import group from '../../img/icons/group.svg';
import { Card, CardMedia } from '@rmwc/card';
import cloudinaryCore from '../../utils/cloudinaryCore';
import { ElectionContext } from '../../pages/election';
import shuffleArray from '../../utils/shuffleArray';
import UserContext from '../context/UserContext';
import Grid from '@material-ui/core/Grid';

const ElectionNav = () => {
	const election = React.useContext(ElectionContext);
	const user = React.useContext(UserContext);

	// Seed is stored in a ref to ensure consistency across re-renders
	const seed = React.useRef(Math.floor(Math.random() * 1000));
	const [candidates, setCandidates] = React.useState([]);

	React.useEffect(() => {
		if (election) {
			const newCandidates = Array.from(election.candidates);
			setCandidates(shuffleArray(newCandidates, seed.current));
		}
	}, [election]);

	const stickyStyles = {};

	return (
		<div style={stickyStyles}>
			<h1>{election.name}</h1>
			<GridRow>
				<GridCell span={12}>
					<h2>
						<Icon
							icon={{ icon: poll, size: 'large' }}
							style={{ verticalAlign: 'middle' }}
						/>{' '}
						Voting
					</h2>
					<img
						src={vote}
						alt={'People voting'}
						style={{ maxHeight: '130px' }}
					/>
					<p>
						Starts:{' '}
						<span style={{ color: 'grey' }}>
							{moment(election.start).format(
								'ddd, MMM Do YYYY, h:mma'
							)}
						</span>
					</p>
					<p>
						Ends:{' '}
						<span style={{ color: 'grey' }}>
							{moment(election.end).format(
								'ddd, MMM Do[,] YYYY, h:mma'
							)}
						</span>
					</p>
					<UnstyledLink to={`/election/${election.url}/vote`}>
						<Button
							outlined
							disabled={new Date() < new Date(election.start)}
						>
							Vote
						</Button>
					</UnstyledLink>
					&nbsp; &nbsp; &nbsp;
					<UnstyledLink to={`/election/${election.url}/results`}>
						<Button
							outlined
							disabled={
								!election.complete &&
								!user?.adminRoles?.includes('elections')
							}
						>
							Results
						</Button>
					</UnstyledLink>
				</GridCell>
				<GridCell span={12}>
					<h2>
						<Icon
							icon={{
								icon: group,
								size: 'large'
							}}
							style={{
								verticalAlign: 'middle'
							}}
						/>{' '}
						Candidates
					</h2>

					<Grid container spacing={2}>
						{candidates.map(candidate => {
							return (
								<Grid
									item
									xl={3}
									lg={3}
									md={4}
									sm={6}
									xs={12}
									key={candidate.id}
								>
									<Card
										outlined
										style={{
											width: '100%',
											minHeight: '250px',
											borderRadius: '10px',
											// border: '2px solid lightgrey',
											textAlign: 'center',
											position: 'relative'
										}}
									>
										<CardMedia
											sixteenByNine
											style={{
												background: `url(${cloudinaryCore.url(
													candidate.coverPic.publicId,
													{
														secure: true,
														crop: 'fit',
														height: 330
													}
												)})`,
												backgroundRepeat: 'no-repeat',
												backgroundSize: 'cover',
												height: 115,
												marginBottom: 30
											}}
										/>
										<img
											src={cloudinaryCore.url(
												candidate.profilePic.publicId,
												{
													secure: true,
													width: 200,
													crop: 'fit',
													radius: 'max'
												}
											)}
											alt={'Candidate'}
											style={{
												objectFit: 'cover',
												position: 'absolute',
												height: 100,
												width: 100,
												left: 'calc(50% - 50px)',
												top: 50,
												borderRadius: '50%',
												border: '2px solid white'
											}}
										/>
										<p>{candidate.name}</p>
										<div
											style={{
												height: '30px',
												width: '100%',
												position: 'absolute',
												bottom: 10,
												textAlign: 'center'
											}}
										>
											<UnstyledLink
												to={`/election/${election.url}/${candidate.url}`}
											>
												<Button>View</Button>
											</UnstyledLink>
										</div>
									</Card>
								</Grid>
							);
						})}
					</Grid>
				</GridCell>
			</GridRow>
		</div>
	);
};

export default ElectionNav;
