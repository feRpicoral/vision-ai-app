import { CameraCapturedPicture } from 'expo-camera';
import { vision_v1 } from 'googleapis';

import { instance } from './axios';
import { GoogleCloudResponse, MakeRequired } from './types.helper';

export type ObjectLocalizationResponse = GoogleCloudResponse<
    MakeRequired<
        Pick<
            vision_v1.Schema$AnnotateImageResponse,
            'localizedObjectAnnotations' | 'error' | 'context'
        >,
        'localizedObjectAnnotations'
    >
>;

// https://cloud.google.com/vision/docs/reference/rest/v1/AnnotateImageRequest
export async function processPicture(
    picture: CameraCapturedPicture
): Promise<ObjectLocalizationResponse> {
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

    const { data } = await instance.post<ObjectLocalizationResponse>(
        '/v1/images:annotate',
        body
    );

    return data;
}
