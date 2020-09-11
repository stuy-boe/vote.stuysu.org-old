import React from 'react';
import { Link } from 'react-router-dom';

const UnstyledLink = props => {
	return (
		<Link
			{...props}
			style={{
				color: 'unset',
				textDecoration: 'none'
			}}
		/>
	);
};

export default UnstyledLink;
