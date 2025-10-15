// public/admin-user.js
async function loadUsers() {
  console.log("👥 กำลังโหลดข้อมูลผู้ใช้...");
  const tbody = document.getElementById("userBody");

  try {
    const res = await fetch("/api/user");
    const users = await res.json();

    if (!Array.isArray(users)) {
      tbody.innerHTML = "<tr><td colspan='7' class='text-center text-danger'>ข้อมูลไม่ถูกต้อง</td></tr>";
      return;
    }

    if (users.length === 0) {
      tbody.innerHTML = "<tr><td colspan='7' class='text-center text-muted'>ไม่มีข้อมูลผู้ใช้</td></tr>";
      return;
    }

    tbody.innerHTML = users
      .map(
        (u) => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.phone}</td>
          <td>${u.address}</td>
          <td>${u.balance || 0}
            <i class="bi bi-plus-lg text-warning" style="cursor:pointer"
              onclick="openModal('addBalance',{_id:'${u._id}', name:'${u.name}'})"></i>
          </td>
          <td>${u.isDeleted ? '<i class="bi bi-check-lg text-success fs-5"></i>' : '<i class="bi bi-x-lg text-danger fs-5"></i>'}</td>
          <td>${
            u.isDeleted
              ? `<span class="text-warning" style="cursor:pointer"
                    onclick="openModal('restoreUser',{_id:'${u._id}', name:'${u.name}'})">restore</span>`
              : `<span class="text-secondary">restore</span>`
          }</td>
        </tr>`
      )
      .join("");
  } catch (err) {
    console.error("❌ โหลดข้อมูลผู้ใช้ล้มเหลว:", err);
    tbody.innerHTML =
      "<tr><td colspan='7' class='text-center text-danger'>โหลดข้อมูลไม่สำเร็จ</td></tr>";
  }
}

// ✅ เพิ่มยอดเงิน
async function confirmAddBalance(userId, amount) {
  try {
    const res = await fetch("/api/addBalance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, amount }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("✅ เพิ่มยอดเงินสำเร็จ!");
      closeModal();
      loadUsers();
    } else {
      alert("❌ เพิ่มยอดเงินไม่สำเร็จ: " + (data.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("addBalance error:", err);
  }
}

// ✅ restore ผู้ใช้
async function confirmRestoreUser(userId) {
  try {
    const res = await fetch("/api/restoreUser", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    const data = await res.json();
    if (res.ok) {
      alert("♻️ Restore ผู้ใช้สำเร็จ!");
      closeModal();
      loadUsers();
    } else {
      alert("❌ Restore ไม่สำเร็จ: " + (data.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("restoreUser error:", err);
  }
}

loadUsers();
