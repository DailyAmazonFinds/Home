let allProducts = { featured: [], top: [] }; // store globally

// Load products from products.json
async function loadProducts() {
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Failed to load products.json');
    const data = await res.json();
    allProducts = data; // store globally
    renderProducts('featuredList', data.featured);
    renderProducts('topList', data.top);
  } catch (err) {
    console.error('❌ Error loading products:', err);
  }
}

// Create a product card
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

// Render a list of products
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }
  list.forEach(product => container.appendChild(createCard(product)));
}

// Apply search filter
function applySearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderProducts('featuredList', allProducts.featured);
    renderProducts('topList', allProducts.top);
    return;
  }

  const filterFn = p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.code || '').toLowerCase().includes(q);

  const filteredFeatured = allProducts.featured.filter(filterFn);
  const filteredTop = allProducts.top.filter(filterFn);

  renderProducts('featuredList', filteredFeatured);
  renderProducts('topList', filteredTop);
}

// Setup
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => applySearch(e.target.value));
  }
});
