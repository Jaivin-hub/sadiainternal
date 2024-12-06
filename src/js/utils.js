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

const priceSliderInitialize = (onUpdate) => {

};



// TAG-SEARCH START
const tagInput = document.getElementById('tag-input');
const tagContainer = document.getElementById('tag-container');

tagInput?.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault();
    const tagText = tagInput.value.trim();
    if (tagText) {
      addTag(tagText);
      tagInput.value = '';
    }
  }
});

function addTag(text) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.textContent = text;

  // Add click event to remove the tag
  tag.addEventListener('click', () => {
    tagContainer.removeChild(tag);
  });

  tagContainer.insertBefore(tag, tagInput);
}


// TAG-SEARCH END



// LANGUAGE-ARABIC START
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('toggle-lang'); // Single toggle button
  const englishButton = document.querySelector('.toggle-en'); // Button to switch to English
  const arabicButton = document.querySelector('.toggle-ar'); // Button to switch to Arabic
  const html = document.documentElement;

  // Initialize language and direction from current HTML attributes
  let currentLang = html.lang || 'en';

  const updateLanguage = (lang) => {
      if (lang === 'ar') {
          html.lang = 'ar';
          html.dir = 'rtl';
          toggleButton.textContent = 'EN';
          englishButton.textContent = 'English';
          arabicButton.textContent = 'العربية'; // Arabic remains
          // Add 'active' class to Arabic button
          arabicButton.classList.add('active');
          englishButton.classList.remove('active');
      } else {
          html.lang = 'en';
          html.dir = 'ltr';
          toggleButton.textContent = 'عربي';
          englishButton.textContent = 'English'; // English remains
          arabicButton.textContent = 'عربي';
          // Add 'active' class to English button
          englishButton.classList.add('active');
          arabicButton.classList.remove('active');
      }
      currentLang = lang;
  };

  // Toggle language on the single toggle button
  toggleButton.addEventListener('click', () => {
      const newLang = currentLang === 'en' ? 'ar' : 'en';
      updateLanguage(newLang);
  });

  // Explicitly switch to English
  englishButton.addEventListener('click', () => {
      updateLanguage('en');
  });

  // Explicitly switch to Arabic
  arabicButton.addEventListener('click', () => {
      updateLanguage('ar');
  });
});


// LANGUAGE-ARABIC END






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

    // Function to initialize or reinitialize Slick sliders
    const initSliders = (isRTL) => {
      // Destroy existing sliders to avoid duplicate instances
      if ($('.whatSlider').hasClass('slick-initialized')) {
        $('.whatSlider').slick('unslick');
      }
      if ($('.image-slider').hasClass('slick-initialized')) {
        $('.image-slider').slick('unslick');
      }
      if ($('.thumbnail-slider').hasClass('slick-initialized')) {
        $('.thumbnail-slider').slick('unslick');
      }
      if ($('.content-slider').hasClass('slick-initialized')) {
        $('.content-slider').slick('unslick');
      }

      // Initialize `whatSlider`
      if ($('.whatSlider').length) {
        $('.whatSlider').slick({
          rtl: isRTL, // Add RTL dynamically
          dots: false,
          slidesToShow: 3,
          slidesToScroll: 1,
          initialSlide: 3,
          infinite: true,
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: false,
          variableWidth: true,
          responsive: [
            {
              breakpoint: 768,
              settings: {
                slidesToShow: 1,
                variableWidth: false,
              },
            },
          ],
        });
      }

      // Initialize `image-slider`
      if ($('.image-slider').length) {
        $('.image-slider').slick({
          rtl: isRTL, // Add RTL dynamically
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
      }

      // Initialize `thumbnail-slider`
      if ($('.thumbnail-slider').length) {
        $('.thumbnail-slider').slick({
          rtl: isRTL, // Add RTL dynamically
          slidesToShow: 4,
          slidesToScroll: 1,
          asNavFor: '.image-slider, .content-slider',
          focusOnSelect: true,
          infinite: false,
        });
      }

      // Initialize `content-slider`
      if ($('.content-slider').length) {
        $('.content-slider').slick({
          rtl: isRTL, // Add RTL dynamically
          arrows: false,
          autoplay: false,
          infinite: false,
          speed: 1000,
          slidesToShow: 1,
          slidesToScroll: 1,
          fade: false,
          asNavFor: '.image-slider, .thumbnail-slider',
        });
      }

      // Add event listeners to `.content-item`
      if ($('.content-item').length) {
        $('.image-slider').on('beforeChange', (event, slick, currentSlide, nextSlide) => {
          $('.content-item').removeClass('active');
          $('.content-item[data-slide="' + nextSlide + '"]').addClass('active');
        });
        $('.content-item[data-slide="0"]').addClass('active');
      }

      // Add click events to `.thumbnail`
      if ($('.thumbnail').length && !$._data($('.thumbnail').get(0), 'events')) {
        $('.thumbnail').on('click', function () {
          const slideIndex = $(this).data('slide');
          if (typeof slideIndex !== 'undefined') {
            $('.image-slider').slick('slickGoTo', slideIndex);
          }
        });
      }
    };

    // Determine initial direction
    const isRTL = $('html').attr('dir') === 'rtl';
    initSliders(isRTL);

    // Watch for changes to `dir` attribute on `<html>`
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          const newRTL = $('html').attr('dir') === 'rtl';
          console.log('Direction changed. Reinitializing sliders. RTL:', newRTL);
          initSliders(newRTL); // Reinitialize sliders with new direction
        }
      });
    });

    // Start observing changes to the `<html>` element
    observer.observe(document.documentElement, { attributes: true });
  } catch (error) {
    console.error('Error initializing Slick sliders:', error);
  }
};

// SLICK-END



// STORY-SLIDER START

const initializeNewSlider = () => {
  try {
    // Ensure Slick is loaded
    if (typeof $.fn.slick === 'undefined') {
      console.error('Slick is not loaded.');
      return;
    }

    // Function to initialize sliders
    const initSliders = (isRTL) => {
      // Destroy existing sliders if they are already initialized
      if ($('#new-image-slider').hasClass('slick-initialized')) {
        $('#new-image-slider').slick('unslick');
      }
      if ($('#new-thumbnail-slider').hasClass('slick-initialized')) {
        $('#new-thumbnail-slider').slick('unslick');
      }

      // Main image slider options
      const mainSliderOptions = {
        rtl: isRTL, // Dynamically set RTL mode
        arrows: false,
        autoplay: false,
        infinite: false,
        speed: 1000,
        slidesToShow: 3.5,
        slidesToScroll: 1,
        fade: false,
        asNavFor: '#new-thumbnail-slider',
        autoplaySpeed: 3000,
        draggable: true,
        swipe: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1.1,
              slidesToScroll: 1,
            },
          },
        ],
      };

      // Thumbnail slider options
      const thumbnailSliderOptions = {
        rtl: isRTL, // Dynamically set RTL mode
        slidesToShow: 3.5,
        slidesToScroll: 1,
        asNavFor: '#new-image-slider',
        focusOnSelect: true,
        infinite: false,
        draggable: true,
        swipe: true,
      };

      // Initialize sliders
      $('#new-image-slider').slick(mainSliderOptions);
      $('#new-thumbnail-slider').slick(thumbnailSliderOptions);
    };

    // Initial setup based on current RTL state
    const isRTL = $('html').attr('dir') === 'rtl';
    initSliders(isRTL);

    // Watch for changes in the <html> dir attribute
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          const newRTL = $('html').attr('dir') === 'rtl';
          console.log('Direction changed. RTL mode:', newRTL);
          initSliders(newRTL); // Reinitialize sliders with updated RTL state
        }
      });
    });

    // Observe the <html> tag for changes to the dir attribute
    observer.observe(document.documentElement, { attributes: true });

  } catch (error) {
    console.error('Error initializing new sliders:', error);
  }
};


// STORY-SLIDER END





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
      const wheretobuyElement = document.querySelector('.form-select#countryDrops');
      const inStoreApi = wheretobuyElement.getAttribute('data-url');
      const selectedValue = selectElement.value;
      const fetchUrl = `${inStoreApi}?countryId=${selectedValue}`


      // Fetch new data and update markers
      fetchStores(fetchUrl, selectedValue, (newData) => {
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

export { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn,initializeNewSlider };