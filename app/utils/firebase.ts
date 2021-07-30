import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

import { IStorageItem } from "./storage";
import { captureException } from "./sentry";

export async function initFirebase() {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyCHjQG1n_F8PdciEAr7WodbOR-dimT2Nus",
      authDomain: "youblock-44c9c.firebaseapp.com",
      projectId: "youblock-44c9c",
      storageBucket: "youblock-44c9c.appspot.com",
      messagingSenderId: "519721661437",
      appId: "1:519721661437:web:cd8a9456ed3b24d83fdf94",
      measurementId: "G-JDE9NS2TQW",
    };
    firebase.initializeApp(firebaseConfig);
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
      .set({
        ...config,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
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
