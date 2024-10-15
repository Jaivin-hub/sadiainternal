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

// Import Mapbox GL JS and CSS
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token (replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual token)
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

// Function to initialize Mapbox map
const initializeMapbox = () => {
  console.log('initializeMapbox')
  try {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: 'mapFrame', // ID of the container element
      style: 'mapbox://styles/mapbox/streets-v11', // Map style URL
      center: [-74.5, 40], // Starting position [lng, lat]
      zoom: 9, // Starting zoom level
    });

    // Optional: Add navigation control (zoom buttons)
    map.addControl(new mapboxgl.NavigationControl());

    // Optional: Add a marker at a specific location
    new mapboxgl.Marker()
      .setLngLat([-74.5, 40]) // Coordinates for the marker [lng, lat]
      .addTo(map); // Add the marker to the map

    console.log('Mapbox initialized successfully');
  } catch (error) {
    console.error('Error initializing Mapbox:', error);
  }
};

// Function to initialize Slick sliders
const initializeSlick = () => {
  console.log('inside the initializeslick');
  console.log('jQuery:', $);
  console.log('Slick:', $.fn.slick);

  try {
    // FAVOURITE-SLIDER START
    $('.image-slider').slick({
      arrows: false,
      autoplay: false,
      infinite: false,
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
      infinite: false,
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
    $('.thumbnail').on('click', function () {
      const slideIndex = $(this).data('slide');
      $('.image-slider').slick('slickGoTo', slideIndex);
    });

    // FAVOURITE-SLIDER END

    // Initialize another carousel if needed
    $('.whatSlider').slick({
      dots: false,
      slidesToShow: 3, // Show one main slide at a time
      slidesToScroll: 1,
      initialSlide: 3, // Start at the 4th slide (index 3)
      infinite: true, // Enable infinite looping
      autoplay: true,
      autoplaySpeed: 3000,
      arrows: false,
      variableWidth: true, // Enable variable width for custom slide widths
    });
  } catch (error) {
    console.error('Error initializing Slick sliders:', error);
  }
};

// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  initializeSlick(); // Initialize Slick sliders
  initializeMapbox(); // Initialize Mapbox map

  // Initialize search bar functionality
  $('.search-button').on('click', function () {
    $('.search-form').addClass('expanded');
    $('.close-button').show();
    $('.search-button').hide();
  });

  $('.close-button').on('click', function () {
    $('.search-form').removeClass('expanded');
    $('.close-button').hide();
    $('.search-button').show();
    $('#searchBar').val('');
  });

  // Handle dropdowns for mobile
  document.querySelectorAll('.dropdown-toggle.mob').forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      const dropdownMenu = this.nextElementSibling;
      if (dropdownMenu.classList.contains('show')) {
        dropdownMenu.classList.remove('show');
      } else {
        document.querySelectorAll('.dropdown-menu').forEach(function (openDropdown) {
          openDropdown.classList.remove('show');
        });
        dropdownMenu.classList.add('show');
      }
      event.stopPropagation();
    });
  });

  document.addEventListener('click', function () {
    document.querySelectorAll('.dropdown-menu').forEach(function (dropdown) {
      dropdown.classList.remove('show');
    });
  });

  // Fix header visibility and scroll appearance
  const header = document.querySelector('.main-header');
  header.classList.add('visible');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  console.log('Main script loaded and running');
});
