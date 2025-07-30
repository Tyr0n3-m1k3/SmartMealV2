document.addEventListener('DOMContentLoaded', () => {
    // Configuration
    const API_BASE_URL = 'http://localhost:5000/api';
    const DELIVERY_FEE = 2.99;

    // DOM Elements
    const dom = {
        // Auth Elements
        loginBtn: document.getElementById('login-btn'),
        signupBtn: document.getElementById('signup-btn'),
        loginModal: document.getElementById('login-modal'),
        signupModal: document.getElementById('signup-modal'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        showSignup: document.getElementById('show-signup'),
        showLogin: document.getElementById('show-login'),

        // Cart Elements
        cartBtn: document.querySelector('.cart-btn'),
        cartSidebar: document.getElementById('cart-sidebar'),
        closeCart: document.querySelector('.close-cart'),
        cartItems: document.getElementById('cart-items'),
        cartCount: document.getElementById('cart-count'),
        cartSubtotal: document.getElementById('cart-subtotal'),
        cartTotal: document.getElementById('cart-total'),
        checkoutBtn: document.getElementById('checkout-btn'),

        // Checkout Elements
        checkoutModal: document.getElementById('checkout-modal'),
        checkoutSteps: document.querySelectorAll('.checkout-steps .step'),
        checkoutForms: document.querySelectorAll('.checkout-form'),
        nextStepBtns: document.querySelectorAll('.next-step'),
        paymentMethods: document.querySelectorAll('.payment-method'),
        paymentDetails: document.querySelectorAll('.payment-details'),
        backHomeBtn: document.querySelector('.back-home'),
        orderId: document.getElementById('order-id'),

        // Restaurant Elements
        restaurantList: document.getElementById('restaurant-list')
    };

    // Application State
    const state = {
        cart: [],
        currentStep: 1,
        currentPaymentMethod: 'credit',
        restaurants: [
            {
                id: 1,
                name: "Burger Palace",
                cuisine: "American, Burgers",
                rating: 4.5,
                deliveryTime: "20-30 min",
                price: "$$",
                image: "images/burger-restaurant.jpg",
                menu: [
                    { id: 101, name: "Classic Burger", price: 8.99, description: "Beef patty with lettuce, tomato, and special sauce" },
                    { id: 102, name: "Cheeseburger", price: 9.99, description: "Classic burger with American cheese" }
                ]
            },
            {
                id: 2,
                name: "Pizza Heaven",
                cuisine: "Italian, Pizza",
                rating: 4.7,
                deliveryTime: "25-35 min",
                price: "$$",
                image: "images/pizza-restaurant.jpg",
                menu: [
                    { id: 201, name: "Margherita Pizza", price: 12.99, description: "Classic pizza with tomato sauce and mozzarella" },
                    { id: 202, name: "Pepperoni Pizza", price: 14.99, description: "Margherita pizza with pepperoni" }
                ]
            }
        ]
    };

    // Initialize the application
    function init() {
        checkAuthStatus();
        renderRestaurants();
        setupEventListeners();
        console.log('SmartMeal initialized');
    }

    // ========================
    // AUTHENTICATION FUNCTIONS
    // ========================
    function checkAuthStatus() {
        const token = localStorage.getItem('smartmeal_token');
        if (token) {
            dom.loginBtn.textContent = 'My Account';
            dom.signupBtn.style.display = 'none';
        }
    }

    async function handleLogin(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Login failed');

            localStorage.setItem('smartmeal_token', data.token);
            dom.loginModal.style.display = 'none';
            checkAuthStatus();
            showToast('Login successful!');
        } catch (error) {
            console.error('Login error:', error);
            showToast(error.message, 'error');
        }
    }

    async function handleSignup(name, email, password, phone) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, phone })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Registration failed');

            localStorage.setItem('smartmeal_token', data.token);
            dom.signupModal.style.display = 'none';
            checkAuthStatus();
            showToast('Registration successful!');
        } catch (error) {
            console.error('Signup error:', error);
            showToast(error.message, 'error');
        }
    }

    // ========================
    // CART FUNCTIONS
    // ========================
    function updateCart() {
        dom.cartItems.innerHTML = '';
        let subtotal = 0;

        state.cart.forEach((item, index) => {
            subtotal += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="images/${item.name.toLowerCase().replace(' ', '-')}.jpg" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                        <button class="remove-btn" data-index="${index}">×</button>
                    </div>
                </div>
            `;
            dom.cartItems.appendChild(cartItem);
        });

        dom.cartCount.textContent = state.cart.reduce((sum, item) => sum + item.quantity, 0);
        dom.cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        dom.cartTotal.textContent = `$${(subtotal + DELIVERY_FEE).toFixed(2)}`;
    }

    function handleCartAction(e) {
        const index = parseInt(e.target.dataset.index);
        
        if (e.target.classList.contains('minus')) {
            if (state.cart[index].quantity > 1) {
                state.cart[index].quantity--;
            } else {
                state.cart.splice(index, 1);
            }
        } 
        else if (e.target.classList.contains('plus')) {
            state.cart[index].quantity++;
        }
        else if (e.target.classList.contains('remove-btn')) {
            state.cart.splice(index, 1);
        }

        updateCart();
    }

    // ========================
    // CHECKOUT FUNCTIONS
    // ========================
    function setupCheckout() {
        // Step navigation
        dom.nextStepBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const nextStep = parseInt(btn.dataset.next);
                
                if (validateStep(state.currentStep)) {
                    goToStep(nextStep);
                    
                    if (nextStep === 3) {
                        processPayment();
                    }
                }
            });
        });

        // Payment method selection
        dom.paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                dom.paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                state.currentPaymentMethod = method.dataset.method;
                dom.paymentDetails.forEach(d => d.classList.add('hidden'));
                document.getElementById(`${state.currentPaymentMethod}-details`).classList.remove('hidden');
            });
        });
    }

    function validateStep(step) {
        if (step === 1) {
            const required = document.querySelectorAll('#delivery-step [required]');
            let valid = true;
            
            required.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = 'red';
                    valid = false;
                } else {
                    input.style.borderColor = '';
                }
            });
            
            if (!valid) showToast('Please fill all required fields', 'error');
            return valid;
        }
        
        if (step === 2 && state.currentPaymentMethod === 'credit') {
            const cardNum = document.querySelector('#credit-card-details input[placeholder="Card Number"]');
            if (!/^\d{16}$/.test(cardNum.value.replace(/\s/g, ''))) {
                showToast('Please enter a valid 16-digit card number', 'error');
                return false;
            }
        }
        
        return true;
    }

    function goToStep(step) {
        dom.checkoutSteps.forEach(s => s.classList.remove('active'));
        dom.checkoutSteps[step - 1].classList.add('active');
        
        dom.checkoutForms.forEach(f => f.classList.add('hidden'));
        document.getElementById(`${['delivery', 'payment', 'confirmation'][step - 1]}-step`).classList.remove('hidden');
        
        state.currentStep = step;
    }

    async function processPayment() {
        const token = localStorage.getItem('smartmeal_token');
        if (!token) {
            showToast('Please login to complete your order', 'error');
            dom.loginModal.style.display = 'block';
            return;
        }

        try {
            const orderData = {
                items: state.cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                paymentMethod: state.currentPaymentMethod,
                deliveryAddress: getDeliveryAddress()
            };

            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Payment failed');

            dom.orderId.textContent = data.orderId;
            state.cart = [];
            updateCart();
            showToast('Order placed successfully!');
        } catch (error) {
            console.error('Payment error:', error);
            showToast(error.message, 'error');
            goToStep(1);
        }
    }

    function getDeliveryAddress() {
        return {
            name: document.querySelector('#delivery-step input[placeholder="Full Name"]').value,
            street: document.querySelector('#delivery-step input[placeholder="Address"]').value,
            phone: document.querySelector('#delivery-step input[placeholder="Phone Number"]').value,
            instructions: document.querySelector('#delivery-step textarea').value
        };
    }

    // ========================
    // RESTAURANT FUNCTIONS
    // ========================
    function renderRestaurants() {
        dom.restaurantList.innerHTML = state.restaurants.map(restaurant => `
            <div class="restaurant-card">
                <img src="${restaurant.image}" alt="${restaurant.name}">
                <div class="restaurant-info">
                    <h3>${restaurant.name}</h3>
                    <p>${restaurant.cuisine}</p>
                    <div class="restaurant-meta">
                        <span>${'★'.repeat(Math.floor(restaurant.rating))}${'☆'.repeat(5 - Math.ceil(restaurant.rating))}</span>
                        <span>${restaurant.deliveryTime}</span>
                        <span>${restaurant.price}</span>
                    </div>
                    <button class="view-menu-btn" data-id="${restaurant.id}">View Menu</button>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.view-menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const restaurant = state.restaurants.find(r => r.id === parseInt(btn.dataset.id));
                showMenuModal(restaurant);
            });
        });
    }

    function showMenuModal(restaurant) {
        const modalHTML = `
            <div class="modal" id="menu-modal">
                <div class="modal-content">
                    <span class="close">&times;</span>
                    <h2>${restaurant.name} Menu</h2>
                    <div class="menu-items">
                        ${restaurant.menu.map(item => `
                            <div class="menu-item">
                                <div>
                                    <h4>${item.name}</h4>
                                    <p>${item.description}</p>
                                    <span>$${item.price.toFixed(2)}</span>
                                </div>
                                <div class="item-controls">
                                    <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                    <span class="quantity">0</span>
                                    <button class="quantity-btn plus" data-id="${item.id}">+</button>
                                    <button class="add-btn" data-id="${item.id}">Add</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = document.getElementById('menu-modal');

        // Handle modal close
        modal.querySelector('.close').addEventListener('click', () => {
            modal.style.display = 'none';
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                setTimeout(() => modal.remove(), 300);
            }
        });

        // Handle menu item interactions
        modal.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = parseInt(btn.dataset.id);
                const quantity = parseInt(btn.closest('.menu-item').querySelector('.quantity').textContent);
                
                if (quantity > 0) {
                    const menuItem = restaurant.menu.find(item => item.id === itemId);
                    state.cart.push({ ...menuItem, quantity });
                    updateCart();
                    modal.style.display = 'none';
                    setTimeout(() => modal.remove(), 300);
                    showToast(`${quantity} ${menuItem.name}(s) added to cart`);
                }
            });
        });

        // Handle quantity changes
        modal.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const quantityEl = btn.closest('.item-controls').querySelector('.quantity');
                let quantity = parseInt(quantityEl.textContent);
                
                if (btn.classList.contains('minus')) {
                    quantity = Math.max(0, quantity - 1);
                } else {
                    quantity++;
                }
                
                quantityEl.textContent = quantity;
            });
        });

        modal.style.display = 'block';
    }

    // ========================
    // UTILITY FUNCTIONS
    // ========================
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }, 100);
    }

    function setupEventListeners() {
        // Auth Event Listeners
        dom.loginBtn?.addEventListener('click', () => dom.loginModal.style.display = 'block');
        dom.signupBtn?.addEventListener('click', () => dom.signupModal.style.display = 'block');
        
        dom.showSignup?.addEventListener('click', (e) => {
            e.preventDefault();
            dom.loginModal.style.display = 'none';
            dom.signupModal.style.display = 'block';
        });
        
        dom.showLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            dom.signupModal.style.display = 'none';
            dom.loginModal.style.display = 'block';
        });
        
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                dom.loginModal.style.display = 'none';
                dom.signupModal.style.display = 'none';
            });
        });
        
        dom.loginForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = dom.loginForm.querySelector('input[type="email"]').value;
            const password = dom.loginForm.querySelector('input[type="password"]').value;
            handleLogin(email, password);
        });
        
        dom.signupForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = dom.signupForm.querySelector('input[type="text"]').value;
            const email = dom.signupForm.querySelector('input[type="email"]').value;
            const password = dom.signupForm.querySelector('input[type="password"]').value;
            const phone = dom.signupForm.querySelector('input[type="tel"]').value;
            handleSignup(name, email, password, phone);
        });

        // Cart Event Listeners
        dom.cartBtn?.addEventListener('click', () => dom.cartSidebar.classList.add('active'));
        dom.closeCart?.addEventListener('click', () => dom.cartSidebar.classList.remove('active'));
        dom.cartItems?.addEventListener('click', handleCartAction);
        dom.checkoutBtn?.addEventListener('click', () => {
            if (state.cart.length === 0) {
                showToast('Your cart is empty', 'error');
                return;
            }
            dom.checkoutModal.style.display = 'block';
            dom.cartSidebar.classList.remove('active');
            goToStep(1);
        });

        // Checkout Event Listeners
        dom.backHomeBtn?.addEventListener('click', () => {
            dom.checkoutModal.style.display = 'none';
            goToStep(1);
        });

        setupCheckout();
    }

    // Initialize the application
    init();
});
