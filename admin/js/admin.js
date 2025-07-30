// DOM Elements
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li');
const sections = document.querySelectorAll('.section');
const logoutBtn = document.getElementById('logout');
const adminName = document.getElementById('admin-name');

// Chart Elements
const revenueChartCtx = document.getElementById('revenue-chart');
const ordersChartCtx = document.getElementById('orders-chart');

// Tables
const recentOrdersTable = document.getElementById('recent-orders-table');
const activeRestaurantsTable = document.getElementById('active-restaurants-table');
const restaurantsTable = document.getElementById('restaurants-table');
const ordersTable = document.getElementById('orders-table');
const usersTable = document.getElementById('users-table');
const menuItemsTable = document.getElementById('menu-items-table');
const driversTable = document.getElementById('drivers-table');

// Modals
const restaurantModal = document.getElementById('restaurant-modal');
const userModal = document.getElementById('user-modal');
const orderModal = document.getElementById('order-modal');
const closeButtons = document.querySelectorAll('.close');

// Buttons
const addRestaurantBtn = document.getElementById('add-restaurant-btn');
const addUserBtn = document.getElementById('add-user-btn');
const addDriverBtn = document.getElementById('add-driver-btn');

// Form elements
const restaurantForm = document.getElementById('restaurant-form');
const userForm = document.getElementById('user-form');

// Charts
let revenueChart, ordersChart;

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Demo admin data (since we're removing login)
const DEMO_ADMIN = {
    name: "Admin User",
    role: "Administrator"
};

// Initialize the dashboard
async function initDashboard() {
    try {
        // Set demo admin data
        adminName.textContent = DEMO_ADMIN.name;

        // Load dashboard data
        await Promise.all([
            loadDashboardStats(),
            loadRecentOrders(),
            loadActiveRestaurants()
        ]);

        // Setup event listeners
        setupEventListeners();

        // Activate default section
        activateDefaultSection();

        // Create demo charts
        createDemoCharts();

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize dashboard. Please try again.');
    }
}

// Activate default section
function activateDefaultSection() {
    if (sidebarMenuItems.length > 0) {
        sidebarMenuItems[0].classList.add('active');
    }
    
    const defaultSection = document.getElementById('dashboard-section');
    if (defaultSection) {
        defaultSection.classList.add('active');
    }
}

// Create demo charts (since we're not fetching real data)
function createDemoCharts() {
    createRevenueChart(12500);
    createOrdersChart(85, 15);
}

// Create revenue chart
function createRevenueChart(revenue) {
    try {
        if (revenueChart) revenueChart.destroy();
        
        revenueChart = new Chart(revenueChartCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Revenue',
                    data: [1200, 1900, 1500, 2000, 2200, 2500, 2800, 2600, 3000, 3200, 3500, 4000],
                    backgroundColor: 'rgba(249, 66, 58, 0.2)',
                    borderColor: 'rgba(249, 66, 58, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
            }
        });
    } catch (error) {
        console.error('Error creating revenue chart:', error);
    }
}

// Create orders chart
function createOrdersChart(delivered, pending) {
    try {
        if (ordersChart) ordersChart.destroy();
        
        ordersChart = new Chart(ordersChartCtx, {
            type: 'doughnut',
            data: {
                labels: ['Delivered', 'Pending'],
                datasets: [{
                    data: [delivered, pending],
                    backgroundColor: [
                        'rgba(249, 66, 58, 0.8)',
                        'rgba(52, 152, 219, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    } catch (error) {
        console.error('Error creating orders chart:', error);
    }
}

// Load dashboard statistics (demo data)
async function loadDashboardStats() {
    try {
        // Demo data
        const stats = {
            totalUsers: 42,
            totalRestaurants: 15,
            totalOrders: 127,
            totalRevenue: 12500,
            deliveredOrders: 85
        };
        
        // Update stats cards
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-restaurants').textContent = stats.totalRestaurants;
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-revenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Failed to load dashboard statistics');
    }
}

// Load recent orders (demo data)
async function loadRecentOrders() {
    try {
        if (!recentOrdersTable) return;
        
        // Demo data
        const orders = [
            {
                _id: '63a1b2c3d4e5f',
                customer: { name: 'John Doe' },
                restaurant: { name: 'Burger Palace' },
                total: 24.99,
                status: 'delivered',
                createdAt: new Date()
            },
            {
                _id: '73b2c3d4e5f6',
                customer: { name: 'Jane Smith' },
                restaurant: { name: 'Pizza Heaven' },
                total: 32.50,
                status: 'preparing',
                createdAt: new Date(Date.now() - 86400000)
            },
            {
                _id: '83c3d4e5f6g7',
                customer: { name: 'Mike Johnson' },
                restaurant: { name: 'Sushi World' },
                total: 45.75,
                status: 'delivered',
                createdAt: new Date(Date.now() - 172800000)
            }
        ];
        
        const tbody = recentOrdersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order._id.substring(0, 8)}</td>
                <td>${order.customer.name}</td>
                <td>${order.restaurant.name}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${order.status}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            `;
            if (orderModal) {
                row.addEventListener('click', () => openOrderModal(order));
            }
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        if (recentOrdersTable?.querySelector('tbody')) {
            recentOrdersTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Failed to load orders</td></tr>';
        }
    }
}

// Load active restaurants (demo data)
async function loadActiveRestaurants() {
    try {
        if (!activeRestaurantsTable) return;
        
        // Demo data
        const restaurants = [
            {
                name: 'Burger Palace',
                cuisineType: 'American',
                owner: { name: 'Robert Burger' },
                rating: 4.5,
                isActive: true
            },
            {
                name: 'Pizza Heaven',
                cuisineType: 'Italian',
                owner: { name: 'Mario Pizza' },
                rating: 4.2,
                isActive: true
            },
            {
                name: 'Sushi World',
                cuisineType: 'Japanese',
                owner: { name: 'Yuki Sushi' },
                rating: 4.8,
                isActive: true
            }
        ];
        
        const tbody = activeRestaurantsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        restaurants.forEach(restaurant => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${restaurant.name}</td>
                <td>${restaurant.cuisineType}</td>
                <td>${restaurant.owner.name}</td>
                <td>${restaurant.rating.toFixed(1)} ★</td>
                <td><span class="status-badge ${restaurant.isActive ? 'active' : 'inactive'}">${restaurant.isActive ? 'Active' : 'Inactive'}</span></td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error loading active restaurants:', error);
        if (activeRestaurantsTable?.querySelector('tbody')) {
            activeRestaurantsTable.querySelector('tbody').innerHTML = '<tr><td colspan="5" class="text-center">Failed to load restaurants</td></tr>';
        }
    }
}

// Open order modal (demo data)
function openOrderModal(order) {
    if (!orderModal) return;
    
    try {
        document.getElementById('order-id').textContent = `#${order._id.substring(0, 8)}`;
        document.getElementById('order-customer').textContent = order.customer.name;
        document.getElementById('order-restaurant').textContent = order.restaurant.name;
        document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleString();
        document.getElementById('order-address').textContent = '123 Main St, Anytown';
        document.getElementById('order-instructions').textContent = 'Ring doorbell';
        
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
            statusElement.textContent = order.status;
            statusElement.className = `status-badge ${order.status}`;
        }
        
        document.getElementById('order-subtotal').textContent = `$${(order.total * 0.85).toFixed(2)}`;
        document.getElementById('order-delivery-fee').textContent = '$3.99';
        document.getElementById('order-tax').textContent = `$${(order.total * 0.08).toFixed(2)}`;
        document.getElementById('order-total').textContent = `$${order.total.toFixed(2)}`;
        document.getElementById('payment-method').textContent = 'Credit Card';
        document.getElementById('payment-status').textContent = 'Paid';
        
        // Demo order items
        const itemsList = document.getElementById('order-items-list');
        if (itemsList) {
            itemsList.innerHTML = '';
            
            const demoItems = [
                { menuItem: { name: 'Cheeseburger' }, quantity: 2, price: 8.99 },
                { menuItem: { name: 'Fries' }, quantity: 1, price: 3.99 },
                { menuItem: { name: 'Soda' }, quantity: 1, price: 2.50 }
            ];
            
            demoItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.menuItem.name}</td>
                    <td>${item.quantity}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                `;
                itemsList.appendChild(row);
            });
        }
        
        orderModal.style.display = 'block';
    } catch (error) {
        console.error('Error opening order modal:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar menu navigation
    if (sidebarMenuItems) {
        sidebarMenuItems.forEach(item => {
            item.addEventListener('click', () => {
                sidebarMenuItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                sections.forEach(section => section.classList.remove('active'));
                const sectionId = `${item.dataset.section}-section`;
                const section = document.getElementById(sectionId);
                if (section) section.classList.add('active');
            });
        });
    }
    
    // Logout button (optional - can be removed if not needed)
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = '/admin';
        });
    }
    
    // Close modals
    if (closeButtons) {
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (restaurantModal) restaurantModal.style.display = 'none';
                if (userModal) userModal.style.display = 'none';
                if (orderModal) orderModal.style.display = 'none';
            });
        });
    }
    
    // Add restaurant button
    if (addRestaurantBtn && restaurantModal && restaurantForm) {
        addRestaurantBtn.addEventListener('click', () => {
            const titleElement = document.getElementById('restaurant-modal-title');
            const idElement = document.getElementById('restaurant-id');
            
            if (titleElement) titleElement.textContent = 'Add New Restaurant';
            if (idElement) idElement.value = '';
            restaurantForm.reset();
            restaurantModal.style.display = 'block';
        });
    }
    
    // Add user button
    if (addUserBtn && userModal && userForm) {
        addUserBtn.addEventListener('click', () => {
            const titleElement = document.getElementById('user-modal-title');
            const idElement = document.getElementById('user-id');
            
            if (titleElement) titleElement.textContent = 'Add New User';
            if (idElement) idElement.value = '';
            userForm.reset();
            userModal.style.display = 'block';
        });
    }
    
    // Add driver button
    if (addDriverBtn && userModal && userForm) {
        addDriverBtn.addEventListener('click', () => {
            const titleElement = document.getElementById('user-modal-title');
            const idElement = document.getElementById('user-id');
            const roleElement = document.getElementById('user-role');
            
            if (titleElement) titleElement.textContent = 'Add New Driver';
            if (idElement) idElement.value = '';
            userForm.reset();
            if (roleElement) roleElement.value = 'driver';
            userModal.style.display = 'block';
        });
    }
    
    // Restaurant form submission
    if (restaurantForm) {
        restaurantForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                alert('Restaurant saved successfully! (Demo)');
                if (restaurantModal) restaurantModal.style.display = 'none';
            } catch (error) {
                console.error('Error saving restaurant:', error);
                alert('Failed to save restaurant');
            }
        });
    }
    
    // User form submission
    if (userForm) {
        userForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                alert('User saved successfully! (Demo)');
                if (userModal) userModal.style.display = 'none';
            } catch (error) {
                console.error('Error saving user:', error);
                alert('Failed to save user');
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (restaurantModal && e.target === restaurantModal) {
            restaurantModal.style.display = 'none';
        }
        if (userModal && e.target === userModal) {
            userModal.style.display = 'none';
        }
        if (orderModal && e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
}

// Initialize the dashboard when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
