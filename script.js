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

/* Show Products */
function displayProducts(list = products) {

    const productList =
        document.getElementById("productList");

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


/* Add Product To Cart */
function addToCart(id) {

    const product =
        products.find(p => p.id === id);

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


/* Update Cart Count */
function updateCart() {

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    document.getElementById("cartCount")
        .textContent = count;
}


/* Open Cart */
function openCart() {

    document.getElementById("cartModal")
        .style.display = "block";

    displayCart();
}


/* Close Cart */
function closeCart() {

    document.getElementById("cartModal")
        .style.display = "none";
}


/* Display Cart */
function displayCart() {

    const cartItems =
        document.getElementById("cartItems");

    cartItems.innerHTML = "";

    let total = 0;

    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>আপনার Cart খালি।</p>";

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

    document.getElementById("cartTotal")
        .textContent = total;
}


/* Search */
function searchProducts() {

    const search =
        document.getElementById("search")
            .value
            .toLowerCase();

    const result =
        products.filter(product =>
            product.name
                .toLowerCase()
                .includes(search)
        );

    displayProducts(result);
}


/* Shop Now */
function scrollToProducts() {

    document.getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* Checkout */
function checkout() {

    if (cart.length === 0) {

        alert("আপনার Cart খালি!");

        return;
    }

    alert(
        "Checkout system পরের ধাপে তৈরি করা হবে।"
    );
}


/* Start Website */
displayProducts();
updateCart();