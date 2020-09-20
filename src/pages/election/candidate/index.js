import React from 'react';
import { ElectionContext } from '../index';
import layout from '../../../styles/Layout.module.css';
import notFound from '../../../vectors/page-not-found-2.svg';
import { generatePath, Route, Switch, useLocation } from 'react-router-dom';
import { Button } from '@rmwc/button';
import UnstyledLink from '../../../comps/utils/UnstyledLink';
import cloudinaryCore from '../../../utils/cloudinaryCore';
import '@rmwc/tabs/styles';
import UserContext from '../../../comps/context/UserContext';
import ElectionUpdates from '../../../comps/elections/ElectionUpdates';
import CreateUpdate from '../../../comps/CreateUpdate';
import { gql, useMutation } from '@apollo/client';
import DialogQueue from '../../../comps/queues/DialogQueue';
import { createUseStyles } from 'react-jss';
import { Icon } from '@rmwc/icon';
import MessageQueue from '../../../comps/queues/MessageQueue';
import { Helmet } from 'react-helmet';

const useStyles = createUseStyles({
	obfuscator: {
		width: '100%',
		height: '100%',
		background: 'black',
		opacity: 0,
		position: 'absolute',
		cursor: 'pointer',
		borderRadius: '5px',
		'&:hover': {
			opacity: 0.7
		},
		textAlign: 'center',
		color: 'white'
	}
});

export const CandidateContext = React.createContext({});

const FOLLOW = gql`
	mutation($candidateId: String!) {
		follow(candidateId: $candidateId)
	}
`;

const UNFOLLOW = gql`
	mutation($candidateId: String!) {
		unfollow(candidateId: $candidateId)
	}
`;

const UPDATE_PROFILE_PIC = gql`
	mutation($candidateId: String!, $pic: Upload!) {
		alterProfilePic(candidateId: $candidateId, picture: $pic) {
			id
			coverPic {
				defaultUrl
				publicId
				width
				height
				mimetype
			}
		}
	}
`;

const UPDATE_COVER_PIC = gql`
	mutation($candidateId: String!, $pic: Upload!) {
		alterCoverPic(candidateId: $candidateId, picture: $pic) {
			id
			coverPic {
				defaultUrl
				publicId
				width
				height
				mimetype
			}
		}
	}
`;

const validateFile = file => {
	if (!file.type.startsWith('image/')) {
		MessageQueue.notify({
			body: 'You are only allowed to upload image files'
		});
		return false;
	}

	if (file.size > 1000 * 1000 * 5) {
		MessageQueue.notify({
			body: 'Your uploaded file must be smaller than 5MB.'
		});
		return false;
	}

	return true;
};

const Candidate = ({ match, history }) => {
	const classes = useStyles();
	const election = React.useContext(ElectionContext);
	const [activeTab, setActiveTab] = React.useState(0);

	const [tempCoverUrl, setTempCoverUrl] = React.useState(null);
	const [tempPFPUrl, setTempPFPUrl] = React.useState(null);

	const pfpInputRef = React.createRef();
	const coverInputRef = React.createRef();

	const user = React.useContext(UserContext);

	const candidate = election.candidates.find(
		cand => cand.url === match.params.candidateUrl
	);

	const [follow, { loading: followLoading }] = useMutation(FOLLOW, {
		variables: {
			candidateId: candidate.id
		},
		update: () => election.refetch()
	});

	const [unfollow, { loading: unfollowLoading }] = useMutation(UNFOLLOW, {
		variables: {
			candidateId: candidate.id
		},
		update: () => election.refetch()
	});

	const [updateCover] = useMutation(UPDATE_COVER_PIC);

	const [updateProfilePic] = useMutation(UPDATE_PROFILE_PIC);

	const confirmFollow = async () => {
		const confirmed = await DialogQueue.confirm({
			body: (
				<div>
					<p>
						When you follow a candidate, you'll receive an email for
						new posts.
					</p>
					<p>Do you want to continue?</p>
				</div>
			)
		});

		if (confirmed) {
			await follow();
		}
	};

	const tabs = [
		{
			label: 'Updates',
			path: generatePath(match.path, match.params)
		},
		{
			label: 'Q & A',
			path: generatePath(match.path + '/q-a', match.params)
		},
		{
			label: 'About',
			path: generatePath(match.path + '/bio', match.params)
		}
	];

	const location = useLocation();

	React.useEffect(() => {
		const isCorrectTab = location.pathname === tabs[activeTab]?.path;

		if (!isCorrectTab) {
			let newTab = tabs.findIndex(tab => tab.path === location.pathname);

			if (newTab !== -1) {
				setActiveTab(newTab);
			} else {
				setActiveTab(0);
				history.push(tabs[0].path);
			}
		}
	}, [activeTab, history, location, tabs]);

	if (!candidate) {
		return (
			<div className={layout.container}>
				<Helmet>
					<title>Page Not Found | StuyBOE Voting Site</title>
					<meta
						property={'og:title'}
						content={'Page Not Found | StuyBOE Voting Site'}
					/>
				</Helmet>
				<main className={layout.main}>
					<img
						src={notFound}
						alt={'Someone next to a sign that says Error 404'}
						style={{ width: '300px', maxWidth: '100%' }}
					/>
					<p>There's no candidate at that url</p>
					<UnstyledLink
						to={generatePath('/election/:url', match.params)}
					>
						<Button outlined>Go Back</Button>
					</UnstyledLink>
				</main>
			</div>
		);
	}

	return (
		<div>
			<Helmet>
				<title>{candidate.name} | StuyBOE Voting Site</title>
				<meta
					property={'og:title'}
					content={`${candidate.name} | StuyBOE Voting Site`}
				/>
				<meta
					property={'og:description'}
					content={`${candidate.name} is a candidate for ${election.name}. View their official page and latest updates.`}
				/>
				<meta
					property={'og:image'}
					content={candidate.profilePic.defaultUrl}
				/>
			</Helmet>
			<div
				style={{
					width: '100%',
					height: '250px',
					position: 'relative',
					marginBottom: 70
				}}
			>
				{candidate.isManager && (
					<div
						className={classes.obfuscator}
						onClick={() => coverInputRef.current?.click()}
					>
						<input
							type={'file'}
							accept={'.jpg,.jpeg,.png,.svg,.gif'}
							ref={coverInputRef}
							onChange={async ev => {
								const file = ev.target.files[0];

								if (!file) {
									return;
								}

								if (!validateFile(file)) {
									return;
								}

								setTempCoverUrl(
									window.URL.createObjectURL(file)
								);

								const confirmed = await DialogQueue.confirm({
									body:
										'This is what your profile will look like, are you sure you want to continue?'
								});

								if (confirmed) {
									await updateCover({
										variables: {
											candidateId: candidate.id,
											pic: file
										}
									});
									await election.refetch();
								}
								setTempCoverUrl(null);
							}}
							style={{ display: 'none' }}
						/>
						<Icon
							icon={{
								icon: 'add_photo_alternate',
								size: 'xlarge'
							}}
							style={{ marginTop: '1rem' }}
						/>
						<p>Upload New Cover Picture</p>
					</div>
				)}
				<img
					src={
						tempCoverUrl ||
						cloudinaryCore.url(candidate.coverPic.publicId, {
							secure: true,
							height: 800,
							crop: 'fit'
						})
					}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						borderRadius: '5px'
					}}
					alt={'cover'}
				/>
				<div
					style={{
						textAlign: 'center',
						position: 'absolute',
						top: 120,
						left: `calc(50% - 92.5px)`
					}}
				>
					{candidate.isManager && (
						<div
							className={classes.obfuscator}
							style={{
								borderRadius: '50%',
								height: 175,
								width: 175,
								left: 5,
								top: 5
							}}
							onClick={() => pfpInputRef?.current?.click()}
						>
							<input
								type={'file'}
								accept={'.jpg,.jpeg,.png,.svg,.gif'}
								ref={pfpInputRef}
								onChange={async ev => {
									const file = ev.target.files[0];

									if (!file) {
										return;
									}

									if (!validateFile(file)) {
										return;
									}

									setTempPFPUrl(
										window.URL.createObjectURL(file)
									);

									const confirmed = await DialogQueue.confirm(
										{
											body:
												'This is what your profile will look like, are you sure you want to continue?'
										}
									);

									if (confirmed) {
										await updateProfilePic({
											variables: {
												candidateId: candidate.id,
												pic: file
											}
										});
										await election.refetch();
									}
									setTempPFPUrl(null);
								}}
								style={{ display: 'none' }}
							/>
							<Icon
								icon={{
									icon: 'add_photo_alternate',
									size: 'xlarge'
								}}
								style={{ marginTop: '1rem' }}
							/>
							<p>Upload New Profile Picture</p>
						</div>
					)}

					<img
						src={
							tempPFPUrl ||
							cloudinaryCore.url(candidate.profilePic.publicId, {
								secure: true,
								height: 175,
								width: 175,
								crop: 'fit',
								radius: 'max'
							})
						}
						style={{
							borderRadius: '50%',
							border: '5px solid white',
							height: 175,
							width: 175
						}}
						alt={'Profile'}
					/>
				</div>
			</div>

			<div style={{ textAlign: 'center' }}>
				<h2>
					{candidate.name} &nbsp;{' '}
					{user.signedIn &&
						(candidate.isFollowing ? (
							<Button
								onClick={unfollow}
								disabled={unfollowLoading}
							>
								Unfollow
							</Button>
						) : (
							<Button
								onClick={confirmFollow}
								outlined
								disabled={followLoading}
							>
								Follow
							</Button>
						))}
				</h2>

				{/*<TabBar activeTabIndex={activeTab}>*/}
				{/*	{tabs.map((tab, index) => (*/}
				{/*		<Tab*/}
				{/*			label={tab.label}*/}
				{/*			key={index}*/}
				{/*			onClick={() => {*/}
				{/*				setActiveTab(index);*/}
				{/*				history.push(tab.path);*/}
				{/*			}}*/}
				{/*		/>*/}
				{/*	))}*/}
				{/*</TabBar>*/}
			</div>

			<CandidateContext.Provider value={candidate}>
				<Switch>
					<Route path={match.path}>
						<br />

						{candidate.isManager && <CreateUpdate />}

						<ElectionUpdates
							electionId={election.id}
							candidateId={candidate.id}
							showPending={candidate.isManager}
						/>
					</Route>
				</Switch>
			</CandidateContext.Provider>
		</div>
	);
};

export default Candidate;
