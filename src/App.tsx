import { Camera, CameraCapturedPicture, CameraType } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
    // eslint-disable-next-line prettier/prettier
    const [cameraPermission, requestCameraPermission] = Camera.useCameraPermissions();
    const [isCameraReady, setIsCameraReady] = React.useState(false);
    const cameraRef = React.useRef<Camera>(null);
    const [picture, setPicture] = React.useState<CameraCapturedPicture>();

    const takePicture = useCallback(async () => {
        if (!isCameraReady || !cameraRef.current) return;

        const photo = await cameraRef.current.takePictureAsync();
        setPicture(photo);
    }, [isCameraReady, cameraRef]);

    useEffect(() => {
        if (!picture) return;
        // TODO Upload picture to Vision API and do something with the result
    }, [picture]);

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
    }
});
