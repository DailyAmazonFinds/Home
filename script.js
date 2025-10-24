// Load products from products.json
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Failed to load products.json');
    return await res.json();
  } catch (err) {
    console.error('❌ Error loading products:', err);
    return { featured: [], top: [] };
  }
}

// Create product card
function createCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  const descHTML = product.desc ? `<p class="desc">${product.desc}</p>` : '';
  card.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <div class="card-body">
      <h3>${product.name}</h3>
      <div class="code">Code: ${product.code}</div>
      ${descHTML}
      <div class="price">${product.price}</div>
      <a href="${product.link}" class="btn" target="_blank">Buy on Amazon</a>
    </div>
  `;
  return card;
}

// Render a section
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }

  list.forEach(product => container.appendChild(createCard(product)));
}

// Apply search filter
function applySearch(products, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) {
    renderProducts('featuredList', products.featured);
    renderProducts('topList', products.top);
    return;
  }

  const filterFn = p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.code || '').toLowerCase().includes(q);

  renderProducts('featuredList', (products.featured || []).filter(filterFn));
  renderProducts('topList', (products.top || []).filter(filterFn));
}

// Load and render on startup
document.addEventListener('DOMContentLoaded', async () => {
  const products = await loadProducts();
  renderProducts('featuredList', products.featured);
  renderProducts('topList', products.top);

  document.getElementById('searchInput').addEventListener('input', e => {
    applySearch(products, e.target.value);
  });
});
