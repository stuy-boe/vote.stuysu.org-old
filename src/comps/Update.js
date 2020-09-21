import React from 'react';
import { Card } from '@rmwc/card';
import ReactMarkdown from 'react-markdown';
import cloudinaryCore from '../utils/cloudinaryCore';
import LinkPreview from './LinkPreview';
import moment from 'moment-timezone';
import { List, SimpleListItem } from '@rmwc/list';
import { Icon } from '@rmwc/icon';
import Slideshow from './Slideshow';
import { createUseStyles } from 'react-jss';
import boeLogo from './../img/png/logo512.png';

const useStyles = createUseStyles({
	content: {
		padding: '0 1.5rem 1.5rem 1.5rem'
	},
	subtitle: {
		color: 'grey'
	}
});

const Update = ({
	content,
	link,
	pictures,
	createdAt,
	candidate,
	official,
	approval,
	extra,
	showPending
}) => {
	const classes = useStyles();

	console.log(official, candidate);

	return (
		<Card outlined style={{ margin: '1rem 0' }}>
			<List twoLine nonInteractive>
				<SimpleListItem
					text={official ? 'Board of Elections' : candidate.name}
					secondaryText={moment(createdAt).format('MM/DD/YY')}
					graphic={
						<Icon
							icon={{
								icon: official
									? boeLogo
									: cloudinaryCore.url(
											candidate.profilePic.publicId,
											{
												secure: true,
												height: 50,
												width: 50,
												crop: 'fill',
												radius: 'max'
											}
									  ),
								size: 'xlarge'
							}}
						/>
					}
				/>
			</List>
			<div className={classes.content}>
				<ReactMarkdown
					disallowedTypes={['image']}
					escapeHtml={true}
					source={content}
					renderers={{
						link: props => {
							return (
								<a
									href={props.href}
									style={{
										color: '#0984e3',
										textDecoration: 'underline'
									}}
								>
									{props.children}
								</a>
							);
						}
					}}
				/>
				{Boolean(pictures?.length) && (
					<>
						<p className={classes.subtitle}>Pictures:</p>{' '}
						<Slideshow pictures={pictures} />
					</>
				)}
				{Boolean(link) && Boolean(link.title) && (
					<>
						<p className={classes.subtitle}>Links:</p>{' '}
						<LinkPreview {...link} />
					</>
				)}
			</div>
			{showPending && approval?.status !== 'approved' && (
				<div style={{ padding: '1rem' }}>
					<hr />
					<h4>Approval Status: {approval.status}</h4>
					{Boolean(approval.message) && (
						<p>Reason: {approval.message}</p>
					)}
				</div>
			)}
			{extra}
		</Card>
	);
};

export default Update;
