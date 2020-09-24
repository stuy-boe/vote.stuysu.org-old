import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Loading from '../../comps/utils/Loading';
import 'react-multi-carousel/lib/styles.css';
import { Icon } from '@rmwc/icon';
import { generatePath, Route, Switch } from 'react-router-dom';
import { Grid, GridCell, GridRow } from '@rmwc/grid';

import { useMediaQuery } from 'react-responsive/src';
import ElectionNav from '../../comps/elections/ElectionNav';
import ElectionUpdates from '../../comps/elections/ElectionUpdates';
import { Button } from '@rmwc/button';
import UnstyledLink from '../../comps/utils/UnstyledLink';
import Vote from './vote';
import Candidate from './candidate';
import comments from '../../img/icons/comments.svg';
import { Helmet } from 'react-helmet';
import ErrorPage from '../ErrorPage';
import searching from './../../vectors/searching.svg';
import Results from './results';

export const ElectionContext = React.createContext({});

const ELECTION_QUERY = gql`
	query($url: String!) {
		election(url: $url) {
			id
			name
			url
			hasVoted
			candidates {
				id
				name
				url
				profilePic {
					defaultUrl
					publicId
				}
				coverPic {
					publicId
				}
				isManager
				isFollowing
			}
			picture {
				defaultUrl
				publicId
			}
			start
			end
			type
			complete
			allowedGradYears
		}
	}
`;

const ElectionRouter = ({ match }) => {
	const showElectionInfo = useMediaQuery({ query: '(max-width: 1200px)' });
	const { url } = match.params;
	const { data, loading, refetch } = useQuery(ELECTION_QUERY, {
		variables: { url }
	});

	if (loading) {
		return <Loading />;
	}

	if (!data.election) {
		return (
			<ErrorPage
				title={"We couldn't find an election at that url"}
				back={null}
				image={searching}
				children={
					<div style={{ textAlign: 'center' }}>
						<Helmet>
							<title>Page Not Found | StuyBOE Voting Site</title>
							<meta
								property={'og:title'}
								content={'Page Not Found | StuyBOE Voting Site'}
							/>
						</Helmet>
						<UnstyledLink to={'/elections'}>
							<Button outlined>Back To Elections</Button>
						</UnstyledLink>
					</div>
				}
			/>
		);
	}

	return (
		<ElectionContext.Provider value={{ ...data.election, refetch }}>
			<Helmet>
				<title>{data.election.name} | StuyBOE Voting Site</title>
				<meta
					property={'og:title'}
					content={`${data.election.name} | StuyBOE Voting Site`}
				/>
				<meta
					property={'og:image'}
					content={data.election.picture.defaultUrl}
				/>
				<meta
					property={'og:description'}
					content={`View candidates, vote, and see results for ${data.election.name}`}
				/>
			</Helmet>
			<UnstyledLink to={'/elections'}>
				<Button>Elections</Button>
			</UnstyledLink>
			<Icon
				style={{ verticalAlign: 'middle' }}
				icon={{ icon: 'keyboard_arrow_right' }}
			/>
			<UnstyledLink to={generatePath(match.path, match.params)}>
				<Button>{data.election.name}</Button>
			</UnstyledLink>

			<Route path={match.path + '/:anything'}>
				<Icon
					style={{ verticalAlign: 'middle' }}
					icon={{ icon: 'keyboard_arrow_right' }}
				/>
			</Route>
			<Switch>
				<Route path={match.path + '/vote'}>
					<UnstyledLink
						to={generatePath(match.path + '/vote', match.params)}
					>
						<Button>Vote</Button>
					</UnstyledLink>
				</Route>
				<Route path={match.path + '/results'}>
					<UnstyledLink
						to={generatePath(match.path + '/results', match.params)}
					>
						<Button>Results</Button>
					</UnstyledLink>
				</Route>
				<Route
					path={match.path + '/:candidateUrl'}
					component={({ match: { params } }) => (
						<UnstyledLink
							to={generatePath(
								match.path + '/:candidateUrl',
								params
							)}
						>
							<Button>
								{data.election.candidates.find(
									candidate =>
										candidate.url === params.candidateUrl
								)?.name || 'Candidate Not Found'}
							</Button>
						</UnstyledLink>
					)}
				/>
			</Switch>
			<Grid>
				<GridRow>
					<GridCell span={showElectionInfo ? 12 : 5}>
						{showElectionInfo ? (
							<Route
								path={match.path}
								exact
								component={ElectionNav}
							/>
						) : (
							<ElectionNav />
						)}
					</GridCell>

					<GridCell span={showElectionInfo ? 12 : 7}>
						<Switch>
							<Route path={match.path} exact>
								<h2>
									<Icon
										icon={{ icon: comments, size: 'large' }}
										style={{ verticalAlign: 'middle' }}
									/>{' '}
									Updates
								</h2>
								<ElectionUpdates
									electionId={data.election.id}
								/>
							</Route>
							<Route
								path={match.path + '/vote'}
								exact
								component={Vote}
							/>
							<Route
								path={match.path + '/results'}
								exact
								component={Results}
							/>

							<Route
								path={match.path + '/:candidateUrl'}
								component={Candidate}
							/>
						</Switch>
					</GridCell>
				</GridRow>
			</Grid>
		</ElectionContext.Provider>
	);
};

export default ElectionRouter;
