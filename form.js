document.addEventListener('DOMContentLoaded', async () => {
  const user = await requireLogin(); 
  if (!user) return;

  const params = new URLSearchParams(window.location.search);
  const editId = params.get('id');

  const form = document.getElementById('puisi-form');
  const formTitle = document.getElementById('form-title');
  const submitBtn = document.getElementById('submit-btn');
  const messageEl = document.getElementById('form-message');

  const judulInput = document.getElementById('judul');
  const kategoriInput = document.getElementById('kategori');
  const keywordInput = document.getElementById('keyword');
  const isiInput = document.getElementById('isi');
  const idInput = document.getElementById('puisi-id');

  if (editId) {
    formTitle.textContent = 'Edit Puisi';
    submitBtn.textContent = 'Perbarui';

    try {
      const res = await fetch(`${API_BASE}/puisi/${editId}`, { credentials: 'include' });
      const json = await res.json();

      if (!json.success) throw new Error(json.message || 'Gagal mengambil data puisi');

      idInput.value = json.data.id;
      judulInput.value = json.data.judul || '';
      kategoriInput.value = json.data.kategori || '';
      keywordInput.value = json.data.keyword || '';
      isiInput.value = json.data.isi || '';
    } catch (err) {
      messageEl.textContent = err.message;
      messageEl.style.color = 'red';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitBtn.disabled = true;
    messageEl.textContent = '';

    const payload = {
      judul: judulInput.value.trim(),
      kategori: kategoriInput.value.trim(),
      keyword: keywordInput.value.trim(),
      isi: isiInput.value.trim(),
    };

    try {
      const isEdit = Boolean(idInput.value);
      const endpoint = isEdit ? `${API_BASE}/puisi/${idInput.value}` : `${API_BASE}/puisi`;
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message || 'Gagal menyimpan puisi');

      window.location.href = '/frontend/index.html';
    } catch (err) {
      messageEl.textContent = err.message;
      messageEl.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
    }
  });
});