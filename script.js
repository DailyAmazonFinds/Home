let allProducts = { featured: [], top: [] };
let currentFilter = 'all';

// Load products from products.json
async function loadProducts() {
  try {
    const res = await fetch('./products.json?nocache=' + Date.now());
    if (!res.ok) throw new Error('products.json not found');
    const data = await res.json();
    allProducts = data;
    renderFilteredProducts();
  } catch (err) {
    console.error('❌ Error loading products:', err);
    document.getElementById('featuredList').innerHTML = '<p class="empty">Failed to load products</p>';
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
      <a href="${product.link}" class="btn" target="_blank" rel="noopener noreferrer">BUY NOW</a>
    </div>
  `;
  return card;
}

// Render a list of products in a container
function renderProducts(containerId, list) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  if (!list || list.length === 0) {
    container.innerHTML = `<p class="empty">No products found.</p>`;
    return;
  }

  list.forEach(product => container.appendChild(createCard(product)));
}

// Render products based on current filter + search
function renderFilteredProducts(searchQuery = '') {
  const q = searchQuery.trim().toLowerCase();

  let productsToShow = [];
  if (currentFilter === 'featured') {
    productsToShow = allProducts.featured;
  } else if (currentFilter === 'top') {
    productsToShow = allProducts.top;
  } else {
    productsToShow = [...allProducts.featured, ...allProducts.top];
  }

  if (q) {
    productsToShow = productsToShow.filter(
      p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.code || '').toLowerCase().includes(q)
    );
  }

  renderProducts('featuredList', productsToShow);
}

// Change filter
function filterProducts(type) {
  currentFilter = type;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.filter-btn[onclick="filterProducts('${type}')"]`).classList.add('active');
  renderFilteredProducts(document.getElementById('searchInput').value);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();

  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => renderFilteredProducts(e.target.value));
  }
});
