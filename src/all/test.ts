import all from '.'
import assert from 'assert'
import set from '../set'
import { collection } from '../collection'
import { Ref, ref } from '../ref'
import get from '../get'
import remove from '../remove'

describe('all', () => {
  type Book = { title: string }
  type Order = { book: Ref<Book>; quantity: number; date?: Date }

  const books = collection<Book>('books')
  const orders = collection<Order>('orders')

  beforeEach(async () => {
    await Promise.all([
      set(books, 'sapiens', { title: 'Sapiens' }),
      set(books, '22laws', { title: 'The 22 Immutable Laws of Marketing' }),
      set(books, 'momtest', { title: 'The Mom Test' }),
      remove(books, 'hp1'),
      remove(books, 'hp2')
    ])
  })

  it('returns all documents in a collection', async () => {
    const docs = await all(books)
    assert.deepEqual(docs.map(({ data: { title } }) => title).sort(), [
      'Sapiens',
      'The 22 Immutable Laws of Marketing',
      'The Mom Test'
    ])
  })

  it('expands references', async () => {
    await Promise.all([
      set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1 }),
      set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1 })
    ])
    const docs = await all(orders)
    assert(docs[0].data.book.__type__ === 'ref')
    const orderedBooks = await Promise.all(
      docs.map(doc => get(books, doc.data.book.id))
    )
    assert.deepEqual(orderedBooks.map(({ data: { title } }) => title).sort(), [
      'Sapiens',
      'The 22 Immutable Laws of Marketing'
    ])
  })

  it('expands dates', async () => {
    const date = new Date(1987, 1, 11)
    await Promise.all([
      set(orders, 'order1', { book: ref(books, 'sapiens'), quantity: 1, date }),
      set(orders, 'order2', { book: ref(books, '22laws'), quantity: 1, date })
    ])
    const docs = await all(orders)
    assert(docs[0].data.date.getTime() === date.getTime())
    assert(docs[1].data.date.getTime() === date.getTime())
  })
})
