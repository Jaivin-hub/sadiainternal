// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel';
// Import SCSS
import '../scss/style.scss';

// Import jQuery (Slick Slider requires jQuery)
import $ from 'jquery'; 

// Function to initialize Slick sliders
const initializeSlick = () => {
    console.log('inside the initializeslick')
    console.log('jQuery:', $);
        console.log('Slick:', $.fn.slick);

    try {
        $('.your-carousel-class').slick({
            dots: true,
            infinite: true,
            speed: 500,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
        });

        $('.image-slider').slick({
            arrows: false,
            autoplay: false,
            infinite: true,
            speed: 1000,
            slidesToShow: 1,
            slidesToScroll: 1,
            fade: false,
            asNavFor: '.thumbnail-slider',
            autoplaySpeed: 3000,
        });

        $('.thumbnail-slider').slick({
            slidesToShow: 4,
            slidesToScroll: 1,
            asNavFor: '.image-slider',
            focusOnSelect: true,
        });

        // Handle content display on slide change
        $('.image-slider').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
            $('.content-item').removeClass('active');
            $('.content-item[data-slide="' + nextSlide + '"]').addClass('active');
            $('.slick-current .slide').removeClass('slide-exiting');
            $('.slick-current .slide').addClass('slide-exiting');
        });

        // Initialize content for the first slide
        $('.content-item[data-slide="0"]').addClass('active');

        // Clicking a thumbnail manually triggers the image slider
        $('.thumbnail').on('click', function() {
            const slideIndex = $(this).data('slide');
            $('.image-slider').slick('slickGoTo', slideIndex);
        });

        // Initialize another carousel if needed
        $('.your-carousel').slick({
            dots: true,
            infinite: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: true,
        });
    } catch (error) {
        console.error('Error initializing Slick sliders:', error);
    }
};

// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    alert('Page loaded!'); // Alert to ensure JS is working

    initializeSlick(); // Initialize Slick sliders

    // Initialize search bar functionality
    const searchBarContainer = document.querySelector('.search-bar-container');
    const searchBar = document.getElementById('searchBar');

    // Expand search bar when clicked or focused
    searchBar.addEventListener('focus', () => {
        searchBarContainer.classList.add('active');
    });

    // Collapse search bar when it loses focus (optional)
    searchBar.addEventListener('blur', () => {
        if (!searchBar.value) {
            searchBarContainer.classList.remove('active');
        }
    });

    console.log("Main script loaded and running");
});
