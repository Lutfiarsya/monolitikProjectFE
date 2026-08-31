document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireLogin(); 
  if (!user) return; 

  tampilkanUserLogin(user);

  const feedList = document.getElementById('feed-list');
  const loadMoreBtn = document.querySelector('.load-more');
  const createButton = document.querySelector('.createBtn');
  const limit = 3;
  let offset = 0;

  if (createButton) {
    createButton.addEventListener('click', () => {
      window.location.href = '/frontend/page/form.html';
    });
  }

  function tampilkanUserLogin(user) {
    const nama = user?.nama || user?.username || 'Penulis';
    const namaDepan = nama.split(' ')[0];

    const inisial = nama
      .trim()
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');

    const greetingEl = document.getElementById('greeting-title');
    const avatarEl = document.getElementById('nav-avatar');

    if (greetingEl) greetingEl.textContent = `Apa yang ingin kamu tuliskan hari ini, ${namaDepan}?`;
    if (avatarEl) avatarEl.textContent = inisial || '?';
  }

  function cardTemplate(poem) {
    return `
      <article class="card" data-id="${poem?.id}">
        <div class="card__rail"></div>
        <div class="card__body">
          <p class="card__tag">${poem.kategori ?? ''}</p>
          <h3 class="card__title">${poem.judul}</h3>
          <p class="card__excerpt">${poem.excerpt}</p>
          <div class="card__footer">
            <div class="card__author">
              <span class="avatar avatar--sm">${poem.inisial}</span>
              <div>
                <span class="card__author-name">${poem.penulis}</span>
                <span class="card__meta">${poem.tanggal} · ${poem.reading_time}</span>
              </div>
            </div>
            <div class="card__actions">
              <a class="icon-btn" href="/frontend/page/form.html?id=${poem.id}" aria-label="Edit">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>
                </svg>
              </a>
              <button class="icon-btn hapus-btn" data-id="${poem.id}" aria-label="Hapus">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </article>`;
  }

  async function loadPuisi() {
    try {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Memuat…';

      const res = await fetch(`${API_BASE}/puisi?limit=${limit}&offset=${offset}`, { credentials: 'include' });
      const json = await res.json();

      if (!json.success) throw new Error(json.error || 'Gagal memuat data');

      if (json.data.length === 0 && offset === 0) {
        feedList.innerHTML = '<p>Belum ada puisi.</p>';
        loadMoreBtn.style.display = 'none';
        return;
      }

      json.data.forEach(poem => {
        feedList.insertAdjacentHTML('beforeend', cardTemplate(poem));
      });

      offset += limit;

      if (json.data.length < limit) {
        loadMoreBtn.style.display = 'none';
      }
    } catch (err) {
      console.error(err);
      feedList.insertAdjacentHTML('beforeend', `<p style="color:red">Gagal memuat puisi: ${err.message}</p>`);
    } finally {
      loadMoreBtn.disabled = false;
      loadMoreBtn.textContent = 'Muat lebih banyak';
    }
  }

  async function hapusPuisi(id, cardEl) {
    if (!confirm('Yakin mau hapus puisi ini?')) return;

    try {
      const res = await fetch(`${API_BASE}/puisi/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Gagal menghapus puisi');

      cardEl.remove();
    } catch (err) {
      alert(err.message);
    }
  }

  feedList.addEventListener('click', (e) => {
    const btn = e.target.closest('.hapus-btn');
    if (!btn) return;

    const id = btn.dataset.id;
    const cardEl = btn.closest('.card');
    hapusPuisi(id, cardEl);
  });

  loadMoreBtn.addEventListener('click', loadPuisi);
  loadPuisi();
});