// script.js — Google Sheets loader + robust live search (debounced)
// CONFIG - replace with your Sheet ID / optional sheet name
const SHEET_ID = "1Nnil4LOj5Fkr3O8zX7KLqleOLIi8-iy3GVKoOWug9bQ";
const SHEET_NAME = "Sheet1";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(SHEET_NAME)}`;

let allProducts = []; // flat array of product objects used for search & render
let lastLoadedAt = 0;

// ---- utility: safe lower-case string ----
function s(str) {
  return (str || "").toString().toLowerCase();
}

// ---- debounce helper to avoid too-many renders while typing ----
function debounce(fn, wait = 220) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

// ---- fetch & parse Google Sheets (gviz JSON) ----
async function loadProductsFromSheet() {
  try {
    const res = await fetch(SHEET_URL, { cache: "no-store" });
    if (!res.ok) throw new Error(`Network response ${res.status}`);
    const text = await res.text();
    // Google wraps JSON with: /**/google.visualization.Query.setResponse(...)
    // strip the wrapper
    const json = JSON.parse(text.substr(47).slice(0, -2));
    const rows = json.table?.rows || [];

    // map rows -> objects. adjust indexes to your sheet columns
    // Expected columns: Name | Price | ImageURL | ProductLink | Code (optional) | Desc (optional) | Category (optional)
    const products = rows.map(r => {
      const c = r.c || [];
      return {
        name: c[0]?.v || "",
        price: c[1]?.v || "",
        image: c[2]?.v || "https://via.placeholder.com/300x200?text=No+Image",
        link: c[3]?.v || "#",
        code: c[4]?.v || "",
        desc: c[5]?.v || "",
        category: (c[6]?.v || "featured").toString().toLowerCase()
      };
    });

    // store flattened list (we can also split by category for sections)
    allProducts = products;
    lastLoadedAt = Date.now();

    // render initial set (featured by default)
    renderProducts(allProducts);

    // clear any previous error messages
    clearStatus();

    return products;
  } catch (err) {
    showStatus("Failed to load products from Google Sheets. Check sheet publish/share settings.", true);
    console.error("loadProductsFromSheet error:", err);
    // keep previous allProducts if any
    if (allProducts.length) renderProducts(allProducts);
    return [];
  }
}

// ---- render function ----
function renderProducts(list) {
  const container = document.getElementById("featuredList") || document.querySelector(".product-grid");
  if (!container) return;

  container.innerHTML = "";

  if (!Array.isArray(list) || list.length === 0) {
    container.innerHTML = `<p class="empty" style="color:#ccc;text-align:center;padding:20px">No products found.</p>`;
    return;
  }

  // create cards
  const frag = document.createDocumentFragment();
  list.forEach(p => {
    const card = document.createElement("div");
    card.className = "card";
    const nameEsc = escapeHtml(p.name || "");
    const descHtml = p.desc ? `<p class="desc">${escapeHtml(p.desc)}</p>` : "";
    card.innerHTML = `
  <img src="${p.image}" alt="${p.name}">
  <div class="card-body">
    <h3>${p.name}</h3>
    <p class="category">${p.category}</p>
    <p class="code">Code: ${p.code}</p>
    <p class="price">${p.price}</p>
    <a href="${p.link}" target="_blank">View on Amazon</a>
  </div>
`;

    frag.appendChild(card);
  });

  container.appendChild(frag);
}

// ---- safe HTML escape ----
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ---- search implementation (debounced) ----
function applySearchRaw(q) {
  const query = (q || "").trim().toLowerCase();
  if (!query) {
    // show all products (or you can show only featured)
    renderProducts(allProducts);
    return;
  }

  // split by spaces and require all tokens to match (AND search)
  const tokens = query.split(/\s+/).filter(Boolean);

  const filtered = allProducts.filter(p => {
    const hay = `${p.name} ${p.code} ${p.desc} ${p.category} ${p.price}`.toLowerCase();
    // all tokens must be present
    return tokens.every(t => hay.includes(t));
  });

  renderProducts(filtered);
}
const applySearch = debounce(applySearchRaw, 160);

// ---- small UI helpers ----
function showStatus(msg, isError = false) {
  let el = document.getElementById("fetchStatus");
  if (!el) {
    el = document.createElement("div");
    el.id = "fetchStatus";
    el.style.position = "fixed";
    el.style.left = "50%";
    el.style.transform = "translateX(-50%)";
    el.style.bottom = "24px";
    el.style.padding = "10px 14px";
    el.style.borderRadius = "10px";
    el.style.zIndex = 9999;
    el.style.fontSize = "0.95rem";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.background = isError ? "rgba(200,60,60,0.95)" : "rgba(30,30,30,0.85)";
  el.style.color = isError ? "#fff" : "#ddd";
}

function clearStatus() {
  const el = document.getElementById("fetchStatus");
  if (el) el.remove();
}

// ---- auto-refresh (optional) ----
function startAutoRefresh(intervalMs = 120000) { // default 2 minutes
  setInterval(async () => {
    const prev = lastLoadedAt;
    await loadProductsFromSheet();
    if (lastLoadedAt > prev) showStatus("Products refreshed", false);
    setTimeout(clearStatus, 2000);
  }, intervalMs);
}

// ---- init on DOM ready ----
document.addEventListener("DOMContentLoaded", () => {
  // ensure search input and container exist
  const si = document.getElementById("searchInput");
  if (si) {
    si.addEventListener("input", (e) => applySearch(e.target.value));
  } else {
    console.warn("No #searchInput found — search will not be available.");
  }

  loadProductsFromSheet();      // initial load
  startAutoRefresh(2 * 60 * 1000); // optional: refresh every 2 minutes
});
