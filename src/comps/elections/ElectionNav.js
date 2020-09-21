import React from 'react';
import { GridCell, GridRow } from '@rmwc/grid';
import { Icon } from '@rmwc/icon';
import poll from '../../img/icons/poll.svg';
import vote from '../../vectors/vote-grass.svg';
import moment from 'moment-timezone';
import UnstyledLink from '../utils/UnstyledLink';
import { Button } from '@rmwc/button';
import group from '../../img/icons/group.svg';
import Carousel from 'react-multi-carousel';
import { Card, CardMedia } from '@rmwc/card';
import cloudinaryCore from '../../utils/cloudinaryCore';
import { ElectionContext } from '../../pages/election';
import { useMediaQuery } from 'react-responsive/src';
import shuffleArray from '../../utils/shuffleArray';

const responsive = {
	desktop: {
		breakpoint: { max: 3000, min: 600 },
		items: 2,
		slidesToSlide: 2 // optional, default to 1.
	},
	mobile: {
		breakpoint: { max: 600, min: 0 },
		items: 1,
		slidesToSlide: 1 // optional, default to 1.
	}
};

const ElectionNav = () => {
	const election = React.useContext(ElectionContext);

	// Seed is stored in a ref to ensure consistency across re-renders
	const seed = React.useRef(Math.floor(Math.random() * 1000));
	const [candidates, setCandidates] = React.useState([]);
	const isSticky = useMediaQuery({ query: '(min-height: 900px)' });

	React.useEffect(() => {
		if (election) {
			const newCandidates = Array.from(election.candidates);
			setCandidates(shuffleArray(newCandidates, seed.current));
		}
	}, [election]);

	const stickyStyles = {};

	if (isSticky) {
		stickyStyles.position = 'sticky';
		stickyStyles.top = 80;
	}

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

					<Carousel responsive={responsive}>
						{candidates.map(candidate => {
							return (
								<div
									style={{
										padding: '0.5rem'
									}}
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
								</div>
							);
						})}
					</Carousel>
				</GridCell>
			</GridRow>
		</div>
	);
};

export default ElectionNav;
