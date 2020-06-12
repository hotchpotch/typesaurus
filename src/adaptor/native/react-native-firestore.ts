/**
 * ReactNative Firestore adaptor.
 */
import { getAll } from '../utils'

export async function dynamicImportAdaptor() {
  const nativeFirestore = await import('@react-native-firebase/firestore')
  const firestore = nativeFirestore.default()
  // @ts-ignore: React Native Firebase doesn't export types for internal modules
  const DocumentReference = FirestoreDocumentReference as nativeFirebase.FirebaseFirestoreTypes.DocumentReference
  // At the moment, the React Native Firebase adaptor doesn't support getAll.
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })

  return {
    firestore,
    consts: {
      DocumentReference,
      Timestamp: nativeFirestore.firebase.firestore.Timestamp,
      FieldValue: nativeFirestore.firebase.firestore.FieldValue
    }
  }
}
