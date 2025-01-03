import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        backgroundColor:"#d1d0f0",
        alignItems: 'center'
    },
    image:{
        height: '18%',
        marginTop: '50%',
        aspectRatio: 480 / 203,
    },
    buttonContainer: {
        backgroundColor: 'white',
        marginTop: '35%',
        height: '35%',
        width: '80%',
        borderRadius: 10
    }
})

export default styles