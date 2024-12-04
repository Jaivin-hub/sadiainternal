import Mustache from 'mustache';
import productList from '../assets/json/productlist.json';
import instoreList from '../assets/json/instore.json';
import onlineStoreList from '../assets/json/onlinestore.json';


async function fetchAndRenderData(templateName, apiUrl, selectedValue, productTypeId, offset, limit, lang, productCatId) {
    try {
        console.log('consoling in finall',productCatId)
        let isEmpty = false;
        const url = `${apiUrl}?productTypeId=${productTypeId}&limit=${limit}&offset=${offset}&filter=${selectedValue}&productCatId=${productCatId}&lang=${lang}`;
        console.log('url-====',url)
        const response = await fetch(url);
        console.log('response',response)
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const productsList = await response.json(); // Assume productList is an array of items
       console.log('productsList',productsList)
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
        let isEmpty = false;
        const formdata = {
            "recipeCatId": data.recipeCatId,
            "mealTypeId": data.mealType == null || undefined ?[]:[Number(data.mealType)],
            "difficultyLevelId": data.difficulty == null || undefined  ? [] : [Number(data.difficulty)],
            "preparationTime": data.prepTime == null || undefined  ? "" : data.prepTime,
            "cuisineId": data.cuisine == null || undefined  ? [] : [Number(data.cuisine)],
            "dietaryId": data.dietaryNeeds == null || undefined  ? [] : [Number(data.dietaryNeeds)],
            "occasionId": data.occasion == null || undefined  ? [] : [Number(data.occasion)],
            "preparationStyleId": data.preparationStyle == null || undefined ? [] : [Number(data.preparationStyle)],
            "filter": data.recipeSelectedValue,
            "keyword": data.keyword,
            "limit": data.limit,
            "offset": data.offset,
            "lang":data.lang
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

async function fetchCookingHacks(templateName, data){
    try{
        let isEmpty = false;
        const formdata = {
            "cookingHackCatId": data.cookingHackCatId,
            "occasionId": data.occasionId == null || undefined ? [] : [Number(data.occasionId)],
            "recipeId": data.recipeId == null || undefined ? [] : [Number(data.recipeId)],
            "productId": data.productId == null || undefined ? [] : [Number(data.productId)],
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

export {fetchInstore, fetchAndRenderData, fetchOnlineStore, fetchRecipes, fetchCookingHacks}