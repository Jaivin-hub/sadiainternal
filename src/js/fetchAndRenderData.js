import Mustache from 'mustache';
import productList from '../assets/json/productlist.json';
import instoreList from '../assets/json/instore.json';
import onlineStoreList from '../assets/json/onlinestore.json';


async function fetchAndRenderData(templateName, apiUrl, selectedValue, productTypeId, offset, limit, lang, productCatId) {
    try {
        let isEmpty = false;
        const url = `${apiUrl}?productTypeId=${productTypeId}&limit=${limit}&offset=${offset}&filter=${selectedValue}&productCatId=${productCatId}&lang=${lang}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const productsList = await response.json(); // Assume productList is an array of items
        if(productsList.length === 0){
            isEmpty = true;
        }
        const template = document.getElementById(templateName)?.innerHTML;
        if (!template) {
            throw new Error(`Template with ID '${templateName}' not found.`);
        }
        // // Generate HTML for each item in productList
        let html = '';
        productsList.forEach(item => {
            html += Mustache.render(template, item); // Using Mustache template rendering
        });
        const obj = {html, isEmpty}
        return obj;
    } catch (error) {
        console.error('Error fetching/rendering data:', error);
        throw error; // Rethrow to handle in getProductList
    }
}

async function fetchInstore(templateName, apiUrl, offset, limit, more) {
    try {
        // const response = await fetch(`${apiUrl}?limit=${limit}&offset=${offset}${more}`);
        // const data = await response.json();
        // Get the template source
        const template = document.getElementById('productlist-template').innerHTML;

        // Generate the HTML for all items
        let html = '';
        instoreList.forEach(item => {
            html += Mustache.render(template, item);
        });
        return html;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function fetchOnlineStore(templateName,selectedValue, apiUrl) {
    try {
        let isEmpty = false;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if(data.length === 0){
            isEmpty = true;
        }
        // Get the template source
        const template = document.getElementById('online-template')?.innerHTML;
        if (!template) {
            throw new Error(`Template with ID '${templateName}' not found.`);
        }   
        // const template = document.getElementById(templateName).innerHTML;

        // // // // Generate the HTML for all items
        let html = '';
        data.forEach(item => {
            html += Mustache.render(template, item);
        });
        const obj = {html, isEmpty}
        return obj;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function fetchRecipes(templateName, data){
    try{
        console.log("data in fetchRecipes",data)
        let isEmpty = false;
        const formdata = {
            "recipeCatId": data.recipeCatId,
            "mealTypeId": data.mealType == null || data.mealType == undefined || data.mealType == "" ?[]:[Number(data.mealType)],
            "difficultyLevelId": data.difficulty == null || data.difficulty == undefined || data.difficulty == ""  ? [] : [Number(data.difficulty)],
            "preparationTime": data.prepTime == null || data.prepTime == undefined || data.prepTime == ""  ? "" : data.prepTime,
            "cuisineId": data.cuisine == null || data.cuisine == undefined || data.cuisine == ""  ? [] : [Number(data.cuisine)],
            "dietaryId": data.dietaryNeeds == null || data.dietaryNeeds == undefined || data.dietaryNeeds == ""  ? [] : [Number(data.dietaryNeeds)],
            "occasionId": data.occasion == null || data.occasion == undefined || data.occasion == ""  ? [] : [Number(data.occasion)],
            "preparationStyleId": data.preparationStyle == null || data.preparationStyle == undefined || data.preparationStyle == "" ? [] : [Number(data.preparationStyle)],
            "filter": data.recipeSelectedValue,
            "keyword": data.keyword,
            "limit": data.limit,
            "offset": data.offset,
            "lang":data.lang
          }
          console.log('formdata',formdata)
          const response = await fetch(data.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formdata),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if(result.length === 0){
            isEmpty = true;
        }

        const template = document.getElementById(templateName)?.innerHTML;
        if (!template) {
            throw new Error(`Template with ID '${templateName}' not found.`);
        }

        let html = '';
        result.forEach(item => {
            html += Mustache.render(template, item);
        });
        const obj = {html, isEmpty}
        return obj;
          
    }catch(err){
        console.error('Error fetching recipes:', err);
    }
}

async function fetchCookingHacks(templateName, data, getProductList){
    try{
        let isEmpty = false;
        const formdata = {
            "cookingHackCatId": data.cookingHackCatId,
            "occasionId": data.occasionId == null || data.occasionId == undefined || data.occasionId == "" ? [] : [Number(data.occasionId)],
            "recipeId": data.recipeId == null || data.recipeId == undefined || data.recipeId == "" ? [] : [Number(data.recipeId)],
            "productId": data.productId == null || data.productId == undefined || data.productId == "" ? [] : [Number(data.productId)],
            "filter": data.filter,
            "keyword": data.keyword,
            "limit": data.limit,
            "offset": data.offset,
            "lang": data.lang
        }
  

          const response = await fetch(data.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formdata),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        if(result.length === 0){
            isEmpty = true;
        }

        const template = document.getElementById(templateName)?.innerHTML;
        if (!template) {
            throw new Error(`Template with ID '${templateName}' not found.`);
        }

        let html = '';
        result.forEach(item => {
            html += Mustache.render(template, item);
        });
        const obj = {html, isEmpty}
        return obj;
          
    }catch(err){
        console.error('Error fetching recipes:', err);
    }
}

async function fetchProductDatas(showMoreClicked, elements) {
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
export {fetchInstore, fetchAndRenderData, fetchOnlineStore, fetchRecipes, fetchCookingHacks, fetchProductDatas}