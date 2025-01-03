import React, { useState, useRef } from "react"
import { View, TextInput, ActivityIndicator, Alert } from "react-native"
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker'

import { DetectDocumentTextCommand, TextractClient } from "@aws-sdk/client-textract"
import 'react-native-url-polyfill/auto'
import 'react-native-get-random-values'
import { ReadableStream } from 'web-streams-polyfill'
globalThis.ReadableStream = ReadableStream
import { Buffer } from "buffer"
globalThis.Buffer = Buffer

import Button from '../components/Button'
import IconBar from "../components/IconBar"
import styles from '../styles/UploadListScreen'
import { addWord } from '../content/current_words'

const UploadImageScreen = function ({ navigation }) {
	const selectedImage = useRef('')
	const [words, setWords] = useState([])
	const [listName, setListName] = useState('')
	const [loading, setLoading] = useState(0);

	const pickImage = async () => {
		setLoading(1)
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: false,
			aspect: [4, 3],
			quality: 1,
			base64: true
		})

		if (!result.canceled) {
			selectedImage.current = result.assets[0].base64
			onRunOCR()
		}
	}

	const onRunOCR = async () => {
		const client = new TextractClient({
			region: "us-east-1",
			credentials: {
				accessKeyId: '***REMOVED***',
				secretAccessKey: '***REMOVED***'
			}
		})

		const params = {
			Document: {
				Bytes: Buffer.from(selectedImage.current, 'base64')
			},
			FeatureTypes: ["LAYOUT"]
		}
		const command = new DetectDocumentTextCommand(params)
		try {
			const response = await client.send(command)
			for (let i = 0; i < response.Blocks.length; i++) {
				if (response.Blocks[i].BlockType == "WORD") {
					words.push(response.Blocks[i].Text)
					addWord(response.Blocks[i].Text)
				}
			}
			setLoading(2)
		} catch (error) {
			console.log("err: ", error)
		}
	}

	const handleTextChange = (text) => {
		setListName(text)
	}

	const createList = async () => {
		await AsyncStorage.setItem(listName, JSON.stringify(words))
		Alert.alert('List added!')
		navigation.navigate("MyTabs")
	}

	return <View style={styles.container}>
		<IconBar helpMessage=' ' navigation={navigation} />
		{loading == 1 && <ActivityIndicator size="large" color="#220a6a" style={styles.loadingSwirl} />}
		<View style={styles.buttonContainer}>
			{(loading == 0 || loading == 1) && <Button title='Select Image' numButtons={2} onTouch={() => pickImage()} />}
			{loading == 2 && <Button title='Selected!' numButtons={2} />}
			<TextInput
				autoComplete={'off'}
				autoCorrect={false}
				placeholder="Name your list here"
				placeholderTextColor={'black'}
				style={styles.textInput}
				onChangeText={handleTextChange}
				value={listName}
				returnKeyType="done"
				onSubmitEditing={createList}
			/>
		</View>
	</View>
}

export default UploadImageScreen