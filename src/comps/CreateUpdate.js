import React from 'react';
import SimpleMDE from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';
import MessageQueue from './queues/MessageQueue';
import { Button } from '@rmwc/button';
import { Card } from '@rmwc/card';
import '../styles/SimpleMDE.css';
import LinkPreview from './LinkPreview';
import { gql, useMutation, useQuery } from '@apollo/client';
import Loading from './utils/Loading';
import Carousel from 'react-multi-carousel';
import { Icon } from '@rmwc/icon';
import { CandidateContext } from '../pages/election/candidate';
import { ElectionContext } from '../pages/election';
import DialogQueue from './queues/DialogQueue';
import { cache } from './context/ApolloProvider';

const responsive = {
	desktop: {
		breakpoint: { max: 4000, min: 0 },
		items: 1,
		slidesToSlide: 1
	}
};

const linkify = require('linkifyjs');
const LINK_PREVIEW_QUERY = gql`
	query($url: String!) {
		linkPreview(url: $url) {
			title
			description
			siteName
			url
			image
		}
	}
`;

const DynamicLinkPreview = ({ url }) => {
	const { data, loading } = useQuery(LINK_PREVIEW_QUERY, {
		variables: { url }
	});

	if (loading) {
		return <Loading />;
	}

	if (!data.linkPreview?.title) {
		return null;
	}

	return (
		<div style={{ padding: '1rem' }}>
			<LinkPreview {...data.linkPreview} />
		</div>
	);
};

const CREATE_UPDATE = gql`
	mutation(
		$title: String!
		$content: String!
		$link: String
		$pictures: [Upload!]
		$candidateId: String
	) {
		createUpdate(
			title: $title
			content: $content
			link: $link
			pictures: $pictures
			candidateId: $candidateId
		) {
			id
		}
	}
`;

const SubmitUpdate = ({ title, content, link, pictures, clear }) => {
	const candidate = React.useContext(CandidateContext);
	const election = React.useContext(ElectionContext);
	const [submit, { loading }] = useMutation(CREATE_UPDATE, {
		variables: {
			title,
			content,
			link,
			pictures,
			candidateId: candidate.id
		}
	});

	const handleClick = async () => {
		try {
			const confirm = await DialogQueue.confirm({
				body: 'Are you sure you want to make this post?'
			});
			if (confirm) {
				await submit();
				clear();
				cache.reset().then(() => election.refetch());
			}
		} catch (er) {
			MessageQueue.notify({ body: er.message });
		}
	};

	return (
		<Button
			outlined
			style={{ margin: '1rem' }}
			onClick={handleClick}
			disabled={loading}
		>
			Submit
		</Button>
	);
};

class CreateUpdate extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditing: false,
			value: `You can:\n* Create Lists\n* Upload Images (click on the image icon)\n* [Add Links](https://vote.stuysu.org)\n* And more! Click the help icon for more information`,
			pics: [],
			title: 'removed',
			link: 'https://vote.stuysu.org'
		};

		this.fileInputRef = React.createRef();
		this.rootRef = React.createRef();
		this.onFile = this.onFile.bind(this);

		this.clear = () => {
			this.setState({
				isEditing: false,
				value: '',
				pics: [],
				link: ''
			});
		};
	}

	onFile(event) {
		// Do something with the files
		const file = event.target.files[0];

		if (!file.type.startsWith('image/')) {
			return MessageQueue.notify({
				body: 'You are only allowed to upload image files'
			});
		}

		if (file.size > 1000 * 1000 * 5) {
			return MessageQueue.notify({
				body: 'Your uploaded file must be smaller than 5MB.'
			});
		}

		this.setState(state => ({
			pics: state.pics.concat(file)
		}));
	}

	componentDidUpdate(prevProps, prevState) {
		if (
			prevState.isEditing !== this.state.isEditing &&
			this.rootRef.current
		) {
			this.rootRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'nearest'
			});
		}

		if (prevState.value !== this.state.value) {
			const links = linkify.find(this.state.value, 'url');
			this.setState({ link: links[0]?.href });
		}
	}

	render() {
		if (!this.state.isEditing) {
			return (
				<div style={{ textAlign: 'right' }}>
					<Button
						onClick={() => this.setState({ isEditing: true })}
						outlined
					>
						Create New Post +
					</Button>
				</div>
			);
		}

		return (
			<Card outlined ref={this.rootRef}>
				<input
					type={'file'}
					accept={'.jpg,.jpeg,.png,.svg,.gif'}
					ref={this.fileInputRef}
					onChange={this.onFile}
					style={{ display: 'none' }}
				/>
				<SimpleMDE
					onChange={value => this.setState({ value })}
					value={this.state.value}
					options={{
						autofocus: true,
						spellChecker: false,
						uploadImage: false,
						status: [],
						toolbar: [
							'bold',
							'italic',
							'heading',
							'|',
							'quote',
							'unordered-list',
							'ordered-list',
							'link',
							{
								name: 'image',
								className: 'fa fa-image',
								style: { color: 'green' },
								action: () => {
									this.fileInputRef.current.click();
								},
								title: 'Image'
							},
							'|',
							'preview',
							'guide'
						],
						minHeight: '150px'
					}}
					className={'simpleMDE'}
				/>
				<div>
					{Boolean(this.state.pics.length) && (
						<>
							<Carousel responsive={responsive}>
								{this.state.pics.map((pic, index) => (
									<div
										style={{
											position: 'relative'
										}}
									>
										<Icon
											style={{
												position: 'absolute',
												right: '3rem',
												background: 'grey',
												borderRadius: '50%',
												color: 'white',
												cursor: 'pointer'
											}}
											onClick={() => {
												const pics = Array.from(
													this.state.pics
												);
												pics.splice(index, 1);
												this.setState({ pics });
											}}
											icon={{ icon: 'close' }}
										/>
										<img
											src={window.URL.createObjectURL(
												pic
											)}
											alt={'Upload'}
											style={{
												objectFit: 'contain',
												width: '100%',
												height: '300px'
											}}
										/>
									</div>
								))}
							</Carousel>
						</>
					)}
					{Boolean(this.state.link) && (
						<DynamicLinkPreview url={this.state.link} />
					)}
					<SubmitUpdate
						title={this.state.title}
						content={this.state.value}
						pictures={this.state.pics}
						link={this.state.link}
						clear={this.clear}
					/>
				</div>
			</Card>
		);
	}
}

export default CreateUpdate;
