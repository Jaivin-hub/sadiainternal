import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn } from './utils.js';
import { fetchAssets, fetchProducts } from './api.js'
import { fetchAndRenderData, fetchOnlineStore } from './fetchAndRenderData.js';

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

// const renderData = (data) => {
//   if (data && Array.isArray(data)) {
//     const templateSource = `
//       <div class="card col-md-3">
//         <div class="logo-box">
//           <a href="{{this.onlineBuyUrl}}">
//             <img src="{{this.storeLogoUrl}}" class="img-fluid bxImg" alt="img">
//           </a>
//         </div>
//       </div>
//     `;
//     const template = Handlebars.compile(templateSource);
//     const compiledHTML = data.map(item => template(item)).join(''); // Join items into a single string of HTML

//     const container = document.getElementById('OnlineStoreCards'); // The container for the cards
//     const existingRow = container.querySelector('.row.shop_logos'); // Find the existing row

//     if (showMoreClicked && existingRow) {
//       // Append new items to the existing row if "Show More" was clicked
//       existingRow.innerHTML += compiledHTML;
//     } else {
//       // Replace content for dropdown change or initial load
//       if (existingRow) {
//         existingRow.innerHTML = compiledHTML; // Replace the content in the row
//       } else {
//         // Create the row if it doesn't exist
//         const newRow = document.createElement('div');
//         newRow.classList.add('row', 'shop_logos');
//         newRow.innerHTML = compiledHTML;
//         container.appendChild(newRow);
//       }
//     }

//     // Reset the flag after rendering
//     showMoreClicked = false;
//   }
// };

// const renderProductData = (data) => {
//   // Check if data is a JSON string and parse it if necessary
//   if (typeof data === 'string') {
//       try {
//           data = JSON.parse(data);
//       } catch (e) {
//           console.error('Failed to parse JSON data:', e);
//           return;
//       }
//   }
//   if (Array.isArray(data)) {
//       const templateSource = `
//           <div class="col-md-4">
//               <div class="list_prdct text-center">
//                   <div class="pdctImg">
//                       <img src="{{productThumbnailUrl}}" class="img-fluid prdctImg" alt="img">
//                   </div>
//                   <div class="prdctCont">
//                       <h4 class="titles">{{productTitle}}</h4>
//                       <p class="dtls">{{productCalories}}</p>
//                   </div>
//               </div>
//           </div>
//       `;
//       const template = Handlebars.compile(templateSource);
//       const compiledHTML = data.map(item => template(item)).join('');

//       // Find the row container where the products will be inserted
//       const productRow = document.querySelector('.productList .row');
//       if (showMoreClicked && productRow) {
//           // Insert the compiled HTML into the row
//           productRow.innerHTML += compiledHTML;
//       }else{
//         productRow.innerHTML = compiledHTML; // Replace the content in the row
//       }
//   } else {
//       console.error('Data is not an array or is undefined:', data);
//   }
// };

// function fetchDataForSelectedOption() {
//   const selectElement = document.querySelector('.form-select');
//   const buttonElement = document.querySelector('#onlineShowMore');
//   const searchInput = document.querySelector('#searchInpts');

//   if (!selectElement || !buttonElement) return;

//   const apiUrl = buttonElement.getAttribute('data-api');
//   const limit = buttonElement.getAttribute('data-limit') || 0;
//   const offset = buttonElement.getAttribute('data-offset') || 0;
//   const selectedValue = selectElement.value;
//   const keyword = searchInput.value || '';
//   const container = document.querySelector('#onlinecontainer');

//   // Construct the full URL with all parameters
//   const fullUrl = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}`;
//   fetchOnlineStore('online-template', fullUrl).then(html =>{
//     container.innerHTML = html;
//   })
// }


// function fetchProductslists(templateName, limit, offset, apiUrl, event) {
//   const container = document.querySelector('#cardcontainer');
//   fetchAndRenderData(templateName, apiUrl, offset, limit)
//     .then(html => {
//       if (event === 'showmore') {
//         container.innerHTML += html;  // Append new content
//       } else {
//         container.innerHTML = html;   // Replace existing content
//       }
//     })
//     .catch(error => console.error('Error populating data:', error));
// }

// function updateOffsetAndFetch() {
//   const buttonElement = document.querySelector('#onlineShowMore');
//   const selectElement = document.querySelector('.form-select');
//   const searchInput = document.querySelector('#searchInpts');
//   const apiUrl = buttonElement.getAttribute('data-api');
//   const container = document.querySelector('#onlinecontainer');

//   if (!buttonElement) return;

//   const limit = parseInt(buttonElement.getAttribute('data-limit'), 10) || 0;
//   let offset = parseInt(buttonElement.getAttribute('data-offset'), 10) || 0;

//   const selectedValue = selectElement.value;
//   offset += limit;
//   buttonElement.setAttribute('data-offset', offset);
//   const keyword = searchInput.value || '';
//   const fullUrl = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}`;

//   fetchOnlineStore('online-template', fullUrl).then(html => {
//     container.innerHTML += html;
//   })
// }

// function updateOffsetAndFetchList() {
//   const buttonElement = document.querySelector('#onlineShowMore');
//   const selectElement = document.querySelector('.form-select');
//   const searchInput = document.querySelector('#searchInpts');

//   if (!buttonElement) return;
//   const limit = parseInt(buttonElement.getAttribute('data-limit'), 10) || 0;
//   let offset = parseInt(buttonElement.getAttribute('data-offset'), 10) || 0;
//   const apiUrl = buttonElement.getAttribute('data-api');
//   const container = document.querySelector('#onlinecontainer');
//   const selectedValue = selectElement.value;
//   buttonElement.setAttribute('data-offset', offset);
//   const keyword = searchInput.value || '';
//   const fullUrl = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}`;
//   fetchOnlineStore('online-template', fullUrl).then(html => {
//     container.innerHTML = html;
//   })
// }


// function updateProductOffsetAndFetch() {
//   const buttonElement = document.querySelector('#productShowMore');
//   if (!buttonElement) return;

//   const limit = parseInt(buttonElement.getAttribute('data-limit'), 10) || 0;
//   let offset = parseInt(buttonElement.getAttribute('data-offset'), 10) || 0;

//   // Increase offset only if "Show More" was clicked
//   if (showMoreClicked) offset += limit;

//   buttonElement.setAttribute('data-offset', offset);

//   // Fetch the product list with the current limit and offset
//   const url = buttonElement.getAttribute('data-api');
//   fetchProductslists('productlist-template', limit, offset, url, showMoreClicked ? 'showmore' : 'initial');
// }

// function resetOffset() {
//   const buttonElement = document.querySelector('#onlineShowMore');
//   if (buttonElement) {
//     // const limit = buttonElement.getAttribute('data-limit') || '0'; // Get the current limit value
//     buttonElement.setAttribute('data-offset', '0'); // Reset offset to the current limit value
//   }
// }

// function resetOffsetProducts() {
//   const buttonElement = document.querySelector('#productShowMore');
//   if (buttonElement) {
//     // const limit = buttonElement.getAttribute('data-limit') || '0'; // Get the current limit value
//     buttonElement.setAttribute('data-offset', '0'); // Reset offset to the current limit value
//   }
// }

let showMoreClicked = false; // Global flag


function getProductList(template, url, productCatId, limit, offset) {
  fetchAndRenderData(template, url, productCatId, offset, limit)
    .then(html => {
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
    })
    .catch(error => {
      console.error('Error fetching product list:', error);
    });
}

function fetchOnlineStores(templateName, selectedValue, apiUrl, limit, offset, keyword) {
  const url = `${apiUrl}?countryId=${selectedValue}&limit=${limit}&offset=${offset}&keyword=${encodeURIComponent(keyword)}`;

  fetchOnlineStore(templateName, selectedValue, url)
    .then(html => {
      const container = document.getElementById('onlinecontainers');
      if (!container) {
        console.warn('Container with ID "onlinecontainer" not found.');
        return;
      }

      if (showMoreClicked) {
        console.log('Appending HTML');
        container.innerHTML += html;
      } else {
        console.log('Replacing HTML');
        container.innerHTML = html;
      }
    })
    .catch(error => {
      console.error('Error fetching/rendering online stores:', error);
    });
}

// function fetchProductslists(templateName, limit, offset, apiUrl, event) {
//   const container = document.querySelector('#cardcontainer');
//   fetchAndRenderData(templateName, apiUrl, offset, limit)
//   .then(html => {
//     if (event === 'showmore') {
//       container.innerHTML += html;  // Append new content
//     } else {
//       container.innerHTML = html;   // Replace existing content
//     }
//   })
//     .catch(error => console.error('Error populating data:', error));
// }





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
    productButton: document.querySelector('#productShowMore'),
    video: document.getElementById("myVideo"),
    playButton: document.getElementById("playButton"),
    onlineShowMore: document.querySelector('#onlineShowMore'),
    mainHeader: document.querySelector('.main-header'),
    productCatId: document.querySelector('.categ_filter.filBtn')

  };




  // Initialize slick sliders if required elements are present
  if (elements.imageSlider || elements.thumbnailSlider || elements.contentItem || elements.whatSlider) {
    initializeSlick();
  } else {
    console.warn('Slick slider elements not found in the DOM.');
  }

  // Initialize other components if elements are present
  if (elements.filtCatSpc) {
    toogleBtn();
  }
  if (elements.priceRangeSlider || elements.priceRangeSliders) {
    priceSliderInitialize();
  }
  if (elements.mapFrame) {
    initializeMapbox();
  }




  if (elements.productDropdown && elements.selectElement && elements.productButton) {
    const url = elements.productButton.getAttribute('data-api');
    
    // Initial call with the first product category
    const initialProductCatId = elements.productCatId?.getAttribute('data-umb-id') || 0;
    const limit = parseInt(elements.productButton.getAttribute('data-limit'), 10) || 0;
    let offset = parseInt(elements.productButton.getAttribute('data-offset'), 10) || 0;
    showMoreClicked = false;
    getProductList('productlist-template', url, initialProductCatId, limit, offset);
    elements.selectElement.addEventListener('change', () => {
      elements.productButton.setAttribute('data-offset', '0');
      showMoreClicked = false;
      offset = 0; // Reset offset variable
      getProductList('productlist-template', url, initialProductCatId, limit, offset);
    });
    elements.productButton.addEventListener('click', (event) => {
      event.preventDefault();
      showMoreClicked = true;
      const limit = parseInt(elements.productButton.getAttribute('data-limit'), 10) || 0;
      let offset = parseInt(elements.productButton.getAttribute('data-offset'), 10) || 0;
      offset += limit;
      elements.productButton.setAttribute('data-offset', offset);
      getProductList('productlist-template', url, initialProductCatId, limit, offset);
    });

    // Event listener for button clicks
    document.querySelectorAll('[data-umb-id]').forEach((button) => {
      button.addEventListener('click', (event) => {
          event.preventDefault();
          showMoreClicked = true;

          const productCatId = button.getAttribute('data-umb-id');
          console.log('Clicked productCatId:', productCatId);
          // Update offset and call API
          elements.productButton.setAttribute('data-offset', '0'); // Reset offset to the current limit value
          const limit = parseInt(elements.productButton.getAttribute('data-limit'), 10) || 0;
          let offset = parseInt(elements.productButton.getAttribute('data-offset'), 10) || 0;
          getProductList('productlist-template', url, productCatId, limit, offset);
      });
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
  }





  // // Product List Dropdown
  // if (productDropdown && selectElement) {
  //   selectElement.addEventListener('change', () => {
  //     showMoreClicked = false;
  //     resetOffsetProducts();
  //     const url = productButtonElement.getAttribute('data-api');
  //     const limit = parseInt(productButtonElement.getAttribute('data-limit'), 10) || 0;
  //     let offset = parseInt(productButtonElement.getAttribute('data-offset'), 10) || 0;
  //     fetchProductslists('productlist-template', limit, offset, url, 'initial');
  //   });
  // }

  // // Product Show More Button
  // if (productButtonElement) {
  //   updateProductOffsetAndFetch();
  //   productButtonElement.addEventListener('click', (event) => {
  //     event.preventDefault();
  //     showMoreClicked = true;
  //     updateProductOffsetAndFetch();
  //   });
  // }

  // // Select Element for Filtered Data Fetch
  // if (selectElement) {
  //   selectElement.addEventListener('change', () => {
  //     showMoreClicked = false;
  //     resetOffset();
  //     updateOffsetAndFetchList()
  //     // updateOffsetAndFetch();
  //     // fetchDataForSelectedOption();
  //   });
  // }

  // // Search Input with live filtering
  // if (searchInput) {
  //   searchInput.addEventListener('input', () => {
  //     if (searchInput.value.length >= 3) {
  //       showMoreClicked = false;
  //       fetchDataForSelectedOption();
  //     }
  //   });
  // }

  // // Show More Button for Online Content
  // if (buttonElement) {
  //   buttonElement.addEventListener('click', (event) => {
  //     event.preventDefault();
  //     showMoreClicked = true;
  //     updateOffsetAndFetch();
  //   });
  // }






























  // Video Play Button Handling
  if (elements.video && elements.playButton) {
    playButton.addEventListener("click", playVideo);
    video.addEventListener("click", toggleVideoPlayPause);

    function playVideo() {
      video.play().then(() => {
        playButton.style.display = "none";
      }).catch(error => {
        console.error("Playback prevented:", error);
        alert("Click to play was blocked by the browser.");
      });
    }

    function toggleVideoPlayPause() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        playButton.style.display = "flex";
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

  // Link Navigation Handlers
  const links = {
    viewMoreRecipes: 'recipe-details',
    viewProduct: 'product-listing',
    productdetails: 'product-details',
    productnav: 'products',
    aboutnav: 'about',
    viewMoreHack: 'hack-listing',
    cookwithsadianav: 'recipe-details',
    whereToBuy: 'where-to-buy',
    abtLink: 'about',
  };

  Object.keys(links).forEach(linkId => {
    const element = document.getElementById(linkId);
    if (element) {
      element.addEventListener('click', event => {
        event.preventDefault();
        window.location.href = links[linkId];
      });
    }
  });

  document.querySelectorAll('.viewCampaign').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = 'campaign';
    });
  });

  document.querySelectorAll('.where-to-buy').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      window.location.href = 'where-to-buy';
    });
  });

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
