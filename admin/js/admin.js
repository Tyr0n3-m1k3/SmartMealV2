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

// Auth Token
let authToken = localStorage.getItem('smartmeal_admin_token');

// Initialize the dashboard
async function initDashboard() {
    // Check authentication
    if (!authToken) {
        window.location.href = '/admin/login.html';
        return;
    }

    // Load admin name
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch admin data');
        }
        
        const adminData = await response.json();
        adminName.textContent = adminData.name;
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load admin data');
    }

    // Load dashboard data
    loadDashboardStats();
    loadRecentOrders();
    loadActiveRestaurants();
    setupEventListeners();
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        
        const stats = await response.json();
        
        // Update stats cards
        document.getElementById('total-users').textContent = stats.totalUsers;
        document.getElementById('total-restaurants').textContent = stats.totalRestaurants;
        document.getElementById('total-orders').textContent = stats.totalOrders;
        document.getElementById('total-revenue').textContent = `$${stats.totalRevenue.toFixed(2)}`;
        
        // Create charts
        createRevenueChart(stats.totalRevenue);
        createOrdersChart(stats.deliveredOrders, stats.totalOrders - stats.deliveredOrders);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load dashboard statistics');
    }
}

// Create revenue chart
function createRevenueChart(revenue) {
    if (revenueChart) revenueChart.destroy();
    
    revenueChart = new Chart(revenueChartCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: [1200, 1900, 1500, 2000, 2200, 2500, 2800, 2600, 3000, 3200, 3500, 4000],
                backgroundColor: 'rgba(6, 193, 103, 0.2)',
                borderColor: 'rgba(6, 193, 103, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Create orders chart
function createOrdersChart(delivered, pending) {
    if (ordersChart) ordersChart.destroy();
    
    ordersChart = new Chart(ordersChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Delivered', 'Pending'],
            datasets: [{
                data: [delivered, pending],
                backgroundColor: [
                    'rgba(6, 193, 103, 0.8)',
                    'rgba(52, 152, 219, 0.8)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load recent orders
async function loadRecentOrders() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders?limit=5`, {
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch recent orders');
        }
        
        const orders = await response.json();
        const tbody = recentOrdersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        orders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order._id.substring(0, 8)}</td>
                <td>${order.customer.name}</td>
                <td>${order.restaurant.name}</td>
                <td>$${order.total.toFixed(2)}</td>
                <td><span class="status-badge ${order.status}">${order.status.replace('_', ' ')}</span></td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
            `;
            row.addEventListener('click', () => openOrderModal(order));
            tbody.appendChild(row);
        });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load recent orders');
    }
}

// Load active restaurants
async function loadActiveRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants?limit=5`, {
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch active restaurants');
        }
        
        const restaurants = await response.json();
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
        console.error('Error:', error);
        alert('Failed to load active restaurants');
    }
}

// Open order modal
function openOrderModal(order) {
    document.getElementById('order-id').textContent = `#${order._id.substring(0, 8)}`;
    document.getElementById('order-customer').textContent = order.customer.name;
    document.getElementById('order-restaurant').textContent = order.restaurant.name;
    document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleString();
    document.getElementById('order-address').textContent = `${order.deliveryAddress.street}, ${order.deliveryAddress.city}`;
    document.getElementById('order-instructions').textContent = order.deliveryAddress.instructions || 'None';
    document.getElementById('current-status').textContent = order.status.replace('_', ' ');
    document.getElementById('current-status').className = `status-badge ${order.status}`;
    document.getElementById('order-subtotal').textContent = `$${order.subtotal.toFixed(2)}`;
    document.getElementById('order-delivery-fee').textContent = `$${order.deliveryFee.toFixed(2)}`;
    document.getElementById('order-tax').textContent = `$${order.tax.toFixed(2)}`;
    document.getElementById('order-total').textContent = `$${order.total.toFixed(2)}`;
    document.getElementById('payment-method').textContent = order.paymentMethod.replace('_', ' ');
    document.getElementById('payment-status').textContent = order.paymentStatus;
    
    // Load order items
    const itemsList = document.getElementById('order-items-list');
    itemsList.innerHTML = '';
    
    order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.menuItem.name}</td>
            <td>${item.quantity}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>$${(item.price * item.quantity).toFixed(2)}</td>
        `;
        itemsList.appendChild(row);
    });
    
    // Show modal
    orderModal.style.display = 'block';
}

// Setup event listeners
function setupEventListeners() {
    // Sidebar menu navigation
    sidebarMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all items
            sidebarMenuItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            // Show corresponding section
            const sectionId = `${item.dataset.section}-section`;
            document.getElementById(sectionId).classList.add('active');
        });
    });
    
    // Logout button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('smartmeal_admin_token');
        window.location.href = '/admin/login.html';
    });
    
    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            restaurantModal.style.display = 'none';
            userModal.style.display = 'none';
            orderModal.style.display = 'none';
        });
    });
    
    // Add restaurant button
    addRestaurantBtn.addEventListener('click', () => {
        document.getElementById('restaurant-modal-title').textContent = 'Add New Restaurant';
        document.getElementById('restaurant-id').value = '';
        restaurantForm.reset();
        restaurantModal.style.display = 'block';
    });
    
    // Add user button
    addUserBtn.addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Add New User';
        document.getElementById('user-id').value = '';
        userForm.reset();
        userModal.style.display = 'block';
    });
    
    // Add driver button
    addDriverBtn.addEventListener('click', () => {
        document.getElementById('user-modal-title').textContent = 'Add New Driver';
        document.getElementById('user-id').value = '';
        userForm.reset();
        document.getElementById('user-role').value = 'driver';
        userModal.style.display = 'block';
    });
    
    // Restaurant form submission
    restaurantForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Handle form submission
        // You would typically send this data to your backend API
        alert('Restaurant saved successfully!');
        restaurantModal.style.display = 'none';
    });
    
    // User form submission
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Handle form submission
        // You would typically send this data to your backend API
        alert('User saved successfully!');
        userModal.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === restaurantModal) {
            restaurantModal.style.display = 'none';
        }
        if (e.target === userModal) {
            userModal.style.display = 'none';
        }
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);
