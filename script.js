// --- CONFIGURATION ---
// PASTE THE GOOGLE APPS SCRIPT URL YOU COPIED IN PART 2 HERE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwuw-juRDLj8N8xcltI4wFx5VXKazsLeKUaG_tNuZZl4vZhyieiW9ucj6WU-Fi81aQg/exec';

// --- ELEMENT SELECTORS ---
const customerListDiv = document.getElementById('customerList');
const loaderDiv = document.getElementById('loader');
const addCustomerForm = document.getElementById('addCustomerForm');

// --- FUNCTIONS ---

/**
 * Fetches all data from the Google Sheet and renders it.
 */
async function loadData() {
    loaderDiv.style.display = 'block';
    customerListDiv.innerHTML = '';

    try {
        const response = await fetch(SCRIPT_URL);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        renderCustomers(data.customers);
    } catch (error) {
        console.error('Failed to load data:', error);
        customerListDiv.innerHTML = `<p style="color: red;">Error: Could not load data. Check console for details.</p>`;
    } finally {
        loaderDiv.style.display = 'none';
    }
}

/**
 * Renders the list of customers and their services on the page.
 * @param {Array} customers - An array of customer objects.
 */
function renderCustomers(customers) {
    if (!customers || customers.length === 0) {
        customerListDiv.innerHTML = '<p>No customers found. Add one above!</p>';
        return;
    }

    customers.forEach(customer => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'customer-entry';

        let servicesHtml = '<p>No services recorded yet.</p>';
        if (customer.services && customer.services.length > 0) {
            servicesHtml = '<ul class="service-list">';
            customer.services.forEach(service => {
                servicesHtml += `<li>
                    <span>${service.ServiceName} (${service.Status})</span>
                    <strong>Charge: ₹${service.Charge}</strong>
                </li>`;
            });
            servicesHtml += '</ul>';
        }

        entryDiv.innerHTML = `
            <div class="customer-header">
                <h3>${customer.Name}</h3>
                <span>${customer.Phone}</span>
            </div>
            ${servicesHtml}
            <form class="add-service-form" data-customer-id="${customer.CustomerID}">
                <input type="text" name="serviceName" placeholder="New Service Name" required>
                <input type="number" name="charge" placeholder="Service Charge (₹)" required>
                <button type="submit">Add Service</button>
            </form>
        `;
        customerListDiv.appendChild(entryDiv);
    });
}

/**
 * Handles the submission of the "Add New Customer" form.
 */
async function handleAddCustomer(event) {
    event.preventDefault(); // Prevent page reload
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;

    const postData = {
        action: 'addCustomer',
        name: name,
        phone: phone,
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Customer added!');
            addCustomerForm.reset();
            loadData(); // Reload the list
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Failed to add customer:', error);
        alert(`Error: ${error.message}`);
    }
}

/**
 * Handles the submission of any "Add Service" form.
 */
async function handleAddService(event) {
    // Only handle submissions from forms with the correct class
    if (!event.target.matches('.add-service-form')) return;

    event.preventDefault();
    const form = event.target;
    const customerID = form.dataset.customerId;
    const serviceName = form.querySelector('input[name="serviceName"]').value;
    const charge = form.querySelector('input[name="charge"]').value;

    const postData = {
        action: 'addService',
        customerID: customerID,
        serviceName: serviceName,
        charge: charge,
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(postData),
        });
        const result = await response.json();

        if (result.status === 'success') {
            alert('Service added!');
            loadData(); // Reload everything to show the new service
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Failed to add service:', error);
        alert(`Error: ${error.message}`);
    }
}


// --- EVENT LISTENERS ---

// Load data as soon as the page is ready
document.addEventListener('DOMContentLoaded', loadData);

// Listen for the new customer form submission
addCustomerForm.addEventListener('submit', handleAddCustomer);

// Listen for clicks within the customer list (for adding services)
customerListDiv.addEventListener('submit', handleAddService);
