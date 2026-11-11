const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const cart = JSON.parse(localStorage.getItem("savat") || "[]");
const fmt = (n) => n.toLocaleString("ru-RU") + " so‘m";
const save = () => { localStorage.setItem("savat", JSON.stringify(cart)); render(); };
function render() {
  $("#cartCount").textContent = cart.reduce((s, i) => s + i.qty, 0);
  $("#cartTotal").textContent = fmt(cart.reduce((s, i) => s + i.qty * i.price, 0));
  $("#cartEmpty").hidden = cart.length > 0;
  $("#checkout").disabled = cart.length === 0;
  $("#cartItems").innerHTML = cart.map((i, k) => `
    <li class="cart-item" style="--d:${k * 0.07}s">
      <img src="${i.img}" alt="${i.name}">
      <div class="cart-info"><h4>${i.name}</h4><span>${fmt(i.price * i.qty)}</span>
        <div class="qty"><button data-act="minus" data-k="${k}">−</button><b>${i.qty}</b><button data-act="plus" data-k="${k}">+</button></div>
      </div>
      <button class="remove" data-act="del" data-k="${k}" aria-label="O‘chirish">✕</button>
    </li>`).join("");
}
function toast(text, t = $("#toast")) {
  t.textContent = text;
  t.classList.add("show"), clearTimeout(t.timer);
  t.timer = setTimeout(() => t.classList.remove("show"), 2500);
}
function countUp(el, start = performance.now()) {
  const step = (now) => {
    const p = Math.min((now - start) / 1800, 1);
    el.textContent = (el.dataset.pre || "") + Math.round(el.dataset.to * (1 - (1 - p) ** 3)).toLocaleString("ru-RU") + (el.dataset.suf || "");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const openCart = (v) => ["#cart", "#overlay"].forEach((s) => $(s).classList.toggle("open", v));
const bump = (el) => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); };
$$(".add-btn").forEach((btn) => btn.addEventListener("click", () => {
  const { id, name, price, img } = btn.closest(".product").dataset;
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, name, img, price: +price, qty: 1 });
  save();
  toast(`${name} savatchaga qo‘shildi ✓`);
  [$("#cartBtn"), btn].forEach(bump);
}));
$("#cartItems").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const k = +b.dataset.k, act = b.dataset.act;
  if (act !== "del") cart[k].qty += act === "plus" ? 1 : -1;
  if (act === "del" || cart[k].qty < 1) cart.splice(k, 1);
  save();
});
$$(".product").forEach((p) => {
  p.onmousemove = (e) => {
    const r = p.getBoundingClientRect();
    p.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 12 + "deg");
    p.style.setProperty("--rx", ((e.clientY - r.top) / r.height - 0.5) * -12 + "deg");
  };
  p.onmouseleave = () => p.removeAttribute("style");
});
$("#cartBtn").onclick = () => openCart(true);
$("#cartClose").onclick = $("#overlay").onclick = () => openCart(false);
$("#clearCart").onclick = () => { cart.length = 0; save(); };
$("#checkout").onclick = () => { cart.length = 0; save(); openCart(false); toast("Buyurtmangiz qabul qilindi! Tez orada bog‘lanamiz 🎉"); };
$("#burger").onclick = () => $("#nav").classList.toggle("open");
$$(".nav a").forEach((a) => a.onclick = () => $("#nav").classList.remove("open"));
$("#contactForm").onsubmit = (e) => { e.preventDefault(); e.target.reset(); toast("Rahmat! Tez orada qo‘ng‘iroq qilamiz 📞"); };
$$(".filter").forEach((f) => f.onclick = () => {
  $$(".filter").forEach((x) => x.classList.toggle("active", x === f));
  $$(".product").forEach((p) => p.classList.toggle("hide", f.dataset.cat !== "all" && p.dataset.cat !== f.dataset.cat));
});
addEventListener("scroll", () => {
  $(".header").classList.toggle("scrolled", scrollY > 40);
  $("#progress").style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight)) * 100 + "%";
});
const io = new IntersectionObserver((list) => list.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("visible"), io.unobserve(e.target);
  if (e.target.matches(".count")) countUp(e.target);
}), { threshold: 0.15 });
$$(".reveal, .count").forEach((el) => io.observe(el));
render();
