import { Camera, CameraCapturedPicture, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback } from 'react';
import {
    Button,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { processPicture } from './process-picture';

export default function App() {
    // eslint-disable-next-line prettier/prettier
    const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
    const [isCameraReady, setIsCameraReady] = React.useState(false);
    const [picture, setPicture] = React.useState<CameraCapturedPicture>();
    const cameraRef = React.useRef<Camera>(null);

    const takePicture = useCallback(async () => {
        if (!isCameraReady || !cameraRef.current) return;

        // eslint-disable-next-line prettier/prettier
        const picture = await cameraRef.current.takePictureAsync({ base64: true });
        setPicture(picture);
        await processPicture(picture);

        // TODO:
        //  Draw the bounding boxes based on google vision response (https://www.npmjs.com/package/react-bounding-box)
    }, [isCameraReady, cameraRef]);

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
