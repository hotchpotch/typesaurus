/**
 * Browser Firestore adaptor.
 */
import { getAll } from '../utils'

export async function dynamicImportAdaptor() {
  const firebase = await import('firebase/app')
  await import('firebase/firestore')
  const firestore = firebase.firestore()

  // At the moment, the browser's Firestore adaptor doesn't support getAll.
  // Get rid of the fallback when the issue is closed:
  // https://github.com/firebase/firebase-js-sdk/issues/1176
  if (!('getAll' in firestore)) Object.assign(firestore, { getAll })

  return {
    firestore,
    consts: {
      DocumentReference: firebase.firestore.DocumentReference,
      Timestamp: firebase.firestore.Timestamp,
      FieldValue: firebase.firestore.FieldValue
    }
  }
}
