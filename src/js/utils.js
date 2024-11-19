// Import Mapbox GL JS and CSS
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { fetchStores } from './api';
mapboxgl.accessToken = 'pk.eyJ1IjoicmFqc3Jpc2h0aXMiLCJhIjoiY20yYTNkOTJzMGJtZDJpb3hwY21lY3p1eCJ9.7t6X_NQIGtIsI-FRLNPU6g';

// Function to initialize Mapbox map
const initializeMapbox = () => {
  try {
    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: 'mapFrame', // ID of the container element
      style: 'mapbox://styles/mapbox/dark-v11', // Map style URL
      center: [54.3773, 24.4539], // Default starting position for UAE (Abu Dhabi)
      attributionControl: false, // Disables the default attribution control
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

const priceSliderInitialize = () => {
  var slider = document.getElementById("slider-ranges");
  if(slider){
    noUiSlider.create(slider, {
      start: 15, // Single initial value
      connect: [true, false], // Connect the bar from the start to the thumb position
      range: {
        min: 5,
        max: 60
      },
      format: {
        to: function (value) {
          return " " + value.toFixed(0);
        },
        from: function (value) {
          return Number(value.replace('', ''));
        }
      }
    });
  }

  var slider = document.getElementById("slider-range");
  if(slider){
    noUiSlider.create(slider, {
      start: 15, // Single initial value
      connect: [true, false], // Connect the bar from the start to the thumb position
      range: {
        min: 5,
        max: 60
      },
      format: {
        to: function (value) {
          return " " + value.toFixed(0);
        },
        from: function (value) {
          return Number(value.replace('', ''));
        }
      }
    });
  }

  var slider = document.getElementById("slider-ranger");
  if(slider){
    noUiSlider.create(slider, {
      start: 15, // Single initial value
      connect: [true, false], // Connect the bar from the start to the thumb position
      range: {
        min: 5,
        max: 60
      },
      format: {
        to: function (value) {
          return " " + value.toFixed(0);
        },
        from: function (value) {
          return Number(value.replace('', ''));
        }
      }
    });
  }

  var slider = document.getElementById("slider-rangers");
  if(slider){
    noUiSlider.create(slider, {
      start: 15, // Single initial value
      connect: [true, false], // Connect the bar from the start to the thumb position
      range: {
        min: 5,
        max: 60
      },
      format: {
        to: function (value) {
          return " " + value.toFixed(0);
        },
        from: function (value) {
          return Number(value.replace('', ''));
        }
      }
    });
  }
  
  // Update the amount field with the single thumb value
  var amount = document.getElementById("amount");
  var amounts = document.getElementById("amounts");
  if(slider && amount){
    slider.noUiSlider.on("update", function (values) {
      amount.value = values[0]; // Display the single thumb value
    });
  }
  if(slider && amounts){
    slider.noUiSlider.on("update", function (values) {
      amounts.value = values[0]; // Display the single thumb value
    });
  }
}





// SIDEBAR-COLLPASE START
const toogleBtn = () => {
  // Select the toggle button and sidebar frame elements
  const toggleButton = document.getElementById("toggleButton");
  const sidebarFrame = document.getElementById("sidebarFrame");
  // Add click event listener to the button
  toggleButton.addEventListener("click", function () {
    // Toggle the "active" class on the toggleButton
    toggleButton.classList.toggle("active");

    // Toggle the "hideSidebar" class on the sidebarFrame
    sidebarFrame.classList.toggle("hideSidebar");
  });
}
// SIDEBAR-COLLPASE END





// Function to initialize Slick sliders
const initializeSlick = () => {
  try {
    // Ensure Slick is loaded
    if (typeof $.fn.slick === 'undefined') {
      console.error('Slick is not loaded.');
      return;
    }

    if ($('.whatSlider').length) {
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
      // return;
    }

    if ($('.image-slider').length || $('.thumbnail-slider').length) {
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

      // return;
    }

  } catch (error) {
    console.error('Error initializing Slick sliders:', error);
  }
};

const initializeWhereToBuyMapbox = (url) => {
  const selectElement = document.querySelector('.form-select.countryDrops');
  const selectedValue = selectElement.value;
  const apiEndpoint = url

  const initializeMapWithData = (storesList) => {
    const coordinatesArray = storesList.map(store => store.coordinates);

    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: 'wheretobuyMapframe',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [54.3773, 24.4539], // Default position for UAE (Abu Dhabi)
      zoom: 5,
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
          marker.getPopup().remove();
        }
      });
    };

    // Function to add red location markers with popups
    const addRedMarkers = (data) => {
      const { locations, storesList } = data;
      clearPopups();

      locations.forEach((location, index) => {
        const coordinates = location.split(',').map(Number);
        const store = storesList[index];

        // Dynamic popup content from storesList
        const popupContent = `
          <div style="text-align: center; width: 300px; padding: 10px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9;">
            <img src="${store.storeLogoUrl}" alt="${store.storeName} Logo" style="width: 100%; height: auto; max-width: 100%; padding: 5px 0; border-radius: 8px;"/>
            <br/>
            <p style="font-size: 16px; font-weight: bold; color: #333; margin: 5px 0;">${store.storeName}</p>
            <button style="margin-top: 10px; padding: 10px 15px; background-color: red; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;"
              onclick="window.open('${store.directionsUrl}', '_blank')">
              Get Directions
            </button>
          </div>
        `;

        // Create the popup and attach it to the marker
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);
        const marker = new mapboxgl.Marker({ color: 'red' })
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map);

        markers.push(marker);
      });
    };

    // Add red markers for the initial selection
    const objData = { "locations": coordinatesArray, "storesList": storesList };
    addRedMarkers(objData);

    // Center map on the first location's coordinates
    const firstLocation = coordinatesArray[0].split(',').map(Number);
    map.setCenter(firstLocation);

    // Listen for dropdown selection change
    selectElement.addEventListener('change', () => {
      const selectedValue = selectElement.value;
      
      // Fetch new data and update markers
      fetchStores(apiEndpoint, selectedValue, (newData) => {
        const newCoordinatesArray = newData.map(store => store.coordinates);
        const objData = { "locations": newCoordinatesArray, "storesList": newData };
        
        clearMarkers();
        addRedMarkers(objData);
        const firstLocation = newCoordinatesArray[0].split(',').map(Number);
        map.setCenter(firstLocation);
      });
    });
  };

  // Initial data fetch and map initialization
  fetchStores(apiEndpoint, selectedValue, initializeMapWithData);
};

export { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn };