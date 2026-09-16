/* =========================================
   TECHNOVABD - SUPABASE PRODUCT SYSTEM
========================================= */


/* =========================================
   SUPABASE
========================================= */

const SUPABASE_URL =
    "https://dcmeprqtygptljxjnbku.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_UQ_deuuX94nqT77envaRJg_VZXMhZqC";

const shopSupabase =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* =========================================
   PRODUCTS
========================================= */

let products = [];

let cart = [];


/* =========================================
   LOAD PRODUCTS FROM ADMIN / SUPABASE
========================================= */

async function loadProducts() {

    const productList =
        document.getElementById("productList");

    if (!productList) return;


    productList.innerHTML = `
        <p style="
            text-align:center;
            width:100%;
            padding:30px;
        ">
            🔄 পণ্য লোড হচ্ছে...
        </p>
    `;


    const {
        data,
        error
    } = await shopSupabase
        .from("products")
        .select("*")
        .order("id", {
            ascending: false
        });


    if (error) {

        console.error(
            "Product loading error:",
            error
        );


        productList.innerHTML = `
            <p style="
                text-align:center;
                width:100%;
                color:red;
                padding:30px;
            ">
                ❌ পণ্য লোড করা যায়নি।
                <br>
                আবার চেষ্টা করুন।
            </p>
        `;

        return;
    }


    products = data || [];


    displayProducts(products);

}


/* =========================================
   SHOW PRODUCTS
========================================= */

function displayProducts(list = products) {

    const productList =
        document.getElementById("productList");

    if (!productList) return;


    productList.innerHTML = "";


    if (!list || list.length === 0) {

        productList.innerHTML = `
            <p style="
                text-align:center;
                width:100%;
                padding:30px;
            ">
                📦 বর্তমানে কোনো পণ্য নেই।
            </p>
        `;

        return;
    }


    list.forEach(product => {

        const productId =
            product.id;

        const productName =
            product.name || "Product";

        const productPrice =
            Number(product.price) || 0;

        const productImage =
            product.image ||
            "https://via.placeholder.com/300";


        productList.innerHTML += `

            <div class="product">

                <img
                    src="${productImage}"
                    alt="${productName}"
                    onerror="
                        this.src='https://via.placeholder.com/300';
                    "
                >

                <h3>
                    ${productName}
                </h3>

                <div class="price">
                    ৳${productPrice}
                </div>


                <div class="product-buttons">

                    <button
                        onclick="addToCart('${productId}')">

                        🛒 Add to Cart

                    </button>


                    <button
                        onclick="buyNow('${productId}')">

                        ⚡ Buy Now

                    </button>

                </div>

            </div>

        `;
    });

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(id) {

    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if (!product) {

        alert(
            "❌ Product পাওয়া যায়নি।"
        );

        return;
    }


    const existing =
        cart.find(
            item =>
                String(item.id) === String(id)
        );


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCart();

    displayCart();

    updateOrderSummary();


    alert(
        product.name +
        " Cart-এ যোগ হয়েছে!"
    );

}


/* =========================================
   BUY NOW
========================================= */

function buyNow(id) {

    const product =
        products.find(
            p => String(p.id) === String(id)
        );


    if (!product) {

        alert(
            "❌ Product পাওয়া যায়নি।"
        );

        return;
    }


    /*
       Buy Now করলে
       Cart-এ শুধু এই Product থাকবে।
    */

    cart = [

        {

            ...product,

            quantity: 1

        }

    ];


    updateCart();

    displayCart();

    updateOrderSummary();


    const orderSection =
        document.getElementById("order");


    if (orderSection) {

        orderSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateCart() {

    const count =
        cart.reduce(

            (total, item) =>
                total +
                Number(item.quantity || 0),

            0

        );


    const cartCount =
        document.getElementById(
            "cartCount"
        );


    if (cartCount) {

        cartCount.textContent =
            count;

    }

}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

    const modal =
        document.getElementById(
            "cartModal"
        );


    if (modal) {

        modal.style.display =
            "block";

    }


    displayCart();

}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    const modal =
        document.getElementById(
            "cartModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {

    const cartItems =
        document.getElementById(
            "cartItems"
        );


    const cartTotal =
        document.getElementById(
            "cartTotal"
        );


    if (!cartItems) return;


    cartItems.innerHTML = "";


    let total = 0;


    if (cart.length === 0) {

        cartItems.innerHTML =
            "<p>আপনার Cart খালি।</p>";


        if (cartTotal) {

            cartTotal.textContent =
                "0";

        }


        return;

    }


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;


        const quantity =
            Number(item.quantity) || 1;


        const itemTotal =
            price * quantity;


        total += itemTotal;


        cartItems.innerHTML += `

            <div
                class="cart-item"
                style="
                    margin-bottom:15px;
                    padding:12px;
                    border-bottom:1px solid #ddd;
                ">

                <div>

                    <strong>
                        ${item.name}
                    </strong>

                    <br>

                    ৳${price}
                    ×
                    ${quantity}

                </div>


                <strong>
                    ৳${itemTotal}
                </strong>


                <div
                    style="
                        margin-top:8px;
                    ">

                    <button
                        onclick="
                            decreaseQuantity('${item.id}')
                        ">

                        −

                    </button>


                    <button
                        onclick="
                            increaseQuantity('${item.id}')
                        ">

                        +

                    </button>


                    <button
                        onclick="
                            removeFromCart('${item.id}')
                        ">

                        🗑️ Remove

                    </button>

                </div>

            </div>

        `;

    });


    if (cartTotal) {

        cartTotal.textContent =
            total;

    }

}


/* =========================================
   INCREASE QUANTITY
========================================= */

function increaseQuantity(id) {

    const item =
        cart.find(
            item =>
                String(item.id) === String(id)
        );


    if (!item) return;


    item.quantity++;


    updateCart();

    displayCart();

    updateOrderSummary();

}


/* =========================================
   DECREASE QUANTITY
========================================= */

function decreaseQuantity(id) {

    const item =
        cart.find(
            item =>
                String(item.id) === String(id)
        );


    if (!item) return;


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        cart =
            cart.filter(
                item =>
                    String(item.id) !== String(id)
            );

    }


    updateCart();

    displayCart();

    updateOrderSummary();

}


/* =========================================
   REMOVE FROM CART
========================================= */

function removeFromCart(id) {

    cart =
        cart.filter(
            item =>
                String(item.id) !== String(id)
        );


    updateCart();

    displayCart();

    updateOrderSummary();

}


/* =========================================
   SEARCH PRODUCTS
========================================= */

function searchProducts() {

    const searchInput =
        document.getElementById(
            "search"
        );


    if (!searchInput) return;


    const search =
        searchInput.value
            .toLowerCase()
            .trim();


    const result =
        products.filter(product => {

            const name =
                (
                    product.name || ""
                ).toLowerCase();


            return name.includes(search);

        });


    displayProducts(result);

}


/* =========================================
   SHOP NOW
========================================= */

function scrollToProducts() {

    const productsSection =
        document.getElementById(
            "products"
        );


    if (!productsSection) return;


    productsSection.scrollIntoView({

        behavior: "smooth"

    });

}


/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    if (cart.length === 0) {

        alert(
            "⚠️ আপনার Cart খালি!"
        );

        return;
    }


    closeCart();


    updateOrderSummary();


    const orderSection =
        document.getElementById(
            "order"
        );


    if (orderSection) {

        orderSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* =========================================
   UPDATE ORDER SUMMARY
========================================= */

function updateOrderSummary() {

    /*
       এই function index.html-এর
       updateOrderSummary function থাকলে
       সেটি ব্যবহার করবে।
    */

    if (
        typeof window.updateOrderSummary ===
        "function"
    ) {

        try {

            window.updateOrderSummary();

        } catch (error) {

            console.log(
                "Order summary update:",
                error
            );

        }

    }

}


/* =========================================
   START WEBSITE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        updateCart();

    }
);
