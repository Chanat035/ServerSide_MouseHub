async function loadProducts() {
  console.log("🛒 กำลังโหลดข้อมูลสินค้า...");
  const tbody = document.getElementById("productBody");

  try {
    const res = await fetch("/api/product");
    const products = await res.json();

    if (!Array.isArray(products)) {
      tbody.innerHTML =
        "<tr><td colspan='9' class='text-center text-danger'>รูปแบบข้อมูลไม่ถูกต้อง</td></tr>";
      return;
    }

    if (products.length === 0) {
      tbody.innerHTML =
        "<tr><td colspan='9' class='text-center text-muted'>ไม่มีข้อมูลสินค้า</td></tr>";
      return;
    }

    tbody.innerHTML = products
      .map((p) => {
        const shortDesc =
          p.description && p.description.length > 20
            ? p.description.slice(0, 20) + "..."
            : p.description || "-";

        const isDeleted = !!p.isDeleted;
        const deleteIcon = isDeleted
          ? `<i class="bi bi-check-lg text-success fs-5" style="cursor:pointer"
                onclick='openModal("restoreProduct", ${JSON.stringify(p).replace(
                  /"/g,
                  "&quot;"
                )})'></i>`
          : `<i class="bi bi-x-lg text-danger fs-5" style="cursor:pointer"
                onclick='openModal("deleteProduct", ${JSON.stringify(p).replace(
                  /"/g,
                  "&quot;"
                )})'></i>`;

        return `
        <tr>
          <td>${p.name}</td>
          <td>${p.price}</td>
          <td>${p.quantity}</td>
          <td>${p.brand}</td>
          <td>${p.category || "-"}</td>
          <td>${shortDesc}</td>
          <td><img src="${p.imgUrl || ""}" alt="img" width="50" height="50" style="object-fit:cover;border-radius:6px;"></td>
          <td>${deleteIcon}</td>
          <td>
            <i class="bi bi-pencil text-warning fs-5" style="cursor:pointer"
              onclick='openModal("editProduct", ${JSON.stringify(p).replace(
                /"/g,
                "&quot;"
              )})'></i>
          </td>
        </tr>
      `;
      })
      .join("");
  } catch (err) {
    console.error("❌ โหลดสินค้าล้มเหลว:", err);
    tbody.innerHTML =
      "<tr><td colspan='9' class='text-center text-danger'>โหลดข้อมูลไม่สำเร็จ</td></tr>";
  }
}

// ✅ สร้างสินค้าใหม่
async function createProduct(formData) {
  try {
    const res = await fetch("/api/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (res.ok) {
      alert("✅ เพิ่มสินค้าเรียบร้อย!");
      closeModal();
      loadProducts();
    } else {
      alert("❌ เพิ่มสินค้าไม่สำเร็จ: " + (result.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("❌ createProduct error:", err);
    alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
  }
}

// ✅ แก้ไขสินค้า
async function updateProduct(formData) {
  try {
    const res = await fetch("/api/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const result = await res.json();
    if (res.ok) {
      alert("✅ แก้ไขสินค้าเรียบร้อย!");
      closeModal();
      loadProducts();
    } else {
      alert("❌ แก้ไขสินค้าไม่สำเร็จ: " + (result.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    alert("เกิดข้อผิดพลาดในการแก้ไขสินค้า");
  }
}

// ✅ ลบสินค้า
async function deleteProduct(id) {
  try {
    const res = await fetch("/api/product", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, confirmMessage: "Confirm" }),
    });
    const result = await res.json();
    if (res.ok) {
      alert("🗑️ ลบสินค้าเรียบร้อย!");
      closeModal();
      loadProducts();
    } else {
      alert("❌ ลบสินค้าไม่สำเร็จ: " + (result.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("❌ deleteProduct error:", err);
    alert("เกิดข้อผิดพลาดในการลบสินค้า");
  }
}

// ✅ Restore สินค้า
async function restoreProduct(id) {
  try {
    const res = await fetch("/api/restore", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const result = await res.json();
    if (res.ok) {
      alert("♻️ Restore สินค้าเรียบร้อย!");
      closeModal();
      loadProducts();
    } else {
      alert("❌ Restore ไม่สำเร็จ: " + (result.message || "ไม่ทราบสาเหตุ"));
    }
  } catch (err) {
    console.error("❌ restoreProduct error:", err);
    alert("เกิดข้อผิดพลาดในการ restore สินค้า");
  }
}

loadProducts();
