const SUPABASE_URL = "https://solwfbeqayavqwfmertm.supabase.co";
const SUPABASE_KEY = "sb_publishable_kvi5ZZB0l1XK_olNMTcY3g_mxfBsVHs";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);
// -------------------------
// MODALLAR
// -------------------------

const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

document.getElementById("loginBtn").onclick = () => {
  loginModal.style.display = "flex";
};

document.getElementById("signupBtn").onclick = () => {
  signupModal.style.display = "flex";
};

document.getElementById("closeLogin").onclick = () => {
  loginModal.style.display = "none";
};

document.getElementById("closeSignup").onclick = () => {
  signupModal.style.display = "none";
};

document.getElementById("switchToSignup").onclick = () => {
  loginModal.style.display = "none";
  signupModal.style.display = "flex";
};

document.getElementById("switchToLogin").onclick = () => {
  signupModal.style.display = "none";
  loginModal.style.display = "flex";
};

// -------------------------
// KAYIT
// -------------------------

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;
  const msg = document.getElementById("signupMsg");

  msg.textContent = "Kayıt oluşturuluyor...";

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  if (!data.user) {
    msg.textContent = "Kayıt oluşturulamadı.";
    return;
  }

  const { error: profileError } = await supabaseClient
    .from("profiles")
    .insert({
      id: data.user.id,
      fullname: name,
      role: role
    });

  if (profileError) {
    msg.textContent = "Hesap oluşturuldu fakat profil oluşturulamadı: " + profileError.message;
    return;
  }

  msg.textContent = "Kayıt başarılı!";

  setTimeout(() => {
    signupModal.style.display = "none";
  }, 1000);
});

// -------------------------
// GİRİŞ
// -------------------------

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMsg");

  msg.textContent = "Giriş yapılıyor...";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    msg.textContent = error.message;
    return;
  }

  msg.textContent = "Giriş başarılı!";

  setTimeout(() => {
    loginModal.style.display = "none";
    loadRequests();
  }, 700);
});

// -------------------------
// TALEP OLUŞTUR
// -------------------------

document.getElementById("requestForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("msg");

  const {
    data: { user }
  } = await supabaseClient.auth.getUser();

  if (!user) {
    msg.textContent = "Talep oluşturmak için önce giriş yapmalısın.";
    loginModal.style.display = "flex";
    return;
  }

  const category = document.getElementById("category").value;
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const location = document.getElementById("location").value.trim();

  msg.textContent = "Talep yayınlanıyor...";

 const { error } = await supabaseClient
  .from("requests")
  const { error } = await supabaseClient
  .from("requests")
  .insert({
    customer_id: user.id,
    category: category,
    title: title,
    description: description,
    location: location
  });

  if (error) {
    msg.textContent = "Hata: " + error.message;
    return;
  }

  msg.textContent = "Talebin başarıyla yayınlandı!";

  document.getElementById("requestForm").reset();

  loadRequests();
});

// -------------------------
// TALEPLERİ GETİR
// -------------------------

async function loadRequests() {
  const container = document.getElementById("requests");

  container.innerHTML = '<div class="empty">Talepler yükleniyor...</div>';

  const { data, error } = await supabaseClient
    .from("istekler")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    container.innerHTML =
      '<div class="empty">Talepler yüklenirken hata oluştu.</div>';
    console.error(error);
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML =
      '<div class="empty">Henüz yayınlanmış bir talep yok.</div>';
    return;
  }

  container.innerHTML = "";

  data.forEach((request) => {
    const div = document.createElement("div");

    div.className = "card";
    div.style.marginBottom = "15px";

    div.innerHTML = `
      <b>${escapeHtml(request.title)}</b>
      <small>${escapeHtml(request.category)} · ${escapeHtml(request.location)}</small>
      <p>${escapeHtml(request.description)}</p>
    `;

    container.appendChild(div);
  });
}

// -------------------------
// GÜVENLİ METİN
// -------------------------

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// -------------------------
// BAŞLANGIÇ
// -------------------------

loadRequests();
