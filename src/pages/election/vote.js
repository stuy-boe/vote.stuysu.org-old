import React from 'react';
import { generatePath } from 'react-router-dom';
import layout from './../../styles/Layout.module.css';
import UnstyledLink from '../../comps/utils/UnstyledLink';
import { Button } from '@rmwc/button';
import rejected from '../../vectors/marginalia-rejected.svg';

const Vote = ({ match }) => {
	return (
		<div className={layout.container}>
			<main className={layout.main}>
				<h2 className={layout.title}>Voting</h2>
				<img
					src={rejected}
					alt={'Someone next to an x'}
					style={{ maxHeight: '40vh' }}
				/>
				<p>This election hasn't opened for voting yet.</p>
				<UnstyledLink to={generatePath('/election/:url', match.params)}>
					<Button outlined>Go Back</Button>
				</UnstyledLink>
			</main>
		</div>
	);
};

export default Vote;
