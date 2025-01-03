import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    container: {
      height: '100%',
      width: '100%',
      backgroundColor:"#d1d0f0",
      alignItems: 'center'
    },
    buttonContainer: {
        backgroundColor: 'white',
        marginTop: '30%',
        height: '40%',
        width: '80%',
        borderRadius: 10
    },
    textInput: {
      backgroundColor: "#f1f0f8",
      alignSelf:"center",
      height: '20%',
      width: "80%",
      borderRadius: 10,
      fontSize: 27,
      paddingHorizontal: "5%",
      fontFamily: 'MarkerFelt-Thin',
      marginTop: '20%'
    },
    loadingSwirl: {
      position: 'absolute',
      marginTop: 200
    }
})

export default styles