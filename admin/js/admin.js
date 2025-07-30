
Here's the admin.js to change;// DOM Elements
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
        // Check authentication
        if (!authToken) {
            window.location.href = '/admin/login.html';
            return;
        }

        // Verify token is still valid
        const isValid = await verifyToken(authToken);
        if (!isValid) {
            localStorage.removeItem('smartmeal_admin_token');
            window.location.href = '/admin/login.html';
            return;
        }

        // Load admin name
        await loadAdminData();

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

    } catch (error) {
        console.error('Initialization error:', error);
        alert('Failed to initialize dashboard. Please try again.');
        if (error.message.includes('Authentication')) {
            localStorage.removeItem('smartmeal_admin_token');
            window.location.href = '/admin/login.html';
        }
    }
}

// Verify token validity
async function verifyToken(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'x-auth-token': token
            }
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
            headers: {
                'x-auth-token': authToken
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch admin data');
        }
        
        const adminData = await response.json();
        adminName.textContent = adminData.name || 'Admin';
    } catch (error) {
        console.error('Error loading admin data:', error);
        throw new Error('Authentication failed');
    }
}

// Activate default section
function activateDefaultSection() {
    // Activate first menu item by default
    if (sidebarMenuItems.length > 0) {
        sidebarMenuItems[0].classList.add('active');
    }
    
    // Show dashboard section by default
    const defaultSection = document.getElementById('dashboard-section');
    if (defaultSection) {
        defaultSection.classList.add('active');
    }
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
        if (document.getElementById('total-users')) {
            document.getElementById('total-users').textContent = stats.totalUsers || 0;
        }
        if (document.getElementById('total-restaurants')) {
            document.getElementById('total-restaurants').textContent = stats.totalRestaurants || 0;
        }
        if (document.getElementById('total-orders')) {
            document.getElementById('total-orders').textContent = stats.totalOrders || 0;
        }
        if (document.getElementById('total-revenue')) {
            document.getElementById('total-revenue').textContent = `$${(stats.totalRevenue || 0).toFixed(2)}`;
        }
        
        // Create charts if elements exist
        if (revenueChartCtx) {
            createRevenueChart(stats.totalRevenue);
        }
        if (ordersChartCtx) {
            createOrdersChart(stats.deliveredOrders || 0, (stats.totalOrders || 0) - (stats.deliveredOrders || 0));
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Failed to load dashboard statistics');
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
                    backgroundColor: 'rgba(249, 66, 58, 0.2)', // Grubhub red
                    borderColor: 'rgba(249, 66, 58, 1)', // Grubhub red
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
                        'rgba(249, 66, 58, 0.8)', // Grubhub red
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
    } catch (error) {
        console.error('Error creating orders chart:', error);
    }
}

// Load recent orders
async function loadRecentOrders() {
    try {
        if (!recentOrdersTable) return;
        
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
        
        if (orders && orders.length > 0) {
            orders.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order._id ? order._id.substring(0, 8) : ''}</td>
                    <td>${order.customer?.name || 'N/A'}</td>
                    <td>${order.restaurant?.name || 'N/A'}</td>
                    <td>$${(order.total || 0).toFixed(2)}</td>
                    <td><span class="status-badge ${order.status || ''}">${order.status ? order.status.replace('_', ' ') : 'N/A'}</span></td>
                    <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                `;
                if (orderModal) {
                    row.addEventListener('click', () => openOrderModal(order));
                }
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No recent orders found</td></tr>';
        }
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        if (recentOrdersTable && recentOrdersTable.querySelector('tbody')) {
            recentOrdersTable.querySelector('tbody').innerHTML = '<tr><td colspan="6" class="text-center">Failed to load orders</td></tr>';
        }
    }
}

// Load active restaurants
async function loadActiveRestaurants() {
    try {
        if (!activeRestaurantsTable) return;
        
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
        
        if (restaurants && restaurants.length > 0) {
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
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No active restaurants found</td></tr>';
        }
        
    } catch (error) {
        console.error('Error loading active restaurants:', error);
        if (activeRestaurantsTable && activeRestaurantsTable.querySelector('tbody')) {
            activeRestaurantsTable.querySelector('tbody').innerHTML = '<tr><td colspan="5" class="text-center">Failed to load restaurants</td></tr>';
        }
    }
}

// Open order modal
function openOrderModal(order) {
    if (!orderModal) return;
    
    try {
        document.getElementById('order-id').textContent = `#${order._id ? order._id.substring(0, 8) : ''}`;
        document.getElementById('order-customer').textContent = order.customer?.name || 'N/A';
        document.getElementById('order-restaurant').textContent = order.restaurant?.name || 'N/A';
        document.getElementById('order-date').textContent = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
        
        if (order.deliveryAddress) {
            document.getElementById('order-address').textContent = `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}`;
        } else {
            document.getElementById('order-address').textContent = 'N/A';
        }
        
        document.getElementById('order-instructions').textContent = order.deliveryAddress?.instructions || 'None';
        
        const statusElement = document.getElementById('current-status');
        if (statusElement) {
            statusElement.textContent = order.status ? order.status.replace('_', ' ') : 'N/A';
            statusElement.className = `status-badge ${order.status || ''}`;
        }
        
        document.getElementById('order-subtotal').textContent = `$${(order.subtotal || 0).toFixed(2)}`;
        document.getElementById('order-delivery-fee').textContent = `$${(order.deliveryFee || 0).toFixed(2)}`;
        document.getElementById('order-tax').textContent = `$${(order.tax || 0).toFixed(2)}`;
        document.getElementById('order-total').textContent = `$${(order.total || 0).toFixed(2)}`;
        document.getElementById('payment-method').textContent = order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'N/A';
        document.getElementById('payment-status').textContent = order.paymentStatus || 'N/A';
        
        // Load order items
        const itemsList = document.getElementById('order-items-list');
        if (itemsList) {
            itemsList.innerHTML = '';
            
            if (order.items && order.items.length > 0) {
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

// Setup event listeners
function setupEventListeners() {
    // Sidebar menu navigation
    if (sidebarMenuItems) {
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
                const section = document.getElementById(sectionId);
                if (section) {
                    section.classList.add('active');
                }
            });
        });
    }
    
    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('smartmeal_admin_token');
            window.location.href = '/admin/login.html';
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
                // Handle form submission
                // You would typically send this data to your backend API
                alert('Restaurant saved successfully!');
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
                // Handle form submission
                // You would typically send this data to your backend API
                alert('User saved successfully!');
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
} (CHANGE IT ACCORDINGLY AND PROVIDE THE FULL FILE)
