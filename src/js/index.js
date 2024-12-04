import $, { error } from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Mustache from 'mustache';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn, initializeNewSlider } from './utils.js';
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
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data) {
            document.querySelector('.contactForms').style.display = 'none';
            document.querySelector('.thanksWraper').style.display = 'block';
          }
        })
        .catch((error) => {
          console.error('Error:', error);
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

  document.querySelectorAll('.filBtn').forEach(button => {
    button.addEventListener('click', function () {
      document.querySelectorAll('.filBtn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
    });
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
      .then(({ html, isEmpty }) => {
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
        if (isEmpty) {
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
      selectedPrepTime = event.target.value;
    });

    
    difficultySelect.addEventListener('change', (event) => {
      selectedDifficulty = event.target.value;
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

function initializeRecipeFilter() {
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
  const dietaryNeedsSelect = document.querySelector('#dietary-needs');
  const occasionSelect = document.querySelector('#occasion');
  const preparationSelect = document.querySelector('#preparation-style');
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
    return {
      mealType: selectedMealType,
      cuisine: selectedCuisine,
      difficulty: difficulties,
      prepTime: timeTaken,
      dietaryNeeds: selectedDietaryNeeds,
      occasion: selectedOccasion,
      preparationStyle: preparationStyle,
      recipeCatId: recipeCatId,
      url,
      limit,
      offset,
      keyword,
      recipeSelectedValue,
      lang,
    };
  }

  function initialRequestData(keyword = '', recipeSelectedValue = '') {
    return {
      mealType: selectedMealType,
      cuisine: selectedCuisine,
      difficulty: null,
      prepTime: '',
      dietaryNeeds: selectedDietaryNeeds,
      occasion: selectedOccasion,
      preparationStyle: preparationStyle,
      recipeCatId: recipeCatId,
      url,
      limit,
      offset,
      keyword,
      recipeSelectedValue,
      lang,
    };
  }

  // Helper function to update the recipe list
  function updateRecipeList(data) {
    fetchRecipes('recipelist-template', data)
      .then(({ html, isEmpty }) => {
        if (showMoreClicked) {
          recipeContainer.innerHTML += html;
        } else {
          recipeContainer.innerHTML = html;
        }
        showMoreButton.style.visibility = isEmpty ? "hidden" : "visible";
      })
      .catch(error => console.error('Error fetching recipes:', error));
  }

  // Event Handlers
  function handleFilterButtonClick(event) {
    document.querySelectorAll('.filBtn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    selectedMealType = event.target.getAttribute('data-id');
  }

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
    difficulties = selectedDifficulty;
    timeTaken = selectedPrepTime;
    offset = 0;
    showMoreClicked = false;
    updateRecipeList(prepareRequestData());
  }

  function initialFetch() {
    offset = 0;
    showMoreClicked = false;
    updateRecipeList(initialRequestData());
  }

  function handleShowMoreButtonClick() {
    showMoreClicked = true;
    offset += limit;
    updateRecipeList(prepareRequestData());
  }

  function handleResetButtonsClick() {
    window.location.reload();
  }

  // Bind Events
  function bindEvents() {
    document.querySelectorAll('.filBtn').forEach(button =>
      button.addEventListener('click', handleFilterButtonClick)
    );

    cuisineSelect.addEventListener('change', event => handleDropdownChange(event, 'cuisine'));
    dietaryNeedsSelect.addEventListener('change', event => handleDropdownChange(event, 'dietary'));
    occasionSelect.addEventListener('change', event => handleDropdownChange(event, 'occasion'));
    preparationSelect.addEventListener('change', event => handleDropdownChange(event, 'preparation'));

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
      const { html, isEmpty } = res;
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
      if (isEmpty) {
        showMoreButton.style.visibility = "hidden"; // Hide the button but preserve layout
      } else {
        showMoreButton.style.visibility = "visible"; // Show the button without affecting layout
      }
    }).catch(error => {
      console.log('inside the catch error', error)
    })
  }
  fetchCookingHacks('hack-template', data).then(obj => {
    const { html, isEmpty } = obj;
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
    if (isEmpty) {
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
      const { html, isEmpty } = obj;
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
      const { html, isEmpty } = obj;
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
        const { html, isEmpty } = obj;
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
        const { html, isEmpty } = obj;
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

    // productCatId: document.querySelector('.categ_filter.filBtn')
  };

  initializeNewSlider()

    // const phoneInputField = document.getElementById('phoneNumber');
    // const phoneError = document.getElementById('phoneError');

    // const iti = intlTelInput(phoneInputField, {
    //     initialCountry: "auto", // Auto-detect user's country
    //     geoIpLookup: function (callback) {
    //         fetch('https://ipinfo.io/json?token=5cef6dd088fc9f')
    //             .then((response) => response.json())
    //             .then((json) => callback(json.country))
    //             .catch(() => callback('US'));
    //     },
    //     utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.19/js/utils.js", // For number formatting and validation
    // });

    // phoneInputField.addEventListener('blur', () => {
    //     if (iti.isValidNumber()) {
    //         phoneError.style.display = 'none';
    //     } else {
    //         phoneError.style.display = 'block';
    //     }
    // });

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
    // Add an event listener to the form to prevent default submission
    document.querySelector('.search-form').addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent form submission
    });


    // Add a keydown event listener to handle the Enter key
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


  }


  if (elements.searchResult) {

    const urlParams = new URLSearchParams(window.location.search);
    const searchKeyword = urlParams.get("keyword"); // Get the value of 'keyword'

    // Select the search input field
    const searchInput = document.getElementById("search-Bar");

    // If 'keyword' exists in the URL, set its value in the input field
    if (searchKeyword) {
      searchInput.value = decodeURIComponent(searchKeyword); // Decode the keyword (e.g., to handle spaces)
    }

    // document.getElementById('searchProductShowMore').addEventListener('click', function () {
    //   const templateName = 'searchlist-template'
    //   const template = document.getElementById(templateName)?.innerHTML;
    //   console.log('template',template)
    //   if (!template) {
    //     throw new Error(`Template with ID '${templateName}' not found.`);
    //   }
    //   let html = '';

    //   dataList.forEach(item => {
    //     html += Mustache.render(template, item);
    //   });

    //   const container = document.getElementById('productDisplay');
    //   console.log('container',container)
    //   if (!container) {
    //     console.warn('Container with ID "defaultlistspace" not found.');
    //     return;
    //   }
    //   console.log('html',html)
    //   container.innerHTML = html;
    // });

    function renderSections() {
      const sectionsContainer = document.getElementById("sections-container");
      sectionsContainer.innerHTML = "";
    
      dataList.forEach((data, index) => {
        const sectionHTML = `
          <div class="container">
            <div class="titleWrap">
              <h2 class="mainTitle">${data.name}</h2>
            </div>
            <div class="row rowDiv" id="section-${index}">
              <!-- Items will be rendered here -->
            </div>
            <div class="btnSapce text-center">
              <button id="showMore-${index}" class="btn btn-more btnBor" data-index="${index}">Show More</button>
            </div>
          </div>
        `;
        sectionsContainer.insertAdjacentHTML("beforeend", sectionHTML);
        renderItems(index, 0, 3); // Render first 3 items
      });
    }

    function renderItems(sectionIndex, start, count) {
      const section = dataList[sectionIndex];
      const sectionContainer = document.getElementById(`section-${sectionIndex}`);
    
      const itemsToRender = section.items.slice(start, start + count);
      const template = document.getElementById("searchlist-template").innerHTML;
    
      itemsToRender.forEach(item => {
        const html = Mustache.render(template, item);
        sectionContainer.insertAdjacentHTML("beforeend", html);
      });
    
      // Hide "Show More" button if no more items to load
      // if (start + count >= section.items.length) {
      //   document.getElementById(`showMore-${sectionIndex}`).style.display = "none";
      // }
    }
    
    // Event listener for "Show More" buttons
    document.getElementById("sections-container").addEventListener("click", function (event) {
      if (event.target.tagName === "BUTTON" && event.target.id.startsWith("showMore")) {
        const sectionIndex = parseInt(event.target.dataset.index, 10);
        const sectionContainer = document.getElementById(`section-${sectionIndex}`);
        const currentCount = sectionContainer.childElementCount;
        renderItems(sectionIndex, currentCount, 3); // Load the next 3 items
      }
    });

    renderSections();
    

    // document.getElementById('breadedbutton').addEventListener('click', function () {
    //   const section = document.getElementById("breadedsection");
    //   const button = document.getElementById('breadedbutton');
    //   if (section.style.visibility === "hidden") {
    //     section.style.visibility = "visible";
    //     section.style.height = "auto";
    //     section.style.overflow = "visible";
    //     button.style.display = "none"; // Hides the button
    //   } else {
    //     section.style.visibility = "hidden";
    //     section.style.height = "0";
    //     section.style.overflow = "hidden";
    //   }
    // });

    // document.getElementById('recipebtn').addEventListener('click', function () {
    //   const section = document.getElementById("recipessection");
    //   const button = document.getElementById('recipebtn');
    //   if (section.style.visibility === "hidden") {
    //     section.style.visibility = "visible";
    //     section.style.height = "auto";
    //     section.style.overflow = "visible";
    //     button.style.display = "none"; // Hides the button
    //   } else {
    //     section.style.visibility = "hidden";
    //     section.style.height = "0";
    //     section.style.overflow = "hidden";
    //   }
    // });

    // document.getElementById('cookingbtn').addEventListener('click', function () {
    //   const section = document.getElementById("cookingsection");
    //   const button = document.getElementById('cookingbtn');
    //   if (section.style.visibility === "hidden") {
    //     section.style.visibility = "visible";
    //     section.style.height = "auto";
    //     section.style.overflow = "visible";
    //     button.style.display = "none"; // Hides the button
    //   } else {
    //     section.style.visibility = "hidden";
    //     section.style.height = "0";
    //     section.style.overflow = "hidden";
    //   }
    // });

    // document.getElementById('endlistshowmore').addEventListener('click', function () {
    //   const section = document.getElementById("lastsection");
    //   const button = document.getElementById('endlistshowmore');
    //   if (section.style.visibility === "hidden") {
    //     section.style.visibility = "visible";
    //     section.style.height = "auto";
    //     section.style.overflow = "visible";
    //     button.style.display = "none"; // Hides the button
    //   } else {
    //     section.style.visibility = "hidden";
    //     section.style.height = "0";
    //     section.style.overflow = "hidden";
    //   }
    // });
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

  const recipeListing = document.getElementById("recipe-listing");
  const cookingHack = document.getElementById("cooking-hack");

  if (recipeListing) {
    toggleRecipeSections()
  }

  if (cookingHack) {
    cookingHacksSection()
  }


  // if (elements.priceRangeSlider || elements.priceRangeSliders) {
  //   // Function to create sliders dynamically
  //   const createDynamicSlider = (sliderId, labelSelector, sliderType) => {
  //     const slider = document.getElementById(sliderId);
  //     if (!slider) {
  //       console.error(`${sliderType} slider not found in DOM`);
  //       return;
  //     }

  //     // Dynamically read labels and data-id from HTML
  //     const labelElements = Array.from(document.querySelectorAll(labelSelector));
  //     const items = labelElements.map((el) => ({
  //       id: parseInt(el.getAttribute("data-id")),
  //       label: el.textContent.trim(),
  //     }));

  //     // Calculate the step size dynamically
  //     const maxValue = items.length - 1; // Last index in the items array
  //     const step = maxValue > 0 ? 1 : 0; // Ensure step is valid only when items exist

  //     // Create slider
  //     noUiSlider.create(slider, {
  //       start: 0, // Start at the first point
  //       connect: [true, false],
  //       range: {
  //         min: 0,
  //         max: maxValue,
  //       },
  //       step: step, // Step between points
  //       pips: false,
  //       format: {
  //         to: (value) => items[Math.round(value)].id, // Map slider value to data-id
  //         from: (value) =>
  //           items.findIndex((item) => item.id === parseInt(value)), // Find index by data-id
  //       },
  //     });

  //     // Handle updates
  //     slider.noUiSlider.on("update", (values) => {
  //       const selectedId = parseInt(values[0]); // Get the selected data-id
  //       if (sliderType === "Difficulty") {
  //         selectedDifficulty = selectedId;
  //       } else if (sliderType === "Preparation Time") {
  //         selectedPrepTime = selectedId;
  //       }
  //     });
  //   };

  //   // Create Difficulty Slider
  //   createDynamicSlider(
  //     "difficulty-range",
  //     "#difficulty-range-sliders .range-labels span.names",
  //     "Difficulty"
  //   );

  //   // Create Preparation Time Slider
  //   createDynamicSlider(
  //     "preparation-range",
  //     "#preparation-range-slider .range-labels span.names",
  //     "Preparation Time"
  //   );
  // }

  // recipe-category-listing
  const recipeCategoryListing = document.getElementById("recipe-category-listing");
  const contactForm = document.getElementById("contactForm");



  if (recipeCategoryListing) {
    initializeRecipeFilter();
  }

  if (contactForm) {
    contactForms()
  }

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

    const getProductTypeId = () =>{
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
    if (typeFilterButtons) {
      typeFilterButtons.forEach(button => {
          button.addEventListener('click', event => {
              event.preventDefault();

              // Remove `active` class from all buttons
              typeFilterButtons.forEach(btn => btn.classList.remove('active'));

              // Add `active` class to the clicked button
              button.classList.add('active');

              // Get the `data-umb-id` of the clicked button
              productTypeId = button.getAttribute('data-umb-id');

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
