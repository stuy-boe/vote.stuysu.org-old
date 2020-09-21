import React from 'react';
import { gql, useMutation, useQuery } from '@apollo/client';
import Update from '../../../comps/Update';
import { Button } from '@rmwc/button';
import Loading from '../../../comps/utils/Loading';
import DialogQueue from '../../../comps/queues/DialogQueue';

const UPDATES = gql`
	query {
		updates {
			id
			content
			approval {
				status
				message
				reviewedAt
			}
			pictures {
				publicId
				defaultUrl
			}
			link {
				url
				title
				image
				description
				siteName
			}
			showOnHome
			pinned
			official
			candidate {
				name
				profilePic {
					publicId
					defaultUrl
				}
			}
		}
	}
`;

const REVIEW = gql`
	mutation($updateId: String!, $status: String!, $message: String) {
		alterUpdateApproval(
			updateId: $updateId
			status: $status
			message: $message
		) {
			id
			title
			content
			approval {
				status
				message
			}
		}
	}
`;

const Updates = () => {
	const { data, loading, refetch, error } = useQuery(UPDATES, {
		fetchPolicy: 'no-cache'
	});

	const [review] = useMutation(REVIEW, { update: () => refetch() });

	if (loading || !data.updates) {
		return <Loading />;
	}

	if (error) {
		return <p>{error.message}</p>;
	}

	return (
		<div>
			<h2>Updates Approval</h2>
			{data.updates
				.sort((a, b) => {
					if (a.approval?.status === 'pending') {
						return -1;
					}

					if (b?.approval?.status === 'pending') {
						return 1;
					}

					if (new Date(a.createdAt) < new Date(b.createdAt)) {
						return -1;
					}
					return 1;
				})
				.map(update => {
					return (
						<Update
							key={update.id}
							{...update}
							showPending
							extra={
								<>
									{update?.approval?.status === 'pending' ? (
										<>
											<Button
												onClick={async () => {
													const confirm = await DialogQueue.confirm(
														{
															body:
																'Are you sure you want to approve this post?'
														}
													);

													if (confirm) {
														await review({
															variables: {
																updateId:
																	update.id,
																status:
																	'approved'
															}
														});
													}
												}}
											>
												Approve
											</Button>
											<br />
											<Button
												onClick={async () => {
													const reason = await DialogQueue.prompt(
														{
															body:
																'Provide a reason for rejecting this post:',
															inputProps: {
																label: 'Reason'
															}
														}
													);

													if (reason) {
														await review({
															variables: {
																updateId:
																	update.id,
																status:
																	'rejected',
																message: reason
															}
														});
													}
												}}
											>
												Reject
											</Button>
											<br />
										</>
									) : null}
								</>
							}
						/>
					);
				})}
		</div>
	);
};

export default Updates;
