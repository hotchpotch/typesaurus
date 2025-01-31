import assert, { rejects } from 'assert'
import onGetMany from '.'
import get from '../get'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import add from '../add'
import update from '../update'
import sinon from 'sinon'
import set from '../set'
import remove from '../remove'

describe('onGetMany', () => {
  type Fruit = { color: string }

  const fruits = collection<Fruit>('fruits')

  beforeAll(async () => {
    await Promise.all([
      set(fruits, 'apple', { color: 'green' }),
      set(fruits, 'banana', { color: 'yellow' }),
      set(fruits, 'orange', { color: 'orange' })
    ])
  })

  let off: (() => void) | undefined

  afterEach(() => {
    off && off()
    off = undefined
  })

  it('returns nothing when called with empty array', () => {
    return new Promise(resolve => {
      off = onGetMany(fruits, [], list => {
        expect(list.length).toBe(0)
        resolve()
      })
    })
  })

  it('allows to get single doc by id', () => {
    return new Promise(resolve => {
      off = onGetMany(fruits, ['apple'], fruitsFromDB => {
        expect(fruitsFromDB.length).toBe(1)
        expect(fruitsFromDB[0].__type__).toBe('doc')
        expect(fruitsFromDB[0].data.color).toBe('green')
        expect(fruitsFromDB[0].ref.id).toBe('apple')
        expect(fruitsFromDB[0].ref.collection.path).toBe('fruits')
        resolve()
      })
    })
  })

  it('allows to get multiple docs by id', () => {
    return new Promise(resolve => {
      off = onGetMany(
        fruits,
        ['banana', 'apple', 'banana', 'orange'],
        fruitsFromDB => {
          expect(fruitsFromDB.length).toBe(4)
          expect(fruitsFromDB[0].ref.id).toBe('banana')
          expect(fruitsFromDB[1].ref.id).toBe('apple')
          expect(fruitsFromDB[2].ref.id).toBe('banana')
          expect(fruitsFromDB[3].ref.id).toBe('orange')
          resolve()
        }
      )
    })
  })

  // TODO: Find a way to enable missing ids handling

  // it('throws an error when an id is missing', () => {
  //   return new Promise((resolve, reject) => {
  //     off = onGetMany(
  //       fruits,
  //       ['nonexistant'],
  //       () => {
  //         reject(new Error('onResult should not been called'))
  //       },
  //       err => {
  //         expect(err.message).toBe('Missing document with id nonexistant')
  //         resolve()
  //       }
  //     )
  //   })
  // })

  // it('allows to specify custom logic when a document is not found', () => {
  //   return new Promise(resolve => {
  //     off = onGetMany(
  //       fruits,
  //       ['nonexistant'],
  //       list => {
  //         expect(list.length).toBe(1)
  //         expect(list[0].data.color).toBe(
  //           'nonexistant is missing but I filled it in'
  //         )
  //         resolve()
  //       },
  //       null,
  //       id => ({
  //         color: `${id} is missing but I filled it in`
  //       })
  //     )
  //   })
  // })

  // it('allows to ignore missing documents', () => {
  //   return new Promise(resolve => {
  //     off = onGetMany(
  //       fruits,
  //       ['apple', 'nonexistant', 'banana'],
  //       list => {
  //         expect(list.length).toBe(2)
  //         resolve()
  //       },
  //       null,
  //       'ignore'
  //     )
  //   })
  // })

  describe('real-time', () => {
    it('subscribes to updates', async () => {
      const spy = sinon.spy()
      await set(fruits, 'mango', { color: 'green' })

      setTimeout(() => {
        update(fruits, 'mango', { color: 'yellow' })
      })

      return new Promise(resolve => {
        off = onGetMany(fruits, ['mango'], list => {
          if (list[0].data.color === 'yellow') resolve()
        })
      })
    })
  })
})
