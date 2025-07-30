document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded - initializing SmartMeal');

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

    // Sample restaurant data
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

    // Initialize the app
    function init() {
        renderRestaurants();
        setupEventListeners();
        console.log('App initialized');
    }

    // Render restaurants to the page
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
                    <button class="add-to-cart-btn" data-restaurant="${restaurant.id}">View Menu</button>
                </div>
            `;
            
            restaurantList.appendChild(restaurantCard);
        });
        
        // Add event listeners to "View Menu" buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', function() {
                const restaurantId = parseInt(this.getAttribute('data-restaurant'));
                const restaurant = restaurants.find(r => r.id === restaurantId);
                showRestaurantMenu(restaurant);
            });
        });
    }

    // Show restaurant menu in a modal
    function showRestaurantMenu(restaurant) {
        // Create modal HTML
        const modalHTML = `
            <div class="modal" id="menu-modal">
                <div class="modal-content" style="max-width: 600px;">
                    <span class="close">&times;</span>
                    <h2>${restaurant.name} Menu</h2>
                    <div class="menu-items">
                        ${restaurant.menu.map(item => `
                            <div class="menu-item" data-id="${item.id}">
                                <div class="menu-item-info">
                                    <h3>${item.name}</h3>
                                    <p>${item.description}</p>
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
                    <button class="view-cart-btn">View Cart</button>
                </div>
            </div>
        `;
        
        // Add modal to the page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const menuModal = document.getElementById('menu-modal');
        
        // Show modal
        menuModal.style.display = 'block';
        
        // Close modal when clicking X
        menuModal.querySelector('.close').addEventListener('click', function() {
            menuModal.style.display = 'none';
            setTimeout(() => menuModal.remove(), 300);
        });
        
        // Close modal when clicking outside
        menuModal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                setTimeout(() => this.remove(), 300);
            }
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
                    
                    cart.push({
                        ...menuItem,
                        quantity,
                        restaurantId: restaurant.id
                    });
                    
                    updateCart();
                    menuModal.style.display = 'none';
                    setTimeout(() => menuModal.remove(), 300);
                }
            });
        });
    }

    // Update cart UI
    function updateCart() {
        if (!cartItems || !cartCount || !cartSubtotal || !cartTotal) return;
        
        cartItems.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="images/${item.name.toLowerCase().replace(' ', '-')}.jpg" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus">-</button>
                        <span class="cart-item-quantity">${item.quantity}</span>
                        <button class="quantity-btn plus">+</button>
                        <button class="cart-item-remove">×</button>
                    </div>
                </div>
            `;
            cartItems.appendChild(cartItem);
            
            subtotal += item.price * item.quantity;
        });
        
        cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        const deliveryFee = 2.99;
        cartTotal.textContent = `$${(subtotal + deliveryFee).toFixed(2)}`;
    }

    // Setup all event listeners
    function setupEventListeners() {
        // Modal toggles
        loginBtn?.addEventListener('click', () => loginModal.style.display = 'block');
        signupBtn?.addEventListener('click', () => signupModal.style.display = 'block');
        
        // Close buttons
        closeBtns.forEach(btn => {
            btn?.addEventListener('click', () => {
                loginModal.style.display = 'none';
                signupModal.style.display = 'none';
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
        cartBtn?.addEventListener('click', () => cartSidebar.classList.add('active'));
        closeCart?.addEventListener('click', () => cartSidebar.classList.remove('active'));
        
        // Checkout flow
        checkoutBtn?.addEventListener('click', () => {
            checkoutModal.style.display = 'block';
            cartSidebar.classList.remove('active');
        });
        
        // Payment methods
        paymentMethods?.forEach(method => {
            method.addEventListener('click', () => {
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
                
                paymentDetails.forEach(detail => detail.classList.add('hidden'));
                const methodType = method.getAttribute('data-method');
                document.getElementById(`${methodType}-details`).classList.remove('hidden');
            });
        });
        
        // Back home button
        backHomeBtn?.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
    }

    // Initialize the app
    init();
});
