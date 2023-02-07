import { GOOGLE_CLOUD_API_KEY } from '@env';
import axios from 'axios';

export const instance = axios.create({
    baseURL: 'https://vision.googleapis.com',
    params: {
        key: GOOGLE_CLOUD_API_KEY
    },
    withCredentials: true
});
