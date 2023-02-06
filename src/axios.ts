import axios from 'axios';

export const instance = axios.create({
    baseURL: 'https://vision.googleapis.com',
    params: {
        key: 'AIzaSyDGu9KSsJIEzeIskAKhJ2p0_zQGAtAmGjY'
    },
    withCredentials: true
});
