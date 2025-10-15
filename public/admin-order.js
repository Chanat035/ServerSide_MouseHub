async function loadOrders() {
  console.log("🔍 เริ่มโหลดออเดอร์...");
  const tbody = document.getElementById("orderBody");

  try {
    const res = await fetch("/api/allOrders");
    console.log("📡 สถานะการตอบกลับ:", res.status);
    const orders = await res.json();

    if (!Array.isArray(orders)) {
      tbody.innerHTML = "<tr><td colspan='8' class='text-danger text-center'>รูปแบบข้อมูลไม่ถูกต้อง</td></tr>";
      return;
    }

    tbody.innerHTML = orders.map(order => {
      const statusOptions = ["pending", "shipped", "delivered", "cancelled"]
        .map(s => `<option value="${s}" ${order.status === s ? "selected" : ""}>${s}</option>`)
        .join("");

      const paymentOptions = ["unpaid", "paid", "refunded"]
        .map(p => `<option value="${p}" ${order.paymentStatus === p ? "selected" : ""}>${p}</option>`)
        .join("");

      // แปลงวันที่เป็น dd/mm/yyyy
      const createdAt = new Date(order.createdAt);
      const formattedDate = `${String(createdAt.getDate()).padStart(2, "0")}/${String(createdAt.getMonth() + 1).padStart(2, "0")}/${createdAt.getFullYear()}`;

      return `
        <tr>
          <td>${order._id}</td>
          <td>${order.userId?.name || "-"}</td>
          <td>
            <span class="text-primary" style="cursor:pointer"
              onclick='showItems(${JSON.stringify(order.items)})'>
              ${order.items[0]?.name || "-"}
            </span>
          </td>
          <td>${order.totalAmount}</td>
          <td>${order.shippingAddress}</td>
          <td>${formattedDate}</td>
          <td>
            <select onchange="updateOrder('${order._id}', this.value, null)">
              ${statusOptions}
            </select>
          </td>
          <td>
            <select onchange="updateOrder('${order._id}', null, this.value)">
              ${paymentOptions}
            </select>
          </td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error("❌ โหลดข้อมูลล้มเหลว:", err);
    tbody.innerHTML = "<tr><td colspan='8' class='text-center text-danger'>โหลดข้อมูลไม่สำเร็จ</td></tr>";
  }
}

// ✅ ฟังก์ชันอัปเดตสถานะ
async function updateOrder(orderId, status, paymentStatus) {
  try {
    const body = { orderId };
    if (status) body.status = status;
    if (paymentStatus) body.paymentStatus = paymentStatus;

    const res = await fetch("/api/updateOrderStatus", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      throw new Error(`Failed to update (${res.status})`);
    }

    const updated = await res.json();
    console.log("✅ อัปเดตสำเร็จ:", updated);
  } catch (err) {
    console.error("❌ อัปเดตไม่สำเร็จ:", err);
    alert("อัปเดตสถานะไม่สำเร็จ");
  }
}

// ✅ ฟังก์ชันแสดงสินค้าทั้งหมดใน order
function showItems(items) {
  const html = items.map(it =>
    `<div style="margin-bottom:6px;">
      <strong>${it.name}</strong><br>
      ราคา: ${it.price}฿ × ${it.quantity} ชิ้น
    </div>`
  ).join("");

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box">
      <h2>รายละเอียดสินค้า</h2>
      ${html}
      <div class="modal-actions">
        <button class="confirm" onclick="closeModal()">ปิด</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function closeModal() {
  const modal = document.querySelector(".modal-overlay");
  if (modal) modal.remove();
}

// ✅ เรียกโหลดทันทีเมื่อสคริปต์ถูกแทรก
loadOrders();
