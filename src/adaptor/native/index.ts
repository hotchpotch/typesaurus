/**
 * ReactNative Firebase adaptor.
 */

type AdaptorType = 'browser' | 'react-native-firestore'
let currentAdaptorType: AdaptorType = 'browser'

/**
 * setAdaptor 'browser' (@firebase/firestore) or 'react-native-firebase' (@react-native-firebase/firestore)
 * default: 'browser'
 * @param adaptorType
 */
export function setAdaptor(adaptorType: AdaptorType) {
  currentAdaptorType = adaptorType
}

export default async function adaptor() {
  if (currentAdaptorType === 'react-native-firestore') {
    return (await import('./react-native-firestore')).dynamicImportAdaptor()
  } else if (currentAdaptorType === 'browser') {
    return (await import('./browser')).dynamicImportAdaptor()
  }
  throw new Error('Unknown Adaptor Type')
}

export function injectAdaptor() {
  throw new Error(
    'Injecting adaptor is not supported in the browser environment'
  )
}
