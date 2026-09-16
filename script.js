const products = [
    {
        id: 1,
        name: "F15-2 Wireless Microphone",
        price: 1499,
        image: "https://via.placeholder.com/300"
    },
    {
        id: 2,
        name: "Wireless Bluetooth Speaker",
        price: 1299,
        image: "https://via.placeholder.com/300"
    },
    {
        id: 3,
        name: "Type-C Fast Charging Cable",
        price: 399,
        image: "https://via.placeholder.com/300"
    },
    {
        id: 4,
        name: "Premium Mobile Stand",
        price: 499,
        image: "https://via.placeholder.com/300"
    },
    {
        id: 5,
        name: "Wireless Earbuds",
        price: 999,
        image: "https://via.placeholder.com/300"
    },
    {
        id: 6,
        name: "65W Fast Charger",
        price: 1199,
        image: "https://via.placeholder.com/300"
    }
];

let cart = [];


/* =========================
   SHOW PRODUCTS
========================= */

function displayProducts(list = products) {

    const productList =
        document.getElementById("productList");

    if (!productList) return;

    productList.innerHTML = "";

    list.forEach(product => {

        productList.innerHTML += `
            <div class="product">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <h3>${product.name}</h3>

                <div class="price">
                    ৳${product.price}
                </div>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

            </div>
        `;
    });
}


/* =========================
   ADD TO CART
========================= */

function addToCart(id) {

    const product =
        products.find(p => p.id === id);

    if (!product) return;

    const existing =
        cart.find(item => item.id === id);

    if (existing) {

        existing.quantity++;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCart();

    alert(product.name + " Cart-এ যোগ হয়েছে!");
}


/* =========================
   UPDATE CART COUNT
========================= */

function updateCart() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    const cartCount =
        document.getElementById("cartCount");

    if (cartCount) {
        cartCount.textContent = count;
    }
}


/* =========================
   OPEN CART
========================= */

function openCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {
        modal.style.display = "block";
    }

    displayCart();
}


/* =========================
   CLOSE CART
========================= */

function closeCart() {

    const modal =
        document.getElementById("cartModal");

    if (modal) {
        modal.style.display = "none";
    }
}


/* =========================
   DISPLAY CART
========================= */

function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    const cartTotal =
        document.getElementById("cartTotal");

    if (!cartItems) return;

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>আপনার Cart খালি।</p>";

        if (cartTotal) {
            cartTotal.textContent = "0";
        }

        return;
    }


    cart.forEach(item => {

        const itemTotal =
            item.price * item.quantity;

        total += itemTotal;

        cartItems.innerHTML += `
            <div class="cart-item">

                <span>
                    ${item.name}
                    × ${item.quantity}
                </span>

                <strong>
                    ৳${itemTotal}
                </strong>

            </div>
        `;
    });


    if (cartTotal) {
        cartTotal.textContent = total;
    }
}


/* =========================
   SEARCH PRODUCTS
========================= */

function searchProducts() {

    const searchInput =
        document.getElementById("search");

    if (!searchInput) return;

    const search =
        searchInput.value.toLowerCase();

    const result =
        products.filter(product =>
            product.name
                .toLowerCase()
                .includes(search)
        );

    displayProducts(result);
}


/* =========================
   SHOP NOW
========================= */

function scrollToProducts() {

    const productsSection =
        document.getElementById("products");

    if (!productsSection) return;

    productsSection.scrollIntoView({
        behavior: "smooth"
    });
}


/* =========================
   CHECKOUT
========================= */

function checkout() {

    if (cart.length === 0) {

        alert("আপনার Cart খালি!");

        return;
    }

    alert(
        "Checkout system পরের ধাপে তৈরি করা হবে।"
    );
}


/* =========================
   START WEBSITE
========================= */

displayProducts();
updateCart();
