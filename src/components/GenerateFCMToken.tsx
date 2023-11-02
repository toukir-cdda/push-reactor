import React, { useCallback, useEffect, useState } from 'react';
import { getToken, isSupported, getMessaging, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';

// Type for Firebase Configuration
type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
};

// Type for VAPID Key
type VapidKey = string;

interface GenerateFCMTokenProps {
    firebaseConfig: FirebaseConfig;
    vapidKey: VapidKey;
    inAppNotification?: (payload: any | null) => void;
    getDeviceToken?: ({ token, isLoading, error }: { token: string; isLoading: boolean; error: string }) => void;
}

let messaging: Messaging | undefined;

const getFirebaseConfig = (firebaseConfig: FirebaseConfig) => {
    isSupported()
        .then((supported) => {
            if (supported) {
                initializeApp(firebaseConfig);

                messaging = getMessaging();
            } else {
                console.error('Browser does not support notifications');
            }
        })
        .catch((e) => {
            console.error(e);
        });
};

const hasNotificationPermission = () => {
    try {
        return Notification.permission === 'granted';
    } catch (error) {
        return false;
    }
};

const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('An error occurred while requesting permission', error);
        return false;
    }
};

export const GenerateFCMToken: React.FC<GenerateFCMTokenProps> = ({ firebaseConfig, vapidKey, inAppNotification, getDeviceToken }) => {
    getFirebaseConfig(firebaseConfig);
    const [hasPermission, setHasPermission] = useState(hasNotificationPermission());
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');

    const registerToken = useCallback(
        async (messaging: Messaging) => {
            try {
                const token = await getToken(messaging, {
                    vapidKey: vapidKey
                });
                return { token };
            } catch (error) {
                return { error };
            }
        },
        [vapidKey]
    );
    // notification permission request
    useEffect(() => {
        if (!hasPermission) {
            requestNotificationPermission().then((permission) => {
                setHasPermission(permission);
            });
        }
    }, [hasPermission]);

    // register token and listen for messages
    useEffect(() => {
        if (!messaging || !hasPermission || token || isLoading) {
            return;
        }
        setIsLoading(true);
        // set token to empty string
        if (getDeviceToken) {
            getDeviceToken({ token: '', isLoading: true, error: '' });
        }
        // listen for in app notfication
        if (inAppNotification) {
            onMessage(messaging, (payload) => {
                inAppNotification(payload);
            });
        }

        registerToken(messaging).then(({ token, error }) => {
            if (error || !token) {
                console.error(`Notifications: ${error ?? 'No token received'}`);
                if (getDeviceToken) {
                    getDeviceToken({
                        token: '',
                        isLoading: false,
                        error: error ? error.toString() : ''
                    });
                }
            } else {
                // console.log(`Notifications: ${token}`);
                setToken(token);

                if (getDeviceToken) {
                    getDeviceToken({ token: token, isLoading: false, error: '' });
                }
            }
            setIsLoading(false);
        });
    }, [hasPermission, token, isLoading, registerToken, inAppNotification, getDeviceToken, date]);

    // to simulate re-render for fetch token
    useEffect(() => {
        if (token === '') {
            const timer = window.setTimeout(() => {
                setDate(new Date());
            }, 1000);
            return () => {
                window.clearTimeout(timer);
            };
        }
    }, [token]);

    return null;
};
