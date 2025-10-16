async function initCartModal() {
  const cartButton = document.getElementById("cartButton");
  const cartContainer = document.getElementById("cartItemsContainer");
  const cartTotal = document.getElementById("cartTotal");

  if (!cartButton || !cartContainer) return;

  async function refreshTotal() {
    const res = await fetch("/api/cart");
    const items = await res.json();
    updateTotal(items);
  }

  async function loadCartItems() {
    try {
      cartContainer.innerHTML = `<div class="text-center text-muted p-3">กำลังโหลด...</div>`;
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("โหลดข้อมูลตะกร้าไม่สำเร็จ");
      const items = await res.json();

      if (!items.length) {
        cartContainer.innerHTML = `<div class="text-center text-muted p-3">ไม่มีสินค้าในตะกร้า</div>`;
        cartTotal.textContent = "รวมทั้งหมด: 0฿";
        return;
      }

      cartContainer.innerHTML = items
        .map((item) => {
          const img = item.productId?.imgUrl || "/images/no-image.png";
          const name = item.productId?.name || "สินค้าหายไปแล้ว";
          const price = item.productId?.price || 0;
          const qty = item.quantity || 1;
          const id = item.productId?._id;

          return `
          <div class="list-group-item bg-dark text-light d-flex align-items-center justify-content-between border-secondary">
            <div class="d-flex align-items-center gap-3">
              <img src="${img}" alt="${name}" width="60" height="60" class="rounded border">
              <div>
                <h6 class="mb-0">${name}</h6>
                <small class="text-muted">${price}฿ / ชิ้น</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-warning qty-btn" data-action="decrease" data-id="${id}">–</button>
              <span class="fw-semibold">${qty}</span>
              <button class="btn btn-sm btn-outline-warning qty-btn" data-action="increase" data-id="${id}">+</button>
              <button class="btn btn-sm btn-outline-danger remove-item" data-id="${id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>`;
        })
        .join("");

      updateTotal(items);

      // ปุ่มลบสินค้า
      document.querySelectorAll(".remove-item").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const productId = e.currentTarget.dataset.id;
          await fetch("/api/removeFromCart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId }),
          });
          await loadCartItems(); 
        });
      });

      // ปุ่มเพิ่ม/ลดจำนวนสินค้า
      document.querySelectorAll(".qty-btn").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
          const action = e.currentTarget.dataset.action;
          const productId = e.currentTarget.dataset.id;
          const qtyElem = e.currentTarget.parentElement.querySelector("span");
          let qty = parseInt(qtyElem.textContent);

          qty = action === "increase" ? qty + 1 : Math.max(1, qty - 1);
          qtyElem.textContent = qty;

          await fetch("/api/updateCart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId, quantity: qty }),
          });

          refreshTotal();
        });
      });
    } catch (err) {
      cartContainer.innerHTML = `<div class="text-center text-danger p-3">${err.message}</div>`;
    }
  }

  cartButton.addEventListener("click", loadCartItems);

  function updateTotal(items) {
    const total = items.reduce(
      (sum, item) => sum + item.quantity * (item.productId?.price || 0),
      0
    );
    cartTotal.textContent = `รวมทั้งหมด: ${total}฿`;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCartModal);
} else {
  initCartModal();
}
