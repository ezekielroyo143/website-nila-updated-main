const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("siteNav"); // or use class if needed

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("mobile-open");
  });
}

async function updateNavigation() {
  const nav =
    document.getElementById("navActions") ||
    document.querySelector(".nav-actions");

  if (!nav) return;

  // Make sure supabase is ready
  if (!window.supabaseClient) {
    console.error("supabaseClient not found");
    return;
  }

  const {
    data: { session },
    error: sessionError,
  } = await window.supabaseClient.auth.getSession();

  if (sessionError) {
    console.error("Navigation auth error:", sessionError);
    return;
  }

  // Not logged in
  if (!session || !session.user) {
    nav.innerHTML = `
      <a href="./login.html" class="btn">Login</a>
      <a href="./register.html" class="btn btn-primary">Register</a>
    `;
    return;
  }

  const userId = session.user.id;

  // Check admin_users table (user is admin if their id exists there)
  const { data: adminRow, error: adminError } = await window.supabaseClient
    .from("admin_users")
    .select("id")
    .eq("id", userId) // change to .eq("user_id", userId) if your column is user_id
    .maybeSingle();

  if (adminError) {
    console.warn("Admin check error:", adminError);
  }

  // Optional fallback: also check profiles.role
  let isAdmin = !!adminRow;

  if (!isAdmin) {
    const { data: profile } = await window.supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    isAdmin = profile?.role === "admin";
  }

  if (isAdmin) {
    nav.innerHTML = `
      <a href="./admin.html" class="btn btn-primary">Admin Dashboard</a>
      <button type="button" class="btn" id="navLogoutBtn">Logout</button>
    `;
  } else {
    nav.innerHTML = `
      <a href="./rooms.html" class="btn">Rooms</a>
      <a href="./my-reservations.html" class="btn btn-primary">My Reservations</a>
      <button type="button" class="btn" id="navLogoutBtn">Logout</button>
    `;
  }

  const logoutBtn = document.getElementById("navLogoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      logoutBtn.textContent = "Logging out...";

      const { error } = await window.supabaseClient.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        logoutBtn.disabled = false;
        logoutBtn.textContent = "Logout";
        return;
      }

      window.location.href = "./index.html";
    });
  }
}

updateNavigation();
