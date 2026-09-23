import { createLibrary } from './library-product.mjs';

export const products = {
  'willow-library': {
    name: 'Willow Library', actors: ['Reader', 'Librarian'],
    prompt: 'Explore Willow Library and record useful Knowledge about what people can do and what happens. Use the available sessions. Keep this first pass to at most 40 Product requests, then tell me what you covered and what remains.',
  },
  'cedar-shop': {
    name: 'Cedar Shop', actors: ['Shopper'],
    prompt: 'Explore how someone buys an item and checks their order in Cedar Shop. Try the available checkout outcomes and record what happens so we can decide what to cover next.',
  },
  'harbor-desk': {
    name: 'Harbor Desk', actors: ['Customer', 'Support'],
    prompt: 'Explore a customer opening a support ticket and a support person handling it in Harbor Desk. Also look at how billing staff refund a ticket charge if you can access that part.',
  },
  'atlas-directory': {
    name: 'Atlas Directory', actors: ['Member'],
    prompt: 'Continue exploring customer search in Atlas Directory. Check a matching search, a search with no matches, and opening two customer details. Build on what is already recorded.',
  },
};

export function createProduct(slug) {
  if (slug === 'willow-library') return createLibrary();
  let order = null;
  let ticket = null;
  const reply = (status, body) => ({ status, body });
  const actorRequired = (actor, expected) => actor === expected ? null : reply(403, { error: `Requires ${expected}` });
  return ({ method, pathname, query, actor, body }) => {
    if (method === 'GET' && pathname === '/') return reply(200, {
      product: products[slug].name,
      environment: 'Local disposable development service. All data is synthetic.',
      docs: '/docs',
    });
    if (method === 'GET' && pathname === '/docs') {
      const common = { authentication: 'Set X-Actor to an available Actor name. These are local demo sessions, with no credentials.',
        navigation: 'GET / is the service index; GET /docs describes the API.' };
      if (slug === 'cedar-shop') return reply(200, { ...common, operations: [
        { method: 'GET', path: '/cart', label: 'Cart', actor: 'Shopper' },
        { method: 'POST', path: '/checkout', label: 'Checkout', actor: 'Shopper', json: { email: 'shopper@example.invalid or empty', payment: 'approved or declined' } },
        { method: 'GET', path: '/orders/:id', label: 'Order details', actor: 'Shopper', hint: 'Use the order URL returned by checkout.' },
      ] });
      if (slug === 'harbor-desk') return reply(200, { ...common, operations: [
        { method: 'POST', path: '/tickets', label: 'Open ticket', actor: 'Customer', json: { subject: 'Any non-empty subject' } },
        { method: 'GET', path: '/tickets/:id', label: 'Ticket details', actor: 'Customer or Support' },
        { method: 'POST', path: '/tickets/:id/replies', label: 'Reply to ticket', actor: 'Support', json: { message: 'Any non-empty message' } },
        { method: 'POST', path: '/tickets/:id/refund', label: 'Refund charge', actor: 'Billing', json: { amount: 10 } },
      ] });
      return reply(200, { ...common, operations: [
        { method: 'GET', path: '/customers?q=<text>', label: 'Customers', actor: 'Member', examples: ['Ada', 'Nobody'] },
        { method: 'GET', path: '/customers/:id', label: 'Customer details', actor: 'Member', examples: ['101', '102'] },
      ] });
    }
    if (slug === 'cedar-shop') {
      const forbidden = actorRequired(actor, 'Shopper');
      if (forbidden) return forbidden;
      if (method === 'GET' && pathname === '/cart') return reply(200, { items: [{ name: 'Notebook', quantity: 1, price: 12 }], total: 12, checkout: '/checkout' });
      if (method === 'POST' && pathname === '/checkout') {
        if (!body.email) return reply(422, { error: 'Email is required', cartPreserved: true });
        if (body.payment === 'declined') return reply(402, { error: 'Payment declined', cartPreserved: true });
        if (body.payment !== 'approved') return reply(422, { error: 'Choose approved or declined' });
        order = { id: '501', status: 'confirmed', total: 12 };
        return reply(201, { ...order, url: '/orders/501' });
      }
      if (method === 'GET' && pathname === '/orders/501' && order) return reply(200, order);
    }
    if (slug === 'harbor-desk') {
      if (method === 'POST' && pathname === '/tickets') {
        const forbidden = actorRequired(actor, 'Customer');
        if (forbidden) return forbidden;
        if (!body.subject) return reply(422, { error: 'Subject is required' });
        ticket = { id: '701', subject: body.subject, status: 'open', replies: [] };
        return reply(201, { ...ticket, url: '/tickets/701' });
      }
      if (pathname.startsWith('/tickets/701') && ticket) {
        if (method === 'GET' && pathname === '/tickets/701') {
          if (!['Customer', 'Support'].includes(actor)) return reply(403, { error: 'Requires Customer or Support' });
          return reply(200, { ...ticket, ...(actor === 'Support' ? { internalQueue: 'general', canReply: true } : { canReply: false }) });
        }
        if (method === 'POST' && pathname.endsWith('/replies')) {
          const forbidden = actorRequired(actor, 'Support');
          if (forbidden) return forbidden;
          if (!body.message) return reply(422, { error: 'Message is required' });
          ticket.replies.push(body.message);
          ticket.status = 'answered';
          return reply(201, ticket);
        }
        if (method === 'POST' && pathname.endsWith('/refund')) return reply(403, { error: 'Billing session unavailable' });
      }
    }
    if (slug === 'atlas-directory') {
      const forbidden = actorRequired(actor, 'Member');
      if (forbidden) return forbidden;
      const customers = [{ id: '101', name: 'Ada North' }, { id: '102', name: 'Ben West' }];
      if (method === 'GET' && pathname === '/customers') {
        const matches = customers.filter(customer => customer.name.toLowerCase().includes((query.get('q') ?? '').toLowerCase()));
        return reply(200, { customers: matches, ...(matches.length ? {} : { message: 'No customers found. Clear your search to see all customers.' }) });
      }
      if (method === 'GET' && pathname.startsWith('/customers/')) {
        const customer = customers.find(item => pathname === `/customers/${item.id}`);
        if (customer) return reply(200, customer);
      }
    }
    return reply(404, { error: 'Not found' });
  };
}
