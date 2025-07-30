document.addEventListener('DOMContentLoaded', () => {
    console.log('SmartMeal client-side initialized');

    // =============================================
    // DOM ELEMENTS
    // =============================================
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
    const orderNowBtn = document.querySelector('.order-btn');

    // =============================================
    // DATA
    // =============================================
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
                { id: 101, name: "Classic Burger", price: 8.99, description: "Beef patty with lettuce, tomato, and special sauce", image: "images/burger.jpg" },
                { id: 102, name: "Cheeseburger", price: 9.99, description: "Classic burger with American cheese", image: "images/cheeseburger.jpg" },
                { id: 103, name: "Bacon Burger", price: 10.99, description: "Classic burger with crispy bacon", image: "images/bacon-burger.jpg" }
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
                { id: 201, name: "Margherita Pizza", price: 12.99, description: "Classic pizza with tomato sauce and mozzarella", image: "images/margherita.jpg" },
                { id: 202, name: "Pepperoni Pizza", price: 14.99, description: "Margherita pizza with pepperoni", image: "images/pepperoni.jpg" },
                { id: 203, name: "Vegetarian Pizza", price: 13.99, description: "Pizza with assorted vegetables", image: "images/vegetarian-pizza.jpg" }
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
                { id: 301, name: "California Roll", price: 7.99, description: "Crab, avocado, and cucumber", image: "images/california-roll.jpg" },
                { id: 302, name: "Salmon Nigiri", price: 9.99, description: "Fresh salmon over rice", image: "images/salmon-nigiri.jpg" },
                { id: 303, name: "Dragon Roll", price: 14.99, description: "Eel, crab, and avocado topped with avocado", image: "images/dragon-roll.jpg" }
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
                { id: 401, name: "Caesar Salad", price: 8.99, description: "Romaine lettuce, croutons, parmesan, and Caesar dressing", image: "images/caesar-salad.jpg" },
                { id: 402, name: "Greek Salad", price: 9.99, description: "Cucumbers, tomatoes, olives, and feta cheese", image: "images/greek-salad.jpg" },
                { id: 403, name: "Avocado Salad", price: 10.99, description: "Mixed greens with avocado, nuts, and vinaigrette", image: "images/avocado-salad.jpg" }
            ]
        }
    ];

    let cart = [];
    let currentStep = 1;
    let orderIdCounter = 1000;

    // =============================================
    // INITIALIZATION
    // =============================================
    function init() {
        renderRestaurants();
        setupEventListeners();
        updateCart();
        console.log('SmartMeal fully initialized');
    }

    // =============================================
    // RESTAURANT RENDERING
    // =============================================
    function renderRestaurants() {
        if (!restaurantList) {
            console.error('Restaurant list element not found');
            return;
        }

        restaurantList.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const stars = '★'.repeat(Math.floor(restaurant.rating)) + '☆'.repeat(5 - Math.ceil(restaurant.rating));
            
            const restaurantCard = document.createElement('div');
            restaurantCard.className = 'restaurant-card';
            restaurantCard.innerHTML = `
                <img src="${restaurant.image}" alt="${restaurant.name}" class="restaurant-img">
                <div class="restaurant-info">
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <p class="restaurant-cuisine">${restaurant.cuisine}</p>
                    <div class="restaurant-rating">
                        <span class="stars">${stars}</span>
                        <span class="reviews">(${restaurant.reviews})</span>
                    </div>
                    <div class="restaurant-delivery">
                        <span>${restaurant.deliveryTime}</span>
                        <span>${restaurant.price}</span>
                    </div>
                    <button class="view-menu-btn" data-restaurant="${restaurant.id}">View Menu</button>
                </div>
            `;
            
            restaurantList.appendChild(restaurantCard);
        });
        
        // Add event listeners to view menu buttons
        document.querySelectorAll('.view-menu-btn').forEach(button => {
            button.addEventListener('click', function() {
                const restaurantId = parseInt(this.getAttribute('data-restaurant'));
                const restaurant = restaurants.find(r => r.id === restaurantId);
                if (restaurant) showRestaurantMenu(restaurant);
            });
        });
    }

    // =============================================
    // MENU MODAL
    // =============================================
    function showRestaurantMenu(restaurant) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="menu-modal">
                <div class="modal-content menu-modal-content">
                    <span class="close">&times;</span>
                    <h2>${restaurant.name} Menu</h2>
                    <div class="menu-items">
                        ${restaurant.menu.map(item => `
                            <div class="menu-item" data-id="${item.id}">
                                <img src="${item.image}" alt="${item.name}" class="menu-item-img">
                                <div class="menu-item-info">
                                    <h3>${item.name}</h3>
                                    <p class="menu-item-desc">${item.description}</p>
                                    <span class="price">$${item.price.toFixed(2)}</span>
                                </div>
                                <div class="menu-item-controls">
                                    <button class="quantity-btn minus">-</button>
                                    <span class="quantity">0</span>
                                    <button class="quantity-btn plus">+</button>
                                    <button class="add-btn">Add</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="menu-modal-footer">
                        <button class="view-cart-btn">View Cart (${cart.reduce((sum, item) => sum + item.quantity, 0)})</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const menuModal = document.getElementById('menu-modal');
        
        // Show modal
        menuModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Close modal when clicking X
        menuModal.querySelector('.close').addEventListener('click', closeMenuModal);
        
        // Close modal when clicking outside
        menuModal.addEventListener('click', function(e) {
            if (e.target === this) closeMenuModal();
        });
        
        // Add event listeners to quantity buttons
        menuModal.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const quantityElement = menuItem.querySelector('.quantity');
                let quantity = parseInt(quantityElement.textContent);
                
                if (this.classList.contains('minus') && quantity > 0) {
                    quantity--;
                } else if (this.classList.contains('plus')) {
                    quantity++;
                }
                
                quantityElement.textContent = quantity;
            });
        });

        // Add to cart functionality
        menuModal.querySelectorAll('.add-btn').forEach(button => {
            button.addEventListener('click', function() {
                const menuItem = this.closest('.menu-item');
                const itemId = parseInt(menuItem.getAttribute('data-id'));
                const quantity = parseInt(menuItem.querySelector('.quantity').textContent);
                
                if (quantity > 0) {
                    const restaurant = restaurants.find(r => r.menu.some(item => item.id === itemId));
                    const menuItem = restaurant.menu.find(item => item.id === itemId);
                    
                    // Check if item already exists in cart
                    const existingItemIndex = cart.findIndex(item => 
                        item.id === menuItem.id && item.restaurantId === restaurant.id
                    );
                    
                    if (existingItemIndex >= 0) {
                        // Update quantity if item exists
                        cart[existingItemIndex].quantity += quantity;
                    } else {
                        // Add new item to cart
                        cart.push({
                            ...menuItem,
                            quantity,
                            restaurantId: restaurant.id,
                            restaurantName: restaurant.name
                        });
                    }
                    
                    updateCart();
                    closeMenuModal();
                    
                    // Show added to cart notification
                    showNotification(`${quantity} ${menuItem.name} added to cart`);
                }
            });
        });
        
        // View cart button
        menuModal.querySelector('.view-cart-btn')?.addEventListener('click', () => {
            closeMenuModal();
            cartSidebar.classList.add('active');
        });
    }

    function closeMenuModal() {
        const menuModal = document.getElementById('menu-modal');
        if (menuModal) {
            menuModal.style.display = 'none';
            document.body.style.overflow = '';
            setTimeout(() => menuModal.remove(), 300);
        }
    }

    // =============================================
    // CART FUNCTIONALITY
    // =============================================
    function updateCart() {
        if (!cartItems || !cartCount || !cartSubtotal || !cartTotal) return;
        
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
            cartCount.textContent = '0';
            cartSubtotal.textContent = '$0.00';
            cartTotal.textContent = '$2.99';
            checkoutBtn.disabled = true;
            return;
        }
        
        checkoutBtn.disabled = false;
        
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-restaurant">${item.restaurantName}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                        <button class="cart-item-remove" data-index="${index}">×</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
            
            subtotal += item.price * item.quantity;
        });
        
        // Update cart totals
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        const deliveryFee = 2.99;
        cartTotal.textContent = `$${(subtotal + deliveryFee).toFixed(2)}`;
        
        // Add event listeners to cart item controls
        document.querySelectorAll('.cart-item-controls .quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (isNaN(index) || index < 0 || index >= cart.length) return;
                
                if (this.classList.contains('minus')) {
                    if (cart[index].quantity > 1) {
                        cart[index].quantity--;
                    } else {
                        cart.splice(index, 1);
                    }
                } else if (this.classList.contains('plus')) {
                    cart[index].quantity++;
                }
                
                updateCart();
            });
        });
        
        // Add event listeners to remove buttons
        document.querySelectorAll('.cart-item-remove').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                if (!isNaN(index) && index >= 0 && index < cart.length) {
                    cart.splice(index, 1);
                    updateCart();
                    showNotification('Item removed from cart');
                }
            });
        });
    }

    // =============================================
    // CHECKOUT FLOW
    // =============================================
    function setupCheckoutFlow() {
        // Next step buttons
        nextStepBtns.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const nextStep = parseInt(button.getAttribute('data-next'));
                if (nextStep) goToStep(nextStep);
            });
        });
        
        // Payment method selection
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                paymentDetails.forEach(detail => detail.classList.add('hidden'));
                const methodType = method.getAttribute('data-method');
                document.getElementById(`${methodType}-details`)?.classList.remove('hidden');
            });
        });
        
        // Back home button
        backHomeBtn?.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
            document.body.style.overflow = '';
            resetCheckout();
        });
    }

    function goToStep(step) {
        if (step < 1 || step > 3) return;
        
        // Validate current step before proceeding
        if (currentStep === 1 && !validateDeliveryInfo()) {
            showNotification('Please fill in all required delivery information');
            return;
        }
        
        if (currentStep === 2 && !validatePaymentInfo()) {
            showNotification('Please complete all payment information');
            return;
        }
        
        // Update UI
        checkoutSteps.forEach(s => s.classList.remove('active'));
        checkoutSteps[step - 1].classList.add('active');
        
        checkoutForms.forEach(f => f.classList.add('hidden'));
        document.getElementById(`${getStepName(step)}-step`).classList.remove('hidden');
        
        currentStep = step;
        
        // If we reached confirmation, complete the order
        if (step === 3) completeOrder();
    }

    function getStepName(step) {
        switch(step) {
            case 1: return 'delivery';
            case 2: return 'payment';
            case 3: return 'confirmation';
            default: return '';
        }
    }

    function validateDeliveryInfo() {
        const inputs = document.querySelectorAll('#delivery-step input[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    function validatePaymentInfo() {
        const activeMethod = document.querySelector('.payment-method.active');
        if (!activeMethod) return false;
        
        const methodType = activeMethod.getAttribute('data-method');
        const inputs = document.querySelectorAll(`#${methodType}-details input[required]`);
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }

    function completeOrder() {
        // Generate order ID
        const orderId = `SM${orderIdCounter++}`;
        document.getElementById('order-id').textContent = orderId;
        
        // Calculate delivery time (30-45 minutes from now)
        const now = new Date();
        const deliveryTime = new Date(now.getTime() + 30 * 60000 + Math.floor(Math.random() * 15 * 60000));
        const options = { hour: '2-digit', minute: '2-digit' };
        const deliveryTimeStr = deliveryTime.toLocaleTimeString('en-US', options);
        document.getElementById('delivery-time').textContent = `by ${deliveryTimeStr}`;
        
        // Clear cart
        cart = [];
        updateCart();
        
        // Save order to localStorage (for demo purposes)
        const orders = JSON.parse(localStorage.getItem('smartmeal_orders') || '[]');
        orders.push({
            id: orderId,
            date: new Date().toISOString(),
            items: cart, // Note: cart is empty now, but we could save a copy
            total: parseFloat(cartTotal.textContent.replace('$', ''))
        });
        localStorage.setItem('smartmeal_orders', JSON.stringify(orders));
    }

    function resetCheckout() {
        currentStep = 1;
        checkoutSteps.forEach((s, i) => {
            s.classList.toggle('active', i === 0);
        });
        checkoutForms.forEach((f, i) => {
            f.classList.toggle('hidden', i !== 0);
        });
        
        // Reset form inputs
        document.querySelectorAll('#delivery-step input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
        
        // Reset to first payment method
        paymentMethods.forEach((m, i) => {
            m.classList.toggle('active', i === 0);
        });
        paymentDetails.forEach((d, i) => {
            d.classList.toggle('hidden', i !== 0);
        });
    }

    // =============================================
    // EVENT LISTENERS
    // =============================================
    function setupEventListeners() {
        // Modal toggles
        loginBtn?.addEventListener('click', () => {
            loginModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        signupBtn?.addEventListener('click', () => {
            signupModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
        
        // Close buttons
        closeBtns.forEach(btn => {
            btn?.addEventListener('click', () => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'none';
                document.body.style.overflow = '';
            });
        });
        
        // Show signup/login forms
        showSignup?.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            signupModal.style.display = 'block';
        });
        
        showLogin?.addEventListener('click', (e) => {
            e.preventDefault();
            signupModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
        
        // Cart toggle
        cartBtn?.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        closeCart?.addEventListener('click', () => {
            cartSidebar.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        // Checkout button
        checkoutBtn?.addEventListener('click', () => {
            if (cart.length === 0) {
                showNotification('Your cart is empty');
                return;
            }
            
            checkoutModal.style.display = 'block';
            cartSidebar.classList.remove('active');
            document.body.style.overflow = 'hidden';
        });
        
        // Close checkout modal when clicking outside
        checkoutModal?.addEventListener('click', function(e) {
            if (e.target === this) {
                checkoutModal.style.display = 'none';
                document.body.style.overflow = '';
                resetCheckout();
            }
        });
        
        // Order now button
        orderNowBtn?.addEventListener('click', () => {
            // Scroll to restaurants section
            document.querySelector('.restaurants')?.scrollIntoView({
                behavior: 'smooth'
            });
        });
        
        // Setup checkout flow
        setupCheckoutFlow();
    }

    // =============================================
    // UTILITY FUNCTIONS
    // =============================================
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }, 10);
    }

    // =============================================
    // INITIALIZE APP
    // =============================================
    init();
});
