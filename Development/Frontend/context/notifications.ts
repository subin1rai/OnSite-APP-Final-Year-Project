import * as Notifications from 'expo-notifications';
export const initializationNotification = async ()=>{
    console.log("initializationNotification");
   await Notifications.requestPermissionsAsync().then((status) => {
        if (status.status !== 'granted') {
            console.log('Notification permissions not granted');
        }
    });

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
 
}