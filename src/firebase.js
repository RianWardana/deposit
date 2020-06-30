import firebase from '@firebase/app';
import '@firebase/auth';
import '@firebase/database';
import {firebaseConfig} from './configs.js';

firebase.initializeApp(firebaseConfig);

export {firebase};