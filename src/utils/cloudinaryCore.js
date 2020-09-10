import { Cloudinary } from 'cloudinary-core';
import { CLOUDINARY_CLOUD } from '../constants';

const cloudinaryCore = new Cloudinary({ cloud_name: CLOUDINARY_CLOUD });

export default cloudinaryCore;
