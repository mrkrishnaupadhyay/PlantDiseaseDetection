import React, {Component} from 'react';
import {Button, Platform, StyleSheet, View, Text, PermissionsAndroid} from 'react-native';
import ImagePicker from "react-native-image-picker";
import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicon from 'react-native-vector-icons/Ionicons';
import uuid from 'uuid';

const options = {
    storageOptions: {
        skipBackup: true,
        path: 'images',
    },
};

async function requestCameraPermission() {
    try {
        const granted = await PermissionsAndroid.requestMultiple(
            [PermissionsAndroid.PERMISSIONS.CAMERA, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]
            /*{
                title: 'Leafnosis Permissions',
                message: ':( Sorry, we need camera and storage permissions to capture and save photo. Please grant them, otherwise you cannot capture photos',
                // buttonNeutral: 'Ask Me Later',
                // buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },*/
        )
        const grantedLog = Object.values(granted);

        if (grantedLog.includes('denied')) {
            console.log('Permission denied');
        } else {
            console.log('Permission granted');
        }
    } catch (err) {
        console.warn(err);
    }
}

async function requestStoragePermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
            /*{
                title: 'Leafnosis Permissions',
                message: ':( Sorry, we need storage permission read your photo. Please grant it, otherwise you we cannot read photos',
                // buttonNeutral: 'Ask Me Later',
                // buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },*/
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Permission granted');
        } else {
            console.log('Permission denied');
        }
    } catch (err) {
        console.warn(err);
    }
}

export default class CameraScreen extends Component {
    constructor(props) {
        super(props)
        this.state = {
            storagePermissionGranted: PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        }
    }

    openCamera() {
        requestCameraPermission();
        // Launch Camera:
        ImagePicker.launchCamera(options, (response) => {
            let path = Platform.OS === 'ios' ? response.uri : 'file://' + response.path;
            const source = {uri: path};
            this.setState({
                photo: source,
            })
            if (path !== 'file://undefined') {
                const {navigate} = this.props.navigation;
                navigate('Imagee',
                    {photoss: this.state.photo});
            }
        });
    }

    openGallery() {
        requestCameraPermission();
        this.setState({name: uuid.v4()})
        // Open Image Library:
        ImagePicker.launchImageLibrary(options, (response) => {
            // Same code as in above section!
            let path = Platform.OS === 'ios' ? response.uri : 'file://' + response.path;
            const source = {uri: path};
            this.setState({
                photo: source,
            })
            if (path !== 'file://undefined') {
                const {navigate} = this.props.navigation;
                navigate('Imagee',
                    {photoss: this.state.photo});
            }
        });
    }

    navigateToDownload() {
        requestStoragePermission();
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then(result => {
            const {navigate} = this.props.navigation;
            if (result === true) {
                navigate('DownloadModels');
            }
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <View style={styles.photoOption}>
                    <View style={styles.cameraButtonView}>
                        <Icon
                            name="camera"
                            color="black"
                            onPress={() => this.openCamera()}
                            size={60}
                        />
                        <Text>Open Camera</Text>
                    </View>
                    <View style={styles.galleryButtonView}>
                        <Ionicon
                            name="md-photos"
                            color="black"
                            onPress={() => this.openGallery()}
                            size={60}
                        />
                        <Text>Open Gallery</Text>

                    </View>
                </View>
                <View style={styles.modelButtonView}>
                    <Ionicon.Button
                        name="md-download"
                        color="white"
                        backgroundColor="#009900"
                        borderRadius={10}
                        size={60}
                        onPress={() => this.navigateToDownload()}
                    >
                        Download Models for Known Species
                    </Ionicon.Button>
                </View>
            </View>
        )
    }
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // verticalAlign: 'center'
        // paddingTop: '50%'
        // backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        // padding: 20
    },
    photoOption: {
        flexDirection: 'row',
        padding: 50,
        justifyContent: 'space-between'
    },
    cameraButtonView: {
        padding: 50,
    },
    galleryButtonView: {
        padding: 50,
    },
    modelButtonView: {
        padding: 50,
    }
});