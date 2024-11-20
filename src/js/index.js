import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn } from './utils.js';
import { fetchAssets, fetchProducts } from './api.js'
import { fetchAndRenderData, fetchOnlineStore, fetchRecipes } from './fetchAndRenderData.js';

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

let showMoreClicked = false; // Global flag


function getProductList(template, url, selectedValue, productCatId, offset, limit) {
  fetchAndRenderData(template, url, selectedValue, productCatId, offset, limit)
    .then(obj => {
      const { html, isEmpty } = obj;
      const container = document.querySelector('#cardcontainer');
      if (!container) {
        console.warn('Container #cardcontainer not found.');
        return;
      }

      if (showMoreClicked) {
        container.innerHTML += html; // Append HTML for "Show More"
      } else {
        container.innerHTML = html; // Replace HTML for new selection
      }
      const showMoreButton = document.getElementById("productShowMore");
      if (isEmpty) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    })
    .catch(error => {
      console.error('Error fetching product list:', error);
    });
}

function fetchOnlineStores(templateName, selectedValue, apiUrl, limit, offset, keyword) {
  const url = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}`;

  fetchOnlineStore(templateName, selectedValue, url)
    .then(obj => {
      const { html, isEmpty } = obj;
      const container = document.getElementById('onlinecontainers');
      if (!container) {
        console.warn('Container with ID "onlinecontainer" not found.');
        return;
      }

      if (showMoreClicked) {
        container.innerHTML += html;
      } else {
        container.innerHTML = html;
      }
      const showMoreButton = document.querySelector('#onlineShowMore');
      if (isEmpty) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    })
    .catch(error => {
      console.error('Error fetching/rendering online stores:', error);
    });
}

const contactForms = async () => {
  const form = document.querySelector('.contactForms');
  if (form) {
      form.addEventListener('submit', function (e) {
          e.preventDefault();

          let valid = true;

          // Full Name Validation
          const fullName = document.querySelector('input[placeholder="Enter Full Name"]');
          if (!fullName.value.trim()) {
              alert("Full Name is required.");
              valid = false;
          }

          // Email Validation
          const email = document.querySelector('input[type="email"]');
          if (!email.value.trim() || !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email.value)) {
              alert("Please enter a valid email address.");
              valid = false;
          }

          // Phone Number Validation
          const phone = document.querySelector('#mobileNumber');
          if (!phone.value.trim() || !/^\d{10,12}$/.test(phone.value)) {
              alert("Please enter a valid phone number (10-12 digits).");
              valid = false;
          }

          // Dropdown Validation
          const subject = document.querySelector('select');
          if (!subject.value) {
              alert("Please select a subject.");
              valid = false;
          }

          // Message Validation
          const message = document.querySelector('textarea');
          if (!message.value.trim() || message.value.trim().length < 10) {
              alert("Please enter a message with at least 10 characters.");
              valid = false;
          }

          // If form is valid, submit it
          if (valid) {
              this.submit();
          }
      });
  }
}

// Ensure code runs after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  
  // Cache commonly used elements
  const elements = {
    imageSlider: document.querySelector('.image-slider'),
    thumbnailSlider: document.querySelector('.thumbnail-slider'),
    contentItem: document.querySelector('.content-item'),
    whatSlider: document.querySelector('.whatSlider'),
    filtCatSpc: document.getElementById('filt-catSpc'),
    priceRangeSlider: document.getElementById('price-range-slider'),
    priceRangeSliders: document.getElementById('price-range-sliders'),
    mapFrame: document.getElementById('mapFrame'),
    whereToBuyMapFrame: document.getElementById('wheretobuyMapframe'),
    searchInput: document.querySelector('#searchInpts'),
    selectElement: document.querySelector('.form-select'),
    productListElement: document.querySelector('.productList'),
    productDropdown: document.querySelector('#productDropdown'),
    recipeDropdown: document.querySelector('#recipeDropdown'),
    productButton: document.querySelector('#productShowMore'),
    recipeButton: document.querySelector('#recipeshowmore'),
    video: document.getElementById("myVideo"),
    playButton: document.getElementById("playButton"),
    onlineShowMore: document.querySelector('#onlineShowMore'),
    mainHeader: document.querySelector('.main-header'),
    productCatId: document.querySelector('.categ_filter.filBtn')
    // productCatId: document.querySelector('.categ_filter.filBtn')
  };

  let selectedDifficulty = null;
  let selectedPrepTime = null;

  if (elements.imageSlider || elements.thumbnailSlider || elements.contentItem || elements.whatSlider) {
    initializeSlick();
  } else {
    console.warn('Slick slider elements not found in the DOM.');
  }

  if (elements.recipeDropdown) {
    
  let selectedMealType = null;
  let selectedCuisine = null;
  let selectedIngredients = null;
  let selectedDietaryNeeds = null;
  let selectedOccasion = null;
  let selectedSeason = null;


  document.querySelectorAll('.filBtn').forEach(button => {
    button.addEventListener('click', (event) => {
      selectedMealType = event.target.getAttribute('data-id');
    });
  });

  const cuisineSelect = document.querySelector('#cuisineselect');
  cuisineSelect.addEventListener('change', (event) => {
    selectedCuisine = event.target.value;
  });

  const productIngredientSelect = document.querySelector('#product-ingredients');
  productIngredientSelect.addEventListener('change', (event) => {
    selectedIngredients = event.target.value;
  });

  const dietaryNeedsSelect = document.querySelector('#dietary-needs');
  dietaryNeedsSelect.addEventListener('change', (event) => {
    selectedDietaryNeeds = event.target.value;
  });

  const occasionSelect = document.querySelector('#occasion');
  occasionSelect.addEventListener('change', (event) => {
    selectedOccasion = event.target.value;
  });

  document.getElementById('resetButton').addEventListener('click', () => {
    window.location.reload();
});
document.getElementById('resettopbutton').addEventListener('click', () => {
  window.location.reload();
});


  const seasonSelect = document.querySelector('#season');
  seasonSelect.addEventListener('change', (event) => {
    selectedSeason = event.target.value;
  });

  let recipeCatId;
  const activeButton = document.querySelector('.categ_filter .filBtn.active');
  if (activeButton) {
    recipeCatId = activeButton.getAttribute('data-umb-id');
  } else {
    recipeCatId = 0; // Default to 0 if no active button is found
  }

  // Event listener for the submit button
  let recipeSelectedValue = elements.recipeDropdown ? elements.recipeDropdown.value : '';
  const url = elements.recipeButton.getAttribute('data-api');
  const limit = parseInt(elements.recipeButton.getAttribute('data-limit'), 10) || 0;
  let offset = parseInt(elements.recipeButton.getAttribute('data-offset'), 10) || 0;
  const submitButton = document.querySelector('#submit-button');
  console.log('limit------',limit)
  const data = {
    mealType: selectedMealType,
    cuisine: selectedCuisine,
    ingredients: selectedIngredients,
    dietaryNeeds: selectedDietaryNeeds,
    occasion: selectedOccasion,
    season: selectedSeason,
    difficulty: selectedDifficulty,
    prepTime: selectedPrepTime,
    recipeCatId: recipeCatId,
    recipeSelectedValue: recipeSelectedValue,
    url: url,
    limit: limit,
    offset: offset,
    keyword:''
  }

  fetchRecipes('recipelist-template', data).then(obj => {
    const { html, isEmpty } = obj;
    const container = document.getElementById('recipecontainer');
    if (!container) {
      console.warn('Container with ID "onlinecontainer" not found.');
      return;
    }

    if (showMoreClicked) {
      container.innerHTML += html;
    } else {
      container.innerHTML = html;
    }
    const showMoreButton = document.querySelector('#recipeshowmore');
    if (isEmpty) {
      showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
    } else {
      showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
    }
  }).catch(error => {
    console.error('Error fetching/rendering online stores:', error);
  });

    elements.recipeDropdown.addEventListener('change', () => {
      elements.recipeDropdown.setAttribute('data-offset', '0');
      offset = 0; // Reset offset variable
      const selectedValue = elements.recipeDropdown.value; // Update selected value
      showMoreClicked = false;
      data.offset = 0;
      fetchRecipes('recipelist-template', data).then(obj => {
        const { html, isEmpty } = obj;
        const container = document.getElementById('recipecontainer');
        if (!container) {
          console.warn('Container with ID "onlinecontainer" not found.');
          return;
        }
  
        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const showMoreButton = document.querySelector('#recipeshowmore');
        if (isEmpty) {
          showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
        } else {
          showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
        }
      })
        .catch(error => {
          console.error('Error fetching/rendering online stores:', error);
        });
      // getProductList('productlist-template', url, selectedValue, productCatId, offset, limit);
    });

    elements.searchInput.addEventListener('input', () => {
      if (elements.searchInput.value.length >= 3) {
        data.limit = parseInt(elements.recipeButton?.getAttribute('data-limit'), 10) || 0;
        showMoreClicked = false;
        data.keyword = elements.searchInput.value;
        data.offset = 0; // Reset offset
        fetchRecipes('recipelist-template', data).then(obj => {
          const { html, isEmpty } = obj;
          const container = document.getElementById('recipecontainer');
          if (!container) {
            console.warn('Container with ID "onlinecontainer" not found.');
            return;
          }
    
          if (showMoreClicked) {
            container.innerHTML += html;
          } else {
            container.innerHTML = html;
          }
          const showMoreButton = document.querySelector('#recipeshowmore');
          if (isEmpty) {
            showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
          } else {
            showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
          }
        })
          .catch(error => {
            console.error('Error fetching/rendering online stores:', error);
          });
        // fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, keyword);
      }
    });

    submitButton.addEventListener('click', () => {
      let recipeSelectedValue = elements.recipeDropdown ? elements.recipeDropdown.value : '';
      const url = elements.recipeButton.getAttribute('data-api');
      const limit = parseInt(elements.recipeButton.getAttribute('data-limit'), 10) || 0;
      showMoreClicked = true;
      let offset = parseInt(elements.recipeButton.getAttribute('data-offset'), 10) || 0;
      const data = {
        mealType: selectedMealType,
        cuisine: selectedCuisine,
        ingredients: selectedIngredients,
        dietaryNeeds: selectedDietaryNeeds,
        occasion: selectedOccasion,
        season: selectedSeason,
        difficulty: selectedDifficulty,
        prepTime: selectedPrepTime,
        recipeCatId: recipeCatId,
        recipeSelectedValue: recipeSelectedValue,
        url: url,
        limit: limit,
        offset: offset,
      };
      fetchRecipes('recipelist-template', data).then(obj => {
        const { html, isEmpty } = obj;
        const container = document.getElementById('recipecontainer');
        if (!container) {
          console.warn('Container with ID "onlinecontainer" not found.');
          return;
        }
  
        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const showMoreButton = document.querySelector('#recipeshowmore');
        // if (isEmpty) {
        //   showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
        // } else {
        //   showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
        // }
      })
        .catch(error => {
          console.error('Error fetching/rendering online stores:', error);
        });
    });

    elements.recipeButton.addEventListener('click', (event) => {
      event.preventDefault();
      showMoreClicked = true;
      data.offset = offset += limit; // Increment offset
      elements.recipeButton.setAttribute('data-offset', offset);
      fetchRecipes('recipelist-template', data).then(obj => {
        const { html, isEmpty } = obj;
        const container = document.getElementById('recipecontainer');
        if (!container) {
          console.warn('Container with ID "onlinecontainer" not found.');
          return;
        }
  
        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const showMoreButton = document.querySelector('#recipeshowmore');
        if (isEmpty) {
          showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
        } else {
          showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
        }
      })
        .catch(error => {
          console.error('Error fetching/rendering online stores:', error);
        });
    });

  const closeButton = document.querySelector('#recipeclose');
  if(closeButton){
    closeButton.addEventListener('click', (event) => {
      const target = event.target.closest('#recipeclose');
      showMoreClicked = false;
      if (target) {
        fetchRecipes('recipelist-template', data).then(obj => {
          const { html, isEmpty } = obj;
          const container = document.getElementById('recipecontainer');
          if (!container) {
            console.warn('Container with ID "onlinecontainer" not found.');
            return;
          }
    
          if (showMoreClicked) {
            container.innerHTML += html;
          } else {
            container.innerHTML = html;
          }
          const showMoreButton = document.querySelector('#recipeshowmore');
          if (isEmpty) {
            showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
          } else {
            showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
          }
        })
          .catch(error => {
            console.error('Error fetching/rendering online stores:', error);
          });
      }
    });
  }

  }



  contactForms()


  // Define the fetchRecipes function
  // const fetchRecipes = (data) => {
  //   // Add your logic to fetch recipes using mealType and cuisine
  // };

  // Initialize slick sliders if required elements are present
  

  // Initialize other components if elements are present
  if (elements.filtCatSpc) {
    toogleBtn();
  }
  if (elements.mapFrame) {
    initializeMapbox();
  }


  if (elements.priceRangeSlider || elements.priceRangeSliders) {
    // priceSliderInitialize(handleSliderUpdate);
    const difficultySlider = document.getElementById("slider-ranges");

if (difficultySlider) {
  // Map difficulty levels to their corresponding data-ids
  const difficulties = [
    { id: 1526, label: "Easy" },
    { id: 1527, label: "Medium" },
    { id: 1528, label: "Hard" },
  ];

  noUiSlider.create(difficultySlider, {
    start: 0, // Start at "Easy" (index 0)
    connect: [true, false],
    range: {
      min: 0,
      max: difficulties.length - 1, // Adjust max based on array length
    },
    step: 1,
    format: {
      to: (value) => difficulties[Math.round(value)].id, // Return the data-id
      from: (value) =>
        difficulties.findIndex((difficulty) => difficulty.id === parseInt(value)),
    },
  });

  difficultySlider.noUiSlider.on("update", (values) => {
    const selectedId = values[0]; // Get the selected data-id
    selectedDifficulty = selectedId;
    console.log("Selected difficulty ID:", selectedId);
  });
} else {
  console.error("Difficulty slider not found in DOM");
}

    // Preparation Time Slider
    const prepTimeSlider = document.getElementById("slider-range");
    if (prepTimeSlider) {
      noUiSlider.create(prepTimeSlider, {
        start: 1,
        connect: [true, false],
        range: {
          min: 5,
          max: 60,
        },
        format: {
          to: (value) => `${value.toFixed(0)} mins`,
          from: (value) => Number(value.replace(" mins", "")),
        },
      });

      prepTimeSlider.noUiSlider.on("update", (values) => {
        const prepTime = values[0];
        selectedPrepTime = prepTime;
      });
    } else {
      console.error('Preparation time slider not found in DOM');
    }
  }

  if (elements.productButton) {
    // Default selectedValue to empty string if productDropdown is not found
    let selectedValue = elements.productDropdown ? elements.productDropdown.value : '';

    // Find the initial active button and get its `data-umb-id`
    let productCatId;
    const activeButton = document.querySelector('.categ_filter .filBtn.active');
    if (activeButton) {
      productCatId = activeButton.getAttribute('data-umb-id');
    } else {
      productCatId = 0; // Default to 0 if no active button is found
    }

    const url = elements.productButton.getAttribute('data-api');
    const limit = parseInt(elements.productButton.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(elements.productButton.getAttribute('data-offset'), 10) || 0;

    showMoreClicked = false;

    // Initial call to fetch products
    getProductList('productlist-template', url, selectedValue, productCatId, offset, limit);

    // Add event listener for dropdown only if it exists
    if (elements.productDropdown) {
      elements.productDropdown.addEventListener('change', () => {
        elements.productButton.setAttribute('data-offset', '0');
        offset = 0; // Reset offset variable
        selectedValue = elements.productDropdown.value; // Update selected value
        showMoreClicked = false;
        getProductList('productlist-template', url, selectedValue, productCatId, offset, limit);
      });
    }

    // Event listener for "Show More" button clicks
    elements.productButton.addEventListener('click', (event) => {
      event.preventDefault();
      showMoreClicked = true;
      offset += limit; // Increment offset
      elements.productButton.setAttribute('data-offset', offset);
      getProductList('productlist-template', url, selectedValue, productCatId, offset, limit);
    });
  }


  const closeButton = document.querySelector('#instoreclose');
  const onlineCloseButton = document.querySelector('#onlinestoreclose');


  if (closeButton) {
    closeButton.addEventListener('click', (event) => {
      const wheretobuyElement = document.querySelector('.form-select#countryDrops');
      const target = event.target.closest('#instoreclose');
      const inStoreApi = wheretobuyElement.getAttribute('data-url');
      showMoreClicked = false;
      if (target) {
        const selectedCountry = wheretobuyElement.value;
        const fullApiUrl = `${inStoreApi}?countryId=${selectedCountry}`;
        initializeWhereToBuyMapbox(fullApiUrl);
      }
    });
  }

  if (onlineCloseButton) {
    onlineCloseButton.addEventListener('click', (event) => {
      const wheretobuyElement = document.querySelector('.form-select#countryselect');
      const target = event.target.closest('#onlinestoreclose');
      const inStoreApi = wheretobuyElement.getAttribute('data-url');
      const buttonElement = document.querySelector('#onlineShowMore');
      const limit = parseInt(buttonElement?.getAttribute('data-limit'), 10) || 0;
      let offset = 0;
      showMoreClicked = false;
      if (target) {
        const selectedCountry = wheretobuyElement.value;
        fetchOnlineStores('online-template', selectedCountry, inStoreApi, limit, offset, '');
      }
    });
  }


  if (elements.whereToBuyMapFrame) {
    const selectElement = document.querySelector('.form-select#countryselect');
    const countryselect = document.querySelector('#countryselect');
    const apiEndpoint = selectElement.getAttribute('data-url');
    const buttonElement = document.querySelector('#onlineShowMore');
    const limit = parseInt(buttonElement?.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(buttonElement?.getAttribute('data-offset'), 10) || 0;
    showMoreClicked = false;
    const selectedValue = selectElement.value;
    fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, '');
    // Event listener for dropdown change
    countryselect.addEventListener('change', () => {
      const selectedValue = selectElement.value;
      offset = 0; // Reset offset
      buttonElement.setAttribute('data-offset', '0');
      showMoreClicked = false;
      fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, '');
    });

    // Event listener for "Show More" button
    buttonElement.addEventListener('click', (event) => {
      event.preventDefault();
      showMoreClicked = true;
      offset += limit;
      buttonElement.setAttribute('data-offset', offset);
      const selectedValue = selectElement.value;
      fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, '');
    });

    elements.searchInput.addEventListener('input', () => {
      if (elements.searchInput.value.length >= 3) {
        const limit = parseInt(buttonElement?.getAttribute('data-limit'), 10) || 0;
        showMoreClicked = false;
        offset = 0; // Reset offset
        const keyword = elements.searchInput.value;
        const selectedValue = selectElement.value;
        fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, keyword);
      }
    });

    const wheretobuyElement = document.querySelector('.form-select#countryDrops');
    const countryElement = document.querySelector('#countryDrops');
    const inStoreApi = wheretobuyElement.getAttribute('data-url');
    const searchInput = document.querySelector('#inStoreSearchInpts');

    // Get selected country from the dropdown initially
    const selectedCountry = wheretobuyElement.value;

    // Form the full API URL
    const fullApiUrl = `${inStoreApi}?countryId=${selectedCountry}`;

    initializeWhereToBuyMapbox(fullApiUrl);

    // Event listener for search input change
    searchInput.addEventListener('input', () => {
      const keyword = searchInput.value;

      // Only make the API call if the keyword length is greater than or equal to 3
      if (keyword.length >= 3) {
        const selectedCountry = wheretobuyElement.value;
        const fullApiUrl = `${inStoreApi}?countryId=${selectedCountry}&keyword=${encodeURIComponent(keyword)}`;
        initializeWhereToBuyMapbox(fullApiUrl);
      }
    });
  }

  // Video Play Button Handling
  if (elements.video && elements.playButton) {
    elements.playButton.addEventListener("click", playVideo);
    elements.video.addEventListener("click", toggleVideoPlayPause);

    function playVideo() {
      elements.video.play().then(() => {
        elements.playButton.style.display = "none";
      }).catch(error => {
        console.error("Playback prevented:", error);
        alert("Click to play was blocked by the browser.");
      });
    }

    function toggleVideoPlayPause() {
      if (elements.video.paused) {
        playVideo();
      } else {
        elements.video.pause();
        elements.playButton.style.display = "flex";
      }
    }
  }

  // Search Bar Expand/Collapse Handlers
  $('.search-button').on('click', () => {
    $('.search-form').addClass('expanded');
    $('.close-button').show();
    $('.search-button').hide();
  });

  $('.close-button').on('click', () => {
    $('.search-form').removeClass('expanded');
    $('.close-button').hide();
    $('.search-button').show();
    $('#searchBar').val('');
  });

  // Location Search Expand/Collapse Handlers
  $('.serLoc').on('click', () => {
    $('.locatSearch').addClass('expanded');
    $('.cl_ser').show();
    $('.serLoc').hide();
  });

  $('.cl_ser').on('click', () => {
    $('.locatSearch').removeClass('expanded');
    $('.cl_ser').hide();
    $('.serLoc').show();
    $('.search-bar').val('');
  });

  // Mobile Dropdown Toggle
  document.querySelectorAll('.dropdown-toggle').forEach(dropdown => {
    dropdown.addEventListener('click', event => {
      if (isMobileViewport()) {
        const dropdownMenu = dropdown.nextElementSibling;
        toggleDropdown(dropdownMenu, event);
      }
    });
  });

  // Mobile Dropdown Close on Outside Click
  document.addEventListener('click', () => {
    if (isMobileViewport()) {
      closeAllDropdowns();
    }
  });

  // Handle window resize to re-check mobile viewport and close dropdowns
  window.addEventListener('resize', closeAllDropdowns);

  function isMobileViewport() {
    return window.innerWidth <= 991;
  }

  function toggleDropdown(dropdownMenu, event) {
    if (dropdownMenu.classList.contains('show')) {
      dropdownMenu.classList.remove('show');
    } else {
      closeAllDropdowns();
      dropdownMenu.classList.add('show');
    }
    event.stopPropagation();
  }

  function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => dropdown.classList.remove('show'));
  }

  // Header Scroll Appearance
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


// COUNTRY-DROPDOWN START
const dropdownItems = document.querySelectorAll('.dropdown-item');
const dropdownButton = document.getElementById('countryDropdown');

dropdownItems.forEach(item => {
  item.addEventListener('click', function (e) {
    e.preventDefault();
    const selectedValue = this.getAttribute('data-value');
    const flagImg = this.querySelector('img').outerHTML;
    dropdownButton.innerHTML = `${flagImg} <span class="codes">${selectedValue}</span>`;
  });
});

// COUNTRY-DROPDOWN END
