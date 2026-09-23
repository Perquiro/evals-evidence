export function createLibrary() {
  const books = new Map([
    ['101', { id: '101', title: 'River Atlas', available: true }],
    ['102', { id: '102', title: 'Garden Notes', available: false }],
    ['103', { id: '103', title: 'Night Trains', available: false }],
  ]);
  const holds = new Map();
  let nextHold = 301;
  let renewals = 0;
  let returned = false;
  const reply = (status, body) => ({ status, body });
  return ({ method, pathname, query, actor, body }) => {
    if (method === 'GET' && pathname === '/') return reply(200, {
      product: 'Willow Library', environment: 'Local disposable development service. All data is synthetic.',
      docs: '/docs', links: { catalog: '/catalog', account: '/account', serviceDesk: '/desk' },
    });
    if (method === 'GET' && pathname === '/docs') return reply(200, {
      authentication: 'Set X-Actor to Reader or Librarian, the available local demo sessions. No credentials are needed.',
      navigation: 'Follow links and actions in responses. Actions give their HTTP method and JSON fields. An empty object is valid when no fields are listed.',
    });
    if (!['Reader', 'Librarian'].includes(actor)) return reply(403, { error: 'Choose an available session' });
    if (method === 'GET' && pathname === '/catalog') {
      const matched = [...books.values()].filter(book => book.title.toLowerCase().includes((query.get('q') ?? '').toLowerCase()));
      return reply(200, { books: matched.map(book => ({ ...book, href: `/books/${book.id}` })),
        search: { href: '/catalog?q=<title>', field: 'q' },
        ...(matched.length ? {} : { message: 'No books found', clear: '/catalog' }),
      });
    }
    if (method === 'GET' && pathname.startsWith('/books/')) {
      const book = books.get(pathname.split('/')[2]);
      return book ? reply(200, { ...book, actions: [{ label: 'Reserve book', method: 'POST', href: '/holds', json: { bookId: book.id }, actor: 'Reader' }] }) : reply(404, { error: 'Book not found' });
    }
    if (method === 'GET' && pathname === '/account') return reply(200, { links: { reservations: '/holds', loans: '/loans' }, actor });
    if (method === 'GET' && pathname === '/holds') return reply(200, { holds: [...holds.values()].map(hold => ({ ...hold, cancel: { method: 'DELETE', href: `/holds/${hold.id}` } })),
      ...(!holds.size ? { message: 'No reservations' } : {}) });
    if (method === 'POST' && pathname === '/holds') {
      if (actor !== 'Reader') return reply(403, { error: 'Reservations require Reader' });
      if (!body.bookId) return reply(422, { error: 'Book is required' });
      const book = books.get(body.bookId);
      if (!book) return reply(404, { error: 'Book not found' });
      if (!book.available) return reply(409, { error: 'Book is unavailable' });
      if ([...holds.values()].some(hold => hold.bookId === book.id)) return reply(409, { error: 'Already reserved' });
      const hold = { id: String(nextHold++), bookId: book.id, title: book.title };
      holds.set(hold.id, hold);
      return reply(201, { ...hold, links: { reservations: '/holds' } });
    }
    if (method === 'DELETE' && pathname.startsWith('/holds/')) {
      if (actor !== 'Reader') return reply(403, { error: 'Reservations require Reader' });
      return holds.delete(pathname.split('/')[2]) ? reply(200, { message: 'Reservation cancelled' }) : reply(404, { error: 'Reservation not found' });
    }
    if (method === 'GET' && pathname === '/loans') return reply(200, { loans: returned ? [] : [{ id: '201', title: 'Garden Notes', href: '/loans/201' }], ...(returned ? { message: 'No loans' } : {}) });
    if (method === 'GET' && pathname === '/loans/201') return returned ? reply(404, { error: 'Loan not found' }) : reply(200, {
      id: '201', bookId: '102', title: 'Garden Notes', renewals, due: renewals ? '2026-10-15' : '2026-10-01',
      actions: [{ label: 'Renew loan', method: 'POST', href: '/loans/201/renew', actor: 'Reader' }, { label: 'Return book', method: 'POST', href: '/loans/201/return', actor: 'Reader' }],
    });
    if (method === 'POST' && pathname === '/loans/201/renew') {
      if (actor !== 'Reader') return reply(403, { error: 'Renewal requires Reader' });
      if (returned) return reply(404, { error: 'Loan not found' });
      if (renewals) return reply(409, { error: 'Renewal limit reached' });
      renewals++;
      return reply(200, { id: '201', renewals, due: '2026-10-15' });
    }
    if (method === 'POST' && pathname === '/loans/201/return') {
      if (actor !== 'Reader') return reply(403, { error: 'Returns require Reader' });
      if (returned) return reply(404, { error: 'Loan not found' });
      returned = true;
      books.get('102').available = true;
      return reply(200, { message: 'Book returned', bookId: '102', catalog: '/catalog', loans: '/loans' });
    }
    if (method === 'GET' && pathname === '/desk') {
      if (actor !== 'Librarian') return reply(403, { error: 'Service desk requires Librarian' });
      return reply(200, { checkIn: { label: 'Check in a book', method: 'POST', href: '/desk/returns', json: { bookId: '103' } }, pendingReturns: books.get('103').available ? [] : [{ bookId: '103', title: 'Night Trains' }] });
    }
    if (method === 'POST' && pathname === '/desk/returns') {
      if (actor !== 'Librarian') return reply(403, { error: 'Service desk requires Librarian' });
      if (!body.bookId) return reply(422, { error: 'Book is required' });
      const book = books.get(body.bookId);
      if (!book) return reply(404, { error: 'Book not found' });
      if (book.available) return reply(409, { error: 'Book is already checked in' });
      book.available = true;
      return reply(200, { message: 'Book checked in', bookId: book.id, href: `/books/${book.id}` });
    }
    return reply(404, { error: 'Not found' });
  };
}
