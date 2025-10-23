let products = {};

fetch('products.json')
  .then(res => res.json())
  .then(data => {
    products = data;
    renderProducts();
  });

function createCard(product) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img src="${product.img}" alt="${product.name}">
    <div class="card-body">
      <h3>${product.name}</h3>
      <div class="code">Code: ${product.code}</div>
      <p>${product.desc}</p>
      <a href="${product.link}" class="btn" target="_blank">Buy on Amazon</a>
    </div>
  `;
  return card;
}

function renderProducts() {
  const featuredList = document.getElementById('featuredList');
  const topList = document.getElementById('topList');
  featuredList.innerHTML = '';
  topList.innerHTML = '';

  products.featured?.forEach(p => featuredList.appendChild(createCard(p)));
  products.top?.forEach(p => topList.appendChild(createCard(p)));

  // Search functionality
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', function() {
    const query = this.value.toLowerCase();
    document.querySelectorAll('.card').forEach(card => {
      const name = card.querySelector('h3').innerText.toLowerCase();
      card.style.display = name.includes(query) ? '' : 'none';
    });
  });
}
