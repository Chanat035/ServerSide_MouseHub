async function initAdminHeader() {
  console.log("✅ admin-header.js loaded (async)!");

  // ✅ รอให้ DOM โหลดครบ
  await new Promise((resolve) => {
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      resolve();
    } else {
      document.addEventListener("DOMContentLoaded", resolve);
    }
  });


  const toggle = document.getElementById("userToggle");
  const menu = document.getElementById("userMenu");
  const logoutBtn = document.getElementById("logoutBtn");
  const searchBox = document.getElementById("searchBox");
  const homeLink = document.getElementById("homeLink");

  // --- toggle dropdown ---
  if (toggle && menu) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) {
        menu.classList.remove("active");
      }
    });
  }

  // --- logout ---
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        const res = await fetch("/api/logout", { method: "POST" });
        if (res.ok) {
          alert("ออกจากระบบเรียบร้อย");
          window.location.href = "/";
        } else {
          alert("ออกจากระบบไม่สำเร็จ");
        }
      } catch (err) {
        console.error("Logout error:", err);
      }
    });
  }

  // --- กลับหน้า Home ---
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "/";
    });
  }

  // --- Search ---
  if (searchBox) {
    searchBox.addEventListener("input", () => {
      const query = searchBox.value.toLowerCase().trim();

      const activeSidebar = document.querySelector(".sidebar-item.active");
      if (!activeSidebar) return;

      const page = activeSidebar.textContent.trim().toLowerCase();

      if (page === "user") {
        filterTable("userBody", query, "name");
      } else if (page === "product") {
        filterTable("productBody", query, "name");
      } else if (page === "order") {
        filterTable("orderBody", query, "id");
      }
    });
  }
}

// --- ฟังก์ชันกรองแถวในตาราง ---
function filterTable(tbodyId, query, key) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const rows = Array.from(tbody.querySelectorAll("tr"));
  let visibleCount = 0;

  rows.forEach((row) => {
    const cells = row.querySelectorAll("td");
    if (cells.length === 0) return;

    let targetText = "";
    if (key === "name") targetText = cells[0]?.textContent.toLowerCase();
    else if (key === "id") targetText = cells[0]?.textContent.toLowerCase();

    if (targetText.includes(query) || query === "") {
      row.style.display = "";
      visibleCount++;
    } else {
      row.style.display = "none";
    }
  });

  if (visibleCount === 0) {
    const colspan = tbody.querySelector("tr td")?.colSpan || 5;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="text-center text-muted">ไม่พบข้อมูลที่ค้นหา</td></tr>`;
  }
}

// ✅ เรียกฟังก์ชันหลัก
initAdminHeader();
