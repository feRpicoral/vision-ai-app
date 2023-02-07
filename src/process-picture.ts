import { CameraCapturedPicture } from 'expo-camera';
import { vision_v1 } from 'googleapis';

import { instance } from './axios';

// https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageRequest
export async function processPicture(
    picture: CameraCapturedPicture
): Promise<void> {
    console.log('processPicture');
    const body: vision_v1.Schema$BatchAnnotateImagesRequest = {
        requests: [
            {
                image: {
                    content: picture.base64
                },
                features: [
                    {
                        maxResults: 50,
                        type: 'OBJECT_LOCALIZATION'
                    }
                    // {
                    //     maxResults: 50,
                    //     type: 'LABEL_DETECTION'
                    // }
                ]
            }
        ]
    };

    const result =
        await instance.post<vision_v1.Schema$BatchAnnotateImagesResponse>(
            '/v1/images:annotate',
            body
        );

    console.log(JSON.stringify(result.data, null, 2));
}
