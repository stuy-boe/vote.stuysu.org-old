import React from 'react';
import { List, SimpleListItem } from '@rmwc/list';
import { Icon } from '@rmwc/icon';
import { Avatar } from '@rmwc/avatar';
import '@rmwc/avatar/styles';
import { createUseStyles } from 'react-jss';
import DialogQueue from './queues/DialogQueue';

const useStyles = createUseStyles({
	list: {
		border: '1px solid lightgrey',
		borderRadius: 5,
		cursor: 'pointer',
		'&:hover': {
			opacity: 0.9
		}
	},
	icon: {
		height: 70,
		width: 70,
		objectFit: 'contain'
	}
});

function LinkPreview({ title, description, image, url, siteName }) {
	const classes = useStyles();

	const confirmDialog = async () => {
		const confirmation = await DialogQueue.confirm({
			body: (
				<>
					<p>
						The link you clicked on is taking you to{' '}
						<code>{url}</code>.
					</p>
					<p>Are you sure you want to continue?</p>
				</>
			)
		});

		if (confirmation) {
			window.open(url);
		}
	};

	return (
		<List
			twoLine
			nonInteractive
			className={classes.list}
			onAction={confirmDialog}
		>
			<SimpleListItem
				text={title}
				secondaryText={description}
				graphic={
					<Icon
						icon={
							<Avatar
								src={image}
								size="xlarge"
								name={title}
								square
								className={classes.icon}
							/>
						}
					/>
				}
			/>
		</List>
	);
}
export default LinkPreview;
