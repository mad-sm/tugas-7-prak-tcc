const BASE_URL = "http://localhost:5000";

// Ambil elemen form
const formulir = document.querySelector("form");
const inputId = document.querySelector("#note-id");
const inputNama = document.querySelector("#nama");
const inputJudul = document.querySelector("#judul");
const inputCatatan = document.querySelector("#catatan");

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const token = getToken();
        if (!token) {
            alert("Anda harus login terlebih dahulu.");
            window.location.href = "http://localhost:8080/TCC_Shidiq_073/frontend/login.html"; 
            return;
        }

        const response = await axios.get(`${BASE_URL}/user`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const user = response.data;
        const usernameElement = document.getElementById("username");
        usernameElement.textContent = `Halo, ${user.name}`;
    } catch (error) {
        console.error("Error fetching logged-in user:", error);
        alert("Gagal memuat data pengguna. Silakan login kembali.");
        window.location.href = "http://localhost:8080/TCC_Shidiq_073/frontend/login.html"; 
    }
});

document.getElementById("logout").addEventListener("click", async () => {
    try {
        const token = getToken();
        if (!token) return;

        await axios.delete(`${BASE_URL}/logout`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        localStorage.removeItem('token');
        alert("Anda telah berhasil logout.");
        window.location.href = "http://localhost:8080/TCC_Shidiq_073/frontend/login.html";
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Gagal logout. Silakan coba lagi.");
    }
});

// Tambahkan event listener untuk submit form
formulir.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = inputId.value;
  const nama = inputNama.value;
  const judul = inputJudul.value;
  const catatan = inputCatatan.value;

  try {
    if (!nama || !judul || !catatan) {
      alert("Semua field harus diisi!");
      return;
    }

    const token = getToken();
    if (!token) return;

    if (id === "") {
      await axios.post(`${BASE_URL}/notes`, { nama, judul, catatan }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      await axios.put(`${BASE_URL}/notes/${id}`, { nama, judul, catatan }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    resetForm();
    getNotes();
  } catch (error) {
    console.error("Gagal menyimpan data:", error.message);
  }
});

// Fungsi untuk GET semua notes
async function getNotes() {
  try {
    const token = getToken();
    if (!token) return;

    const { data } = await axios.get(`${BASE_URL}/notes`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const table = document.querySelector("#table-notes");
    let tampilan = "";
    let no = 1;

    for (const note of data) {
      tampilan += tampilkanNotes(no++, note);
    }

    table.innerHTML = tampilan;
    hapusNotes();
    editNotes();
  } catch (error) {
    console.error("Gagal mengambil data:", error.message);
  }
}

// Fungsi untuk menampilkan catatan dalam tabel
function tampilkanNotes(no, note) {
  return `
    <tr>
      <td>${no}</td>
      <td class="nama">${note.nama}</td>
      <td class="judul">${note.judul}</td>
      <td class="catatan">${note.catatan}</td>
      <td><button data-id=${note.id} class='btn-edit'>Edit</button></td>
      <td><button data-id=${note.id} class='btn-hapus'>Hapus</button></td>
    </tr>
  `;
}

// Fungsi untuk menghapus catatan dengan konfirmasi
function hapusNotes() {
  document.querySelectorAll(".btn-hapus").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Apakah Anda yakin ingin menghapus catatan ini?")) return;
      try {
        const token = getToken();
        if (!token) return;

        await axios.delete(`${BASE_URL}/notes/${btn.dataset.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        getNotes();
      } catch (error) {
        console.error("Gagal menghapus data:", error.message);
      }
    });
  });
}

// Fungsi untuk mengedit catatan
function editNotes() {
  document.querySelectorAll(".btn-edit").forEach((tombol_edit) => {
    tombol_edit.addEventListener("click", () => {
      const id = tombol_edit.dataset.id;
      const row = tombol_edit.parentElement.parentElement;

      inputId.value = id;
      inputNama.value = row.querySelector(".nama").innerText;
      inputJudul.value = row.querySelector(".judul").innerText;
      inputCatatan.value = row.querySelector(".catatan").innerText;
    });
  });
}

// Fungsi untuk mereset form
function resetForm() {
  inputId.value = "";
  inputNama.value = "";
  inputJudul.value = "";
  inputCatatan.value = "";
}

// Fungsi untuk mengambil token dari localStorage
function getToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("Token tidak ditemukan. Harap login terlebih dahulu.");
    return null;
  }
  return token;
}

// Panggil fungsi getNotes() untuk menampilkan data saat pertama kali halaman dimuat
getNotes();