const SUPABASE_URL = "https://solwfbeqayavqwfmertm.supabase.co";
const SUPABASE_KEY = "sb_publishable_kvi5ZZB0l1XK_olNMTcY3g_mxfBsVHs";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

// =====================================================
// MODALLAR
// =====================================================

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


// =====================================================
// KAYIT OL
// =====================================================

document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("signupMsg");

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const role = document.getElementById("signupRole").value;

  if (!name || !email || !password || !role) {
    msg.textContent = "Lütfen tüm alanları doldurun.";
    return;
  }

  msg.textContent = "Kayıt oluşturuluyor...";

  try {

    // ---------------------------------------------
    // 1. SUPABASE AUTH KAYDI
    // ---------------------------------------------

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      console.error("AUTH KAYIT HATASI:", error);
      msg.textContent = "Kayıt hatası: " + error.message;
      return;
    }

    if (!data || !data.user) {
      msg.textContent = "Kullanıcı oluşturulamadı.";
      return;
    }

    const user = data.user;

    // ---------------------------------------------
    // 2. PROFİL OLUŞTUR
    // ---------------------------------------------

    const { error: profileError } = await supabaseClient
      .from("profiles")
      .upsert({
        id: user.id,
        fullname: name,
        role: role
      });

    if (profileError) {
      console.error("PROFİL HATASI:", profileError);

      msg.textContent =
        "Hesap oluşturuldu fakat profil kaydedilemedi: " +
        profileError.message;

      return;
    }

    // ---------------------------------------------
    // 3. BAŞARILI
    // ---------------------------------------------

    msg.textContent = "Kayıt başarılı!";

    setTimeout(() => {
      signupModal.style.display = "none";
    }, 1000);

  } catch (err) {

    console.error("KAYIT BEKLENMEYEN HATA:", err);

    msg.textContent =
      "Beklenmeyen bir hata oluştu: " + err.message;
  }
});


// =====================================================
// GİRİŞ YAP
// =====================================================

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const msg = document.getElementById("loginMsg");

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    msg.textContent = "E-posta ve şifre gerekli.";
    return;
  }

  msg.textContent = "Giriş yapılıyor...";

  try {

    // ---------------------------------------------
    // 1. AUTH GİRİŞ
    // ---------------------------------------------

    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      console.error("GİRİŞ HATASI:", error);
      msg.textContent = "Giriş hatası: " + error.message;
      return;
    }

    if (!data || !data.user) {
      msg.textContent = "Kullanıcı bilgisi alınamadı.";
      return;
    }

    const user = data.user;

    // ---------------------------------------------
    // 2. PROFİLİ GETİR
    // ---------------------------------------------

    const {
      data: profile,
      error: profileError
    } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {

      console.error("PROFİL GETİRME HATASI:", profileError);

      msg.textContent =
        "Giriş yapıldı fakat profil alınamadı: " +
        profileError.message;

      return;
    }

    if (!profile) {

      console.error("PROFİL BULUNAMADI. USER ID:", user.id);

      msg.textContent =
        "Giriş yapıldı fakat bu kullanıcıya ait profil bulunamadı.";

      return;
    }

    // Kullanıcı bilgilerini sakla
    window.currentUser = user;
    window.currentProfile = profile;

    console.log("GİRİŞ YAPAN KULLANICI:", user);
    console.log("KULLANICI PROFİLİ:", profile);

    msg.textContent =
      "Hoş geldin " +
      (profile.fullname || user.email);

    // ---------------------------------------------
    // 3. MODALI KAPAT
    // ---------------------------------------------

    setTimeout(() => {
      loginModal.style.display = "none";

      // Kullanıcı bilgilerini ekranda göstermek
      showLoggedInUser(profile, user);

      // Talepleri getir
      loadRequests();

    }, 700);

  } catch (err) {

    console.error("GİRİŞ BEKLENMEYEN HATA:", err);

    msg.textContent =
      "Beklenmeyen hata: " + err.message;
  }
});


// =====================================================
// GİRİŞ YAPAN KULLANICIYI GÖSTER
// =====================================================

function showLoggedInUser(profile, user) {

  const loginBtn = document.getElementById("loginBtn");
  const signupBtn = document.getElementById("signupBtn");

  if (loginBtn) {
    loginBtn.style.display = "none";
  }

  if (signupBtn) {
    signupBtn.style.display = "none";
  }

  // Sayfada kullanıcı alanı varsa doldur
  const userNameElement =
    document.getElementById("userName");

  if (userNameElement) {
    userNameElement.textContent =
      profile.fullname || user.email;
  }

  const userRoleElement =
    document.getElementById("userRole");

  if (userRoleElement) {
    userRoleElement.textContent =
      profile.role || "";
  }
}


// =====================================================
// TALEP OLUŞTUR
// =====================================================

document.getElementById("requestForm").addEventListener("submit", async (e) => {

  e.preventDefault();

  const msg = document.getElementById("msg");

  // ---------------------------------------------
  // KULLANICIYI KONTROL ET
  // ---------------------------------------------

  const {
    data: { user },
    error: userError
  } = await supabaseClient.auth.getUser();

  if (userError || !user) {

    msg.textContent =
      "Talep oluşturmak için önce giriş yapmalısın.";

    loginModal.style.display = "flex";

    return;
  }

  // ---------------------------------------------
  // FORM BİLGİLERİ
  // ---------------------------------------------

  const category =
    document.getElementById("category").value.trim();

  const title =
    document.getElementById("title").value.trim();

  const description =
    document.getElementById("description").value.trim();

  const location =
    document.getElementById("location").value.trim();


  // ---------------------------------------------
  // BOŞ ALAN KONTROLÜ
  // ---------------------------------------------

  if (!category) {
    msg.textContent = "Kategori seçmelisin.";
    return;
  }

  if (!title) {
    msg.textContent = "Talep başlığı yazmalısın.";
    return;
  }

  if (!description) {
    msg.textContent = "Talebini açıklamalısın.";
    return;
  }

  if (!location) {
    msg.textContent = "Konumunu yazmalısın.";
    return;
  }


  msg.textContent = "Talep yayınlanıyor...";


  // ---------------------------------------------
  // SUPABASE'E KAYDET
  // ---------------------------------------------

  const {
    data,
    error
  } = await supabaseClient
    .from("requests")
    .insert({
      customer_id: user.id,
      title: title,
      category: category,
      description: description,
      location: location
    })
    .select()
    .single();


  // ---------------------------------------------
  // HATA
  // ---------------------------------------------

  if (error) {

    console.error("TALEP OLUŞTURMA HATASI:", error);

    msg.textContent =
      "Hata: " + error.message;

    return;
  }


  // ---------------------------------------------
  // BAŞARILI
  // ---------------------------------------------

  console.log("OLUŞTURULAN TALEP:", data);

  msg.textContent =
    "Talebin başarıyla yayınlandı!";

  document
    .getElementById("requestForm")
    .reset();

  loadRequests();
});


// =====================================================
// TALEPLERİ GETİR
// =====================================================

async function loadRequests() {

  const container =
    document.getElementById("requests");

  if (!container) {
    console.error(
      "HTML içinde #requests elementi bulunamadı."
    );
    return;
  }

  container.innerHTML =
    '<div class="empty">Talepler yükleniyor...</div>';


  const {
    data,
    error
  } = await supabaseClient
    .from("requests")
    .select("*")
    .order("created_at", {
      ascending: false
    });


  // ---------------------------------------------
  // HATA
  // ---------------------------------------------

  if (error) {

    console.error(
      "TALEPLERİ GETİRME HATASI:",
      error
    );

    container.innerHTML =
      '<div class="empty">Talepler yüklenirken hata oluştu.</div>';

    return;
  }


  // ---------------------------------------------
  // TALEP YOK
  // ---------------------------------------------

  if (!data || data.length === 0) {

    container.innerHTML =
      '<div class="empty">Henüz yayınlanmış bir talep yok.</div>';

    return;
  }


  // ---------------------------------------------
  // TALEPLERİ GÖSTER
  // ---------------------------------------------

  container.innerHTML = "";


  data.forEach((request) => {

    const div =
      document.createElement("div");

    div.className = "card";

    div.style.marginBottom = "15px";


    div.innerHTML = `
      <b>${escapeHtml(request.title)}</b>

      <small>
        ${escapeHtml(request.category)}
        ·
        ${escapeHtml(request.location)}
      </small>

      <p>
        ${escapeHtml(request.description)}
      </p>
    `;


    container.appendChild(div);

  });
}


// =====================================================
// OTURUMU KONTROL ET
// SAYFA YENİLENİNCE GİRİŞ KAYBOLMASIN
// =====================================================

async function checkCurrentUser() {

  const {
    data: { user },
    error
  } = await supabaseClient.auth.getUser();


  if (error) {
    console.error(
      "OTURUM KONTROL HATASI:",
      error
    );

    return;
  }


  if (!user) {

    console.log("Aktif kullanıcı yok.");

    return;
  }


  console.log(
    "Aktif kullanıcı bulundu:",
    user.email
  );


  const {
    data: profile,
    error: profileError
  } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();


  if (profileError) {

    console.error(
      "PROFİL KONTROL HATASI:",
      profileError
    );

    return;
  }


  if (!profile) {

    console.error(
      "Aktif kullanıcının profili yok."
    );

    return;
  }


  window.currentUser = user;
  window.currentProfile = profile;


  showLoggedInUser(
    profile,
    user
  );
}


// =====================================================
// ÇIKIŞ YAP
// =====================================================

async function logout() {

  const {
    error
  } = await supabaseClient.auth.signOut();


  if (error) {

    console.error(
      "ÇIKIŞ HATASI:",
      error
    );

    return;
  }


  window.currentUser = null;
  window.currentProfile = null;


  const loginBtn =
    document.getElementById("loginBtn");

  const signupBtn =
    document.getElementById("signupBtn");


  if (loginBtn) {
    loginBtn.style.display = "";
  }

  if (signupBtn) {
    signupBtn.style.display = "";
  }


  location.reload();
}


// Eğer HTML'de logout butonu varsa bağla
const logoutBtn =
  document.getElementById("logoutBtn");

if (logoutBtn) {

  logoutBtn.addEventListener(
    "click",
    logout
  );

}


// =====================================================
// GÜVENLİ METİN
// =====================================================

function escapeHtml(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;
}


// =====================================================
// BAŞLANGIÇ
// =====================================================

checkCurrentUser();

loadRequests();
