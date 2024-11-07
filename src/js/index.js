import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '../scss/style.scss';
import Handlebars from 'handlebars';
import { initializeMapbox, priceSliderInitialize, initializeSlick, initializeWhereToBuyMapbox, toogleBtn } from './utils.js';
import {fetchAssets} from './api.js'

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
// const baseUrl = 'https://sadialife-dev.azurewebsites.net';
// const defaultUrl = 'https://sadialife-dev.azurewebsites.net/Umbraco/api/data/GetOnlineStores?countryId=1288'

// Function to render data
const renderData = (data) => {
  console.log('data in renderData',data)
  if (data && Array.isArray(data)) {
    const templateSource = `
      <div class="row shop_logos">
        {{#each data}}
        <div class="card col-md-3">
          <div class="logo-box">
            <a href="{{this.onlineBuyUrl}}">
              <img src="{{this.storeLogoUrl}}" class="img-fluid bxImg" alt="img">
            </a>
          </div>
        </div>
        {{/each}}
      </div>
      <div class="btnSpace text-center">
        <button class="btn btn-more">Show More</button>
      </div>
    `;
    const template = Handlebars.compile(templateSource);
    const compiledHTML = template({ data });
    document.getElementById('cnt_sec').innerHTML = compiledHTML;
  }
};

// Fetch initial data for the default country (UAE)
// fetchAssets(defaultUrl, renderData);

function fetchDataForSelectedOption() {
  const selectElement = document.querySelector('.form-select');
  if (!selectElement) return;
  const baseUrl = selectElement.getAttribute('data-url');
  const selectedValue = selectElement.value;
  const fullUrl = `${baseUrl}${selectedValue}`;
  fetchAssets(fullUrl, renderData);
}




// Event listener to ensure code runs after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  const imageSliderExists = document.querySelector('.image-slider') !== null;
  const thumbnailSliderExists = document.querySelector('.thumbnail-slider') !== null;
  const contentItem = document.querySelector('.content-item') !== null;
  const whatSlider = document.querySelector('.whatSlider') !== null;
  const selectElement = document.querySelector('.form-select');
  if (selectElement) {
    fetchDataForSelectedOption();
    selectElement.addEventListener('change', fetchDataForSelectedOption);
  }

  
  if (document.getElementById('price-range-slider')) { 
    priceSliderInitialize();
  }


  if (imageSliderExists || thumbnailSliderExists || contentItem || whatSlider) {
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

  if (document.getElementById('filt-catSpc')) { // Replace with your actual Mapbox element ID
    console.log('jjj')
    toogleBtn(); // Initialize Mapbox map
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

  const productDetail = document.getElementById('productdetails');
  if (productDetail) {
    productDetail.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'product-details'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const products = document.getElementById('productnav');
  if (products) {
    products.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'products'; // Adjust the path as per your file structure
      window.location.href = this.href; // Navigate to the new page
    });
  }

  const aboutnav = document.getElementById('aboutnav');
  if (aboutnav) {
    aboutnav.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'about'; // Adjust the path as per your file structure
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

  const cookwithsadianav = document.getElementById('cookwithsadianav');
  if (cookwithsadianav) {
    cookwithsadianav.addEventListener('click', function (event) {
      event.preventDefault(); // Prevent the default action of the link
      this.href = 'recipe-details'; // Adjust the path as per your file structure
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
      this.href = 'where-to-buy'; // Adjust the path as per your file structure
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

