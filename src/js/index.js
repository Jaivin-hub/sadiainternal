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
      center: [54.3773, 24.4539], // Default starting position for UAE (Abu Dhabi)
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
        el.className = 'pulsing-dot';
        const coordinates = location.split(',').map(Number); // Split coordinates and convert to numbers
        const marker = new mapboxgl.Marker(el).setLngLat(coordinates).addTo(map);
        markers.push(marker); // Store marker reference
      });
    };

    // Get the first option's data from the dropdown to initialize the map
    const countryDropdown = document.querySelector('.countryDrops');
    const firstOption = countryDropdown.options[0]; // Get the first option
    const initialLocationsData = firstOption.getAttribute('data'); // Get the 'data' attribute from the first option
    const initialLocations = initialLocationsData.split(' | ').map(city => city.split('-')[1]); // Extract the coordinates from the data attribute

    // Add pulsing markers for the first option's locations
    addPulsingMarkers(initialLocations);
    const firstLocation = initialLocations[0].split(',').map(Number);
    map.setCenter(firstLocation); // Center map on the first city's coordinates

    // Listen for dropdown selection change
    countryDropdown.addEventListener('change', () => {
      const selectedOption = countryDropdown.options[countryDropdown.selectedIndex];
      const data = selectedOption.getAttribute('data'); // Get the 'data' attribute
      const locations = data.split(' | ').map(city => city.split('-')[1]); // Extract the coordinates from the data attribute

      if (locations) {
        clearMarkers(); // Clear existing markers
        addPulsingMarkers(locations); // Add new markers
        const firstLocation = locations[0].split(',').map(Number); // Use the first location for centering
        map.setCenter(firstLocation); // Set the map center to the first city's coordinates
      }
    });

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
      asNavFor: '.thumbnail-slider, .content-slider',
      autoplaySpeed: 3000,
    });



    // Initialize the thumbnail slider
    $('.thumbnail-slider').slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      asNavFor: '.image-slider, .content-slider',
      focusOnSelect: true,
      infinite: false,
    });

    // Initialize the content slider
    $('.content-slider').slick({
      arrows: false,
      autoplay: false,
      infinite: false,
      speed: 1000,
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: false,
      asNavFor: '.image-slider, .thumbnail-slider',  // Link both image and thumbnail
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

const initializeWhereToBuyMapbox = () => {
  console.log('inside the initializeWhereToBuyMapbox');
  try {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: 'wheretobuyMapframe', // ID of the container element
      style: 'mapbox://styles/mapbox/dark-v11', // Map style URL
      center: [54.3773, 24.4539], // Default starting position for UAE (Abu Dhabi)
      zoom: 5, // Starting zoom level
    });

    let markers = [];

    // Function to clear all markers from the map
    const clearMarkers = () => {
      markers.forEach(marker => marker.remove());
      markers = [];
    };

    // Function to clear all previously opened popups
    const clearPopups = () => {
      markers.forEach(marker => {
        if (marker.getPopup() && marker.getPopup().isOpen()) {
          marker.getPopup().remove(); // Close the currently open popup
        }
      });
    };

    // Function to add red location markers with popups
    const addRedMarkers = (locations) => {
      clearPopups(); // Clear any previously opened popups

      locations.forEach(location => {
        const coordinates = location.split(',').map(Number); // Split coordinates and convert to numbers

        // Create the popup content with an image and "Get Directions" button
        const popupContent = `
          <div style="text-align: center; width: 300px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
            <img src="./assets/images/others/image 141.png" alt="Location Image" style="width: 100%; height: auto; max-width: 100%; padding: 5px 0; border-radius: 8px;"/>
            <br/>
            <img src="./assets/images/others/image 75.png" alt="Location Image" style="width: 100%; height: auto; max-width: 100px; border-radius: 8px; margin: 0 auto; display: block;"/>
            <br/>
            <p style="font-size: 16px; font-weight: bold; color: #333; margin: 5px 0;">Park AI Karama - Dubai</p>
            <button style="margin-top: 10px; padding: 10px 15px; background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;"
              onclick="window.open('https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}', '_blank')">
              Get Directions
            </button>
          </div>
        `;

        // Create the popup and attach it to the marker
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

        // Create the marker and attach the popup
        const marker = new mapboxgl.Marker({ color: 'red' })
          .setLngLat(coordinates)
          .setPopup(popup) // Attach the popup to the marker
          .addTo(map);

        markers.push(marker); // Store marker reference
      });
    };

    // Get the first option's data from the dropdown to initialize the map
    const countryDropdown = document.querySelector('.countryDrops');
    console.log('countryDropdown', countryDropdown);
    const firstOption = countryDropdown.options[0]; // Get the first option
    console.log('firstOption', firstOption);
    const initialLocationsData = firstOption.getAttribute('data'); // Get the 'data' attribute from the first option
    const initialLocations = initialLocationsData.split(' | ').map(city => city.split('-')[1]); // Extract the coordinates from the data attribute

    // Add red markers for the first option's locations
    addRedMarkers(initialLocations);
    const firstLocation = initialLocations[0].split(',').map(Number);
    map.setCenter(firstLocation); // Center map on the first city's coordinates

    // Listen for dropdown selection change
    countryDropdown.addEventListener('change', () => {
      console.log('Dropdown changed');
      const selectedOption = countryDropdown.options[countryDropdown.selectedIndex];
      console.log('Selected Option:', selectedOption);
    
      const data = selectedOption.getAttribute('data'); // Get the 'data' attribute
      console.log('Data attribute:', data);
    
      if (data) {
        const locations = data.split(' | ').map(city => city.split('-')[1]); // Extract the coordinates
        console.log('Parsed Locations:', locations);
    
        if (locations.length > 0) {
          clearMarkers(); // Clear existing markers
          addRedMarkers(locations); // Add new markers
          const firstLocation = locations[0].split(',').map(Number); // Get the first location for centering
          map.setCenter(firstLocation); // Center map on the first city's coordinates
        } else {
          console.warn('No locations found in the selected data.');
        }
      } else {
        console.error('No data attribute found for the selected option.');
      }
    });

  } catch (error) {
    console.error('Error initializing Mapbox:', error);
  }
};








// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const imageSliderExists = document.querySelector('.image-slider') !== null;
  const thumbnailSliderExists = document.querySelector('.thumbnail-slider') !== null;
  const contentItem = document.querySelector('.content-item') !== null;
  const currentURL = window.location.pathname; // Get the current URL pathname
    console.log('currentURL:', currentURL);
    // productnav
    if (currentURL === '/about' || currentURL === '/where-to-buy') {
    const aboutNavLink = document.querySelector('#aboutnav');
      console.log('inside')
      aboutNavLink.classList.add('active'); // Add the active class to the About link
      console.log('inside 2')
  }else if(currentURL === '/product-listing'){
    const aboutNavLink = document.querySelector('#productnav');
    aboutNavLink.classList.add('active');
  }
  
  
  if (imageSliderExists && thumbnailSliderExists && contentItem) {
    initializeSlick(); // Initialize Slick sliders
  } else {
    console.warn('Slick slider elements not found in the DOM.');
  }

  if (document.getElementById('mapFrame')) { // Replace with your actual Mapbox element ID
    initializeMapbox(); // Initialize Mapbox map
  }

  if (document.getElementById('wheretobuyMapframe')) { // Replace with your actual Mapbox element ID
    initializeWhereToBuyMapbox(); // Initialize Mapbox map
  }

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
  // HEADER-SEARCH END


  // Map search-bar
    $('.serLoc').on('click', function () {
      $('.locatSearch').addClass('expanded');
      $('.cl_ser').show();
      $('.serLoc').hide();
    });
  
    $('.cl_ser').on('click', function () {
      $('.locatSearch').removeClass('expanded');
      $('.cl_ser').hide();
      $('.serLoc').show();
      $('.search-bar').val('');
    });
  // Map search-bar eND


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
      this.href = 'recipe-details'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const viewProduct = document.getElementById('viewProduct');
  if (viewProduct) {
    viewProduct.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'product-listing'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const viewMoreHack = document.getElementById('viewMoreHack');
  if (viewMoreHack) {
    viewMoreHack.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'hack-listing'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const viewCampaignButtons = document.querySelectorAll('.viewCampaign');
  viewCampaignButtons.forEach(button => {
    button.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      window.location.href = 'campaign'; // Navigate to the new page
    });
  });

  const whereToBuy = document.getElementById('whereToBuy');
  if (whereToBuy) {
    whereToBuy.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'about'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const aboutlink = document.getElementById('abtLink');
  if (aboutlink) {
    aboutlink.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'about'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const wheretobuylinks = document.querySelectorAll('.where-to-buy');
  wheretobuylinks.forEach(link => {
    link.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action
      const targetUrl = 'where-to-buy'; // Adjust the path as per your file structure
      window.location.href = targetUrl; // Navigate to the new page
    });
  });



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

