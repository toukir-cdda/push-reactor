<h1 align="center" id="title">Push-reactor</h1>

<p id="description">"push-reactor" is a user-friendly npm package that simplifies the integration of Firebase Cloud Messaging (FCM) for push notifications in your web and mobile applications. With an easy setup and straightforward configuration push-reactor empowers developers to effortlessly send and receive push notifications enhancing user engagement and communication in their projects.</p>

<h2>🧐 Features</h2>

Here're some of the project's best features:

-   \*\*Simple Integration:\*\* Easily add push notifications to your application with just a few lines of code.
-   \*\*Firebase Ready:\*\* Built to work seamlessly with Firebase Cloud Messaging.
-   \*\*Customizable:\*\* Configure and style your notifications to match your application's design.
-   \*\*Cross-Platform:\*\* Supports web and mobile applications.

<h2>🛠️ Installation Steps:</h2>

<p> Install "push-reactor" via npm:</p>

```
npm install push-reactor
```

<p> Install "push-reactor" via yarn:</p>

```
yarn add push-reactor
```

<p> Once the package is installed you can import the library using import or require approach:</p>

```
import { GenerateFCMToken } from "push-reactor";
```

```render-babel
     <GenerateFCMToken
        firebaseConfig={firebaseConfig}
        vapidKey={vapidKey}
        inAppNotification={(payload: any) => console.log("in message", payload)}
        getDeviceToken={(data) => console.log(data)}
      />
```

<p> Create "firebase-messaging-sw.js" file in /public folder in your project:</p>

```render-babel
/* eslint-disable no-undef */
// eslint-disable-next-line no-undef
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);
const firebaseConfig = {
  apiKey: "<firebase-apiKey>"
authDomain: "<firebase-authDomain>"
projectId: "<firebase-projectId>"
storageBucket: "<firebase-storageBucket>"
messagingSenderId: "<firebase-messagingSenderId>"
appId: "<firebase-appId>"
measurementId: "<firebase-measurementId>"
};
// eslint-disable-next-line no-undef
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

// click on notification
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

//set notification
messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  self.registration.update();

  const notification = payload.data;
  if (!notification) {
    console.warn(
      "[firebase-messaging-sw.js] Unknown notification on message ",
      payload
    );
    return;
  }

  // Customize notification here
  const notificationOptions = {
    ...notification,
    data: {
      url: payload.data.openURL,
    },
  };

  self.registration.showNotification(notification.title, notificationOptions);
});
```
