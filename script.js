let allProducts = { featured: [], top: [] };

// Load products from products.json
async function loadProducts() {
  try {
    const res = await fetch('./products.json');
    if (!res.ok) throw new Error('products.json not found');
    const data = await res.json();
    allProducts = data;
    renderProducts('featuredList', allProducts.featured);
    renderProducts('topList', allProducts.top);
  } catch (err) {
    console.error('❌ Error loading products:', err);
    document.getElementById('featuredList').innerHTML = '<p class="empty">Failed to load products</p>';
    document.getElementById('topList').innerHTML = '<p class="empty">Failed to load products</p>';
  }
}

// Create a product card
function createCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <div class="card-body">
      <h3>${product.name}</h3>
      <div class="code">Code: ${product.code}</div>
      ${product.desc ? `<p class="desc">${product.desc}</p>` : ''}
      <div class="price">${product.price}</div>
      <a href="${product.link}" class="btn" target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
    </div>
  `;
  return card;
}

// Render products into a container
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }

  list.forEach(product => container.appendChild(createCard(product)));
}

// Search products by name or code
function applySearch(query) {
  const q = query.trim().toLowerCase();
  if (!q) {
    renderProducts('featuredList', allProducts.featured);
    renderProducts('topList', allProducts.top);
    return;
  }

  const filterFn = p => (p.name?.toLowerCase().includes(q) || p.code?.toLowerCase().includes(q));
  renderProducts('featuredList', allProducts.featured.filter(filterFn));
  renderProducts('topList', allProducts.top.filter(filterFn));
}

// Initialize everything
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => applySearch(e.target.value));
  }
});
