import Mustache from 'mustache';
import productList from '../assets/json/productlist.json';
import instoreList from '../assets/json/instore.json';
import onlineStoreList from '../assets/json/onlinestore.json';


async function fetchAndRenderData(templateName, apiUrl, selectedValue, productCatId, offset, limit) {
    try {
        let isEmpty = false;
        const url = `${apiUrl}?productCatId=${productCatId}&limit=${limit}&offset=${offset}&filter=${selectedValue}`;
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
        let isEmpty = false;
        console.log('data=====',data)
        const formdata = {
            "recipeCatId": data.recipeCatId,
            "mealTypeId": data.mealType == null?[]:[Number(data.mealType)],
            "difficultyLevelId": data.difficulty == null ? [] : [Number(data.difficulty)],
            "preparationTime": data.prepTime,
            "cuisineId": data.cuisine == null ? [] : [Number(data.cuisine)],
            "dietaryId": data.dietaryNeeds == null ? [] : [Number(data.dietaryNeeds)],
            "occasionId": data.occasion == null ? [] : [Number(data.occasion)],
            "preparationStyleId": data.preparationStyle == null? [] : [Number(data.preparationStyle)],
            "filter": data.recipeSelectedValue,
            "keyword": data.keyword,
            "limit": data.limit,
            "offset": data.offset
          }
          console.log('formdata----====',formdata)
        //   console.log('obj--consoled--',obj)
        // const formdata = {
        //     "recipeCatId": 0,
        //     "mealTypeId": [],
        //     "difficultyLevelId": [1526],
        //     "preparationTime": null,
        //     "cuisineId": [1514],
        //     "dietaryId": [],
        //     "occasionId": [],
        //     "preparationStyleId": [],
        //     "filter": null,
        //     "keyword": null,
        //     "limit": 9,
        //     "offset": 0
        //   }

          

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


export {fetchInstore, fetchAndRenderData, fetchOnlineStore, fetchRecipes}