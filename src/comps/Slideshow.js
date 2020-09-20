import React from 'react';
import cloudinaryCore from '../utils/cloudinaryCore';
import Carousel from 'react-multi-carousel';

const responsive = {
	desktop: {
		breakpoint: { max: 4000, min: 0 },
		items: 1,
		slidesToSlide: 1
	}
};

const Slideshow = ({ pictures }) => {
	return (
		<Carousel responsive={responsive}>
			{pictures.map(pic => (
				<img
					src={cloudinaryCore.url(pic.publicId, {
						secure: true,
						height: 300,
						crop: 'fit'
					})}
					alt={'Upload'}
					style={{
						width: '100%',
						height: '300px',
						objectFit: 'contain'
					}}
				/>
			))}
		</Carousel>
	);
};

export default Slideshow;
