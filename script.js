/* =========================================
   TechNovaBD
   CART + BUY NOW + CHECKOUT + TRACKING
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

let products = [];
let cart = [];

const DEFAULT_IMAGE =
    "https://via.placeholder.com/500x500?text=TechNovaBD";


/* =========================================
   SAFE TEXT
========================================= */

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value);
}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadProducts() {

    const box =
        document.getElementById("productList");

    if (!box) return;

    try {

        const response = await fetch(
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

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error_description ||
                "Products load failed"
            );
        }

        if (!Array.isArray(data)) {
            throw new Error("Product data পাওয়া যায়নি।");
        }

        products = data;

        displayProducts(products);

    } catch (error) {

        console.error("Product Error:", error);

        box.innerHTML = `
            <div class="loading-box">
                <h3>❌ Product Load Error</h3>
                <p>${escapeHTML(error.message)}</p>
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

    if (!list.length) {

        box.innerHTML = `
            <div class="loading-box">
                <h3>🔎 কোনো Product পাওয়া যায়নি</h3>
                <p>অন্য কোনো নাম দিয়ে Search করুন।</p>
            </div>
        `;

        return;
    }

    box.innerHTML = "";

    list.forEach(function(product) {

        const id = String(product.id);
        const name = product.name || "Product";
        const price = Number(product.price) || 0;
        const image = product.image || DEFAULT_IMAGE;

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
                            type="button"
                            class="add-cart"
                            onclick="addToCart('${escapeAttribute(id)}')"
                        >
                            🛒 Add Cart
                        </button>

                        <button
                            type="button"
                            class="buy-now"
                            onclick="buyNow('${escapeAttribute(id)}')"
                        >
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

            return String(product.name || "")
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
            return String(item.id) === String(id);
        });

    if (!product) {
        alert("❌ Product পাওয়া যায়নি।");
        return;
    }

    const existing =
        cart.find(function(item) {
            return String(item.id) === String(id);
        });

    if (existing) {

        existing.quantity =
            Number(existing.quantity || 0) + 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCartUI();

    showToast("✅ Cart-এ Product যোগ হয়েছে");

}


/* =========================================
   BUY NOW
========================================= */

function buyNow(id) {

    const product =
        products.find(function(item) {
            return String(item.id) === String(id);
        });

    if (!product) {
        alert("❌ Product পাওয়া যায়নি।");
        return;
    }

    /*
       Buy Now করলে এই Product-টি Cart-এ থাকবে।
       আগের Cart মুছে যাবে না।
    */

    const existing =
        cart.find(function(item) {
            return String(item.id) === String(id);
        });

    if (existing) {

        existing.quantity = 1;

    } else {

        cart.push({
            ...product,
            quantity: 1
        });

    }

    updateCartUI();

    openCheckout();
}


/* =========================================
   CART UI
========================================= */

function updateCartUI() {

    updateCartCount();
    displayCart();
    updateCartTotals();
    updateCheckoutSummary();

}


/* =========================================
   CART COUNT
========================================= */

function updateCartCount() {

    const count =
        cart.reduce(function(total, item) {

            return total +
                Number(item.quantity || 0);

        }, 0);

    const countBox =
        document.getElementById("cartCount");

    const headerCount =
        document.getElementById("cartHeaderCount");

    if (countBox) {
        countBox.textContent = count;
    }

    if (headerCount) {
        headerCount.textContent = count;
    }

}


/* =========================================
   PRODUCT TOTAL
========================================= */

function calculateProductTotal() {

    return cart.reduce(function(total, item) {

        return total +
            (
                Number(item.price || 0) *
                Number(item.quantity || 0)
            );

    }, 0);

}


/* =========================================
   DELIVERY
========================================= */

function calculateDelivery() {

    if (!cart.length) {
        return 0;
    }

    const division =
        document.getElementById("division");

    if (!division || !division.value) {
        return 0;
    }

    return division.value === "Dhaka"
        ? 60
        : 130;

}


/* =========================================
   DISPLAY CART
========================================= */

function displayCart() {

    const box =
        document.getElementById("cartItems");

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

        const total =
            price * quantity;

        const image =
            item.image || DEFAULT_IMAGE;

        const id =
            String(item.id);

        box.innerHTML += `
            <div class="cart-product">

                <img
                    class="cart-product-image"
                    src="${escapeAttribute(image)}"
                    alt="${escapeAttribute(item.name)}"
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
                        ৳${total.toLocaleString("en-BD")}
                    </div>

                    <div class="quantity-control">

                        <button
                            type="button"
                            onclick="decreaseQuantity('${escapeAttribute(id)}')"
                        >
                            −
                        </button>

                        <strong>
                            ${quantity}
                        </strong>

                        <button
                            type="button"
                            onclick="increaseQuantity('${escapeAttribute(id)}')"
                        >
                            +
                        </button>

                        <button
                            type="button"
                            class="remove-cart"
                            onclick="removeFromCart('${escapeAttribute(id)}')"
                        >
                            🗑 Remove
                        </button>

                    </div>

                </div>

            </div>
        `;

    });

}


/* =========================================
   CART TOTALS
========================================= */

function updateCartTotals() {

    const productTotal =
        calculateProductTotal();

    const delivery =
        calculateDelivery();

    const total =
        productTotal + delivery;

    const subtotalBox =
        document.getElementById("cartSubtotal");

    const deliveryBox =
        document.getElementById("cartDelivery");

    const totalBox =
        document.getElementById("cartTotal");

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
   CHECKOUT SUMMARY
========================================= */

function updateCheckoutSummary() {

    const productsBox =
        document.getElementById("checkoutProducts");

    const productTotal =
        calculateProductTotal();

    const delivery =
        calculateDelivery();

    const grandTotal =
        productTotal + delivery;

    const productTotalBox =
        document.getElementById("productTotal");

    const deliveryBox =
        document.getElementById("deliveryCharge");

    const grandTotalBox =
        document.getElementById("grandTotal");

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

    if (!productsBox) return;

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

    item.quantity =
        Number(item.quantity || 0) + 1;

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

    if (Number(item.quantity) > 1) {

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

    const drawer =
        document.getElementById("cartDrawer");

    const overlay =
        document.getElementById("cartOverlay");

    if (!drawer || !overlay) {
        console.error("Cart elements পাওয়া যায়নি।");
        return;
    }

    displayCart();
    updateCartTotals();

    drawer.classList.add("active");
    overlay.classList.add("active");

    document.body.classList.add("cart-open");

}


/* =========================================
   CLOSE CART
========================================= */

function closeCart() {

    const drawer =
        document.getElementById("cartDrawer");

    const overlay =
        document.getElementById("cartOverlay");

    if (drawer) {
        drawer.classList.remove("active");
    }

    if (overlay) {
        overlay.classList.remove("active");
    }

    document.body.classList.remove("cart-open");

}


/* =========================================
   CHECKOUT
========================================= */

function checkout() {

    if (!cart.length) {

        alert("⚠️ আগে Cart-এ Product যোগ করুন।");

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
        document.getElementById("checkout");

    const successSection =
        document.getElementById("successSection");

    if (successSection) {
        successSection.classList.add("hidden");
    }

    if (!checkoutSection) return;

    checkoutSection.classList.remove("hidden");

    updateCheckoutSummary();

    setTimeout(function() {

        checkoutSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 100);

}


/* =========================================
   BACK TO SHOP
========================================= */

function backToShop() {

    const checkoutSection =
        document.getElementById("checkout");

    const successSection =
        document.getElementById("successSection");

    if (checkoutSection) {
        checkoutSection.classList.add("hidden");
    }

    if (successSection) {
        successSection.classList.add("hidden");
    }

    const productsSection =
        document.getElementById("products");

    if (productsSection) {

        productsSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================
   SCROLL TO PRODUCTS
========================================= */

function scrollToProducts() {

    const section =
        document.getElementById("products");

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

}


/* =========================================
   PLACE ORDER
========================================= */

async function placeOrder() {

    if (!cart.length) {

        alert("⚠️ Cart খালি।");

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


    if (
        !name ||
        !phone ||
        !division ||
        !district ||
        !upazila ||
        !village ||
        !detailsAddress
    ) {

        alert("⚠️ সব তথ্য পূরণ করুন।");

        return;
    }


    if (!/^01[3-9]\d{8}$/.test(phone)) {

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
            "TN" + Date.now();


        const orderData = {

            order_id: orderId,

            customer_name: name,

            phone: phone,

            division: division,

            district: district,

            upazila: upazila,

            village: village,

            details_address:
                detailsAddress,

            products:
                orderProducts,

            product_total:
                productTotal,

            delivery_charge:
                deliveryCharge,

            total:
                grandTotal,

            status:
                "Pending"

        };


        const {
            data,
            error
        } =
            await shopSupabase
                .from("orders")
                .insert([orderData])
                .select()
                .single();


        if (error) {
            throw error;
        }


        const successOrderId =
            document.getElementById(
                "successOrderId"
            );

        const successTotal =
            document.getElementById(
                "successTotal"
            );

        if (successOrderId) {
            successOrderId.textContent =
                orderId;
        }

        if (successTotal) {
            successTotal.textContent =
                grandTotal.toLocaleString("en-BD");
        }


        const checkoutSection =
            document.getElementById(
                "checkout"
            );

        if (checkoutSection) {
            checkoutSection.classList.add(
                "hidden"
            );
        }


        const successSection =
            document.getElementById(
                "successSection"
            );

        if (successSection) {

            successSection.classList.remove(
                "hidden"
            );

            successSection.scrollIntoView({
                behavior: "smooth"
            });

        }


        cart = [];

        updateCartUI();

        clearOrderForm();


    } catch (error) {

        console.error(
            "Order Error:",
            error
        );

        alert(
            "❌ Order দিতে সমস্যা হয়েছে:\n\n" +
            error.message
        );

    } finally {

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
        document.getElementById("division");

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

    if (!input || !result) return;

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


    } catch (error) {

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
   DISPLAY TRACKING
========================================= */

function displayTracking(order) {

    const result =
        document.getElementById(
            "trackingResult"
        );

    if (!result) return;


    const statuses = [

        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Delivered"

    ];


    let currentIndex =
        statuses.indexOf(order.status);


    if (currentIndex < 0) {
        currentIndex = 0;
    }


    let stepsHTML = "";


    statuses.forEach(function(status, index) {

        const active =
            index <= currentIndex
                ? "active"
                : "";

        stepsHTML += `

            <div class="tracking-step ${active}">

                <div class="tracking-dot">
                    ${index + 1}
                </div>

                <span>
                    ${status}
                </span>

            </div>

        `;

    });


    const total =
        Number(order.total || 0);


    result.innerHTML = `

        <div class="tracking-card">

            <div class="tracking-order-info">

                <h3>
                    📦 ${escapeHTML(order.order_id)}
                </h3>

                <p>
                    Customer:
                    ${escapeHTML(order.customer_name)}
                </p>

                <p>
                    Total:
                    ৳${total.toLocaleString("en-BD")}
                </p>

                <p>
                    Status:
                    <strong>
                        ${escapeHTML(order.status || "Pending")}
                    </strong>
                </p>

            </div>


            <div class="tracking-steps">

                ${stepsHTML}

            </div>

        </div>

    `;

}


/* =========================================
   TOAST
========================================= */

function showToast(message) {

    let toast =
        document.getElementById(
            "toastMessage"
        );

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "toastMessage";

        toast.style.position =
            "fixed";

        toast.style.left =
            "50%";

        toast.style.bottom =
            "25px";

        toast.style.transform =
            "translateX(-50%)";

        toast.style.zIndex =
            "99999";

        toast.style.padding =
            "12px 18px";

        toast.style.borderRadius =
            "10px";

        toast.style.background =
            "#111827";

        toast.style.color =
            "#ffffff";

        toast.style.fontSize =
            "14px";

        toast.style.boxShadow =
            "0 5px 20px rgba(0,0,0,.25)";

        document.body.appendChild(toast);

    }


    toast.textContent = message;

    toast.style.display = "block";


    clearTimeout(
        toast._timer
    );


    toast._timer =
        setTimeout(function() {

            toast.style.display =
                "none";

        }, 2200);

}


/* =========================================
   DIVISION CHANGE
========================================= */

function handleDivisionChange() {

    updateCartTotals();
    updateCheckoutSummary();

}


/* =========================================
   GLOBAL FUNCTIONS
   Android / inline onclick-এর জন্য
========================================= */

window.openCart = openCart;
window.closeCart = closeCart;

window.addToCart = addToCart;
window.buyNow = buyNow;

window.increaseQuantity =
    increaseQuantity;

window.decreaseQuantity =
    decreaseQuantity;

window.removeFromCart =
    removeFromCart;

window.checkout = checkout;
window.openCheckout =
    openCheckout;

window.backToShop =
    backToShop;

window.scrollToProducts =
    scrollToProducts;

window.placeOrder =
    placeOrder;

window.trackOrder =
    trackOrder;

window.searchProducts =
    searchProducts;

window.goToTracking =
    function() {

        const section =
            document.getElementById(
                "tracking"
            );

        if (section) {

            section.scrollIntoView({
                behavior: "smooth"
            });

        }

    };


/* =========================================
   START
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "TechNovaBD script loaded successfully."
        );

        const division =
            document.getElementById(
                "division"
            );

        if (division) {

            division.addEventListener(
                "change",
                handleDivisionChange
            );

        }


        loadProducts();

        updateCartUI();

    }
);
