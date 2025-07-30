document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded - initializing SmartMeal');

    // API Base URL - Update this to match your backend
    const API_BASE_URL = 'http://localhost:5000/api';

    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const closeBtns = document.querySelectorAll('.close');
    const cartBtn = document.querySelector('.cart-btn');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.querySelector('.close-cart');
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutSteps = document.querySelectorAll('.checkout-steps .step');
    const checkoutForms = document.querySelectorAll('.checkout-form');
    const nextStepBtns = document.querySelectorAll('.next-step');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const paymentDetails = document.querySelectorAll('.payment-details');
    const backHomeBtn = document.querySelector('.back-home');
    const restaurantList = document.getElementById('restaurant-list');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    // Sample restaurant data (would normally come from API)
   const restaurants = [
        {
            id: 1,
            name: "Burger Palace",
            cuisine: "American, Burgers",
            rating: 4.5,
            reviews: 124,
            deliveryTime: "20-30 min",
            price: "$$",
            image: "images/burger-restaurant.jpg",
            menu: [
                { id: 101, name: "Classic Burger", price: 8.99, description: "Beef patty with lettuce, tomato, and special sauce" },
                { id: 102, name: "Cheeseburger", price: 9.99, description: "Classic burger with American cheese" },
                { id: 103, name: "Bacon Burger", price: 10.99, description: "Classic burger with crispy bacon" }
            ]
        },
        {
            id: 2,
            name: "Pizza Heaven",
            cuisine: "Italian, Pizza",
            rating: 4.7,
            reviews: 215,
            deliveryTime: "25-35 min",
            price: "$$",
            image: "images/pizza-restaurant.jpg",
            menu: [
                { id: 201, name: "Margherita Pizza", price: 12.99, description: "Classic pizza with tomato sauce and mozzarella" },
                { id: 202, name: "Pepperoni Pizza", price: 14.99, description: "Margherita pizza with pepperoni" },
                { id: 203, name: "Vegetarian Pizza", price: 13.99, description: "Pizza with assorted vegetables" }
            ]
        },
        {
            id: 3,
            name: "Sushi World",
            cuisine: "Japanese, Sushi",
            rating: 4.8,
            reviews: 178,
            deliveryTime: "30-40 min",
            price: "$$$",
            image: "images/sushi-restaurant.jpg",
            menu: [
                { id: 301, name: "California Roll", price: 7.99, description: "Crab, avocado, and cucumber" },
                { id: 302, name: "Salmon Nigiri", price: 9.99, description: "Fresh salmon over rice" },
                { id: 303, name: "Dragon Roll", price: 14.99, description: "Eel, crab, and avocado topped with avocado" }
            ]
        },
        {
            id: 4,
            name: "Green Leaf",
            cuisine: "Healthy, Salads",
            rating: 4.3,
            reviews: 92,
            deliveryTime: "15-25 min",
            price: "$$",
            image: "images/salad-restaurant.jpg",
            menu: [
                { id: 401, name: "Caesar Salad", price: 8.99, description: "Romaine lettuce, croutons, parmesan, and Caesar dressing" },
                { id: 402, name: "Greek Salad", price: 9.99, description: "Cucumbers, tomatoes, olives, and feta cheese" },
                { id: 403, name: "Avocado Salad", price: 10.99, description: "Mixed greens with avocado, nuts, and vinaigrette" }
            ]
        }
    ];
    
    // Cart data
    let cart = [];
    let currentStep = 1;
    let currentPaymentMethod = 'credit';

    // Initialize the app
    function init() {
        renderRestaurants();
        setupEventListeners();
        checkAuthStatus();
        console.log('App initialized');
    }

    // Check if user is logged in
    function checkAuthStatus() {
        const token = localStorage.getItem('smartmeal_token');
        if (token) {
            // User is logged in
            loginBtn.textContent = 'My Account';
            signupBtn.style.display = 'none';
        }
    }

    // ========================
    // AUTHENTICATION HANDLERS
    // ========================

    // Login form submission
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('smartmeal_token', data.token);
                loginModal.style.display = 'none';
                checkAuthStatus();
                alert('Login successful!');
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
        }
    });

    // Signup form submission
    signupForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = signupForm.querySelector('input[type="text"]').value;
        const email = signupForm.querySelector('input[type="email"]').value;
        const password = signupForm.querySelector('input[type="password"]').value;
        const phone = signupForm.querySelector('input[type="tel"]').value;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, phone })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('smartmeal_token', data.token);
                signupModal.style.display = 'none';
                checkAuthStatus();
                alert('Registration successful!');
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert(error.message);
        }
    });

    // ========================
    // PAYMENT FUNCTIONALITY
    // ========================

    // Setup checkout steps
    function setupCheckoutSteps() {
        // Next step buttons
        nextStepBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const nextStep = parseInt(btn.getAttribute('data-next'));
                goToStep(nextStep);
            });
        });

        // Payment method selection
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                currentPaymentMethod = method.getAttribute('data-method');
                
                paymentDetails.forEach(detail => detail.classList.add('hidden'));
                document.getElementById(`${currentPaymentMethod}-details`).classList.remove('hidden');
            });
        });
    }

    // Navigate between checkout steps
    function goToStep(step) {
        // Validate current step before proceeding
        if (currentStep === 1 && !validateDeliveryInfo()) {
            alert('Please fill in all required delivery information');
            return;
        }

        if (currentStep === 2 && !validatePaymentInfo()) {
            alert('Please fill in all required payment information');
            return;
        }

        // Update UI
        checkoutSteps.forEach(s => s.classList.remove('active'));
        checkoutSteps[step - 1].classList.add('active');
        
        checkoutForms.forEach(form => form.classList.add('hidden'));
        document.getElementById(`${getStepName(step)}-step`).classList.remove('hidden');
        
        currentStep = step;

        // If final step, process payment
        if (step === 3) {
            processPayment();
        }
    }

    function getStepName(step) {
        return ['delivery', 'payment', 'confirmation'][step - 1];
    }

    function validateDeliveryInfo() {
        const inputs = document.querySelectorAll('#delivery-step input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = 'red';
                isValid = false;
            } else {
                input.style.borderColor = '';
            }
        });
        
        return isValid;
    }

    function validatePaymentInfo() {
        if (currentPaymentMethod === 'credit') {
            const cardNumber = document.querySelector('#credit-card-details input[placeholder="Card Number"]');
            const expiry = document.querySelector('#credit-card-details input[placeholder="MM/YY"]');
            const cvv = document.querySelector('#credit-card-details input[placeholder="CVV"]');
            
            if (!cardNumber.value.trim() || !expiry.value.trim() || !cvv.value.trim()) {
                alert('Please fill in all credit card details');
                return false;
            }
            
            if (!/^\d{16}$/.test(cardNumber.value.replace(/\s/g, ''))) {
                alert('Please enter a valid 16-digit card number');
                return false;
            }
        }
        
        return true;
    }

    async function processPayment() {
        const token = localStorage.getItem('smartmeal_token');
        if (!token) {
            alert('Please login to complete your order');
            loginModal.style.display = 'block';
            return;
        }

        try {
            // Prepare order data
            const orderData = {
                items: cart.map(item => ({
                    menuItemId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                paymentMethod: currentPaymentMethod,
                deliveryAddress: getDeliveryAddress()
            };

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show order confirmation
                document.getElementById('order-id').textContent = data.orderId;
                // Clear cart
                cart = [];
                updateCart();
            } else {
                throw new Error(data.message || 'Payment processing failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert(error.message);
            goToStep(1); // Return to first step on error
        }
    }

    function getDeliveryAddress() {
        return {
            name: document.querySelector('#delivery-step input[placeholder="Full Name"]').value,
            street: document.querySelector('#delivery-step input[placeholder="Address"]').value,
            apartment: document.querySelector('#delivery-step input[placeholder="Apartment, suite, etc."]').value,
            phone: document.querySelector('#delivery-step input[placeholder="Phone Number"]').value,
            instructions: document.querySelector('#delivery-step textarea').value
        };
    }

    // ========================
    // REST OF YOUR EXISTING CODE
    // ========================

    // ... (keep all your existing functions like renderRestaurants, showRestaurantMenu, updateCart, etc.)

    // Modified setupEventListeners to include payment setup
    function setupEventListeners() {
        // ... (keep your existing event listeners)

        // Add payment setup
        setupCheckoutSteps();

        // Back home button - clear cart and reset
        backHomeBtn?.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
            currentStep = 1;
            goToStep(1);
        });
    }

    // Initialize the app
    init();
});
