import React from 'react';
import layout from '../../styles/Layout.module.css';
import notFound from '../../vectors/clip-list-is-empty.svg';
import Update from '../Update';
import { gql, useQuery } from '@apollo/client';
import Loading from '../utils/Loading';
import UserContext from '../context/UserContext';
import { cache } from '../context/ApolloProvider';
import { ElectionContext } from '../../pages/election';

const UPDATES_QUERY = gql`
	query($electionId: String!, $candidateId: String) {
		updates(electionId: $electionId, candidateId: $candidateId) {
			id
			title
			content
			official
			pinned
			approval {
				status
			}
			link {
				title
				description
				image
				siteName
				url
			}
			pictures {
				publicId
				width
				height
			}
			candidate {
				name
				profilePic {
					publicId
				}
			}
			createdAt
		}
	}
`;

const ElectionUpdates = ({ electionId, candidateId, showPending }) => {
	const { data, loading, refetch } = useQuery(UPDATES_QUERY, {
		variables: { electionId: electionId, candidateId },
		fetchPolicy: 'network-only'
	});

	const user = React.useContext(UserContext);
	const election = React.useContext(ElectionContext);

	React.useEffect(() => {
		// Our network-only provision isn't being respected so this is a temporary fix
		cache.reset().then(() => refetch());
	}, [refetch, user, election]);

	if (loading) {
		return <Loading />;
	}

	const updates = data.updates.filter(update => {
		return update.approval.status === 'approved' || showPending;
	});

	return (
		<div>
			{updates.length ? (
				updates.map(update => (
					<Update
						key={update.id}
						{...update}
						showPending={showPending}
					/>
				))
			) : (
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
							{candidateId
								? "This candidate hasn't posted any updates yet"
								: "There aren't any updates for this election yet"}
						</p>
					</main>
				</div>
			)}
		</div>
	);
};

export default ElectionUpdates;
