import $, { error } from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn } from './utils.js';
import { fetchAssets, fetchProducts } from './api.js'
import { fetchAndRenderData, fetchOnlineStore, fetchRecipes, fetchCookingHacks } from './fetchAndRenderData.js';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

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

const contactForms = () => {
  const form = document.querySelector('#contactForm');
  const fileInput = document.querySelector('#formFileLg');
  const fileNameText = document.querySelector('#fileNameText');

  // Hide all error messages initially
  const hideAllErrors = () => {
    const errors = form.querySelectorAll('.error-message');
    errors.forEach((error) => {
      error.style.display = 'none';
    });
  };

  // Validate a single field
  const validateField = (input, errorSelector) => {
    const error = document.querySelector(errorSelector);
    const message = error?.textContent || 'Invalid input';

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
    hideAllErrors(); // Reset all error messages

    let valid = true;

    // Validate each field dynamically
    valid &= validateField(document.querySelector('#fullName'), '#nameError');
    valid &= validateField(document.querySelector('#email'), '#emailError');
    valid &= validateField(document.querySelector('#mobileNumber'), '#phoneError');
    valid &= validateField(document.querySelector('#subject'), '#subjectError');
    valid &= validateField(document.querySelector('#message'), '#messageError');

    if (valid) {
      const lang = document.body.getAttribute('umb-lang');
      const nodeIdInput = document.querySelector('#formNodeId');
      const nodeId = nodeIdInput ? nodeIdInput.value : null;
      // Prepare form data
      const formData = new FormData();
      formData.append('fullName', document.querySelector('#fullName').value);
      formData.append('email', document.querySelector('#email').value);
      formData.append('phoneNumber', document.querySelector('#mobileNumber').value);
      formData.append('subject', document.querySelector('#subject').value);
      formData.append('message', document.querySelector('#message').value);
      formData.append('nodeId', nodeId);
      formData.append('lang', lang);
      console.log('selectedFile',selectedFile)
      // Append the file only if one is selected
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      console.log('Form Data:', formData);

      const submitButton = document.querySelector('.subBtn');
      const apiUrl = submitButton.getAttribute('data-url');

      console.log('apiUrl:', apiUrl);

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
          console.log('API Response:', data);
        })
        .catch((error) => {
          console.error('Error:', error);
        });
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
    console.log('updateREcipe')
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
          showMoreButton.style.visibility = "hidden";
        } else {
          showMoreButton.style.visibility = "visible";
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
      if (section) section.style.visibility = 'visible';
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
    console.log('offset', offset)
    // console.log('limit',limit)
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
    console.log('inside the showmore', dataObj)
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
  console.log('data consoling---', data)
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



    // productCatId: document.querySelector('.categ_filter.filBtn')
  };


  if (elements.imageSlider || elements.thumbnailSlider || elements.contentItem || elements.whatSlider) {
    initializeSlick();
  } else {
    console.warn('Slick slider elements not found in the DOM.');
  }


  if (elements.searchBar) {
    document.getElementById('chickenpartsbutton').addEventListener('click', function () {
      const section = document.getElementById("chickenpartssection");
      const button = document.getElementById('chickenpartsbutton');
      if (section.style.visibility === "hidden") {
        section.style.visibility = "visible";
        section.style.height = "auto";
        section.style.overflow = "visible";
        button.style.display = "none"; // Hides the button
      } else {
        section.style.visibility = "hidden";
        section.style.height = "0";
        section.style.overflow = "hidden";
      }
    });

    document.getElementById('breadedbutton').addEventListener('click', function () {
      const section = document.getElementById("breadedsection");
      const button = document.getElementById('breadedbutton');
      if (section.style.visibility === "hidden") {
        section.style.visibility = "visible";
        section.style.height = "auto";
        section.style.overflow = "visible";
        button.style.display = "none"; // Hides the button
      } else {
        section.style.visibility = "hidden";
        section.style.height = "0";
        section.style.overflow = "hidden";
      }
    });

    document.getElementById('recipebtn').addEventListener('click', function () {
      const section = document.getElementById("recipessection");
      const button = document.getElementById('recipebtn');
      if (section.style.visibility === "hidden") {
        section.style.visibility = "visible";
        section.style.height = "auto";
        section.style.overflow = "visible";
        button.style.display = "none"; // Hides the button
      } else {
        section.style.visibility = "hidden";
        section.style.height = "0";
        section.style.overflow = "hidden";
      }
    });

    document.getElementById('cookingbtn').addEventListener('click', function () {
      const section = document.getElementById("cookingsection");
      const button = document.getElementById('cookingbtn');
      if (section.style.visibility === "hidden") {
        section.style.visibility = "visible";
        section.style.height = "auto";
        section.style.overflow = "visible";
        button.style.display = "none"; // Hides the button
      } else {
        section.style.visibility = "hidden";
        section.style.height = "0";
        section.style.overflow = "hidden";
      }
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


  if (elements.priceRangeSlider || elements.priceRangeSliders) {
    console.log('inside the slider condision')

    // Difficulty Slider
    const difficultySlider = document.getElementById("difficulty-range");
    if (difficultySlider) {
      console.log('difficultySlider')
      // Dynamically read difficulties from HTML
      const difficultyElements = Array.from(document.querySelectorAll(".range-labels span.names"));
      console.log('difficultyElements',difficultyElements)
      const difficulties = difficultyElements.map((el) => ({
        id: parseInt(el.getAttribute("data-id")), // Read the data-id
        label: el.textContent.trim(), // Read the label
      }));

      noUiSlider.create(difficultySlider, {
        start: 0, // Start at the first difficulty
        connect: [true, false],
        range: {
          min: 0,
          max: difficulties.length - 1, // Max based on number of difficulties
        },
        step: 1,
        format: {
          to: (value) => difficulties[Math.round(value)].id, // Map slider value to data-id
          from: (value) =>
            difficulties.findIndex((difficulty) => difficulty.id === parseInt(value)), // Find index by data-id
        },
      });
      console.log(' created',noUiSlider)
      difficultySlider.noUiSlider.on("update", (values) => {
        const selectedId = parseInt(values[0]); // Get the selected data-id
        console.log('selectedId',selectedId)
        selectedDifficulty = selectedId;
      });
    } else {
      console.error("Difficulty slider not found in DOM");
    }

    // Preparation Time Slider
    const prepTimeSlider = document.getElementById("preparation-range");
    if (prepTimeSlider) {
      console.log('preptimeslider')
      // Dynamically read preparation times from HTML
      const prepTimeElements = Array.from(document.querySelectorAll("#preparation-range-slider .range-labels span.names"));
      const prepTimes = prepTimeElements.map((el) => parseInt(el.getAttribute("data-id")));

      noUiSlider.create(prepTimeSlider, {
        start: prepTimes[0], // Start at the first preparation time
        connect: [true, false],
        range: {
          min: Math.min(...prepTimes),
          max: Math.max(...prepTimes),
        },
        step: 1,
        format: {
          to: (value) => `${value.toFixed(0)} mins`,
          from: (value) => Number(value.replace(" mins", "")),
        },
      });
      console.log('created')
      prepTimeSlider.noUiSlider.on("update", (values) => {
        const prepTime = parseInt(values[0]); // Get the selected preparation time
        selectedPrepTime = prepTime;
      });
    } else {
      console.error("Preparation time slider not found in DOM");
    }
  }

  // recipe-category-listing
  const recipeCategoryListing = document.getElementById("recipe-category-listing");
  const contactForm = document.getElementById("contactForm");



  if (recipeCategoryListing) {
    initializeRecipeFilter();
  }

  if(contactForm){
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
