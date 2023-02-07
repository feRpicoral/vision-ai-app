import { Camera, CameraCapturedPicture, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import {
    Button,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ObjectLocalizationResponse, processPicture } from './process-picture';

export default function App() {
    /* eslint-disable prettier/prettier */
    const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
    const [isCameraReady, setIsCameraReady] = React.useState(false);
    const [picture, setPicture] = React.useState<CameraCapturedPicture>();
    const [interpretation, setInterpretation] = React.useState<ObjectLocalizationResponse>();
    const cameraRef = React.useRef<Camera>(null);
    /* eslint-enable prettier/prettier */

    const computeBoundingBoxes = useCallback(() => {
        if (!interpretation || !picture) return [];

        type Vertice = { x: number; y: number };

        type BoundingBox = {
            label: string;
            absoluteVertices: [Vertice, Vertice, Vertice, Vertice];
        };

        const boundingBoxes: BoundingBox[] = [];

        for (const response of interpretation.responses) {
            for (const annotations of response.localizedObjectAnnotations) {
                if (
                    annotations.boundingPoly?.normalizedVertices?.length !== 4
                ) {
                    console.warn(
                        'Bounding box has not 4 vertices. Skipping...'
                    );
                    continue;
                }

                const boundingBox = {
                    label: annotations.name ?? 'Unknown',
                    absoluteVertices:
                        annotations.boundingPoly.normalizedVertices.map(
                            vertice => ({
                                x: (vertice.x ?? 0) * picture.width,
                                y: (vertice.y ?? 0) * picture.height
                            })
                        )
                };

                // @ts-ignore This safety check is done above
                boundingBoxes.push(boundingBox);
            }
        }

        return boundingBoxes;
    }, [picture, interpretation]);

    const takePicture = useCallback(async () => {
        if (!isCameraReady || !cameraRef.current) return;

        // eslint-disable-next-line prettier/prettier
        const picture = await cameraRef.current.takePictureAsync({ base64: true });
        setPicture(picture);
        const result = await processPicture(picture);
        setInterpretation(result);

        // TODO:
        //  Draw the bounding boxes based on google vision response (https://www.npmjs.com/package/react-bounding-box)
    }, [isCameraReady, cameraRef]);

    useEffect(() => {
        if (interpretation) {
            console.log(JSON.stringify(computeBoundingBoxes(), null, 2));
        }
    }, [interpretation]);

    if (!cameraPermission) {
        return (
            <View style={styles.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    if (!cameraPermission.granted) {
        return (
            <View style={styles.container}>
                <Text>Camera permission not granted</Text>
                <Button
                    title={'Request Camera Permission'}
                    onPress={requestCameraPermission}
                />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="auto" />
            <SafeAreaProvider>
                <View style={styles.container}>
                    {picture ? (
                        <ImageBackground source={picture} style={{ flex: 1 }}>
                            <SafeAreaView style={styles.previewContainer}>
                                <TouchableOpacity
                                    onPress={() => setPicture(undefined)}
                                >
                                    <Text style={styles.closePictureButton}>
                                        {'\u00d7'}
                                    </Text>
                                </TouchableOpacity>
                            </SafeAreaView>
                        </ImageBackground>
                    ) : (
                        <Camera
                            type={CameraType.back}
                            style={styles.camera}
                            ref={cameraRef}
                            onCameraReady={() => setIsCameraReady(true)}
                        >
                            <TouchableOpacity
                                style={styles.takePictureButton}
                                onPress={takePicture}
                            >
                                <View style={styles.innerTakePictureButton} />
                            </TouchableOpacity>
                        </Camera>
                    )}
                </View>
            </SafeAreaProvider>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center'
    },
    camera: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    takePictureButton: {
        width: 55,
        height: 55,
        borderRadius: 55 / 2,
        marginBottom: '15%',
        justifyContent: 'center',
        alignItems: 'center',
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 5,
        padding: 20
    },
    innerTakePictureButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white'
    },
    previewContainer: {
        flex: 1
    },
    closePictureButton: {
        fontSize: 45,
        alignSelf: 'flex-end',
        marginRight: 20
    }
});
