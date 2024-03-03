import React, { useState } from "react";
import { Button, Image, ScrollView, Text, TextInput, TouchableOpacity, View, Modal } from "react-native";
import LoginStyles from "../../Styles/login";
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import RNPickerSelect from 'react-native-picker-select';

import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { useAuth } from "../AuthContext";



export interface PlantData {
    name: string,
    price: string,
    images: Array<any>,
    place: string, //indoor or outdoor or both

}



function BussinessProviderHome(navigation: any) {

    const placementTypes: any = ["Indoor Plants", "Outdoor Plants", "Both"]
    const userDetails_From_Auth = useAuth(); //to verify whether the user is loggedIn or not

    // const [selectedImageList, setSelectedImage] = useState<Array<any>>([]);
    // const [price, setPrice] = useState<string>("");

    const [selectedImageList, setSelectedImage] = useState([]);
    const [price, setPrice] = useState("")
    const [name, setName] = useState("")
    const [placement, setPlacement] = useState<any>("Indoor Plants")
    const [isDropdownselected, setIsDropdownSelected] = useState(false)
    // const [statePlantData, setPlantData] = useState<PlantData>({
    //     name: '',
    //     price: '',
    //     images: [],
    //     place: '',
    // });

    const openImagePicker = () => {

        const options: any = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            multiple: true,
        };

        launchImageLibrary(options, (response: any) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('Image picker error: ', response.error);
            } else {
                console.log("response", response)

                let imageUri = response.uri || response.assets?.[0]?.uri;

                const newSelectedImageList: any = selectedImageList.concat(...response.assets)
                // const newSelectedImageList:any = [...selectedImage,...response.assets]
                setSelectedImage(newSelectedImageList);

                // setPlantData((prevState: any) => {
                //     return {
                //         ...prevState,
                //         images: newSelectedImageList
                //     }
                // })
            }
        });

    }

    function removeImage(image: any) {

        const selectedImages = selectedImageList.filter((x: any) => x.uri !== image.uri)

        setSelectedImage([...selectedImages])

    }


    async function logOut() {
        console.log("click me")

        try {
            await auth().signOut();
            navigation.navigate("Login")
        } catch (error) {
            console.error('Error logging out:', error);
        }

    }

    const sendDataToFirestore = async () => {
        try {
            const collectionRef = firestore().collection('bussiness_plants_doc');
            // {   //it is needed when i have custom document id else the firestore will create random guid
            //     const docRef = collectionRef.doc('custom_document_id'); // Replace with your desired custom document ID
            // }
            // Add a new document with the data
            // await docRef.set({

            await collectionRef.add({
                name: name,
                price: price,
                placement: placement,
                imagesList: selectedImageList,
                createdBy: userDetails_From_Auth?.uid
            });

            console.log("doneee")
            setPlacement("Indoor Plants")
            setPrice("")
            setSelectedImage([])
            setName("")

        } catch (error) {
            console.error('Error sending data to Firestore:', error);
        }
    };

    

    function handleDropdown() {
        console.log("Ss")
        setIsDropdownSelected(prev => !prev)
    }


    // console.log("statePlantData", selectedImageList, placement, price, isDropdownselected)
    return (
        <View>
            <ScrollView>
                <Text style={{ color: 'black', textAlign: "center" }}>This iZ Bussiness</Text>

                <Text style={{ color: 'black', textAlign: "center" }}>Plant Name</Text>
                <TextInput value={name} style={[LoginStyles.textInputView, LoginStyles.bottomGap]} onChangeText={(e) => setName(e)}></TextInput>

                <Text style={{ color: 'black', textAlign: "center" }}>Plant Price</Text>
                <TextInput value={price} style={[LoginStyles.textInputView, LoginStyles.bottomGap]} keyboardType="numeric" maxLength={4} onChangeText={(e) => setPrice(e)}></TextInput>

                <TouchableOpacity onPress={() => handleDropdown()}>
                    <Text>Select Plant Type: {placement}</Text>
                </TouchableOpacity>

                <Modal
                    visible={isDropdownselected}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={handleDropdown}
                >
                    

                    <TouchableOpacity
                        style={{ flex: 1,  backgroundColor: 'rgba(0, 0, 0, 0.5)', }}
                        onPress={handleDropdown} // Handle closing the modal when clicked outside
                    >
                        <View style={{ backgroundColor: 'red',margin:5, top:'30%',alignContent:'center',justifyContent:'center', }}>
                        {/* <Text>hi</Text> */}

                        {placementTypes.map((x: any) => {
                            return <TouchableOpacity style={{padding:5,paddingLeft:15}} onPress={()=>{setPlacement(x),handleDropdown()}}>
                                <Text>{x}</Text>
                            </TouchableOpacity>
                        })
                        }

                    </View>
                    </TouchableOpacity>
                </Modal>

                <Text>Selected value: {placement}</Text>

                {/* <TextInput value={price} style={[LoginStyles.textInputView, LoginStyles.bottomGap]} keyboardType="numeric" maxLength={4} onChangeText={(e) => { setPrice(e) }}></TextInput> */}

               

                {selectedImageList.map((image: any, index: number) => {
                    return <View key={index}>
                        <TouchableOpacity onPress={() => { removeImage(image) }}><Text>x {index}</Text></TouchableOpacity>
                        <Image key={index} source={{ uri: image.uri }} style={{ width: 200, height: 200, marginBottom: 10 }} />
                    </View>
                })}

                <Button title="Pick Image" onPress={() => openImagePicker()} />

                <Button title={"Send Data"} onPress={() => sendDataToFirestore()} />

                <TouchableOpacity onPress={() => logOut()}><Text style={LoginStyles.text}>log out</Text></TouchableOpacity>

            </ScrollView>
        </View>
    )
}

export default BussinessProviderHome;



// const onChangeTextInput = (value: string, fieldName: string) => {

    //     setPlantData((prevState: any) => {
    //         return {
    //             ...prevState,
    //             [fieldName]: prevState[fieldName] + (value)
    //         }
    //     })
    // }
    // const onChangeTextInput = (value: string, fieldName: any) => {
    //     setPlantData((prevState: any) => {
    //         const updatedState = {
    //             ...prevState,
    //             [fieldName]: prevState[fieldName] + (value)
    //         };
    //         console.log('statePlantData', updatedState);
    //         return updatedState;
    //     });
    // }


     {/* {selectedImage.map((image: any, index: number) => (
                <Image key={index} source={{ uri: image.uri }} style={{ width: 200, height: 200, marginBottom: 10 }} />
                 ))}  
                */}