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
    try {
        // Remove login check completely - dashboard loads directly
        await loadDashboardData();
        setupEventListeners();
        activateDefaultSection();
    } catch (error) {
        console.error('Initialization error:', error);
        showError('Dashboard initialization failed. Please refresh.');
    }
}

// Load all dashboard data
async function loadDashboardData() {
    try {
        // Try to load authenticated data first
        if (authToken) {
            const isValid = await verifyToken(authToken);
            if (isValid) {
                await Promise.all([
                    loadAdminData(),
                    loadDashboardStats(),
                    loadRecentOrders(),
                    loadActiveRestaurants()
                ]);
                return;
            }
            // If token is invalid, clear it
            localStorage.removeItem('smartmeal_admin_token');
            authToken = null;
        }
        
        // Fallback to public data
        await loadPublicData();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        throw error;
    }
}

// Load public data (non-sensitive information)
async function loadPublicData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/public-stats`);
        const stats = await response.json();
        
        // Update stats cards with public data
        updateStatCard('total-restaurants', stats.totalRestaurants);
        updateStatCard('total-orders', stats.totalOrders);
        
        // Create empty charts
        if (revenueChartCtx) createRevenueChart(0);
        if (ordersChartCtx) createOrdersChart(0, 0);
        
    } catch (error) {
        console.error('Error loading public data:', error);
        // Continue with empty dashboard
    }
}

// Update stat card display
function updateStatCard(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = elementId.includes('revenue') 
            ? `$${(value || 0).toFixed(2)}` 
            : (value || 0);
    }
}

// Verify token validity
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: { 'x-auth-token': token }
        });
        return response.ok;
    } catch (error) {
        console.error('Token verification failed:', error);
        return false;
    }
}

// Load admin data
async function loadAdminData() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            headers: { 'x-auth-token': authToken }
        });
        const adminData = await response.json();
        if (adminName) adminName.textContent = adminData.name || 'Admin';
    } catch (error) {
        console.error('Error loading admin data:', error);
        throw error;
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'x-auth-token': authToken }
        });
        const stats = await response.json();
        
        updateStatCard('total-users', stats.totalUsers);
        updateStatCard('total-restaurants', stats.totalRestaurants);
        updateStatCard('total-orders', stats.totalOrders);
        updateStatCard('total-revenue', stats.totalRevenue);
        
        if (revenueChartCtx) createRevenueChart(stats.totalRevenue);
        if (ordersChartCtx) createOrdersChart(stats.deliveredOrders, stats.totalOrders - stats.deliveredOrders);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        throw error;
    }
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

// Load recent orders
async function loadRecentOrders() {
    try {
        if (!recentOrdersTable) return;
        
        const response = await fetch(`${API_BASE_URL}/admin/orders?limit=5`, {
            headers: { 'x-auth-token': authToken }
        });
        const orders = await response.json();
        const tbody = recentOrdersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (orders?.length > 0) {
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order._id?.substring(0, 8) || ''}</td>
                    <td>${order.customer?.name || 'N/A'}</td>
                    <td>${order.restaurant?.name || 'N/A'}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${order.status || ''}">${order.status?.replace('_', ' ') || 'N/A'}</span></td>
                    <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                `;
                if (orderModal) {
                    row.addEventListener('click', () => openOrderModal(order));
                }
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent orders</td></tr>';
        }
    } catch (error) {
        console.error('Error loading recent orders:', error);
        if (recentOrdersTable?.querySelector('tbody')) {
            recentOrdersTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Failed to load orders</td></tr>';
        }
    }
}

// Load active restaurants
async function loadActiveRestaurants() {
    try {
        if (!activeRestaurantsTable) return;
        
        const response = await fetch(`${API_BASE_URL}/admin/restaurants?limit=5`, {
            headers: { 'x-auth-token': authToken }
        });
        const restaurants = await response.json();
        const tbody = activeRestaurantsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        if (restaurants?.length > 0) {
            restaurants.forEach(restaurant => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${restaurant.name || 'N/A'}</td>
                    <td>${restaurant.cuisineType || 'N/A'}</td>
                    <td>${restaurant.owner?.name || 'N/A'}</td>
                    <td>${restaurant.rating ? restaurant.rating.toFixed(1) + ' ★' : 'N/A'}</td>
                    <td><span class="status-badge ${restaurant.isActive ? 'active' : 'inactive'}">${restaurant.isActive ? 'Active' : 'Inactive'}</span></td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No restaurants found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading active restaurants:', error);
        if (activeRestaurantsTable?.querySelector('tbody')) {
            activeRestaurantsTable.querySelector('tbody').innerHTML = '<tr><td colspan="5" class="text-center">Failed to load restaurants</td></tr>';
        }
    }
}

// Open order modal
function openOrderModal(order) {
    if (!orderModal) return;
    
    try {
        // Update order details
        document.getElementById('order-id').textContent = `#${order._id?.substring(0, 8) || ''}`;
        document.getElementById('order-customer').textContent = order.customer?.name || 'N/A';
        document.getElementById('order-restaurant').textContent = order.restaurant?.name || 'N/A';
        document.getElementById('order-date').textContent = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
        document.getElementById('order-address').textContent = order.deliveryAddress ? 
            `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}` : 'N/A';
        document.getElementById('order-instructions').textContent = order.deliveryAddress?.instructions || 'None';
        
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
            statusElement.textContent = order.status?.replace('_', ' ') || 'N/A';
            statusElement.className = `status-badge ${order.status || ''}`;
        }
        
        // Update financials
        document.getElementById('order-subtotal').textContent = `$${(order.subtotal || 0).toFixed(2)}`;
        document.getElementById('order-delivery-fee').textContent = `$${(order.deliveryFee || 0).toFixed(2)}`;
        document.getElementById('order-tax').textContent = `$${(order.tax || 0).toFixed(2)}`;
        document.getElementById('order-total').textContent = `$${(order.total || 0).toFixed(2)}`;
        document.getElementById('payment-method').textContent = order.paymentMethod?.replace('_', ' ') || 'N/A';
        document.getElementById('payment-status').textContent = order.paymentStatus || 'N/A';
        
        // Load order items
        const itemsList = document.getElementById('order-items-list');
        if (itemsList) {
            itemsList.innerHTML = '';
            
            if (order.items?.length > 0) {
                order.items.forEach(item => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${item.menuItem?.name || 'N/A'}</td>
                        <td>${item.quantity || 0}</td>
                        <td>$${(item.price || 0).toFixed(2)}</td>
                        <td>$${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                    `;
                    itemsList.appendChild(row);
                });
            } else {
                itemsList.innerHTML = '<tr><td colspan="4" class="text-center">No items found</td></tr>';
            }
        }
        
        // Show modal
        orderModal.style.display = 'block';
    } catch (error) {
        console.error('Error opening order modal:', error);
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

// Setup event listeners
function setupEventListeners() {
    // Sidebar navigation
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
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('smartmeal_admin_token');
            window.location.reload(); // Refresh to show public view
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
    
    // Form submissions and other button events remain the same...
    // [Previous implementation of form handlers]
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'global-error';
    errorDiv.innerHTML = `
        <div class="error-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Initialize the dashboard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
