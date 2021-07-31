import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { IStorageItem } from "./storage";
import { captureException } from "./sentry";
import { config } from "./config";

export async function initFirebase() {
  try {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(config.firebase);
    }
    await firebase.auth().signInAnonymously();
  } catch (error) {
    captureException(error, "app");
  }
}

export async function storeConfig(config: any) {
  try {
    const { currentUser } = firebase.auth();
    await firebase
      .firestore()
      .collection("users")
      .doc(currentUser.uid)
      .set(
        {
          ...config,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
  } catch (error) {
    captureException(error, "app");
  }
}

export async function storeNotificationToken(notificationToken: string) {
  try {
    const { currentUser } = firebase.auth();
    await firebase.firestore().collection("users").doc(currentUser.uid).set(
      {
        notificationToken,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    captureException(error, "app");
  }
}

export async function syncFirestore(
  item: IStorageItem,
  type: "videos" | "channels" | "keywords",
  action: "union" | "remove"
) {
  try {
    const { currentUser } = firebase.auth();

    await firebase
      .firestore()
      .collection("blocked")
      .doc(currentUser.uid)
      .set(
        {
          [type]:
            action === "union"
              ? firebase.firestore.FieldValue.arrayUnion(item)
              : firebase.firestore.FieldValue.arrayRemove(item),
        },
        { merge: true }
      );
  } catch (error) {
    captureException(error, "app");
  }
}

export async function getRemoteConfig() {
  try {
    return await firebase.firestore().collection("config").doc("main").get();
  } catch (error) {
    captureException(error, "app");
    return undefined;
  }
}
