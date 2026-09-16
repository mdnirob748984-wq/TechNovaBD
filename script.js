/* =========================================
   TECHNOVABD
   CART + BUY NOW + CHECKOUT + TRACKING
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
   VARIABLES
========================================= */

let products = [];

let cart = [];

let checkoutMode = false;


/* =========================================
   DEFAULT IMAGE
========================================= */

const DEFAULT_IMAGE =
    "https://via.placeholder.com/500x500?text=TechNovaBD";


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    const box =
        document.getElementById("productList");

    if (!box) return;


    try {

        const response =
            await fetch(
                SUPABASE_URL +
                "/rest/v1/products?select=id,name,price,image&order=id.desc",
                {
                    method: "GET",

                    headers: {
                        "apikey": SUPABASE_KEY,
                        "Authorization":
                            "Bearer " + SUPABASE_KEY
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Products load failed"
            );

        }


        if (
            !Array.isArray(data) ||
            data.length === 0
        ) {

            box.innerHTML = `
                <div class="loading-box">
                    <h3>📦 কোনো পণ্য পাওয়া যায়নি</h3>
                    <p>বর্তমানে কোনো Product নেই।</p>
                </div>
            `;

            return;
        }


        products = data;

        displayProducts(products);

    }

    catch (error) {

        console.error(
            "Product Error:",
            error
        );


        box.innerHTML = `
            <div class="loading-box">

                <h3>
                    ❌ Product Load Error
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }

}


/* =========================================
   DISPLAY PRODUCTS
========================================= */

function displayProducts(list) {

    const box =
        document.getElementById("productList");

    if (!box) return;


    box.innerHTML = "";


    if (!list.length) {

        box.innerHTML = `
            <div class="loading-box">

                <h3>
                    🔎 কোনো Product পাওয়া যায়নি
                </h3>

                <p>
                    অন্য কোনো নাম দিয়ে Search করুন।
                </p>

            </div>
        `;

        return;
    }


    list.forEach(function(product) {

        const id =
            product.id;

        const name =
            product.name ||
            "Product";

        const price =
            Number(product.price) || 0;

        const image =
            product.image ||
            DEFAULT_IMAGE;


        box.innerHTML += `

            <div class="product-card">

                <div class="product-image-box">

                    <img
                        src="${escapeAttribute(image)}"
                        alt="${escapeAttribute(name)}"

                        onerror="
                            this.onerror=null;
                            this.src='${DEFAULT_IMAGE}';
                        "
                    >

                </div>


                <div class="product-info">

                    <h3 class="product-name">
                        ${escapeHTML(name)}
                    </h3>


                    <div class="product-price">

                        ৳${price.toLocaleString("en-BD")}

                    </div>


                    <div class="product-buttons">

                        <button
                            class="add-cart"
                            onclick="addToCart('${escapeAttribute(String(id))}')">

                            🛒 Add Cart

                        </button>


                        <button
                            class="buy-now"
                            onclick="buyNow('${escapeAttribute(String(id))}')">

                            ⚡ Buy Now

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


/* =========================================
   SEARCH
========================================= */

function searchProducts() {

    const input =
        document.getElementById("search");

    if (!input) return;


    const text =
        input.value
            .toLowerCase()
            .trim();


    const filtered =
        products.filter(function(product) {

            return String(
                product.name || ""
            )
            .toLowerCase()
            .includes(text);

        });


    displayProducts(filtered);

}


/* =========================================
   ADD TO CART
========================================= */

function addToCart(id) {

    const product =
        products.find(function(item) {

            return String(item.id) ===
                   String(id);

        });


    if (!product) {

        alert(
            "❌ Product পাওয়া যায়নি।"
        );

        return;
    }


    const existing =
        cart.find(function(item) {

            return String(item.id) ===
                   String(id);

        });


    if (existing) {

        existing.quantity++;

    } else {

        cart.push({

            ...product,

            quantity: 1

        });

    }


    updateCartUI();

    showToast(
        "✅ Cart-এ Product যোগ হয়েছে"
    );

}


/* =========================================
   BUY NOW
========================================= */

function buyNow(id) {

    const product =
        products.find(function(item) {

            return String(item.id) ===
                   String(id);

        });


    if (!product) {

        alert(
            "❌ Product পাওয়া যায়নি।"
        );

        return;
    }


    /*
       Buy Now-এর জন্য আলাদা cart তৈরি করছি।
       এতে পুরোনো Cart হারাবে না।
    */

    cart = [

        {
            ...product,

            quantity: 1

        }

    ];


    updateCartUI();

    openCheckout();

}


/* =========================================
   CART UI
========================================= */

function updateCartUI() {

    updateCartCount();

    displayCart();

    updateCheckoutSummary();

}


/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const count =
        cart.reduce(
            function(total, item) {

                return total +
                    Number(item.quantity || 0);

            },
            0
        );


    const countBox =
        document.getElementById("cartCount");


    const headerCount =
        document.getElementById(
            "cartHeaderCount"
        );


    if (countBox) {

        countBox.textContent =
            count;

    }


    if (headerCount) {

        headerCount.textContent =
            count;

    }

}


/* =========================================
   CALCULATE TOTAL
========================================= */

function calculateProductTotal() {

    return cart.reduce(
        function(total, item) {

            return total +
                (
                    Number(item.price || 0) *
                    Number(item.quantity || 0)
                );

        },
        0
    );

}


/* =========================================
   DELIVERY
========================================= */

function calculateDelivery() {

    if (!cart.length) {

        return 0;

    }


    const division =
        document.getElementById(
            "division"
        );


    const value =
        division
            ? division.value
            : "";


    return value === "Dhaka"
        ? 60
        : 130;

}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {

    const box =
        document.getElementById(
            "cartItems"
        );


    if (!box) return;


    if (!cart.length) {

        box.innerHTML = `

            <div class="empty-cart">

                <div class="empty-icon">
                    🛒
                </div>

                <h3>
                    আপনার Cart খালি
                </h3>

                <p>
                    পছন্দের পণ্য Cart-এ যোগ করুন।
                </p>

            </div>

        `;

        return;
    }


    box.innerHTML = "";


    cart.forEach(function(item) {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const itemTotal =
            price * quantity;


        const image =
            item.image ||
            DEFAULT_IMAGE;


        box.innerHTML += `

            <div class="cart-product">

                <img
                    class="cart-product-image"

                    src="${escapeAttribute(image)}"

                    onerror="
                        this.onerror=null;
                        this.src='${DEFAULT_IMAGE}';
                    "
                >


                <div class="cart-product-info">

                    <h4>
                        ${escapeHTML(item.name)}
                    </h4>


                    <div class="cart-product-price">

                        ৳${itemTotal.toLocaleString("en-BD")}

                    </div>


                    <div class="quantity-control">

                        <button
                            onclick="decreaseQuantity('${escapeAttribute(String(item.id))}')">

                            −

                        </button>


                        <strong>
                            ${quantity}
                        </strong>


                        <button
                            onclick="increaseQuantity('${escapeAttribute(String(item.id))}')">

                            +

                        </button>


                        <button
                            class="remove-cart"
                            onclick="removeFromCart('${escapeAttribute(String(item.id))}')">

                            🗑 Remove

                        </button>

                    </div>

                </div>

            </div>

        `;

    });

}


/* =========================================
   UPDATE CART TOTAL
========================================= */

function updateCartTotals() {

    const productTotal =
        calculateProductTotal();


    const delivery =
        calculateDelivery();


    const total =
        productTotal + delivery;


    const subtotalBox =
        document.getElementById(
            "cartSubtotal"
        );


    const deliveryBox =
        document.getElementById(
            "cartDelivery"
        );


    const totalBox =
        document.getElementById(
            "cartTotal"
        );


    if (subtotalBox) {

        subtotalBox.textContent =
            productTotal.toLocaleString("en-BD");

    }


    if (deliveryBox) {

        deliveryBox.textContent =
            delivery.toLocaleString("en-BD");

    }


    if (totalBox) {

        totalBox.textContent =
            total.toLocaleString("en-BD");

    }

}


/* =========================================
   UPDATE CHECKOUT SUMMARY
========================================= */

function updateCheckoutSummary() {

    updateCartTotals();


    const productsBox =
        document.getElementById(
            "checkoutProducts"
        );


    if (!productsBox) return;


    const productTotal =
        calculateProductTotal();


    const delivery =
        calculateDelivery();


    const grandTotal =
        productTotal + delivery;


    const productTotalBox =
        document.getElementById(
            "productTotal"
        );


    const deliveryBox =
        document.getElementById(
            "deliveryCharge"
        );


    const grandTotalBox =
        document.getElementById(
            "grandTotal"
        );


    if (productTotalBox) {

        productTotalBox.textContent =
            productTotal.toLocaleString("en-BD");

    }


    if (deliveryBox) {

        deliveryBox.textContent =
            delivery.toLocaleString("en-BD");

    }


    if (grandTotalBox) {

        grandTotalBox.textContent =
            grandTotal.toLocaleString("en-BD");

    }


    if (!cart.length) {

        productsBox.innerHTML =
            "<p>Cart খালি।</p>";

        return;
    }


    productsBox.innerHTML = "";


    cart.forEach(function(item) {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        const total =
            price * quantity;


        productsBox.innerHTML += `

            <div class="checkout-product">

                <span>
                    ${escapeHTML(item.name)}
                    × ${quantity}
                </span>

                <strong>
                    ৳${total.toLocaleString("en-BD")}
                </strong>

            </div>

        `;

    });

}


/* =========================================
   INCREASE
========================================= */

function increaseQuantity(id) {

    const item =
        cart.find(function(product) {

            return String(product.id) ===
                   String(id);

        });


    if (!item) return;


    item.quantity++;


    updateCartUI();

}


/* =========================================
   DECREASE
========================================= */

function decreaseQuantity(id) {

    const item =
        cart.find(function(product) {

            return String(product.id) ===
                   String(id);

        });


    if (!item) return;


    if (item.quantity > 1) {

        item.quantity--;

    } else {

        removeFromCart(id);

        return;

    }


    updateCartUI();

}


/* =========================================
   REMOVE
========================================= */

function removeFromCart(id) {

    cart =
        cart.filter(function(item) {

            return String(item.id) !==
                   String(id);

        });


    updateCartUI();

}


/* =========================================
   OPEN CART
========================================= */

function openCart() {

    document
        .getElementById("cartDrawer")
        .classList.add("active");


    document
        .getElementById("cartOverlay")
        .classList.add("active");


    displayCart();

    updateCartTotals();

}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    document
        .getElementById("cartDrawer")
        .classList.remove("active");


    document
        .getElementById("cartOverlay")
        .classList.remove("active");

}


/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    if (!cart.length) {

        alert(
            "⚠️ আপনার Cart খালি।"
        );

        return;
    }


    closeCart();

    openCheckout();

}


/* =========================================
   OPEN CHECKOUT
========================================= */

function openCheckout() {

    const checkoutSection =
        document.getElementById(
            "checkout"
        );


    const successSection =
        document.getElementById(
            "successSection"
        );


    if (successSection) {

        successSection.classList.add(
            "hidden"
        );

    }


    if (checkoutSection) {

        checkoutSection.classList.remove(
            "hidden"
        );

        updateCheckoutSummary();


        setTimeout(function() {

            checkoutSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    }

}


/* =========================================
   BACK TO SHOP
========================================= */

function backToShop() {

    const checkoutSection =
        document.getElementById(
            "checkout"
        );


    const successSection =
        document.getElementById(
            "successSection"
        );


    if (checkoutSection) {

        checkoutSection.classList.add(
            "hidden"
        );

    }


    if (successSection) {

        successSection.classList.add(
            "hidden"
        );

    }


    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================
   PLACE ORDER
========================================= */

async function placeOrder() {

    if (!cart.length) {

        alert(
            "⚠️ Cart খালি।"
        );

        return;
    }


    const name =
        document
            .getElementById("customerName")
            .value.trim();


    const phone =
        document
            .getElementById("customerPhone")
            .value.trim();


    const division =
        document
            .getElementById("division")
            .value;


    const district =
        document
            .getElementById("district")
            .value.trim();


    const upazila =
        document
            .getElementById("upazila")
            .value.trim();


    const village =
        document
            .getElementById("village")
            .value.trim();


    const detailsAddress =
        document
            .getElementById("detailsAddress")
            .value.trim();


    /* VALIDATION */

    if (
        !name ||
        !phone ||
        !division ||
        !district ||
        !upazila ||
        !village ||
        !detailsAddress
    ) {

        alert(
            "⚠️ সব তথ্য পূরণ করুন।"
        );

        return;
    }


    if (
        !/^01[3-9]\d{8}$/.test(phone)
    ) {

        alert(
            "⚠️ সঠিক ১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন।"
        );

        return;
    }


    const button =
        document.getElementById(
            "placeOrderButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "⏳ Order নেওয়া হচ্ছে...";

    }


    try {

        let productTotal = 0;


        const orderProducts =
            cart.map(function(item) {

                const price =
                    Number(item.price) || 0;

                const quantity =
                    Number(item.quantity) || 1;


                productTotal +=
                    price * quantity;


                return {

                    id: item.id,

                    name: item.name,

                    price: price,

                    quantity: quantity,

                    image: item.image || ""

                };

            });


        const deliveryCharge =
            division === "Dhaka"
                ? 60
                : 130;


        const grandTotal =
            productTotal +
            deliveryCharge;


        const orderId =
            "TN" +
            Date.now();


        const orderData = {

            order_id: orderId,

            customer_name: name,

            phone: phone,

            division: division,

            district: district,

            upazila: upazila,

            village: village,

            details_address: detailsAddress,

            products: orderProducts,

            product_total: productTotal,

            delivery_charge: deliveryCharge,

            total: grandTotal,

            status: "Pending"

        };


        const {
            error
        } =
            await shopSupabase
                .from("orders")
                .insert([
                    orderData
                ]);


        if (error) {

            throw error;

        }


        /* SUCCESS */

        document
            .getElementById(
                "successOrderId"
            )
            .textContent =
            orderId;


        document
            .getElementById(
                "successTotal"
            )
            .textContent =
            grandTotal.toLocaleString("en-BD");


        document
            .getElementById(
                "trackingOrderId"
            )
            .value =
            orderId;


        document
            .getElementById(
                "checkout"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "successSection"
            )
            .classList.remove(
                "hidden"
            );


        /*
           Order সফল হওয়ার পর cart clear করছি।
        */

        cart = [];

        updateCartUI();


        /*
           Form clear
        */

        clearOrderForm();


        document
            .getElementById(
                "successSection"
            )
            .scrollIntoView({
                behavior: "smooth"
            });


    }

    catch (error) {

        console.error(
            "Order Error:",
            error
        );


        alert(
            "❌ Order দিতে সমস্যা হয়েছে:\n\n" +
            error.message
        );

    }

    finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "✅ Confirm Order";

        }

    }

}


/* =========================================
   CLEAR FORM
========================================= */

function clearOrderForm() {

    const ids = [

        "customerName",
        "customerPhone",
        "district",
        "upazila",
        "village",
        "detailsAddress"

    ];


    ids.forEach(function(id) {

        const element =
            document.getElementById(id);


        if (element) {

            element.value = "";

        }

    });


    const division =
        document.getElementById(
            "division"
        );


    if (division) {

        division.value = "";

    }

}


/* =========================================
   TRACK ORDER
========================================= */

async function trackOrder() {

    const input =
        document.getElementById(
            "trackingOrderId"
        );


    const result =
        document.getElementById(
            "trackingResult"
        );


    const orderId =
        input.value.trim();


    if (!orderId) {

        result.innerHTML = `

            <div class="tracking-card">

                ⚠️ Order ID লিখুন।

            </div>

        `;

        return;
    }


    result.innerHTML = `

        <div class="tracking-card">

            🔎 Order খোঁজা হচ্ছে...

        </div>

    `;


    try {

        const {
            data,
            error
        } =
            await shopSupabase
                .from("orders")
                .select(
                    "order_id,customer_name,total,status,created_at"
                )
                .eq(
                    "order_id",
                    orderId
                )
                .maybeSingle();


        if (error) {

            throw error;

        }


        if (!data) {

            result.innerHTML = `

                <div class="tracking-card">

                    <h3>
                        ❌ Order পাওয়া যায়নি
                    </h3>

                    <p>
                        Order ID সঠিকভাবে লিখেছেন কিনা দেখুন।
                    </p>

                </div>

            `;

            return;
        }


        displayTracking(data);

    }

    catch (error) {

        console.error(
            "Tracking Error:",
            error
        );


        result.innerHTML = `

            <div class="tracking-card">

                <h3>
                    ❌ Tracking Error
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>

        `;

    }

}


/* =========================================
   TRACKING UI
========================================= */

function displayTracking(order) {

    const result =
        document.getElementById(
            "trackingResult"
        );


    const status =
        normalizeStatus(
            order.status
        );


    const statuses = [

        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered"

    ];


    const currentIndex =
        statuses.indexOf(status);


    let stepsHTML = "";


    statuses.forEach(
        function(item, index) {

            const active =
                index <= currentIndex
                    ? "active"
                    : "";


            const icon =
                index <= currentIndex
                    ? "✓"
                    : index + 1;


            stepsHTML += `

                <div class="tracking-step ${active}">

                    <div class="step-circle">

                        ${icon}

                    </div>

                    ${getStatusBangla(item)}

                </div>

            `;

        }
    );


    const date =
        order.created_at
            ? new Date(
                order.created_at
            ).toLocaleString(
                "bn-BD"
            )
            : "—";


    result.innerHTML = `

        <div class="tracking-card">

            <div class="tracking-top">

                <div>

                    <h3>
                        📦 Order Found
                    </h3>

                    <p>
                        Order ID:
                        <strong>
                            ${escapeHTML(order.order_id)}
                        </strong>
                    </p>

                    <p>
                        Customer:
                        ${escapeHTML(order.customer_name || "")}
                    </p>

                </div>


                <div>

                    <span class="status-badge">

                        ${getStatusBangla(status)}

                    </span>

                </div>

            </div>


            <div style="
                margin-top:15px;
                display:flex;
                justify-content:space-between;
                gap:10px;
            ">

                <span>
                    Total
                </span>

                <strong>
                    ৳${Number(order.total || 0)
                        .toLocaleString("en-BD")}
                </strong>

            </div>


            <div style="
                margin-top:6px;
                color:#6b7280;
                font-size:13px;
            ">

                Order Date:
                ${date}

            </div>


            <div class="tracking-steps">

                ${stepsHTML}

            </div>

        </div>

    `;

}


/* =========================================
   STATUS
========================================= */

function normalizeStatus(status) {

    const value =
        String(status || "Pending")
            .trim();


    const valid = [

        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered"

    ];


    if (
        valid.includes(value)
    ) {

        return value;

    }


    /*
       Cancelled হলে Pending-এর পরিবর্তে
       status text দেখানো হবে।
    */

    return value;

}


function getStatusBangla(status) {

    const map = {

        Pending: "Pending",

        Confirmed: "Confirmed",

        Processing: "Processing",

        Shipped: "Shipped",

        Delivered: "Delivered",

        Cancelled: "Cancelled"

    };


    return map[status] ||
           status;

}


/* =========================================
   GO TO TRACKING
========================================= */

function goToTracking() {

    document
        .getElementById("tracking")
        .scrollIntoView({
            behavior: "smooth"
        });


    const input =
        document.getElementById(
            "trackingOrderId"
        );


    if (input) {

        input.focus();

    }

}


/* =========================================
   SHOP NOW
========================================= */

function scrollToProducts() {

    document
        .getElementById("products")
        .scrollIntoView({
            behavior: "smooth"
        });

}


/* =========================================
   DIVISION CHANGE
========================================= */

function setupDivision() {

    const division =
        document.getElementById(
            "division"
        );


    if (!division) return;


    division.addEventListener(
        "change",
        function() {

            updateCheckoutSummary();

        }
    );

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    const oldToast =
        document.querySelector(
            ".tech-toast"
        );


    if (oldToast) {

        oldToast.remove();

    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        "tech-toast";


    toast.textContent =
        message;


    toast.style.cssText = `

        position:fixed;
        bottom:25px;
        left:50%;
        transform:translateX(-50%);

        background:#111827;
        color:white;

        padding:12px 18px;

        border-radius:9px;

        z-index:3000;

        font-size:14px;

        box-shadow:
            0 5px 20px rgba(0,0,0,0.2);

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(function() {

        toast.remove();

    }, 2000);

}


/* =========================================
   SECURITY HELPERS
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escapeAttribute(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

}


/* =========================================
   CLOSE CART WITH ESC
========================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeCart();

        }

    }
);


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadProducts();

        updateCartUI();

        setupDivision();

    }
);
