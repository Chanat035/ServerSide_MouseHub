async function handleCheckout() {
  const confirmModalEl = document.getElementById("confirmCheckoutModal");
  const confirmBtn = document.getElementById("confirmCheckoutBtn");
  const checkoutButton = document.getElementById("checkoutButton");

  if (!confirmModalEl || !confirmBtn || !checkoutButton) return;

  const confirmModal = new bootstrap.Modal(confirmModalEl);

  // 🟡 เมื่อกด “ไปชำระเงิน”
  checkoutButton.addEventListener("click", () => {
    confirmModal.show();
  });

  // ✅ เมื่อกดยืนยัน → ทำการ checkout จริง
  confirmBtn.addEventListener("click", async () => {
    await processCheckout(confirmModal, confirmBtn);
  });
}

async function processCheckout(confirmModal, confirmBtn) {
  confirmBtn.disabled = true;
  confirmBtn.textContent = "กำลังดำเนินการ...";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 👈 ส่ง cookie ที่มี token ไป
      body: JSON.stringify({
        shippingAddress: "", // หรือให้ผู้ใช้กรอกใน modal ก็ได้
        useDefaultAddress: true,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");

    confirmModal.hide();
    alert("✅ สั่งซื้อสำเร็จ! ระบบได้หักเงินและสร้างออเดอร์เรียบร้อยแล้ว");
    location.reload();
  } catch (err) {
    alert("❌ " + err.message);
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.textContent = "ยืนยัน";
  }
}

document.addEventListener("DOMContentLoaded", handleCheckout);
