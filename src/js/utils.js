// Import Mapbox GL JS and CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { fetchStores } from "./api";
mapboxgl.accessToken =
  "pk.eyJ1IjoicmFqc3Jpc2h0aXMiLCJhIjoiY20yYTNkOTJzMGJtZDJpb3hwY21lY3p1eCJ9.7t6X_NQIGtIsI-FRLNPU6g";

// Function to initialize Mapbox map
const initializeMapbox = () => {
  try {
    const map = new mapboxgl.Map({
      container: "mapFrame",
      style: "mapbox://styles/mapbox/dark-v11",
      attributionControl: false,
      zoom: 5,
    });

        // Disable scroll zoom
    map.scrollZoom.disable();

    mapboxgl.setRTLTextPlugin(
      "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js",
      null,
      true
    );

    document.getElementById("mapFrame").style.direction = "ltr";

    let markers = [];

    const clearMarkers = () => {
      markers.forEach((marker) => marker.remove());
      markers = [];
    };

    const addPulsingMarkers = (locations) => {
      locations.forEach((location, index) => {
        const el = document.createElement("div");
        el.className = "pulsing-dot";
        const coordinates = location.split(",").map(Number);
        if (isNaN(coordinates[0]) || isNaN(coordinates[1])) {
          console.error(`Invalid coordinates at index ${index}:`, location);
          return;
        }
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map);
        markers.push(marker);
      });
    };

    const updateMap = (data) => {
      if (!data) return;
      const locations = data
        .split(" | ")
        .map((city) => city.split("-")[1]?.trim())
        .filter(Boolean);

      clearMarkers();
      addPulsingMarkers(locations);

      const firstLocation = locations[0]?.split(",").map(Number);
      if (!isNaN(firstLocation?.[0]) && !isNaN(firstLocation?.[1])) {
        map.setCenter(firstLocation);
      }
    };

    const countryDropdown = document.querySelector(".countryDrops");
    if (countryDropdown) {
      const firstOption = countryDropdown.options[0];
      if (firstOption) {
        updateMap(firstOption.getAttribute("data"));
      }

      countryDropdown.addEventListener("change", () => {
        const data =
          countryDropdown.options[countryDropdown.selectedIndex]?.getAttribute(
            "data"
          );
        updateMap(data);
      });
    }
  } catch (error) {
    console.error("Error initializing Mapbox:", error);
  }
};

const priceSliderInitialize = (onUpdate) => {};

// TAG-SEARCH START
const tagInput = document.getElementById("tag-input");
const tagContainer = document.getElementById("tag-container");

tagInput?.addEventListener("keydown", function (event) {
  if (event.key === "Enter" || event.key === ",") {
    event.preventDefault();
    const tagText = tagInput.value.trim();
    if (tagText) {
      addTag(tagText);
      tagInput.value = "";
    }
  }
});

function addTag(text) {
  const tag = document.createElement("div");
  tag.className = "tag";
  tag.textContent = text;

  // Add click event to remove the tag
  tag.addEventListener("click", () => {
    tagContainer.removeChild(tag);
  });

  tagContainer.insertBefore(tag, tagInput);
}

// TAG-SEARCH END

// LANGUAGE-ARABIC START
document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-lang"); // Single toggle button
  const englishButton = document.querySelector(".toggle-en"); // Button to switch to English
  const arabicButton = document.querySelector(".toggle-ar"); // Button to switch to Arabic
  const html = document.documentElement;

  // Initialize language and direction from current HTML attributes
  let currentLang = html.lang || "en";

  const updateLanguage = (lang) => {
    if (lang === "ar") {
      html.lang = "ar";
      html.dir = "rtl";
      toggleButton.textContent = "EN";
      englishButton.textContent = "English";
      arabicButton.textContent = "العربية"; // Arabic remains
      // Add 'active' class to Arabic button
      arabicButton.classList.add("active");
      englishButton.classList.remove("active");
    } else {
      html.lang = "en";
      html.dir = "ltr";
      toggleButton.textContent = "عربي";
      englishButton.textContent = "English"; // English remains
      arabicButton.textContent = "عربي";
      // Add 'active' class to English button
      englishButton.classList.add("active");
      arabicButton.classList.remove("active");
    }
    currentLang = lang;
  };

  // Toggle language on the single toggle button
  toggleButton.addEventListener("click", () => {
    const newLang = currentLang === "en" ? "ar" : "en";
    updateLanguage(newLang);
  });

  // Explicitly switch to English
  if(englishButton){
    englishButton.addEventListener("click", () => {
      updateLanguage("en");
    });
  }

  // Explicitly switch to Arabic
  if(arabicButton){
    arabicButton.addEventListener("click", () => {
      updateLanguage("ar");
    });
  }

});

// LANGUAGE-ARABIC END

// SIDEBAR-COLLPASE START

    // const toggleBtns = () => {
    //   const toggleButton = document.getElementById("toggleButton");
    //   const sidebarFrame = document.getElementById("sidebarFrame");

    //   if (!toggleButton || !sidebarFrame) {
    //     console.error("Toggle button or sidebar frame element not found.");
    //     return;
    //   }

    //   const applyMobileViewDefaults = () => {
    //     if (window.innerWidth <= 767) {
    //       // Set default states for mobile view
    //       toggleButton.classList.remove("active");
    //       sidebarFrame.classList.add("hideSidebar");
    //     } else {
    //       // Set default states for larger screens
    //       toggleButton.classList.add("active");
    //       sidebarFrame.classList.remove("hideSidebar");
    //     }
    //   };

    //   // Apply the defaults initially
    //   applyMobileViewDefaults();

    //   // Add a debounced resize event listener to reapply defaults
    //   let resizeTimeout;
    //   const onResize = () => {
    //     clearTimeout(resizeTimeout);
    //     resizeTimeout = setTimeout(applyMobileViewDefaults, 150);
    //   };
    //   window.addEventListener("resize", onResize);

    //   // Add a click event listener to toggle the sidebar
    //   toggleButton.addEventListener("click", () => {
    //     toggleButton.classList.toggle("active");
    //     sidebarFrame.classList.toggle("hideSidebar");
    //   });

    //   // Ensure no scroll-related logic affects the sidebar
    //   // Explicitly remove any existing scroll event listeners if present
    //   window.removeEventListener("scroll", () => {});
    // };



    const toggleBtns = () => {
      const toggleButton = document.getElementById("toggleButton");
      const sidebarFrame = document.getElementById("sidebarFrame");
    
      if (!toggleButton || !sidebarFrame) {
        return;
      }
    
      // Track whether the sidebar is manually toggled
      let isSidebarToggledManually = false;
    
      // Apply default behavior based on screen size
      const applyMobileViewDefaults = () => {
        if (window.innerWidth <= 767) {
          // Set default states for mobile view
          toggleButton.classList.remove("active");
          sidebarFrame.classList.add("hideSidebar");
          isSidebarToggledManually = false; // Reset flag
        } else {
          // Set default states for larger screens
          toggleButton.classList.add("active");
          sidebarFrame.classList.remove("hideSidebar");
          isSidebarToggledManually = false; // Reset flag
        }
      };
    
      // Apply the defaults initially
      applyMobileViewDefaults();
    
      // Add a debounced resize event listener to reapply defaults
      let resizeTimeout;
      const onResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (!isSidebarToggledManually) {
            applyMobileViewDefaults();
          }
        }, 150);
      };
      window.addEventListener("resize", onResize);
    
      // Add a click event listener to toggle the sidebar
      toggleButton.addEventListener("click", () => {
        isSidebarToggledManually = true; // Mark as manually toggled
        toggleButton.classList.toggle("active");
        sidebarFrame.classList.toggle("hideSidebar");
      });
    
      // Handle scroll events for the sidebar
      const onScroll = (event) => {
        if (isSidebarToggledManually) {
          // Prevent scroll behavior from interfering when manually toggled
          event.stopPropagation();
          return;
        }
    
        // Optional: Add scroll-specific logic here if needed
      };
    
      // Add a scroll listener to the window
      window.addEventListener("scroll", onScroll);
    };
    
    // toggleBtns();
    

// SIDEBAR-COLLPASE END

// FAVOURITE-SECTION Slick sliders

const initializeSlick = () => {
  try {
    // Ensure Slick is loaded
    if (typeof $.fn.slick === "undefined") {
      console.error("Slick is not loaded.");
      return;
    }

    // NORMAL-CAROUSEL START

    if ($(".whatSlider").length) {
      const initWhatSlider = (isRTL) => {
        // Destroy existing slider if initialized
        if ($(".whatSlider").hasClass("slick-initialized")) {
          $(".whatSlider").slick("unslick");
        }

        // Initialize the slider
        $(".whatSlider").slick({
          dots: false,
          slidesToShow: 3, // Show three main slides at a time
          slidesToScroll: 1,
          initialSlide: 3, // Start at the 4th slide (index 3)
          infinite: true, // Enable infinite looping
          autoplay: true,
          autoplaySpeed: 3000,
          arrows: false,
          variableWidth: true, // Enable variable width for custom slide widths
          rtl: isRTL, // Dynamically set RTL mode
          responsive: [
            {
              breakpoint: 768, // Screen width at which settings should change
              settings: {
                slidesToShow: 1, // Show only one slide at a time on mobile
                variableWidth: false, // Disable variable width for consistent slide width
              },
            },
          ],
        });
      };

      // Initial setup based on current RTL state
      const isRTL = $("html").attr("dir") === "rtl";
      initWhatSlider(isRTL);

      // Watch for changes in the <html> dir attribute
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "dir") {
            const newRTL = $("html").attr("dir") === "rtl";
            initWhatSlider(newRTL); // Reinitialize slider with updated RTL state
          }
        });
      });

      // Observe the <html> tag for changes to the dir attribute
      observer.observe(document.documentElement, { attributes: true });
    }

    // NORMAL-CAROUSEL END

    const initSliders = (isRTL) => {
      // Destroy existing sliders to prevent duplication
      if ($(".image-slider").hasClass("slick-initialized")) {
        $(".image-slider").slick("unslick");
      }
      if ($(".thumbnail-slider").hasClass("slick-initialized")) {
        $(".thumbnail-slider").slick("unslick");
      }

      // Initialize the image slider
      $(".image-slider").slick({
        rtl: isRTL, // Dynamically set RTL mode
        arrows: false,
        autoplay: false,
        infinite: true, // Enable infinite looping
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        fade: false,
        asNavFor: ".thumbnail-slider", // Link with thumbnail slider
      });

      // Initialize the thumbnail slider
      $(".thumbnail-slider").slick({
        rtl: isRTL, // Dynamically set RTL mode
        slidesToShow: 4,
        slidesToScroll: 1,
        asNavFor: ".image-slider", // Link with image slider
        focusOnSelect: true,
        infinite: true, // Enable infinite looping
        centerMode: false,
      });

      // Initially show the next button and hide the previous button
      $(".slick-prev").hide();
      $(".slick-next").show(); // Ensure next button is visible

      // Handle content activation for image-slider
      $(".image-slider").on("afterChange", (event, slick, currentSlide) => {
        // Remove 'active' class from all content items
        $(".content-item").removeClass("active");

        // Add 'active' class to the content item corresponding to the current slide
        const contentSelector = `.content-item[data-slide="${currentSlide}"]`;
        $(contentSelector).addClass("active");
      });

      // Ensure proper active class handling for the thumbnails
      $(".thumbnail-slider").on("afterChange", (event, slick, currentSlide) => {
        const slides = $(".thumbnail-slider .slick-slide");
        slides.removeClass("slick-current slick-active"); // Clear previous active classes

        // Apply active classes to the current thumbnail
        const newActive = slides.filter(`[data-slick-index="${currentSlide}"]`);
        newActive.addClass("slick-current slick-active");
      });

      // Show the previous button after the first scroll (forward or backward)
      $(".thumbnail-slider").on("afterChange", (event, slick, currentSlide) => {
        const totalSlides = slick?.slideCount;

        // Show/hide the previous button
        if (currentSlide > 0) {
          $(".slick-prev").show();
        } else {
          $(".slick-prev").hide();
        }

        // Remove logic for hiding `.slick-next`
        $(".slick-next").show(); // Always keep the next button visible
      });

      // Handle active class application on first load (initialization)
      const firstSlideContentSelector = '.content-item[data-slide="0"]';
      $(firstSlideContentSelector).addClass("active");

      // Remove duplicate content items
      $(".content-item").each(function () {
        if ($(this).hasClass("active")) {
          $(this).siblings().removeClass("active");
        }
      });
    };

    // Detect initial direction
    const isRTL = $("html").attr("dir") === "rtl";
    initSliders(isRTL);

    // Watch for direction changes dynamically
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "dir") {
          const newRTL = $("html").attr("dir") === "rtl";
          initSliders(newRTL); // Reinitialize with updated direction
        }
      });
    });

    // Start observing <html> for changes
    observer.observe(document.documentElement, { attributes: true });
  } catch (error) {
    console.error("Error initializing Slick sliders:", error);
  }
};

// SLICK-END

// STORY-SLIDER START

// const initializeNewSlider = () => {
//   try {
//     // Ensure Slick is loaded
//     if (typeof $.fn.slick === 'undefined') {
//       console.error('Slick is not loaded.');
//       return;
//     }

//     // Function to initialize sliders
//     const initSliders = (isRTL) => {
//       // Destroy existing sliders if they are already initialized
//       if ($('#new-image-slider').hasClass('slick-initialized')) {
//         $('#new-image-slider').slick('unslick');
//       }
//       if ($('#new-thumbnail-slider').hasClass('slick-initialized')) {
//         $('#new-thumbnail-slider').slick('unslick');
//       }

//       // Main image slider options
//       const mainSliderOptions = {
//         rtl: isRTL, // Dynamically set RTL mode
//         arrows: false,
//         autoplay: false,
//         infinite: false,
//         speed: 1000,
//         slidesToShow: 3,
//         slidesToScroll: 1,
//         fade: false,
//         asNavFor: '#new-thumbnail-slider',
//         autoplaySpeed: 3000,
//         draggable: true,
//         swipe: true,
//         responsive: [
//           {
//             breakpoint: 768,
//             settings: {
//               slidesToShow: 1,
//               slidesToScroll: 1,
//             },
//           },
//         ],
//       };

//       // Thumbnail slider options
//       const thumbnailSliderOptions = {
//         rtl: isRTL, // Dynamically set RTL mode
//         slidesToShow: 3,
//         slidesToScroll: 1,
//         asNavFor: '#new-image-slider',
//         focusOnSelect: true,
//         infinite: false,
//         draggable: true,
//         swipe: true,
//         responsive: [
//           {
//             breakpoint: 768,
//             settings: {
//               slidesToShow: 3,
//               slidesToScroll: 1,
//             },
//           },
//         ],
//       };

//       // Initialize sliders
//       $('#new-image-slider').slick(mainSliderOptions);
//       $('#new-thumbnail-slider').slick(thumbnailSliderOptions);
//     };

//     // Initial setup based on current RTL state
//     const isRTL = $('html').attr('dir') === 'rtl';
//     initSliders(isRTL);

//     // Watch for changes in the <html> dir attribute
//     const observer = new MutationObserver((mutations) => {
//       mutations.forEach((mutation) => {
//         if (mutation.attributeName === 'dir') {
//           const newRTL = $('html').attr('dir') === 'rtl';
//           initSliders(newRTL); // Reinitialize sliders with updated RTL state
//         }
//       });
//     });

//     // Observe the <html> tag for changes to the dir attribute
//     observer.observe(document.documentElement, { attributes: true });

//   } catch (error) {
//     console.error('Error initializing new sliders:', error);
//   }
// };


const initializeNewSlider = () => {
  try {
    if (typeof $.fn.slick === 'undefined') {
      console.error('Slick is not loaded.');
      return;
    }

    const initSliders = (isRTL) => {
      const $mainSlider = $('#new-image-slider');
      const $thumbnailSlider = $('#new-thumbnail-slider');

      // Destroy existing sliders if they are already initialized
      if ($mainSlider.hasClass('slick-initialized')) {
        $mainSlider.slick('unslick');
      }
      if ($thumbnailSlider.hasClass('slick-initialized')) {
        $thumbnailSlider.slick('unslick');
      }

      const mainSliderOptions = {
        rtl: isRTL, // Dynamically set RTL mode
        arrows: false,
        autoplay: false,
        infinite: false,
        speed: 1000,
        slidesToShow: 3,
        slidesToScroll: 1,
        fade: false,
        asNavFor: "#new-thumbnail-slider",
        autoplaySpeed: 3000,
        draggable: true,
        swipe: true,
        swipeToSlide: true,  // Allow swipe to slide directly, not just one at a time
        touchMove: true,     // Enable touch move for swipe behavior
        touchThreshold: 10,  // Threshold for swipe
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 1,
              slidesToScroll: 1,
            },
          },
        ],
      };

      const thumbnailSliderOptions = {
        rtl: isRTL, // Dynamically set RTL mode
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: "#new-image-slider",
        focusOnSelect: true,
        infinite: false,
        draggable: true,
        swipe: true,
        responsive: [
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 1,
            },
          },
        ],
      };

      // Initialize sliders
      $mainSlider.slick(mainSliderOptions);
      $thumbnailSlider.slick(thumbnailSliderOptions);

      // Arrow state logic
      $mainSlider.on('afterChange', function (event, slick, currentSlide) {
        const totalSlides = slick?.slideCount;
        const lastSlideIndex = totalSlides - 1; // Last slide index (for 2020)
        const slidesToShow = slick.options.slidesToShow;

        // Disable "Next" arrow if it's on the last slide (2020)
        if (currentSlide === lastSlideIndex) {
          $('.slick-next').addClass('slick-disabled');
        } else {
          $('.slick-next').removeClass('slick-disabled');
        }

        // Disable "Previous" arrow if it's the first slide
        if (currentSlide === 0) {
          $('.slick-prev').addClass('slick-disabled');
        } else {
          $('.slick-prev').removeClass('slick-disabled');
        }
      });

      // Initial trigger to ensure arrow states are correct
      $mainSlider.trigger('afterChange', [null, $mainSlider.slick('getSlick'), 0]);
    };

    // Detect RTL mode based on <html> dir attribute
    const isRTL = $('html').attr('dir') === 'rtl';
    initSliders(isRTL);

    // Monitor <html> dir attribute for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'dir') {
          const newRTL = $('html').attr('dir') === 'rtl';
          initSliders(newRTL); // Reinitialize sliders when RTL state changes
        }
      });
    });

    // Observe changes to the <html> tag's 'dir' attribute
    observer.observe(document.documentElement, { attributes: true });
  } catch (error) {
    console.error("Error initializing new sliders:", error);
  }
};







// STORY-SLIDER END

// ACCORIDAN-START

document.addEventListener("DOMContentLoaded", function () {
  // Select all accordion containers on the page
  const accordions = document.querySelectorAll(".accordion");

  accordions.forEach((accordion) => {
    const buttons = accordion.querySelectorAll(".accordion-button");

    buttons.forEach((button) => {
      button.addEventListener("click", function () {
        // Get the target panel using the data-target attribute
        const targetId = this.getAttribute("data-target");
        const targetPanel = document.querySelector(targetId);

        if (!targetPanel) {
          console.error(`Panel with ID "${targetId}" not found.`);
          return;
        }

        // Check if the target panel is already open
        const isActive = targetPanel.classList.contains("active");

        // Collapse all panels in this accordion
        accordion.querySelectorAll(".accordion-panel").forEach((panel) => {
          panel.classList.remove("active"); // Collapse all
          panel.style.maxHeight = null; // Reset the max-height
          panel.previousElementSibling
            .querySelector(".accordion-button")
            .classList.add("collapsed");
        });

        // If the panel was not active, expand it
        if (!isActive) {
          targetPanel.classList.add("active"); // Open the clicked panel
          targetPanel.style.maxHeight = targetPanel.scrollHeight + "px"; // Set the height based on content
          this.classList.remove("collapsed"); // Change button state to expanded
        }
      });
    });
  });
});

// ACCORIDAN-END

// SHOW-HIDE DIV

// Add event listener to the close icon
const closeIcon = document.getElementById("clsIcon");
if (closeIcon) {
  document.getElementById("clsIcon").addEventListener("click", function () {
    // Find the parent element of the close icon
    const searchValueElement = document.querySelector(".searchValues");

    // Remove the searchValues element from the DOM
    if (searchValueElement) {
      searchValueElement.remove();
    }
  });
}

// SHOW-HIDE DIV

// CUSTOM-DROP START

$(document).ready(function () {
  // Ensure that the event handler is applied after Handlebars rendering

  // Toggle dropdown visibility when .init is clicked
  $(document).on("click", "ul.ct_dropdown .init", function () {
    // Toggle visibility of all options inside the closest dropdown
    $(this).closest("ul.ct_dropdown ").children("li:not(.init)").toggle();
  });

  // Handle the selection of an option
  $(document).on("click", "ul.ct_dropdown li:not(.init)", function () {
    var parentUl = $(this).closest("ul"); // Get the closest dropdown ul
    var allOptions = parentUl.children("li:not(.init)"); // Get all the options in the dropdown

    // Remove 'selected' class from all options in the current dropdown
    allOptions.removeClass("selected");

    // Add 'selected' class to the clicked option
    $(this).addClass("selected");

    // Update the .init text to the selected option
    parentUl.children(".init").html($(this).html());

    // Toggle the options visibility
    allOptions.toggle();
  });
});

// CUSTOM-DROP END

// MAPBOX-START
const initializeWhereToBuyMapbox = (url) => {
  const handleMapResizeOnTabChange = (tabSelector, mapInstance) => {
    if ($(tabSelector).length) {
      $(document).on("shown.bs.tab", tabSelector, function () {
        if (mapInstance) {
          mapInstance.resize();
        } else {
          console.error("Map instance is not initialized.");
        }
      });
    }
  };

  const selectElement = document.querySelector(".form-select.countryDrops");
  const selectedValue = selectElement.value;
  const apiEndpoint = url;

  const initializeMapWithData = (storesList) => {
    const coordinatesArray = storesList.map((store) => store.coordinates);

    // Initialize the Mapbox map
    const map = new mapboxgl.Map({
      container: "wheretobuyMapframe",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [54.3773, 24.4539], // Default position for UAE (Abu Dhabi)
      zoom: 5,
    });

    // Disable scroll zoom
    map.scrollZoom.disable();

    // Enable scroll zoom on click
    map.on("click", () => {
      map.scrollZoom.enable();
    });

    handleMapResizeOnTabChange(".whereWrapper .locationTabs .filBtn", map);

    let markers = [];

    // Function to clear all markers from the map
    const clearMarkers = () => {
      markers.forEach((marker) => marker.remove());
      markers = [];
    };

    // Function to clear all previously opened popups
    const clearPopups = () => {
      markers.forEach((marker) => {
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
        const coordinates = location.split(",").map(Number);
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
        const marker = new mapboxgl.Marker({ color: "red" })
          .setLngLat(coordinates)
          .setPopup(popup)
          .addTo(map);

        markers.push(marker);
      });
    };

    // Add red markers for the initial selection
    const objData = { locations: coordinatesArray, storesList: storesList };
    addRedMarkers(objData);

    // Center map on the first location's coordinates
    const firstLocation = coordinatesArray[0].split(",").map(Number);
    map.setCenter(firstLocation);

    // Listen for dropdown selection change
    selectElement.addEventListener("change", () => {
      const wheretobuyElement = document.querySelector(
        ".form-select#countryDrops"
      );
      const inStoreApi = wheretobuyElement.getAttribute("data-url");
      const selectedValue = selectElement.value;
      const fetchUrl = `${inStoreApi}?countryId=${selectedValue}`;

      // Fetch new data and update markers
      fetchStores(fetchUrl, selectedValue, (newData) => {
        const newCoordinatesArray = newData.map((store) => store.coordinates);
        const objData = { locations: newCoordinatesArray, storesList: newData };

        clearMarkers();
        addRedMarkers(objData);
        const firstLocation = newCoordinatesArray[0].split(",").map(Number);
        map.setCenter(firstLocation);
      });
    });
  };

  // Initial data fetch and map initialization
  fetchStores(apiEndpoint, selectedValue, initializeMapWithData);
};


export { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toggleBtns, initializeNewSlider };
