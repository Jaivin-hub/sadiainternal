import $, { error } from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Mustache from 'mustache';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toggleBtns, initializeNewSlider } from './utils.js';
import { fetchAssets, fetchProducts } from './api.js'
import { fetchAndRenderData, fetchOnlineStore, fetchRecipes, fetchCookingHacks } from './fetchAndRenderData.js';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';
import dataList from '../assets/json/data.json';


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


function getProductList(template, url, selectedValue, productTypeId, offset, limit, productCatId) {
  const lang = document.body.getAttribute('umb-lang');
  fetchAndRenderData(template, url, selectedValue, productTypeId, offset, limit, lang, productCatId)
    .then(obj => {
      const { html, isEmpty, totalCount } = obj;
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
      const productCards = document.querySelectorAll('.productCard');
      const productCardCount = productCards.length;
      if (isEmpty || productCardCount == totalCount) {
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
  const lang = document.body.getAttribute('umb-lang');
  const url = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}&lang=${lang}`;
  fetchOnlineStore(templateName, selectedValue, url)
    .then(obj => {
      const { html, isEmpty, totalCount } = obj;
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
      const shopCards = document.querySelectorAll('.card');
      const shopCardsCount = shopCards.length;
      if (isEmpty || shopCardsCount == totalCount) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    })
    .catch(error => {
      console.error('Error fetching/rendering online stores:', error);
    });
}

const contactForms = () => {
  const form = document.querySelector('#contactForm');
  const fileInput = document.querySelector('#formFileLg');
  const fileNameText = document.querySelector('#fileNameText');
  const phoneInputField = document.getElementById('phoneNumber');
  const phoneError = document.getElementById('phoneError');

  // Initialize intl-tel-input for the phone number field
  const iti = intlTelInput(phoneInputField, {
    initialCountry: "auto", // Auto-detect user's country
    geoIpLookup: function (callback) {
      fetch('https://ipinfo.io/json?token=5cef6dd088fc9f')
        .then((response) => response.json())
        .then((json) => callback(json.country))
        .catch(() => callback('US'));
    },
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js", // For number formatting and validation
  });

  // Validate a single field
  const validateField = (input, errorSelector) => {
    const error = document.querySelector(errorSelector);
    const message = error?.textContent || 'Invalid input';

    // Custom validation for phone number
    if (
      input.id === 'phoneNumber' &&
      (!iti.isValidNumber() || /[^\d]/.test(input.value))
    ) {
      error.textContent = 'Please enter a valid phone number with digits only';
      error.style.display = 'block';
      return false;
    }

    // Custom validation for full name
    if (input.id === 'fullName') {
      if (!input.value.trim()) {
        // Check if the field is empty
        error.textContent = 'Full name is required'; // Use existing error message from HTML
        error.style.display = 'block';
        return false;
      } else if (/[^A-Za-z\s]/.test(input.value)) {
        // Check for special characters
        error.textContent = 'The name should not contain any special characters or numbers';
        error.style.display = 'block';
        return false;
      } else {
        error.style.display = 'none';
        return true;
      }
    }


    // General validation for other fields
    if (!input.value.trim() || (input.type === 'email' && !/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(input.value))) {
      error.textContent = message; // Use existing error message from HTML
      error.style.display = 'block';
      return false;
    } else {
      error.style.display = 'none';
      return true;
    }
  };

  let selectedFile;

  // Update file name when a file is selected
  fileInput.addEventListener('change', () => {
    fileNameText.textContent = fileInput.files.length > 0 ? fileInput.files[0].name : 'Upload attachment';
    selectedFile = fileInput.files[0];
  });

  // Handle form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission

    // Reset all error messages
    const errors = form.querySelectorAll('.error-message');
    errors.forEach((error) => {
      error.style.display = 'none';
    });

    let valid = true;

    // Validate each field dynamically
    valid &= validateField(document.querySelector('#fullName'), '#nameError');
    valid &= validateField(document.querySelector('#email'), '#emailError');
    valid &= validateField(phoneInputField, '#phoneError'); // Validate with intl-tel-input
    valid &= validateField(document.querySelector('#subject'), '#subjectError');
    valid &= validateField(document.querySelector('#message'), '#messageError');

    if (valid) {
      const lang = document.body.getAttribute('umb-lang');
      const nodeIdInput = document.querySelector('#formNodeId');
      const nodeId = nodeIdInput ? nodeIdInput.value : null;

      // Get the full phone number with country code and selected country data
      const fullPhoneNumber = iti.getNumber(); // Full international phone number
      const countryData = iti.getSelectedCountryData(); // Get selected country info
      // Prepare form data
      const formData = new FormData();
      formData.append('fullName', document.querySelector('#fullName').value);
      formData.append('email', document.querySelector('#email').value);
      formData.append('phoneNumber', fullPhoneNumber); // Add formatted phone number
      formData.append('subject', document.querySelector('#subject').value);
      formData.append('message', document.querySelector('#message').value);
      formData.append('nodeId', nodeId);
      formData.append('lang', lang);

      // Append the file only if one is selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      const submitButton = document.querySelector('.subBtn');
      const apiUrl = submitButton.getAttribute('data-url');

      fetch(apiUrl, {
        method: 'POST',
        body: formData, // Use FormData directly
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
          return response.json(); // Assuming the server responds with JSON
        })
        .then((data) => {

          // Hide the form and show the thank you message
          const formElement = document.querySelector('.contactForms');
          const thankYouElement = document.querySelector('.thanksWraper');
          formElement.style.display = 'none';
          thankYouElement.style.display = 'block';

          // Scroll to the thank you message
          thankYouElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        })
        .catch((error) => {
          console.error('Form submission failed:', error);

          // Show an error message to the user (optional)
          alert('There was an issue submitting your form. Please try again.');
        });
    }
  });

  // Validate phone number on blur
  phoneInputField.addEventListener('blur', () => {
    if (iti.isValidNumber() && !/[^\d]/.test(phoneInputField.value)) {
      phoneError.style.display = 'none';
    } else {
      phoneError.style.display = 'block';
    }
  });
};



let selectedDifficulty = null;
let selectedPrepTime = null;


function toggleRecipeSections() {
  let selectedMealType, selectedCuisine, selectedDietaryNeeds, selectedOccasion, recipeCatId, preparationStyle;
  let showMoreClicked = false;
  const submitButton = document.querySelector('#submit-button');
  const recipeDropdown = document.querySelector('#recipeDropdown');
  const cuisineSelect = document.querySelector('#cuisineselect');
  const difficultySelect = document.querySelector('#difficultySelect');
  const preparationTimeSelect = document.querySelector('#preparationSelect');
  const dietaryNeedsSelect = document.querySelector('#dietary-needs');
  const occasionSelect = document.querySelector('#occasion');
  const activeButton = document.querySelector('.categ_filter .filBtn.active');
  const preparationSelect = document.querySelector('#preparation-style');
  const searchInput = document.querySelector('#searchInpts');
  const showMoreButton = document.querySelector('#listingShowMore');
  const closeButton = document.querySelector('#recipeclose');
  const url = submitButton.getAttribute('data-api');
  const limit = parseInt(submitButton.getAttribute('data-limit'), 10) || 0;
  let offset = parseInt(submitButton.getAttribute('data-offset'), 10) || 0;
  const lang = document.body.getAttribute('umb-lang');
  const resetButtons = document.querySelectorAll('#resetButton, #resettopbutton');
  // let selectedPrepTime = null;


  recipeCatId = activeButton ? activeButton.getAttribute('data-umb-id') : 0;

  // document.querySelectorAll('.filBtn').forEach(button => {
  //   button.addEventListener('click', function () {
  //     document.querySelectorAll('.filBtn').forEach(btn => btn.classList.remove('active'));
  //     this.classList.add('active');
  //   });
  // });

  document.addEventListener("click", function (event) {
    // Ensure the clicked element is a filter button
    if (!event.target.classList.contains("filBtn")) return;

    // Find the closest parent filter container (either .categ_filter or .categ_filter.filterWrap)
    let parentFilterSection = event.target.closest(".categ_filter.filterWrap") || 
                              event.target.closest(".categ_filter");

    if (!parentFilterSection) return; // Safety check

    // Remove 'active' only from buttons within the clicked section
    parentFilterSection.querySelectorAll(".filBtn").forEach((btn) => btn.classList.remove("active"));

    // Add 'active' class to the clicked button
    event.target.classList.add("active");

    // Store the selected filter value (optional)
    window.selectedMealType = event.target.getAttribute("data-id") || event.target.getAttribute("data-umb-id");
});





  // Helper function to prepare request data
  function prepareRequestData(keyword = '', filter = '') {
    return {
      mealType: selectedMealType,
      cuisine: selectedCuisine,
      dietaryNeeds: selectedDietaryNeeds,
      occasion: selectedOccasion,
      season: '',
      difficulty: selectedDifficulty,
      prepTime: selectedPrepTime,
      recipeCatId: recipeCatId,
      recipeSelectedValue: recipeDropdown ? recipeDropdown.value : '',
      preparationStyle: preparationStyle,
      url: url,
      limit: limit,
      offset: offset,
      keyword: keyword,
      filter: filter,
      lang: lang
    };
  }

  // Helper function to update recipe list
  function updateRecipeList(data) {
    fetchRecipes('all-recipelist-template', data)
      .then(({ html, isEmpty, totalCount }) => {
        const container = document.getElementById('defaultlistspace');
        if (!container) {
          console.warn('Container with ID "defaultlistspace" not found.');
          return;
        }
        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const recipeCards = document.querySelectorAll('.recipeCard');
        const recipeCardCount = recipeCards.length;
        if (isEmpty || recipeCardCount == totalCount) {
          showMoreButton.style.display = "none";
        } else {
          showMoreButton.style.display = "block";
        }
      })
      .catch(error => console.error('Error fetching/rendering recipes:', error));
  }

  // Function to handle the 'Show More' button
  function handleShowMoreButton() {
    if (!showMoreButton) return;
    showMoreButton.addEventListener('click', (event) => {
      showMoreClicked = true;
      event.preventDefault();
      offset += limit; // Increment offset
      showMoreButton.setAttribute('data-offset', offset);

      const data = prepareRequestData();
      updateRecipeList(data);
    });
  }

  // Function to handle the close button
  function handleCloseButton() {
    if (!closeButton) return;
    closeButton.addEventListener('click', (event) => {
      const target = event.target.closest('#recipeclose');
      showMoreClicked = false;
      if (target) {
        const data = prepareRequestData();
        updateRecipeList(data);
      }
    });
  }

  // Bind event listeners
  function bindEventListeners() {
    document.querySelectorAll('.filBtn').forEach(button => {
      button.addEventListener('click', (event) => {
        selectedMealType = event.target.getAttribute('data-id');
      });
    });

    cuisineSelect.addEventListener('change', (event) => {
      selectedCuisine = event.target.value;
    });

    preparationTimeSelect.addEventListener('change', (event) => {
      selectedPrepTime = event.target.value === '' || event.target.value === 'Select Time' ? null : event.target.value;
    });

    difficultySelect.addEventListener('change', (event) => {
      selectedDifficulty = event.target.value === '' || event.target.value === 'Select Difficulty' ? null : event.target.value;
    });

    dietaryNeedsSelect.addEventListener('change', (event) => {
      selectedDietaryNeeds = event.target.value;
    });

    occasionSelect.addEventListener('change', (event) => {
      selectedOccasion = event.target.value;
    });

    preparationSelect.addEventListener('change', (event) => {
      preparationStyle = event.target.value;
    });

    recipeDropdown.addEventListener('change', () => {
      submitButton.setAttribute('data-offset', '0');
      showMoreClicked = false;
      offset = 0;
      const keyword = searchInput.value.length >= 3 ? searchInput.value : '';
      updateRecipeList(prepareRequestData(keyword, recipeDropdown.value));
      hideSections()
    });

    searchInput.addEventListener('input', () => {
      if (searchInput.value.length >= 3) {
        offset = 0;
        showMoreClicked = false;
        updateRecipeList(prepareRequestData(searchInput.value));
        hideSections()
      }
    });

    submitButton.addEventListener('click', () => {
      offset = 0;
      showMoreClicked = false;
      const data = prepareRequestData();
      updateRecipeList(data);
      // Scroll to the top of the page after receiving the response
      window.scrollTo({ top: 0, behavior: 'smooth' });
      hideSections();
    });

    handleShowMoreButton();
    handleCloseButton();
  }
  function handleResetButtonsClick() {
    window.location.reload();
  }

  resetButtons.forEach(button => button.addEventListener('click', handleResetButtonsClick));

  // Hide specific sections
  function hideSections() {
    ['allsections'].forEach(id => {
      const section = document.getElementById(id);
      if (section) section.style.display = 'none';
    });
    ['listingShowMore'].forEach(id => {
      const section = document.getElementById(id);
      if (section) section.style.display = 'block';
    });
  }

  // Initialize
  bindEventListeners();
}
let selectedDietaryNeedsData = null;
let mealTypeData = null;
let selectedCuisineData = null;
let selectedDifficultyData = null;
let searchKeywordData = null;
let selectedOccasionData = null;
let preparationStyleData = null;
let preparationTime = null;

function initializeRecipeFilter() {
  parseUrlAndSetVariables()
  scrollActiveButtonToLeft();

  document.getElementById('toggleButton').addEventListener('click', function () {

    // Delay to ensure animations and layout updates
    setTimeout(() => {
      const filterWrap = document.querySelector('.filterWrap.categ_filter');

      const parentContainer = document.querySelector('.filterWrap.catgSpc');
      const activeItem = filterWrap.querySelector('.active');
      // Check if the parent is active
      if (activeItem) {
        scrollActiveButtonToLeft();
      } else {
        console.log('Parent not active');
      }
    }, 300);
  });
  // Selected filters
  let selectedMealType = null;
  let selectedCuisine = null;
  let selectedDietaryNeeds = null;
  let selectedOccasion = null;
  let preparationStyle = null;
  let showMoreClicked = false;
  let difficulties = null;
  let timeTaken = null;
  let offset = 0;

  // DOM Elements
  const submitButton = document.querySelector('#submit-button');
  const cuisineSelect = document.querySelector('#cuisineselect');
  console.log('cuisineSelect==',cuisineSelect)
  const dietaryNeedsSelect = document.querySelector('#dietary-needs');
  const occasionSelect = document.querySelector('#occasion');
  const preparationSelect = document.querySelector('#preparation-style');
  const preparationType = document.querySelector('#preparationSelect');
  const difficultyType = document.querySelector('#difficultySelect');

  const searchInput = document.querySelector('#searchInpts');
  const showMoreButton = document.querySelector('#recipeshowmore');
  const resetButtons = document.querySelectorAll('#resetButton, #resettopbutton');
  const recipeContainer = document.getElementById('recipecontainer');
  const activeButton = document.querySelector('.categ_filter .filBtn.active');
  const recipeDropdown = document.querySelector('#recipeDropdown');
  const closeButton = document.querySelector('#recipeclose');



  // Configurations
  const url = submitButton.getAttribute('data-api');
  const limit = parseInt(submitButton.getAttribute('data-limit'), 10) || 0;
  const lang = document.body.getAttribute('umb-lang');
  const recipeCatId = activeButton ? activeButton.getAttribute('data-umb-id') : 0;

  // Helper function to prepare request data
  function prepareRequestData(keyword = '', recipeSelectedValue = '') {
    let urlParamsData = new URLSearchParams(window.location.search);
    mealTypeData = urlParamsData.get('meal');
    selectedDifficultyData = urlParamsData.get('diff');
    preparationTime = urlParamsData.get('preTime');
    selectedCuisineData = urlParamsData.get('cuis');
    selectedDietaryNeedsData = urlParamsData.get('diet');
    selectedOccasionData = urlParamsData.get('occa');
    preparationStyleData = urlParamsData.get('preStyle');
    searchKeywordData = urlParamsData.get('keyword');
    return {
      mealType: mealTypeData ? mealTypeData : selectedMealType,
      cuisine: selectedCuisineData ? selectedCuisineData : selectedCuisine,
      difficulty: selectedDifficultyData ? selectedDifficultyData : difficulties,
      prepTime: preparationTime ? preparationTime :  selectedPrepTime,
      dietaryNeeds: selectedDietaryNeedsData ? selectedDietaryNeedsData : selectedDietaryNeeds,
      occasion: selectedOccasionData ? selectedOccasionData : selectedOccasion,
      preparationStyle: preparationStyleData ? preparationStyleData : preparationStyle,
      recipeCatId: recipeCatId,
      url,
      limit,
      offset,
      keyword: searchKeywordData ? searchKeywordData : keyword,
      recipeSelectedValue,
      lang,
    };
  }

  function initialRequestData(keyword = '', recipeSelectedValue = '') {
    return {
      mealType: mealTypeData,
      cuisine: selectedCuisineData,
      difficulty: selectedDifficultyData,
      prepTime: selectedPrepTime,
      dietaryNeeds: selectedDietaryNeedsData,
      occasion: selectedOccasionData,
      preparationStyle: preparationStyleData,
      recipeCatId: recipeCatId,
      url,
      limit,
      offset,
      keyword: searchKeywordData,
      recipeSelectedValue,
      lang,
    };
  }

  // Helper function to update the recipe list
  function updateRecipeList(data, type) {
    fetchRecipes('recipelist-template', data, type)
      .then(({ html, isEmpty, totalCount }) => {
        if (showMoreClicked) {
          recipeContainer.innerHTML += html;
        } else {
          recipeContainer.innerHTML = html;
        }
        const recipeCards = document.querySelectorAll('.recipeCard');
        const recipeCardCount = recipeCards.length;
        showMoreButton.style.visibility = isEmpty ? "hidden" : recipeCardCount == totalCount ? "hidden" : "visible";
      })
      .catch(error => console.error('Error fetching recipes:', error));
  }

  // Event Handlers
  // function handleFilterButtonClick(event) {
  //   document.querySelectorAll('.filBtn').forEach(btn => btn.classList.remove('active'));
  //   event.target.classList.add('active');
  //   selectedMealType = event.target.getAttribute('data-id');
  // }

  document.addEventListener("click", function (event) {
    // Ensure the clicked element is a filter button
    if (!event.target.classList.contains("filBtn")) return;

    // Find the closest parent filter container (either .categ_filter or .categ_filter.filterWrap)
    let parentFilterSection = event.target.closest(".categ_filter.filterWrap") || 
                              event.target.closest(".categ_filter");

    if (!parentFilterSection) return; // Safety check

    // Remove 'active' only from buttons within the clicked section
    parentFilterSection.querySelectorAll(".filBtn").forEach((btn) => btn.classList.remove("active"));

    // Add 'active' class to the clicked button
    event.target.classList.add("active");

    // Store the selected filter value (optional)
    window.selectedMealType = event.target.getAttribute("data-id") || event.target.getAttribute("data-umb-id");
});

  function handleDropdownChange(event, type) {
    const value = event.target.value;
    switch (type) {
      case 'cuisine':
        selectedCuisine = value;
        break;
      case 'dietary':
        selectedDietaryNeeds = value;
        break;
      case 'occasion':
        selectedOccasion = value;
        break;
      case 'preparation':
        preparationStyle = value;
        break;
      case 'preparationtime':
        selectedPrepTime = value;
        break;
      case 'difficulty':
        difficulties = value;
        break;
    }
  }

  function handleSearchInput() {
    if (searchInput.value.length >= 3) {
      offset = 0;
      showMoreClicked = false;
      updateRecipeList(prepareRequestData(searchInput.value, recipeDropdown.value));
    }
  }

  function handleRecipeDropdown(event) {
    offset = 0;
    showMoreClicked = false;
    const keyword = searchInput.value.length >= 3 ? searchInput.value : '';
    const selectedFilter = event.target.value;
    updateRecipeList(prepareRequestData(keyword, selectedFilter));
  }

  function handleCloseButton() {
    if (!closeButton) return;
    const target = event.target.closest('#recipeclose');

    showMoreClicked = false;
    if (target) {
      const data = prepareRequestData('', recipeDropdown.value);
      updateRecipeList(data);
    }
  }

  function handleSubmitButtonClick() {
    offset = 0;
    showMoreClicked = false;
    updateRecipeList(prepareRequestData(), 'submit');
  }

  function initialFetch() {
    offset = 0;
    showMoreClicked = false;
    updateRecipeList(prepareRequestData());
  }

  function handleShowMoreButtonClick() {
    showMoreClicked = true;
    offset += limit;
    updateRecipeList(prepareRequestData());
  }

  function handleResetButtonsClick() {
    const url = window.location.origin + window.location.pathname;
    window.history.pushState({}, document.title, url); // Clear query params
    location.reload(); // Reload the page without query parameters
  }


  function scrollActiveButtonToLeft() {
    const filterWrap = document.querySelector('.filterWrap.categ_filter');
    if (filterWrap) {
      const activeItem = filterWrap.querySelector('.btn.active');

      if (activeItem) {
        // Calculate the exact offset for left alignment
        const filterWrapRect = filterWrap.getBoundingClientRect();
        const activeItemRect = activeItem.getBoundingClientRect();
        const offsetToScroll =
          activeItemRect.left - filterWrapRect.left + filterWrap.scrollLeft;
        filterWrap.scrollTo({
          left: offsetToScroll,
          behavior: 'smooth'
        });
      }
    }
  }
  // Function to parse URL and set variables
  function parseUrlAndSetVariables() {
    const urlParams = new URLSearchParams(window.location.search);
    mealTypeData = urlParams.get('meal');
    selectedDifficultyData = urlParams.get('diff');
    selectedPrepTime = urlParams.get('preTime');
    selectedCuisineData = urlParams.get('cuis');
    selectedDietaryNeedsData = urlParams.get('diet');
    selectedOccasionData = urlParams.get('occa');
    preparationStyleData = urlParams.get('preStyle');
    searchKeywordData = urlParams.get('keyword');

    // Select Meal Type
    if (mealTypeData) {
      document.querySelectorAll('.categ_filter .btn').forEach(btn => {
        if (btn.dataset.id === mealTypeData) {
          btn.classList.add('active'); // Highlight selected meal type
        }
      });
    }

    // Select Difficulty
    if (selectedDifficultyData) {
      document.querySelector(`#difficultySelect option[value="${selectedDifficultyData}"]`)?.setAttribute('selected', 'selected');
    }

    // Select Preparation Time
    if (selectedPrepTime) {
      document.querySelector(`#preparationSelect option[value="${selectedPrepTime}"]`)?.setAttribute('selected', 'selected');
    }

    // Select Cuisine
    if (selectedCuisineData) {
      document.querySelector(`#cuisineselect option[value="${selectedCuisineData}"]`)?.setAttribute('selected', 'selected');
    }

    // Select Dietary Needs
    if (selectedDietaryNeedsData) {
      document.querySelector(`#dietary-needs option[value="${selectedDietaryNeedsData}"]`)?.setAttribute('selected', 'selected');
    }

    // Select Occasion
    if (selectedOccasionData) {
      document.querySelector(`#occasion option[value="${selectedOccasionData}"]`)?.setAttribute('selected', 'selected');
    }

    // Select Preparation Style
    if (preparationStyleData) {
      document.querySelector(`#preparation-style option[value="${preparationStyleData}"]`)?.setAttribute('selected', 'selected');
    }

    // Handle Search Keyword (optional)
    if (searchKeywordData) {
      console.log(`Search keyword: ${searchKeywordData}`); // Handle as needed
    }
  }

  // Bind Events
  function bindEvents() {
    // document.querySelectorAll('.filBtn').forEach(button =>
    //   button.addEventListener('click', handleFilterButtonClick)
    // );

    cuisineSelect.addEventListener('change', event => handleDropdownChange(event, 'cuisine'));
    dietaryNeedsSelect.addEventListener('change', event => handleDropdownChange(event, 'dietary'));
    occasionSelect.addEventListener('change', event => handleDropdownChange(event, 'occasion'));
    preparationSelect.addEventListener('change', event => handleDropdownChange(event, 'preparation'));
    preparationType.addEventListener('change', event => handleDropdownChange(event, 'preparationtime'));
    difficultyType.addEventListener('change', event => handleDropdownChange(event, 'difficulty'));

    initialFetch()

    searchInput.addEventListener('input', handleSearchInput);
    submitButton.addEventListener('click', handleSubmitButtonClick);
    showMoreButton.addEventListener('click', handleShowMoreButtonClick);
    recipeDropdown.addEventListener('change', handleRecipeDropdown);
    closeButton.addEventListener('click', handleCloseButton)
    resetButtons.forEach(button => button.addEventListener('click', handleResetButtonsClick));
  }

  // Initialize
  bindEvents();
}



const cookingHacksSection = () => {
  let selectedOccasion, selectedRecipe, selectedProduct, activeId;
  const occasionSelect = document.querySelector('#occasionselect');
  const productSelect = document.querySelector('#productselect');
  const recipeSelect = document.querySelector('#recipeselect');
  const activeButton = document.querySelector('.categ_filter .filBtn.active');
  const recipeDropdown = document.querySelector('#recipeDropdown');
  activeId = activeButton ? activeButton.getAttribute('data-umb-id') : 0;
  const submitButton = document.querySelector('#submit-button');
  const dropdown = document.querySelector('#recipeDropdown');
  const limit = parseInt(submitButton.getAttribute('data-limit'), 10) || 0;
  let offset = parseInt(submitButton.getAttribute('data-offset'), 10) || 0;
  const url = submitButton.getAttribute('data-api');
  const searchInput = document.querySelector('#searchInpts');
  const hackshowmore = document.querySelector('#hackshowmore');
  const lang = document.body.getAttribute('umb-lang');
  const closeButton = document.querySelector('#recipeclose');



  closeButton.addEventListener('click', handleCloseButton)
  hackshowmore.addEventListener('click', handleShowMoreButtonClick);

  document.getElementById('resetButton').addEventListener('click', () => {
    window.location.reload();
  });



  occasionSelect.addEventListener('change', (event) => {
    selectedOccasion = event.target.value;
  });

  recipeSelect.addEventListener('change', (event) => {
    selectedRecipe = event.target.value;
  });

  productSelect.addEventListener('change', (event) => {
    selectedProduct = event.target.value;
  });

  const data = {
    cookingHackCatId: activeId,
    occasionId: selectedOccasion,
    recipeId: selectedRecipe,
    productId: selectedProduct,
    filter: '',
    keyword: null,
    limit: limit,
    offset: offset,
    url: url,
    lang: lang
  }

  function handleShowMoreButtonClick() {
    const limit = parseInt(submitButton.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(submitButton.getAttribute('data-offset'), 10) || 0;
    // let offset = parseInt(submitButton.getAttribute('data-offset'), 10) || 0;
    let recipeSelectedValue = dropdown ? dropdown.value : '';
    showMoreClicked = true;
    offset += limit;
    const dataObj = {
      cookingHackCatId: activeId,
      occasionId: selectedOccasion,
      recipeId: selectedRecipe,
      productId: selectedProduct,
      filter: recipeSelectedValue,
      keyword: searchInput.value,
      limit: limit,
      offset: offset,
      url: url,
      lang: lang
    }
    submitButton.setAttribute('data-offset', offset);
    fetchCookingHacks('hack-template', dataObj).then((res) => {
      const { html, isEmpty, totalCount } = res;
      const container = document.getElementById('hackcontainer');
      if (!container) {
        console.warn('Container with ID "onlinecontainer" not found.');
        return;
      }

      if (showMoreClicked) {
        container.innerHTML += html;
      } else {
        container.innerHTML = html;
      }
      const showMoreButton = document.querySelector('#hackshowmore');
      const hackCards = document.querySelectorAll('.cookingHackCard');
      const hackCardCount = hackCards.length;
      if (isEmpty || hackCardCount == totalCount) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    }).catch(error => {
      console.log('inside the catch error', error)
    })
  }
  fetchCookingHacks('hack-template', data).then(obj => {
    const { html, isEmpty, totalCount } = obj;
    const container = document.getElementById('hackcontainer');
    if (!container) {
      console.warn('Container with ID "onlinecontainer" not found.');
      return;
    }

    if (showMoreClicked) {
      container.innerHTML += html;
    } else {
      container.innerHTML = html;
    }
    const showMoreButton = document.querySelector('#hackshowmore');
    const hackCards = document.querySelectorAll('.cookingHackCard');
    const hackCardCount = hackCards.length;
    if (isEmpty || hackCardCount == totalCount) {
      showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
    } else {
      showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
    }
  }).catch(error => {
    console.error('Error fetching/rendering online stores:', error);
  });



  submitButton.addEventListener('click', () => {
    let recipeSelectedValue = dropdown ? dropdown.value : '';
    const url = submitButton.getAttribute('data-api');
    const limit = parseInt(submitButton.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(submitButton.getAttribute('data-offset'), 10) || 0;
    const lang = document.body.getAttribute('umb-lang');
    const searchInput = document.querySelector('#searchInpts');
    showMoreClicked = false;

    const data = {
      cookingHackCatId: activeId,
      occasionId: selectedOccasion,
      recipeId: selectedRecipe,
      productId: selectedProduct,
      filter: recipeSelectedValue,
      keyword: searchInput.value,
      limit: limit,
      offset: 0,
      url: url,
      lang: lang
    }
    submitButton.setAttribute('data-offset', '0');

    fetchCookingHacks('hack-template', data).then(obj => {
      const { html, isEmpty, totalCount } = obj;
      const container = document.getElementById('hackcontainer');
      if (!container) {
        console.warn('Container with ID "onlinecontainer" not found.');
        return;
      }

      if (showMoreClicked) {
        container.innerHTML += html;
      } else {
        container.innerHTML = html;
      }
      const showMoreButton = document.querySelector('#hackshowmore');
      const hackCards = document.querySelectorAll('.cookingHackCard');
      const hackCardCount = hackCards.length;
      if (isEmpty || hackCardCount == totalCount) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    })
      .catch(error => {
        console.error('Error fetching/rendering online stores:', error);
      });
  });

  recipeDropdown.addEventListener('change', () => {
    let recipeSelectedValue = recipeDropdown ? recipeDropdown.value : '';
    showMoreClicked = false;
    const lang = document.body.getAttribute('umb-lang');

    const data = {
      cookingHackCatId: activeId,
      occasionId: selectedOccasion,
      recipeId: selectedRecipe,
      productId: selectedProduct,
      filter: recipeSelectedValue,
      keyword: searchInput.value,
      limit: limit,
      offset: 0,
      url: url,
      lang: lang
    }
    submitButton.setAttribute('data-offset', '0');
    fetchCookingHacks('hack-template', data).then(obj => {
      const { html, isEmpty, totalCount } = obj;
      const container = document.getElementById('hackcontainer');
      if (!container) {
        console.warn('Container with ID "onlinecontainer" not found.');
        return;
      }

      if (showMoreClicked) {
        container.innerHTML += html;
      } else {
        container.innerHTML = html;
      }
      const showMoreButton = document.querySelector('#hackshowmore');
      const hackCards = document.querySelectorAll('.cookingHackCard');
      const hackCardCount = hackCards.length;
      if (isEmpty || hackCardCount == totalCount) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    })
      .catch(error => {
        console.error('Error fetching/rendering online stores:', error);
      });
  });

  searchInput.addEventListener('input', () => {
    let recipeSelectedValue = recipeDropdown ? recipeDropdown.value : '';

    if (searchInput.value.length >= 3) {
      showMoreClicked = false;
      const data = {
        cookingHackCatId: activeId,
        occasionId: selectedOccasion,
        recipeId: selectedRecipe,
        productId: selectedProduct,
        filter: recipeSelectedValue,
        keyword: searchInput.value,
        limit: limit,
        offset: 0,
        url: url,
        lang: lang
      }
      submitButton.setAttribute('data-offset', offset);
      fetchCookingHacks('hack-template', data).then(obj => {
        const { html, isEmpty, totalCount } = obj;
        const container = document.getElementById('hackcontainer');


        if (!container) {
          console.warn('Container with ID "onlinecontainer" not found.');
          return;
        }

        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const showMoreButton = document.querySelector('#hackshowmore');
        const hackCards = document.querySelectorAll('.cookingHackCard');
        const hackCardCount = hackCards.length;
        if (isEmpty || hackCardCount == totalCount) {
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

  function handleCloseButton(event) {
    let recipeSelectedValue = recipeDropdown ? recipeDropdown.value : '';
    const target = event.target.closest('#recipeclose');
    showMoreClicked = false;
    if (target) {
      const data = {
        cookingHackCatId: activeId,
        occasionId: selectedOccasion,
        recipeId: selectedRecipe,
        productId: selectedProduct,
        filter: recipeSelectedValue,
        keyword: searchInput.value,
        limit: limit,
        offset: 0,
        url: url,
        lang: lang
      }
      fetchCookingHacks('hack-template', data).then(obj => {
        const { html, isEmpty, totalCount } = obj;
        const container = document.getElementById('hackcontainer');
        if (!container) {
          console.warn('Container with ID "onlinecontainer" not found.');
          return;
        }

        if (showMoreClicked) {
          container.innerHTML += html;
        } else {
          container.innerHTML = html;
        }
        const showMoreButton = document.querySelector('#hackshowmore');
        const hackCards = document.querySelectorAll('.cookingHackCard');
        const hackCardCount = hackCards.length;
        if (isEmpty || hackCardCount == totalCount) {
          showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
        } else {
          showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
        }
      })
        .catch(error => {
          console.error('Error fetching/rendering online stores:', error);
        });
    }
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
    priceRangeSlider: document.getElementById('preparation-range-slider'),
    priceRangeSliders: document.getElementById('difficulty-range-sliders'),
    mapFrame: document.getElementById('mapFrame'),
    whereToBuyMapFrame: document.getElementById('wheretobuyMapframe'),
    searchInput: document.querySelector('#searchInpts'),
    searchForm: document.querySelector('.locatSearch'),
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
    productCatId: document.querySelector('.categ_filter.filBtn'),
    searchBar: document.querySelector('#search-bar-container'),
    searchBarId: document.querySelector('#searchBar'),
    searchResult: document.querySelector('#searchresults-searchinput'),
    mainFlag: document.querySelector('.ct-logo'),
    subBoxes: document.querySelectorAll('.navBox')

  };


  const oneTrustCookieName = "OptanonConsent";
  const langPrefCookieName = "langpref";
  
  // Function to check if a specific cookie is set and contains a specific value
  function isCookieValueSet(cookieName, value) {
    const cookieMatch = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    return cookieMatch && cookieMatch[2].includes(value);
  }
  
  // Function to get the value of a specific cookie
  function getCookieValue(cookieName) {
    const cookieMatch = document.cookie.match(new RegExp('(^| )' + cookieName + '=([^;]+)'));
    return cookieMatch ? cookieMatch[2] : null;
  }
  
  // Function to set a cookie
  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
  }
  
  // Function to handle language redirection
  function handleLanguageRedirection() {
    console.log('inside language redirection');
    if (isCookieValueSet(oneTrustCookieName, 'C0003:1')) {
      console.log('inside the if condition C0003:1');
      const langPref = getCookieValue(langPrefCookieName);
      console.log('langPref:', langPref);
  
      // Check if no language slug is in the URL (homepage)
      const pathname = window.location.pathname;
      const isHomepage = pathname === '' || pathname === '/' || pathname === '/index.html';
      console.log('isHomepage', isHomepage);
  
      // Redirect dynamically based on langPref
      if (isHomepage && langPref) {
        window.location.href = `/${langPref}`;
      }
    }
  }
  
  // Function to handle dropdown visibility and navigation
  function handleDropdownAndNavigation() {
    const dropdownParent = document.querySelector(".nav-item.dropdown.target-dropdown");
    const dropdownMenu = dropdownParent?.querySelector(".dropdown-menu");
  
    if (!isCookieValueSet(oneTrustCookieName, 'C0003:1')) {
      // Show the dropdown if cookies are not accepted
      if (dropdownParent && dropdownMenu) {
        dropdownParent.classList.add("show");
        dropdownMenu.classList.add("show");
  
        const dropdownToggle = dropdownParent.querySelector("[data-bs-toggle='dropdown']");
        if (dropdownToggle) {
          dropdownToggle.setAttribute("aria-expanded", "true");
        }
      }
  
      // Prevent navigation if cookies are not accepted
      const links = document.querySelectorAll(".navBox, .moreBtn");
      links.forEach((link) => {
        link.addEventListener("click", function (event) {
          event.preventDefault();
        });
      });
    } else {
      // Hide dropdown and enable hover behavior if cookies are accepted
      if (dropdownParent && dropdownMenu) {
        dropdownParent.classList.remove("show");
        dropdownMenu.classList.remove("show");
  
        const dropdownToggle = dropdownParent.querySelector("[data-bs-toggle='dropdown']");
        if (dropdownToggle) {
          dropdownToggle.setAttribute("aria-expanded", "false");
        }
  
        dropdownParent.addEventListener("mouseenter", () => {
          dropdownParent.classList.add("show");
          dropdownMenu.classList.add("show");
        });
  
        dropdownParent.addEventListener("mouseleave", () => {
          dropdownParent.classList.remove("show");
          dropdownMenu.classList.remove("show");
        });
      }
    }
  }
  
  // Function to set langpref on region selection
  function handleRegionSelection() {
    const regionLinks = document.querySelectorAll(".dropdown-menu a");
  
    regionLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const selectedRegion = link.getAttribute("data-country-code");
        console.log('selectedRegion',selectedRegion)
        if (isCookieValueSet(oneTrustCookieName, 'C0001:1')) {
          setCookie(langPrefCookieName, selectedRegion, 365); // Set langpref for 1 year
          window.location.href = `/${selectedRegion}`;
        }
      });
    });
  }
  
  // Initialize functions
  handleLanguageRedirection();
  handleDropdownAndNavigation();
  handleRegionSelection();
  


  const indicators = document.querySelectorAll('.carousel-indicators li');
  if (indicators) {
    const idFromUrl = window.location.hash.substring(1);
    // Loop through indicators to find the matching data-key
    indicators.forEach(indicator => {
      const dataKey = indicator.getAttribute('data-key');
      if (dataKey === idFromUrl) {
        // Remove active class from all items
        indicators.forEach(item => item.classList.remove('active'));
        // Add active class to the matching item
        indicator.classList.add('active');
        indicator.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });
  }




  initializeNewSlider()
  const searchBar = document.getElementById('searchBar');
  const searchForm = document.querySelector('.search-form');
  const searchInputElement = document.getElementById('search-Bar');  // Input field for search with a different ID
  const searchResultsForm = document.querySelector('.search-results-form');  // Form element for search results

  if (elements.imageSlider || elements.thumbnailSlider || elements.contentItem || elements.whatSlider) {
    initializeSlick();
  } else {
    console.warn('Slick slider elements not found in the DOM.');
  }


  if (searchForm || searchResultsForm) {
    // Add event listener to prevent default submission for desktop search form
    document.querySelector('.search-form').addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission
    });

    // Handle Enter key for desktop search bar
    searchBar.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission
        const baseUrl = searchBar.getAttribute('data-url');
        const searchQuery = searchBar.value.trim(); // Get the input value
        if (searchQuery) {
          window.location.href = `${baseUrl}?keyword=${encodeURIComponent(searchQuery)}`;
        }
      }
    });

    if (searchResultsForm) {
      const searchIcon = document.querySelector('.serBtn img');
      searchResultsForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent form submission
      });

      searchInputElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission
          const baseUrl = searchInputElement.getAttribute('data-url');
          const searchQuery = searchInputElement.value.trim(); // Get the input value
          if (searchQuery) {
            window.location.href = `${baseUrl}?keyword=${encodeURIComponent(searchQuery)}`;
          }
        }
      });

      searchIcon.addEventListener('click', () => {
        const baseUrl = searchInputElement.getAttribute('data-url');
        const searchQuery = searchInputElement.value.trim(); // Get the input value
        if (searchQuery) {
          window.location.href = `${baseUrl}?keyword=${encodeURIComponent(searchQuery)}`;
        }
      });
    }

    // Add functionality for the mobile search
    const mobileSearchForm = document.querySelector('.mobileSearch .search-form');
    const mobileSearchBar = document.querySelector('.mobileSearch .search-bar');
    const mobileSearchButton = document.querySelector('.mobileSearch .searchBt');

    if (mobileSearchForm && mobileSearchBar && mobileSearchButton) {
      // Prevent default submission for mobile search form
      mobileSearchForm.addEventListener('submit', (event) => {
        event.preventDefault();
      });

      // Handle Enter key for mobile search bar
      mobileSearchBar.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const baseUrl = mobileSearchBar.getAttribute('data-url');
          const searchQuery = mobileSearchBar.value.trim();
          if (searchQuery) {
            window.location.href = `${baseUrl}?keyword=${encodeURIComponent(searchQuery)}`;
          }
        }
      });

      // Handle click on the mobile search button
      mobileSearchButton.addEventListener('click', () => {
        const baseUrl = mobileSearchBar.getAttribute('data-url');
        const searchQuery = mobileSearchBar.value.trim();
        if (searchQuery) {
          window.location.href = `${baseUrl}?keyword=${encodeURIComponent(searchQuery)}`;
        }
      });
    }
  }


  if (elements.searchResult) {
    const showButtons = document.querySelectorAll(".btn-more");
    const cookingHacksSection = document.querySelector(".searchHacksShowAllBtn");
    const recipeSection = document.querySelector(".searchRecipesShowAllBtn");


    if (cookingHacksSection) {
      cookingHacksSection.addEventListener("click", () => {
        // Select the searchRecipesShowAllDiv
        const cookingDiv = document.querySelector(".searchHacksShowAllDiv");

        if (cookingDiv) {
          // Remove the 'hideDives' class
          cookingDiv.classList.remove("hideDives");
          cookingHacksSection.style.display = "none";

        }
      });
    }
    if (recipeSection) {
      recipeSection.addEventListener("click", () => {
        // Select the searchRecipesShowAllDiv
        const recipesDiv = document.querySelector(".searchRecipesShowAllDiv");

        if (recipesDiv) {
          // Remove the 'hideDives' class
          recipesDiv.classList.remove("hideDives");
          recipeSection.style.display = "none";

        }
      });
    }


    showButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Get the data-index value of the clicked button
        const index = button.getAttribute("data-index");

        // Select the corresponding div with the class `moreDiv-{index}`
        const targetDiv = document.querySelector(`.moreDiv-${index}`);

        // Check if the target div exists
        if (targetDiv) {
          // Show the target div
          targetDiv.style.visibility = "visible";
          targetDiv.style.height = "auto";
          targetDiv.style.overflow = "visible";

          // Hide the clicked button
          button.style.display = "none";
        }
      });
    });
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

    // Check if the screen width is mobile size
    if ($(window).width() <= 768) {
      $('#recipeDropdown').addClass('d-none');
    }
  });

  $('.cl_ser').on('click', () => {
    $('.locatSearch').removeClass('expanded');
    $('.cl_ser').hide();
    $('.serLoc').show();
    $('.search-bar').val('');

    if ($(window).width() <= 768) {
      $('#recipeDropdown').removeClass('d-none');
    }
  });

  const recipeListing = document.getElementById("recipe-listing");
  const cookingHack = document.getElementById("cooking-hack");

  if (recipeListing) {
    toggleRecipeSections()
  }

  if (cookingHack) {
    cookingHacksSection()
  }
  const recipeCategoryListing = document.getElementById("recipe-category-listing");
  const contactForm = document.getElementById("contactForm");

  if (recipeCategoryListing) {
    initializeRecipeFilter();
  }

  if (contactForm) {
    contactForms()
  }
  // Initialize other components if elements are present
  if (elements.filtCatSpc) {
    toggleBtns();
  }
  if (elements.mapFrame) {
    initializeMapbox();
    const countrySelect = document.getElementById('countrySelect');
    const whereToBuyLink = document.getElementById('whereToBuy');

    // Function to update the `href` attribute of the link
    const updateHref = () => {
      // Get the selected option
      const selectedOption = countrySelect.options[countrySelect.selectedIndex];

      // Get the data-id attribute of the selected option
      const dataId = selectedOption.getAttribute('data-id');

      const baseUrl = whereToBuyLink.getAttribute('href').split('?')[0]; // Ensure the base URL remains clean
      whereToBuyLink.href = `${baseUrl}?country=${encodeURIComponent(dataId)}`;
    };

    // Add event listener for dropdown changes
    countrySelect.addEventListener('change', updateHref);

    // Initialize the link on page load
    updateHref();
  }



  if (elements.productButton) {
    let selectedValue = elements.productDropdown ? elements.productDropdown.value : '';

    const filterButtons = document.querySelectorAll('.subfilbtn');
    const typeFilterButtons = document.querySelectorAll('.typefilbtn');


    const url = elements.productButton.getAttribute('data-api');
    const limit = parseInt(elements.productButton.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(elements.productButton.getAttribute('data-offset'), 10) || 0;

    showMoreClicked = false;

    // Function to get the active `productCatId`
    const getActiveProductCatId = () => {
      const subActiveButton = document.querySelector('.categ_filter .subfilbtn.active');
      return subActiveButton ? subActiveButton.getAttribute('data-umb-id') : 0;
    };

    const getProductTypeId = () => {
      const typeActiveButton = document.querySelector('.type_filter .typefilbtn.active');
      return typeActiveButton ? typeActiveButton.getAttribute('data-umb-id') : 0;
    }

    // Initial call to fetch products
    let productCatId = getActiveProductCatId();
    let productTypeId = getProductTypeId();

    getProductList('productlist-template', url, selectedValue, productTypeId, offset, limit, productCatId);

    // Add event listeners to filter buttons
    if (filterButtons) {
      filterButtons.forEach(button => {
        button.addEventListener('click', event => {
          event.preventDefault();

          // Remove `active` class from all buttons
          filterButtons.forEach(btn => btn.classList.remove('active'));

          // Add `active` class to the clicked button
          button.classList.add('active');

          // Get the `data-umb-id` of the clicked button
          productCatId = button.getAttribute('data-umb-id');

          // Reset offset and fetch updated product list
          showMoreClicked = false;
          offset = 0;
          getProductList('productlist-template', url, selectedValue, productTypeId, offset, limit, productCatId);
        });
      });
    }
    // Add event listener for dropdown if it exists
    if (elements.productDropdown) {
      elements.productDropdown.addEventListener('change', () => {
        productCatId = getActiveProductCatId(); // Dynamically fetch active `productCatId`

        elements.productButton.setAttribute('data-offset', '0');
        offset = 0;
        selectedValue = elements.productDropdown.value;
        showMoreClicked = false;
        getProductList('productlist-template', url, selectedValue, productTypeId, offset, limit, productCatId);
      });
    }

    // Event listener for "Show More" button clicks
    elements.productButton.addEventListener('click', event => {
      event.preventDefault();

      productCatId = getActiveProductCatId(); // Dynamically fetch active `productCatId`

      showMoreClicked = true;
      offset += limit;
      elements.productButton.setAttribute('data-offset', offset);
      getProductList('productlist-template', url, selectedValue, productTypeId, offset, limit, productCatId);
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
    // Common function to get query parameters from the URL
    function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
    }

    // Function to set the dropdown value based on the query parameter
    function setDropdownValue(dropdown) {
      const countryId = getQueryParam('country');
      if (countryId) {
        const optionToSelect = Array.from(dropdown.options).find(
          (option) => option.value === countryId
        );
        if (optionToSelect) {
          dropdown.value = countryId;
        }
      }
    }

    // Function to handle API calls for dropdowns
    function updateDropdownApiCall(type, dropdown, apiEndpoint, buttonElement, searchInput) {
      let limit = parseInt(buttonElement?.getAttribute('data-limit'), 10) || 0;
      let offset = parseInt(buttonElement?.getAttribute('data-offset'), 10) || 0;


      function updateAndFetch(keyword = '') {
        const selectedValue = dropdown.value; // Get the latest selected value
        if (type === 'online') {
          fetchOnlineStores('online-template', selectedValue, apiEndpoint, limit, offset, keyword);
        } else if (type === 'instore') {
          const fullApiUrl = `${apiEndpoint}?countryId=${selectedValue}&keyword=${encodeURIComponent(keyword)}`;
          initializeWhereToBuyMapbox(fullApiUrl);
        }
      }

      // Event listener for dropdown change
      dropdown.addEventListener('change', () => {
        offset = 0; // Reset offset
        buttonElement?.setAttribute('data-offset', '0');
        showMoreClicked = false;
        updateAndFetch();
      });

      // Event listener for "Show More" button
      buttonElement?.addEventListener('click', (event) => {
        event.preventDefault();
        showMoreClicked = true;
        offset += limit;
        buttonElement.setAttribute('data-offset', offset.toString());
        updateAndFetch();
      });

      // Event listener for search input
      searchInput?.addEventListener('input', () => {
        if (searchInput.value.length >= 3) {
          offset = 0; // Reset offset
          buttonElement?.setAttribute('data-offset', '0');
          showMoreClicked = false;
          updateAndFetch(searchInput.value);
        }
      });

      // Initial API call
      updateAndFetch();
    }

    // Online Stores Dropdown
    const onlineDropdown = document.querySelector('.form-select#countryselect');
    const onlineApiEndpoint = onlineDropdown.getAttribute('data-url');
    const onlineButton = document.querySelector('#onlineShowMore');
    const onlineSearchInput = elements.searchInput;
    setDropdownValue(onlineDropdown);

    updateDropdownApiCall('online', onlineDropdown, onlineApiEndpoint, onlineButton, onlineSearchInput);

    // In-Store Dropdown
    const instoreDropdown = document.querySelector('.form-select#countryDrops');
    const instoreApiEndpoint = instoreDropdown.getAttribute('data-url');
    const instoreSearchInput = document.querySelector('#inStoreSearchInpts');
    setDropdownValue(instoreDropdown);
    updateDropdownApiCall('instore', instoreDropdown, instoreApiEndpoint, null, instoreSearchInput);
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

const filterWrap = document.querySelector('.filterWrap .type_filter');
if (filterWrap) {
  const activeItem = filterWrap.querySelector('.active');

  if (activeItem) {
    filterWrap.scrollTo({
      left: activeItem.offsetLeft - filterWrap.offsetLeft,
      behavior: 'smooth'
    });
  }
}

// const filterWrapSec = document.querySelector('.filterWrap .categ_filter');
// if (filterWrapSec) {
//   const activeItem = filterWrapSec.querySelector('.active');

//   if (activeItem) {
//     console.log('activeItem',activeItem)
//     filterWrapSec.scrollTo({
//       left: activeItem.offsetLeft - filterWrapSec.offsetLeft,
//       behavior: 'smooth'
//     });
//   }
// }

const categoryFilterWrap = document.querySelector('.filterWrap.catgSpc .categ_filter');
if (categoryFilterWrap) {
  const filterCategoryButton = categoryFilterWrap.querySelector('.filt-catSpc')
  const activeCategoryItem = categoryFilterWrap.querySelector('a.active');

  if (activeCategoryItem) {
    categoryFilterWrap.scrollTo({
      left: activeCategoryItem.offsetLeft - categoryFilterWrap.offsetLeft - filterCategoryButton.offsetWidth,
      behavior: 'smooth'
    });
  }
}