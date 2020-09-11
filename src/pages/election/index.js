import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Loading from '../../comps/utils/Loading';
import 'react-multi-carousel/lib/styles.css';
import { Button } from '@rmwc/button';
import cloudinaryCore from '../../utils/cloudinaryCore';
import poll from './../../img/icons/poll.svg';
import group from './../../img/icons/group.svg';
import vote from './../../vectors/vote-grass.svg';
import comments from './../../img/icons/comments.svg';
import notFound from './../../vectors/clip-list-is-empty.svg';
import { Icon } from '@rmwc/icon';

import { Grid, GridCell, GridRow } from '@rmwc/grid';
import { Card, CardMedia } from '@rmwc/card';
import Carousel from 'react-multi-carousel';
import UnstyledLink from '../../comps/utils/UnstyledLink';

import layout from './../../styles/Layout.module.css';

import moment from 'moment-timezone';
import { useMediaQuery } from 'react-responsive/src';

const responsive = {
	desktop: {
		breakpoint: { max: 3000, min: 1100 },
		items: 2,
		slidesToSlide: 2 // optional, default to 1.
	},
	mobile: {
		breakpoint: { max: 1100, min: 0 },
		items: 1,
		slidesToSlide: 1 // optional, default to 1.
	}
};

const ELECTION_QUERY = gql`
	query($url: String!) {
		election(url: $url) {
			id
			name
			url
			candidates {
				id
				name
				url
				profilePic {
					publicId
				}
				coverPic {
					publicId
				}
			}
			picture {
				defaultUrl
			}
			start
			end
			allowedGradYears
		}
	}
`;

const ElectionRouter = ({ match }) => {
	const { url } = match.params;
	const { data, loading } = useQuery(ELECTION_QUERY, { variables: { url } });
	const [candidates, setCandidates] = React.useState([]);
	const isSticky = useMediaQuery({ query: '(min-height: 900px)' });

	React.useEffect(() => {
		if (data) {
			const newCandidates = Array.from(data.election.candidates);
			newCandidates.sort(() => Math.floor(Math.random() * 2) + -1);
			setCandidates(newCandidates);
		}
	}, [data]);

	if (loading) {
		return <Loading />;
	}

	const stickyStyles = {};

	if (isSticky) {
		stickyStyles.position = 'sticky';
		stickyStyles.top = 80;
	}

	return (
		<div>
			<Grid>
				<GridRow>
					<GridCell span={5}>
						<div style={stickyStyles}>
							<h1>{data.election.name}</h1>
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
											{moment(data.election.start).format(
												'ddd, MMM Do YYYY, h:mma'
											)}
										</span>
									</p>
									<p>
										Ends:{' '}
										<span style={{ color: 'grey' }}>
											{moment(data.election.end).format(
												'ddd, MMM Do[,] YYYY, h:mma'
											)}
										</span>
									</p>
									<UnstyledLink
										to={`/election/${data.election.url}/vote`}
									>
										<Button
											outlined
											disabled={
												new Date() <
												new Date(data.election.start)
											}
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
															borderRadius:
																'10px',
															// border: '2px solid lightgrey',
															textAlign: 'center',
															position: 'relative'
														}}
													>
														<CardMedia
															sixteenByNine
															style={{
																background: `url(${cloudinaryCore.url(
																	candidate
																		.coverPic
																		.publicId,
																	{
																		secure: true,
																		crop:
																			'fit',
																		height: 115
																	}
																)})`,
																height: 115,
																marginBottom: 30
															}}
														/>
														<img
															src={cloudinaryCore.url(
																candidate
																	.profilePic
																	.publicId,
																{
																	secure: true,
																	width: 100,
																	crop: 'fit',
																	radius:
																		'max'
																}
															)}
															alt={'Candidate'}
															style={{
																objectFit:
																	'contain',
																position:
																	'absolute',

																left:
																	'calc(50% - 50px)',
																top: 50
															}}
														/>
														<p>{candidate.name}</p>
														<div
															style={{
																height: '30px',
																width: '100%',
																position:
																	'absolute',
																bottom: 10,
																textAlign:
																	'center'
															}}
														>
															<UnstyledLink
																to={`/election/${data.election.url}/${candidate.url}`}
															>
																<Button>
																	View
																</Button>
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
					</GridCell>
					<GridCell span={7}>
						<h2>
							<Icon
								icon={{ icon: comments, size: 'large' }}
								style={{ verticalAlign: 'middle' }}
							/>{' '}
							Updates
						</h2>
						<div className={layout.container}>
							<main
								className={layout.main}
								style={{ textAlign: 'center' }}
							>
								<img
									src={notFound}
									style={{ maxWidth: '100%' }}
									alt={'Someone looking for something'}
								/>
								<p>
									There aren't any updates for this election
									yet
								</p>
							</main>
						</div>
					</GridCell>
				</GridRow>
			</Grid>
		</div>
	);
};

export default ElectionRouter;
