import { Camera, CameraCapturedPicture, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import randomColor from 'randomcolor';
import React, { useCallback, useMemo } from 'react';
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

type Vertice = { x: number; y: number };

type BoundingBox = {
    label: string;
    absoluteVertices: [Vertice, Vertice, Vertice, Vertice];
    relativeVertices: [Vertice, Vertice, Vertice, Vertice];
};

export default function App() {
    /* eslint-disable prettier/prettier */
    const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
    const [isCameraReady, setIsCameraReady] = React.useState(false);
    const [picture, setPicture] = React.useState<CameraCapturedPicture>();
    const [interpretation, setInterpretation] = React.useState<ObjectLocalizationResponse>();
    const cameraRef = React.useRef<Camera>(null);
    /* eslint-enable prettier/prettier */

    const boudingBoxes: BoundingBox[] = useMemo(() => {
        if (!interpretation || !picture) return [];

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

                const boundingBox: BoundingBox = {
                    label: annotations.name ?? 'Unknown',
                    // @ts-ignore We checked the length of the array above
                    absoluteVertices:
                        annotations.boundingPoly.normalizedVertices.map(
                            vertice => ({
                                x: (vertice.x ?? 0) * picture.width,
                                y: (vertice.y ?? 0) * picture.height
                            })
                        ),
                    // @ts-ignore We checked the length of the array above
                    relativeVertices:
                        annotations.boundingPoly.normalizedVertices.map(
                            ({ x, y }) => ({ x: x ?? 0, y: y ?? 0 })
                        )
                };

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

    const closePreview = () => {
        setPicture(undefined);
        setInterpretation(undefined);
    };

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
                            <View
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0
                                }}
                            >
                                {boudingBoxes.map((boundingBox, index) => {
                                    const width =
                                        (boundingBox.relativeVertices[1].x -
                                            boundingBox.relativeVertices[0].x) *
                                        100;

                                    const height =
                                        (boundingBox.relativeVertices[2].y -
                                            boundingBox.relativeVertices[0].y) *
                                        100;

                                    const top =
                                        boundingBox.relativeVertices[0].y * 100;

                                    const left =
                                        boundingBox.relativeVertices[0].x * 100;

                                    // console.log(
                                    //     JSON.stringify(
                                    //         {
                                    //             label: boundingBox.label,
                                    //             top,
                                    //             left,
                                    //             height,
                                    //             width,
                                    //             relativeVertices:
                                    //                 boundingBox.relativeVertices
                                    //         },
                                    //         null,
                                    //         2
                                    //     )
                                    // );

                                    const color = randomColor();

                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                // TODO: I think I messed up my Xs and Ys, that's why I switched top/left and height/width
                                                top: `${left}%`,
                                                left: `${top}%`,
                                                height: `${width}%`,
                                                width: `${height}%`,
                                                borderWidth: 3,
                                                borderStyle: 'solid',
                                                position: 'absolute',
                                                borderColor: color
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color,
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {boundingBox.label}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                            <SafeAreaView style={styles.previewContainer}>
                                <TouchableOpacity onPress={closePreview}>
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
