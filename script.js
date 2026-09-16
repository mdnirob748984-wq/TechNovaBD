/* =========================================
   TECHNOVABD - SUPABASE SHOP SYSTEM
========================================= */


/* =========================================
   SUPABASE CONFIG
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
   VARIABLES
========================================= */

let products = [];
let cart = [];


/* =========================================
   LOAD PRODUCTS FROM SUPABASE
========================================= */

async function loadProducts() {

    const productList =
        document.getElementById("productList");

    if (!productList) {

        console.error(
            "productList element পাওয়া যায়নি।"
        );

        return;
    }


    productList.innerHTML = `
        <div style="
            text-align:center;
            width:100%;
            padding:30px;
        ">
            🔄 পণ্য লোড হচ্ছে...
        </div>
    `;


    try {

        const {
            data,
            error
        } = await shopSupabase
            .from("products")
            .select("*")
            .order("id", {
                ascending: false
            });


        /* =================================
           SUPABASE ERROR
        ================================= */

        if (error) {

            console.error(
                "Supabase Product Error:",
                error
            );


            productList.innerHTML = `
                <div style="
                    width:100%;
                    text-align:center;
                    padding:30px;
                    color:red;
                    background:#fff5f5;
                    border:1px solid #ffcccc;
                    border-radius:10px;
                    margin:10px;
                ">

                    <h3>
                        ❌ পণ্য লোড করা যায়নি
                    </h3>

                    <p>
                        <strong>Error:</strong>
                        ${error.message || "Unknown error"}
                    </p>

                    <p>
                        <strong>Code:</strong>
                        ${error.code || "N/A"}
                    </p>

                    <p>
                        <strong>Details:</strong>
                        ${error.details || "N/A"}
                    </p>

                    <p>
                        <strong>Hint:</strong>
                        ${error.hint || "N/A"}
                    </p>

                </div>
            `;

            return;
        }


        /* =================================
           SAVE PRODUCTS
        ================================= */

        products = data || [];


        console.log(
            "Supabase Products:",
            products
        );


        /* =================================
           NO PRODUCTS
        ================================= */

        if (products.length === 0) {

            productList.innerHTML = `
                <div style="
                    width:100%;
                    text-align:center;
                    padding:30px;
                ">

                    <h3>
                        📦 বর্তমানে কোনো পণ্য নেই
                    </h3>

                    <p>
                        Admin Panel থেকে পণ্য যোগ করুন।
                    </p>

                </div>
            `;

            return;
        }


        /* =================================
           SHOW PRODUCTS
        ================================= */

        displayProducts(products);

    }

    catch (error) {

        console.error(
            "Unexpected Product Error:",
            error
        );


        productList.innerHTML = `
            <div style="
                width:100%;
                text-align:center;
                padding:30px;
                color:red;
            ">

                <h3>
                    ❌ একটি সমস্যা হয়েছে
                </h3>

                <p>
                    ${error.message || error}
                </p>

            </div>
        `;
    }

}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(list = products) {

    const productList =
        document.getElementById(
            "productList"
        );


    if (!productList) return;


    productList.innerHTML = "";


    if (!list || list.length === 0) {

        productList.innerHTML = `
            <div style="
                width:100%;
                text-align:center;
                padding:30px;
            ">

                📦 কোনো পণ্য পাওয়া যায়নি।

            </div>
        `;

        return;
    }


    list.forEach(product => {

        const productId =
            product.id;


        const productName =
            product.name ||
            "Product";


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
                        this.onerror=null;
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
                        type="button"
                        onclick="addToCart('${productId}')"
                    >
                        🛒 Add to Cart
                    </button>


                    <button
                        type="button"
                        onclick="buyNow('${productId}')"
                    >
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
            p =>
                String(p.id) === String(id)
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

        existing.quantity =
            Number(existing.quantity || 0) + 1;

    }

    else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCart();

    displayCart();

    updateOrderSummarySafe();


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
            p =>
                String(p.id) === String(id)
        );


    if (!product) {

        alert(
            "❌ Product পাওয়া যায়নি।"
        );

        return;
    }


    cart = [

        {

            ...product,

            quantity: 1

        }

    ];


    updateCart();

    displayCart();

    updateOrderSummarySafe();


    const orderSection =
        document.getElementById("order");


    if (orderSection) {

        orderSection.scrollIntoView({

            behavior: "smooth"

        });

    }

}


/* =========================================
   CART COUNT
========================================= */

function updateCart() {

    const count =
        cart.reduce(

            (total, item) =>

                total +
                Number(
                    item.quantity || 0
                ),

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
                "
            >

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
                    "
                >

                    <button
                        type="button"
                        onclick="
                            decreaseQuantity('${item.id}')
                        "
                    >
                        −
                    </button>


                    <button
                        type="button"
                        onclick="
                            increaseQuantity('${item.id}')
                        "
                    >
                        +
                    </button>


                    <button
                        type="button"
                        onclick="
                            removeFromCart('${item.id}')
                        "
                    >
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


    item.quantity =
        Number(item.quantity || 0) + 1;


    updateCart();

    displayCart();

    updateOrderSummarySafe();

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


    if (
        Number(item.quantity) > 1
    ) {

        item.quantity--;

    }

    else {

        cart =
            cart.filter(
                item =>
                    String(item.id) !== String(id)
            );

    }


    updateCart();

    displayCart();

    updateOrderSummarySafe();

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

    updateOrderSummarySafe();

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
        products.filter(
            product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                return name.includes(
                    search
                );

            }
        );


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

    updateOrderSummarySafe();


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
   SAFE ORDER SUMMARY UPDATE
========================================= */

function updateOrderSummarySafe() {

    /*
       index.html-এ যদি
       updateOrderSummary()
       থাকে, সেটি চালানো হবে।
    */

    if (
        typeof window.updateOrderSummary ===
        "function"
    ) {

        try {

            window.updateOrderSummary();

        }

        catch (error) {

            console.log(
                "Order summary error:",
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

        console.log(
            "TechNovaBD website started..."
        );


        loadProducts();

        updateCart();

    }
);
