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
// Live search function for GitHub Pages
function applySearch(query) {
  const q = (query || '').trim().toLowerCase();
  
  if (!q) {
    // No query: render all products
    renderProducts('featuredList', allProducts.featured);
    renderProducts('topList', allProducts.top);
    return;
  }

  // Filter function by name or code
  const filterFn = product =>
    (product.name || '').toLowerCase().includes(q) ||
    (product.code || '').toLowerCase().includes(q);

  // Render filtered products
  renderProducts('featuredList', (allProducts.featured || []).filter(filterFn));
  renderProducts('topList', (allProducts.top || []).filter(filterFn));
}

// Example usage: attach to input
document.getElementById('searchInput').addEventListener('input', e => applySearch(e.target.value));


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
  const q = query.toLowerCase();
  const filterFn = p =>
    p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);

  const featuredFiltered = products.featured.filter(filterFn);
  const topFiltered = products.top.filter(filterFn);

  renderProducts('featuredList', featuredFiltered);
  renderProducts('topList', topFiltered);
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
