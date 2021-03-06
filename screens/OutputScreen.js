import React, { Component } from 'react';
import {View, FlatList, ScrollView, AsyncStorage, Image, Dimensions} from 'react-native';
import firebase from "react-native-firebase";
import NetInfo from "@react-native-community/netinfo";
import { ListItem, Text } from 'react-native-elements';

export default class OutputScreen extends Component {
    constructor() {
        super()
        this.state = {
            disease: {},
            species: {},
            speciesImages: [],
            diseaseImages: undefined,
            isInternetConnected: false,
            isDescriptionVisible: false,
            isCauseVisible: false,
            isControlVisible: false,
            isSymptomsVisible: false,
            isSpeciesImagesVisible: false,
            isDiseaseImagesVisible: false,
            screenWidth: Dimensions.get("window").width,

        };
    }

    componentWillMount() {
        NetInfo.addEventListener(state => {
            this.setState({
                isInternetConnected: state.isInternetReachable
            })
        })
    }

    getDiseaseData = async () => {
        if (this.state.isInternetConnected) {
            let disease = this.props.navigation.state.params.result
            let diseaseDetail
            let species = disease.species
            let ref = firebase.database().ref("species/");
            let query = ref.orderByChild("common_name")
                .equalTo(species)
            query.on("value", (snapshot) => {
                snapshot.forEach((child) => {
                    console.log(child)
                    if (disease.disease !== 'h') {
                        species = child.val()
                        diseaseDetail = child.val().diseases.filter(function (childDisease) {
                            return childDisease.common_name === disease.disease
                        })
                    }
                    this.setState({
                        disease: !!diseaseDetail[0] ? diseaseDetail[0] : '',
                        species: species,
                        speciesImages: species.imageLink,
                        diseaseImages: !!diseaseDetail[0] ? diseaseDetail[0].imageLink : undefined,
                    }, () => {
                        console.log(this.state.diseaseImages)
                    })
                });
            });
        } else {
            try {
                let disease = this.props.navigation.state.params.result
                let diseaseDetail, values
                let species = disease.species
                const value = await AsyncStorage.getItem(`_${species}`);
                values = JSON.parse(value)
                if (value !== null) {
                    // We have data!!
                    values = Object.values(values)
                    values = values[0]
                    if (disease.disease !== 'h') {
                        diseaseDetail = values.diseases.filter(function (childDisease) {
                            return childDisease.common_name === disease.disease
                        })
                    }
                    this.setState({
                        species: values,
                        disease: !!diseaseDetail[0] ? diseaseDetail[0] : '',
                        speciesImages: species.imageLink,
                        diseaseImages: !!diseaseDetail[0] ? diseaseDetail[0].imageLink : undefined,
                    })
                }
            } catch (error) {
                console.log(error)
                // Error retrieving data
            }
        }
    }

    componentDidMount() {
        this.getDiseaseData()
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange');
    }

    toggleDescription = () => {
        this.setState({
            isDescriptionVisible: !this.state.isDescriptionVisible
        })
    }

    toggleCause = () => {
        this.setState({
            isCauseVisible: !this.state.isCauseVisible
        })
    }

    toggleControl = () => {
        this.setState({
            isControlVisible: !this.state.isControlVisible
        })
    }

    toggleSymptoms = () => {
        this.setState({
            isSymptomsVisible: !this.state.isSymptomsVisible
        })
    }

    toggleSpeciesImages = () => {
        this.setState({
            isSpeciesImagesVisible: !this.state.isSpeciesImagesVisible
        })
    }

    toggleDiseaseImages = () => {
        this.setState({
            isDiseaseImagesVisible: !this.state.isDiseaseImagesVisible
        })
    }


    renderSeparator = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: '#CED0CE'
                }}
            />
        );
    };

    render() {
        let i = 1;
        let imageWidth = this.state.screenWidth
        let imageHeight = Math.floor(imageWidth * 0.6)
        return (
            <ScrollView>
                <View>
                    <FlatList
                        data={[`${this.state.species.common_name}`]}
                        renderItem={({ item }) =>
                            <ListItem

                                title={<Text h2>About Species:</Text>}
                            ></ListItem>}
                        keyExtractor={item => item}
                    />

                    {this.renderSeparator()}
                    <FlatList
                        data={[`${this.state.species.common_name}`]}
                        renderItem={({ item }) =>
                            <ListItem

                                title={<Text><Text h4>Common Name: </Text> <Text style={{ fontSize: 20 }}>{item}</Text></Text>}
                            ></ListItem>}
                        keyExtractor={item => item}
                    />

                    {this.renderSeparator()}
                    <FlatList
                        data={[`${this.state.species.scientific_name}`]}
                        renderItem={({ item }) =>
                            <ListItem

                                title={<Text><Text h4>Scientific Name: </Text><Text style={{ fontSize: 20 }}>{item}</Text></Text>}
                            ></ListItem>}
                        keyExtractor={item => item}
                    />

                    {this.renderSeparator()}
                    <FlatList
                        data={[`${this.state.species.description}`]}
                        renderItem={({ item }) =>
                            <ListItem

                                title={<Text><Text h4>Description:</Text> <Text style={{ fontSize: 20 }}>(Touch for detail)</Text></Text>}
                                onPress={() => this.toggleDescription()}
                            ></ListItem>}
                        keyExtractor={item => item}
                    />
                    {this.state.isDescriptionVisible ? <FlatList
                        data={[`${this.state.species.description}`]}
                        renderItem={({ item }) =>
                            <ListItem

                                title={<Text style={{ fontSize: 20 }}>{item}</Text>}
                            ></ListItem>}
                        keyExtractor={item => item}
                    /> : null}
                    {this.renderSeparator()}
                    {(!!this.state.speciesImages) ?
                        <FlatList
                            data={[`${this.state.speciesImages}`]}
                            renderItem={({ item }) =>
                                <ListItem

                                    title={<Text><Text h4>Images:</Text> <Text style={{ fontSize: 20 }}>(Touch to see)</Text></Text>}
                                    onPress={() => this.toggleSpeciesImages()}
                                ></ListItem>}
                            keyExtractor={item => item}
                        />
                        :
                        null}
                    {this.state.isSpeciesImagesVisible ?

                        this.state.speciesImages.map(img => {
                            return (
                                <View style={{
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <Image
                                        source={{
                                            uri: img
                                        }}
                                        style={{
                                            resizeMode: 'contain',
                                            marginTop: 30,height:imageHeight,width:imageWidth
                                        }}>
                                    </Image>
                                </View>
                            )
                        })

                        : null}
                    {this.renderSeparator()}
                    {this.renderSeparator()}
                    {
                        this.props.navigation.state.params.result.disease !== 'Healthy' ?
                            <View>
                                <FlatList
                                    data={[`${this.state.disease.common_name}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text h2>About Disease:</Text>}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.renderSeparator()}
                                <FlatList
                                    data={[`${this.state.disease.common_name}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text><Text h4>Common Name:</Text> <Text style={{ fontSize: 20 }}> {item}</Text></Text>}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.renderSeparator()}
                                <FlatList
                                    data={[`${this.state.disease.disease_scientific_name}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text><Text h4>Scientific Name:</Text> <Text style={{ fontSize: 20 }}>{item}</Text></Text>}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.renderSeparator()}
                                <FlatList
                                    data={[`${this.state.disease.cause}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text><Text h4>Cause:</Text> <Text style={{ fontSize: 20 }}>(Touch for detail)</Text></Text>}
                                            onPress={() => this.toggleCause()}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.state.isCauseVisible ?
                                    <FlatList
                                        data={[`${this.state.disease.cause}`]}
                                        renderItem={({ item }) =>
                                            <ListItem

                                                title={<Text style={{ fontSize: 20 }}>{item} </Text>}
                                            ></ListItem>}
                                        keyExtractor={item => item}
                                    /> : null}
                                {this.renderSeparator()}
                                <FlatList
                                    data={[`${this.state.disease.symptoms}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text><Text h4>Symptoms:</Text> <Text style={{ fontSize: 20 }}>(Touch for detail)</Text></Text>}
                                            onPress={() => this.toggleSymptoms()}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.state.isSymptomsVisible ?
                                    <FlatList
                                        data={[`${this.state.disease.symptoms}`]}
                                        renderItem={({ item }) =>
                                            <ListItem

                                                title={<Text style={{ fontSize: 20 }}>{item} </Text>}
                                            ></ListItem>}
                                        keyExtractor={item => item}
                                    /> : null}
                                {this.renderSeparator()}
                                <FlatList
                                    data={[`${this.state.disease.control}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text><Text h4>Control:</Text> <Text style={{ fontSize: 20 }}>(Touch for detail)</Text></Text>}
                                            onPress={() => this.toggleControl()}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.state.isControlVisible ?
                                    <FlatList
                                        data={[`${this.state.disease.control}`]}
                                        renderItem={({ item }) =>
                                            <ListItem

                                                title={<Text style={{ fontSize: 20 }}>{item} </Text>}
                                            ></ListItem>}
                                        keyExtractor={item => item}
                                    /> : null}
                                {this.renderSeparator()}
                                {!!this.state.diseaseImages ?
                                    <FlatList
                                        data={[`${this.state.diseaseImages}`]}
                                        renderItem={({ item }) =>
                                            <ListItem

                                                title={<Text><Text h4>Images:</Text> <Text style={{ fontSize: 20 }}>(Touch to see)</Text></Text>}
                                                onPress={() => this.toggleDiseaseImages()}
                                            ></ListItem>}
                                        keyExtractor={item => item}
                                    />
                                    :
                                    null}
                                {this.state.isDiseaseImagesVisible ?

                                    this.state.diseaseImages.map(img => {
                                        return (
                                            <View style={{
                                                justifyContent: 'center',
                                                alignItems: 'center'
                                            }}>
                                                <Image
                                                    source={{
                                                        uri: img
                                                    }}
                                                    style={{
                                                        resizeMode: 'contain',
                                                        marginTop: 30,height:imageHeight,width:imageWidth
                                                    }}>
                                                </Image>
                                            </View>
                                        )
                                    })

                                    : null}
                                {this.renderSeparator()}
                            </View> :
                            <View>
                                <FlatList
                                    data={[`${this.state.species.common_name}`]}
                                    renderItem={({ item }) =>
                                        <ListItem

                                            title={<Text h2>Your Plant is totally healthy</Text>}
                                        ></ListItem>}
                                    keyExtractor={item => item}
                                />
                                {this.renderSeparator()}
                            </View>
                    }
                </View >
            </ScrollView>
        )
    }
}