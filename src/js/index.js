// Log message at the very start to know if JS file is connected
console.log("JavaScript file is connected and loaded!");

// Importing CSS and JS libraries
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS
import '../scss/style.scss'; // Import SCSS

// Import any assets if needed
// import logo from '../assets/images/logos/logo.png';
// import slider_1 from '../assets/images/banner/slider_1.png';

// Log message for debugging
console.log("JavaScript is running!");

// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM fully loaded and parsed"); // Log message on DOM load
    alert('Page loaded!'); // Alert to ensure JS is working

    // Any other application-wide JavaScript
    console.log("Main script loaded and running");
});
