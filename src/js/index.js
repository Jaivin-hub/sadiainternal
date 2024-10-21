// Import Bootstrap CSS and JS
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel';
// Import SCSS
import '../scss/style.scss';


// Import Mapbox GL JS and CSS
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Mapbox access token (replace 'YOUR_MAPBOX_ACCESS_TOKEN' with your actual token)
mapboxgl.accessToken = 'pk.eyJ1IjoicmFqc3Jpc2h0aXMiLCJhIjoiY20yYTNkOTJzMGJtZDJpb3hwY21lY3p1eCJ9.7t6X_NQIGtIsI-FRLNPU6g';

// Country coordinates with multiple places
const countryCoordinates = {
  "UAE": [
    { name: "Abu Dhabi", coordinates: [24.4539, 54.3773] },
    { name: "Dubai", coordinates: [25.2048, 55.2708] },
    { name: "Sharjah", coordinates: [25.3463, 55.4209] },
    { name: "Al Ain", coordinates: [24.1302, 55.8023] }
  ],
  "Saudi Arabia": [
    { name: "Riyadh", coordinates: [24.7136, 46.6753] },
    { name: "Jeddah", coordinates: [21.4858, 39.1925] },
    { name: "Mecca", coordinates: [21.3891, 39.8579] },
    { name: "Dammam", coordinates: [26.4207, 50.0888] }
  ],
  "Qatar": [
    { name: "Doha", coordinates: [25.276987, 51.520008] },
    { name: "Al Rayyan", coordinates: [25.2919, 51.4244] },
    { name: "Al Wakrah", coordinates: [25.1686, 51.6032] },
    { name: "Dukhan", coordinates: [25.6281, 50.8819] }
  ],
  "Kuwait": [
    { name: "Kuwait City", coordinates: [29.3759, 47.9774] },
    { name: "Salmiya", coordinates: [29.3333, 48.0833] },
    { name: "Hawally", coordinates: [29.3320, 48.0285] },
    { name: "Jahra", coordinates: [29.3375, 47.6581] }
  ],
  "Oman": [
    { name: "Muscat", coordinates: [23.5880, 58.3829] },
    { name: "Sohar", coordinates: [24.3650, 56.7465] },
    { name: "Nizwa", coordinates: [22.9333, 57.5333] },
    { name: "Salalah", coordinates: [17.0170, 54.0823] }
  ]
};

const pulsingDotStyle = `
<style>
.pulsing-dot {
  width: 20px;
  height: 20px;
  background-color: rgba(255, 0, 0, 0.5); /* Changed to red */
  border-radius: 50%;
  position: relative;
}

.pulsing-dot::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(255, 0, 0, 0.5); /* Changed to red */
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
</style>
`;
document.head.insertAdjacentHTML('beforeend', pulsingDotStyle);


// Function to initialize Mapbox map
const initializeMapbox = () => {
  try {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: 'mapFrame', // ID of the container element
      style: 'mapbox://styles/mapbox/dark-v11', // Map style URL
      center: countryCoordinates.UAE[0].coordinates, // Default starting position for UAE
      zoom: 5, // Starting zoom level
    });

    let markers = [];

    // Function to clear all markers from the map
    const clearMarkers = () => {
      markers.forEach(marker => marker.remove());
      markers = [];
    };

    // Function to add pulsing dot markers
    const addPulsingMarkers = (locations) => {
      locations.forEach(location => {
        const el = document.createElement('div');
        el.className = 'pulsing-dot'; // Apply pulsing dot class

        const marker = new mapboxgl.Marker(el)
          .setLngLat(location.coordinates)
          .addTo(map);

        markers.push(marker); // Keep track of added markers
      });
    };

    // Listen for dropdown selection change
    const countryDropdown = document.querySelector('.countryDrops');
    countryDropdown.addEventListener('change', (event) => {
      const selectedCountry = event.target.options[event.target.selectedIndex].text;
      const locations = countryCoordinates[selectedCountry];

      if (locations) {
        // Update the map's center to the first location in the selected country
        map.setCenter(locations[0].coordinates);
        map.setZoom(5); // Reset zoom level

        // Clear existing markers and add new ones
        clearMarkers();
        addPulsingMarkers(locations);

      }
    });

    // Initialize the map with the default country (UAE)
    addPulsingMarkers(countryCoordinates.UAE);

  } catch (error) {
    console.error('Error initializing Mapbox:', error);
  }
};

// Function to initialize Slick sliders
const initializeSlick = () => {
  try {
    // Ensure Slick is loaded
    if (typeof $.fn.slick === 'undefined') {
      console.error('Slick is not loaded.');
      return;
    }

    // Check if sliders exist in the DOM
    if (!$('.image-slider').length || !$('.thumbnail-slider').length) {
      // console.error('Required slider elements are not found in the DOM.');
      return;
    }

    // Initialize the main image slider
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

    // Initialize the thumbnail slider
    $('.thumbnail-slider').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '.image-slider',
      focusOnSelect: true,
      infinite: false,
    });

    // Ensure content items exist before adding event listener
    if ($('.content-item').length) {
      // Handle content display on slide change
      $('.image-slider').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
        $('.content-item').removeClass('active');
        $('.content-item[data-slide="' + nextSlide + '"]').addClass('active');

        // Ensure current slide exists
        const currentSlideElement = $('.slick-current .slide');
        if (currentSlideElement.length) {
          currentSlideElement.removeClass('slide-exiting');
          currentSlideElement.addClass('slide-exiting');
        }
      });

      // Initialize content for the first slide
      $('.content-item[data-slide="0"]').addClass('active');
    } else {
      console.error('Content items not found.');
    }

    // Prevent adding duplicate event listeners on clicking a thumbnail
    if (!$._data($('.thumbnail').get(0), 'events')) {
      // Clicking a thumbnail manually triggers the image slider
      $('.thumbnail').on('click', function () {
        const slideIndex = $(this).data('slide');
        // Ensure the slideIndex is valid
        if (typeof slideIndex !== 'undefined') {
          $('.image-slider').slick('slickGoTo', slideIndex);
        }
      });
    }


    // Initialize another carousel
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
      responsive: [
        {
          breakpoint: 768, // Screen width at which settings should change
          settings: {
            slidesToShow: 1, // Show only one slide at a time on mobile
            variableWidth: false // Disable variable width for consistent slide width
          }
        }
      ]
    });


  


  } catch (error) {
    console.error('Error initializing Slick sliders:', error);
  }
};


// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
  function isMobileViewport() {
    return window.innerWidth <= 991; // Check if the viewport is 991px or below
  }
  
  document.querySelectorAll('.dropdown-toggle').forEach(function (dropdown) {
    dropdown.addEventListener('click', function (event) {
      if (isMobileViewport()) { // Only trigger for mobile view
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
      }
    });
  });
  
  // Close all dropdowns when clicking outside, only on mobile
document.addEventListener('click', function () {
  if (isMobileViewport()) { // Only trigger for mobile view
    document.querySelectorAll('.dropdown-menu').forEach(function (dropdown) {
      dropdown.classList.remove('show');
    });
  }
});

// Add event listeners with null checks
const viewMoreRecipes = document.getElementById('viewMoreRecipes');
if (viewMoreRecipes) {
  viewMoreRecipes.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    this.href = 'recipe-details.hbs'; // Adjust the path as per your file structure
    window.location.href = this.href; // Navigate to the new page
  });
}

const viewProduct = document.getElementById('viewProduct');
if (viewProduct) {
  viewProduct.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    this.href = 'product-listing.hbs'; // Adjust the path as per your file structure
    window.location.href = this.href; // Navigate to the new page
  });
}

const viewMoreHack = document.getElementById('viewMoreHack');
if (viewMoreHack) {
  viewMoreHack.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    this.href = 'hack-listing.hbs'; // Adjust the path as per your file structure
    window.location.href = this.href; // Navigate to the new page
  });
}

const viewCampaignButtons = document.querySelectorAll('.viewCampaign');
viewCampaignButtons.forEach(button => {
  button.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    window.location.href = 'campaign.hbs'; // Navigate to the new page
  });
});

const whereToBuy = document.getElementById('whereToBuy');
if (whereToBuy) {
  whereToBuy.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    this.href = 'about.hbs'; // Adjust the path as per your file structure
    window.location.href = this.href; // Navigate to the new page
  });
}

const aboutlink = document.getElementById('abtLink');
if (aboutlink) {
  aboutlink.addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action of the link
    this.href = 'about.hbs'; // Adjust the path as per your file structure
    window.location.href = this.href; // Navigate to the new page
  });
}



// Re-check if on mobile when resizing the window
window.addEventListener('resize', function () {
  if (!isMobileViewport()) {
    // Close all dropdowns when switching to desktop view
    document.querySelectorAll('.dropdown-menu').forEach(function (dropdown) {
      dropdown.classList.remove('show');
    });
  }
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

});

