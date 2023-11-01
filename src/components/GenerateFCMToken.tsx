import React, { useEffect, useState } from 'react';
import { getToken, isSupported, getMessaging, onMessage, Messaging } from 'firebase/messaging';
import { initializeApp } from 'firebase/app';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    inAppNotification?: boolean;
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

function ToastDisplay({ payload }: any) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
                background: 'white',
                color: 'gray'
            }}
        >
            <img width={70} height={70} src={payload?.data?.icon} alt="" />
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'white',
                    color: 'gray'
                }}
            >
                <span
                    style={{
                        fontWeight: 'bold'
                    }}
                >
                    {payload?.data?.title}
                </span>
                <span
                    style={{
                        lineHeight: '1.2'
                    }}
                >
                    {payload?.data?.body}
                </span>
            </div>
        </div>
    );
}

export const GenerateFCMToken: React.FC<GenerateFCMTokenProps> = ({ firebaseConfig, vapidKey, inAppNotification = false, getDeviceToken }) => {
    getFirebaseConfig(firebaseConfig);
    const [hasPermission, setHasPermission] = useState(hasNotificationPermission());
    const [date, setDate] = useState(new Date());
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState('');

    const registerToken = async (messaging: Messaging) => {
        try {
            const token = await getToken(messaging, {
                vapidKey: vapidKey
            });
            return { token };
        } catch (error) {
            return { error };
        }
    };
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
        if (getDeviceToken) {
            getDeviceToken({ token: '', isLoading: true, error: '' });
        }
        // listen for in app notfication
        if (inAppNotification) {
            onMessage(messaging, (payload) => {
                toast(<ToastDisplay payload={payload} />);
            });
        }

        registerToken(messaging).then(({ token, error }) => {
            if (error || !token) {
                console.error(`Notifications: ${error ?? 'No token received'}`);
                if (getDeviceToken) {
                    getDeviceToken({ token: '', isLoading: false, error: error ? error.toString() : '' });
                }
            } else {
                setToken(token);

                if (getDeviceToken) {
                    getDeviceToken({ token: token, isLoading: false, error: '' });
                }
            }
            setIsLoading(false);
        });
    }, [hasPermission, date, token, isLoading]);

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
    }, []);

    return (
        <>
            <ToastContainer />
        </>
    );
};
