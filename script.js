// Fetch products.json
fetch('products.json')
  .then(res => res.json())
  .then(data => {
    renderProducts('featuredList', data.featured);
    renderProducts('topList', data.top);

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      filterProducts('featuredList', data.featured, query);
      filterProducts('topList', data.top, query);
    });
  })
  .catch(err => console.error('Failed to load products.json', err));

// Create product card HTML
function createCard(product) {
  const card = document.createElement('div');
  card.className = 'card';

  const descHTML = product.desc ? `<p>${product.desc}</p>` : '';

  card.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <div class="card-body">
      <h3>${product.name}</h3>
      <div class="code">Code: ${product.code}</div>
      ${descHTML}
      <div class="price">Price: ${product.price}</div>
      <a href="${product.link}" class="btn" target="_blank">Buy on Amazon</a>
    </div>
  `;
  return card;
}

// Render all products in a container
function renderProducts(containerId, products) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  products.forEach(product => container.appendChild(createCard(product)));
}

// Filter products by name or code
function filterProducts(containerId, products, query) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  products.forEach(product => {
    const name = product.name.toLowerCase();
    const code = product.code.toLowerCase();
    if (name.includes(query) || code.includes(query)) {
      container.appendChild(createCard(product));
    }
  });
}
