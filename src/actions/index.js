import { auth, provider, storage } from "../firebase";
import db from "../firebase";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { SET_USER, SET_LOADING_STATUS, GET_ARTICLES } from "./actionType";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  QuerySnapshot,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export const setUser = (payload) => ({
  type: SET_USER,
  user: payload,
});

export const setLoading = (status) => ({
  type: SET_LOADING_STATUS,
  status: status,
});

export const getArticles = (payload) => ({
  type: GET_ARTICLES,
  payload: payload,
});

export function signInAPI() {
  return (dispatch) => {
    signInWithPopup(auth, provider)
      .then((payload) => {
        dispatch(setUser(payload.user));
      })
      .catch((error) => alert(error.message));
  };
}

export function getUserAuth() {
  return (dispatch) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser(user));
      }
    });
  };
}

export function signOutAPI() {
  return (dispatch) => {
    signOut(auth)
      .then(() => {
        dispatch(setUser(null));
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
}

export function postArticleAPI(payload) {
  return (dispatch) => {
    dispatch(setLoading(true));
    const storageRef = ref(storage, `images/${payload.image.name}`);
    const upload = uploadBytesResumable(storageRef, payload.image);
    const articleCollectionRef = collection(db, "articles");
    if (payload.image != "") {
      //   const upload = storage
      //     .ref(`images/${payload.image.name}`)
      //     .put(payload.image);

      upload.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          console.log(`Progress: ${progress}%`);

          if (snapshot.state === "RUNNING") {
            console.log(`progress: ${progress}%`);
          }
        },
        (error) => console.log(error.code),
        async () => {
          getDownloadURL(upload.snapshot.ref).then((downloadURL) => {
            addDoc(articleCollectionRef, {
              actor: {
                description: payload.user.email,
                title: payload.user.displayName,
                date: payload.timestamp,
                image: payload.user.photoURL,
              },
              video: payload.video,
              sharedImg: downloadURL,
              comments: 0,
              description: payload.description,
              timestamp: Timestamp.now(),
            });
            dispatch(setLoading(false));
          });
        }
      );
    } else if (payload.video) {
      addDoc(articleCollectionRef, {
        actor: {
          description: payload.user.email,
          title: payload.user.displayName,
          date: payload.timestamp,
          image: payload.user.photoURL,
        },
        video: payload.video,
        sharedImg: "",
        comments: 0,
        description: payload.description,
        timestamp: Timestamp.now(),
      });
      dispatch(setLoading(false));
    }
  };
}

// export function getArticlesAPI() {
//   return (dispatch) => {
//     let payload;
//     onSnapshot(
//       query(collection(db, "articles"), orderBy("timestamp", "desc")),
//       (snapshot) => {
//         payload = snapshot.docs.map((doc) => doc.data());
//         console.log(payload);
//       }
//     );
//   };
// }

// export function getArticlesAPI() {
//   return (dispatch) => {
//     console.log("we load");
//     let payload;
//     const queryWithOrderBy = query(
//       collection(db, "articles"),
//       orderBy("timestamp", "desc")
//     );
//     console.log("we load 2");
//     onSnapshot(
//       query(collection(db, "articles"), orderBy("timestamp", "desc")),
//       (snapshot) => {
//         console.log("here");
//         payload = snapshot.docs.map((doc) => doc.data());
//         console.log(payload);
//       }
//     );
//   };
// }

export function getArticlesAPI() {
  return (dispatch) => {
    const articlesCollection = collection(db, "articles");
    const queryWithOrderBy = query(
      articlesCollection,
      orderBy("timestamp", "desc")
    );

    // subscribing to the query using onSnapshot
    const unsubscribe = onSnapshot(queryWithOrderBy, (snapshot) => {
      const payload = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      dispatch(getArticles(payload));
    });
  };
}
