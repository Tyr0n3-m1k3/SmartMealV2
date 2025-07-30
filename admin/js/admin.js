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

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_BASE_PATH = '/admin';
const authToken = localStorage.getItem('smartmeal_admin_token');

// Initialize the dashboard
async function initDashboard() {
    try {
        // Check authentication
        if (!authToken) {
            redirectToLogin();
            return;
        }

        // Verify token and load data
        await verifyAndLoadData();

        // Setup UI components
        setupUI();

    } catch (error) {
        handleInitError(error);
    }
}

// Authentication functions
async function verifyAndLoadData() {
    const isValid = await verifyToken(authToken);
    if (!isValid) {
        localStorage.removeItem('smartmeal_admin_token');
        redirectToLogin();
        return;
    }

    await Promise.all([
        loadAdminData(),
        loadDashboardStats(),
        loadRecentOrders(),
        loadActiveRestaurants()
    ]);
}

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

function redirectToLogin() {
    window.location.href = `${ADMIN_BASE_PATH}/login.html`;
}

// Data loading functions
async function loadAdminData() {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (!response.ok) throw new Error('Failed to fetch admin data');
        
        const adminData = await response.json();
        adminName.textContent = adminData.name || 'Admin';
    } catch (error) {
        console.error('Error loading admin data:', error);
        throw new Error('Authentication failed');
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        
        const stats = await response.json();
        updateStatsUI(stats);
        createCharts(stats);
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        alert('Failed to load dashboard statistics');
    }
}

function updateStatsUI(stats) {
    const elements = {
        'total-users': stats.totalUsers || 0,
        'total-restaurants': stats.totalRestaurants || 0,
        'total-orders': stats.totalOrders || 0,
        'total-revenue': `$${(stats.totalRevenue || 0).toFixed(2)}`
    };

    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    });
}

function createCharts(stats) {
    if (revenueChartCtx) {
        createRevenueChart(stats.totalRevenue);
    }
    if (ordersChartCtx) {
        createOrdersChart(
            stats.deliveredOrders || 0, 
            (stats.totalOrders || 0) - (stats.deliveredOrders || 0)
        );
    }
}

// Chart creation functions
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

// Data table functions
async function loadRecentOrders() {
    if (!recentOrdersTable) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders?limit=5`, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (!response.ok) throw new Error('Failed to fetch recent orders');
        
        const orders = await response.json();
        renderTable(recentOrdersTable, orders, (order) => `
            <td>${order._id?.substring(0, 8) || ''}</td>
            <td>${order.customer?.name || 'N/A'}</td>
            <td>${order.restaurant?.name || 'N/A'}</td>
            <td>$${(order.total || 0).toFixed(2)}</td>
            <td><span class="status-badge ${order.status || ''}">${order.status?.replace('_', ' ') || 'N/A'}</span></td>
            <td>${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
        `, (order) => {
            if (orderModal) orderModal.open(order);
        });
        
    } catch (error) {
        console.error('Error loading recent orders:', error);
        showTableError(recentOrdersTable, 6);
    }
}

async function loadActiveRestaurants() {
    if (!activeRestaurantsTable) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/restaurants?limit=5`, {
            headers: { 'x-auth-token': authToken }
        });
        
        if (!response.ok) throw new Error('Failed to fetch active restaurants');
        
        const restaurants = await response.json();
        renderTable(activeRestaurantsTable, restaurants, (restaurant) => `
            <td>${restaurant.name || 'N/A'}</td>
            <td>${restaurant.cuisineType || 'N/A'}</td>
            <td>${restaurant.owner?.name || 'N/A'}</td>
            <td>${restaurant.rating ? restaurant.rating.toFixed(1) + ' ★' : 'N/A'}</td>
            <td><span class="status-badge ${restaurant.isActive ? 'active' : 'inactive'}">${restaurant.isActive ? 'Active' : 'Inactive'}</span></td>
        `);
        
    } catch (error) {
        console.error('Error loading active restaurants:', error);
        showTableError(activeRestaurantsTable, 5);
    }
}

function renderTable(table, data, rowTemplate, rowClickHandler) {
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    
    if (data?.length > 0) {
        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = rowTemplate(item);
            if (rowClickHandler) {
                row.addEventListener('click', () => rowClickHandler(item));
            }
            tbody.appendChild(row);
        });
    } else {
        tbody.innerHTML = `<tr><td colspan="${tbody.querySelector('tr')?.cells.length || 1}" class="text-center">No data found</td></tr>`;
    }
}

function showTableError(table, colSpan) {
    const tbody = table?.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center">Failed to load data</td></tr>`;
    }
}

// Modal functions
function setupModals() {
    if (orderModal) {
        orderModal.open = function(order) {
            try {
                document.getElementById('order-id').textContent = `#${order._id?.substring(0, 8) || ''}`;
                document.getElementById('order-customer').textContent = order.customer?.name || 'N/A';
                document.getElementById('order-restaurant').textContent = order.restaurant?.name || 'N/A';
                document.getElementById('order-date').textContent = order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A';
                
                const address = order.deliveryAddress ? 
                    `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}` : 'N/A';
                document.getElementById('order-address').textContent = address;
                
                document.getElementById('order-instructions').textContent = order.deliveryAddress?.instructions || 'None';
                
                const statusElement = document.getElementById('current-status');
                if (statusElement) {
                    statusElement.textContent = order.status?.replace('_', ' ') || 'N/A';
                    statusElement.className = `status-badge ${order.status || ''}`;
                }
                
                document.getElementById('order-subtotal').textContent = `$${(order.subtotal || 0).toFixed(2)}`;
                document.getElementById('order-delivery-fee').textContent = `$${(order.deliveryFee || 0).toFixed(2)}`;
                document.getElementById('order-tax').textContent = `$${(order.tax || 0).toFixed(2)}`;
                document.getElementById('order-total').textContent = `$${(order.total || 0).toFixed(2)}`;
                document.getElementById('payment-method').textContent = order.paymentMethod?.replace('_', ' ') || 'N/A';
                document.getElementById('payment-status').textContent = order.paymentStatus || 'N/A';
                
                renderOrderItems(order.items);
                
                orderModal.style.display = 'block';
            } catch (error) {
                console.error('Error opening order modal:', error);
            }
        };
    }
}

function renderOrderItems(items) {
    const itemsList = document.getElementById('order-items-list');
    if (!itemsList) return;
    
    itemsList.innerHTML = '';
    
    if (items?.length > 0) {
        items.forEach(item => {
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

// UI Setup functions
function setupUI() {
    setupModals();
    setupEventListeners();
    activateDefaultSection();
}

function activateDefaultSection() {
    if (sidebarMenuItems.length > 0) {
        sidebarMenuItems[0].classList.add('active');
    }
    
    const defaultSection = document.getElementById('dashboard-section');
    if (defaultSection) {
        defaultSection.classList.add('active');
    }
}

function setupEventListeners() {
    setupSidebarNavigation();
    setupLogoutButton();
    setupModalCloseButtons();
    setupFormButtons();
    setupWindowClickHandler();
}

function setupSidebarNavigation() {
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

function setupLogoutButton() {
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('smartmeal_admin_token');
            redirectToLogin();
        });
    }
}

function setupModalCloseButtons() {
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (restaurantModal) restaurantModal.style.display = 'none';
            if (userModal) userModal.style.display = 'none';
            if (orderModal) orderModal.style.display = 'none';
        });
    });
}

function setupFormButtons() {
    // Restaurant form
    if (addRestaurantBtn && restaurantModal && restaurantForm) {
        addRestaurantBtn.addEventListener('click', () => setupModal(restaurantModal, restaurantForm, 'Add New Restaurant'));
    }
    
    // User form
    if (addUserBtn && userModal && userForm) {
        addUserBtn.addEventListener('click', () => setupModal(userModal, userForm, 'Add New User'));
    }
    
    // Driver form
    if (addDriverBtn && userModal && userForm) {
        addDriverBtn.addEventListener('click', () => {
            setupModal(userModal, userForm, 'Add New Driver');
            const roleElement = document.getElementById('user-role');
            if (roleElement) roleElement.value = 'driver';
        });
    }
    
    // Form submissions
    if (restaurantForm) {
        restaurantForm.addEventListener('submit', handleFormSubmit('restaurant'));
    }
    
    if (userForm) {
        userForm.addEventListener('submit', handleFormSubmit('user'));
    }
}

function setupModal(modal, form, title) {
    const titleElement = modal.querySelector('.modal-title');
    const idElement = modal.querySelector('[id$="-id"]');
    
    if (titleElement) titleElement.textContent = title;
    if (idElement) idElement.value = '';
    form.reset();
    modal.style.display = 'block';
}

function handleFormSubmit(type) {
    return async (e) => {
        e.preventDefault();
        try {
            // Form submission logic here
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully!`);
            const modal = document.getElementById(`${type}-modal`);
            if (modal) modal.style.display = 'none';
        } catch (error) {
            console.error(`Error saving ${type}:`, error);
            alert(`Failed to save ${type}`);
        }
    };
}

function setupWindowClickHandler() {
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

// Error handling
function handleInitError(error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize dashboard. Please try again.');
    
    if (error.message.includes('Authentication')) {
        localStorage.removeItem('smartmeal_admin_token');
        redirectToLogin();
    }
}

// Initialize the dashboard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
