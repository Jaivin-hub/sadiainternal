import Mustache from 'mustache';
import productList from '../assets/json/productlist.json';
import instoreList from '../assets/json/instore.json';
import onlineStoreList from '../assets/json/onlinestore.json';


async function fetchAndRenderData(templateName, apiUrl, selectedValue, productCatId, offset, limit) {
    try {
        console.log('from the api limit',limit)
        const url = `${apiUrl}?productCatId=${productCatId}&limit=${limit}&offset=${offset}&filter=${selectedValue}`;
        // console.log('url',url)
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const productsList = await response.json(); // Assume productList is an array of items
        // console.log('productsList',productsList)
        const template = document.getElementById(templateName)?.innerHTML;
        if (!template) {
            throw new Error(`Template with ID '${templateName}' not found.`);
        }
        console.log('productsList',productsList)
        // // Generate HTML for each item in productList
        let html = '';
        productsList.forEach(item => {
            html += Mustache.render(template, item); // Using Mustache template rendering
        });

        return html;
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

        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('data response',data)
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
        return html;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

export {fetchInstore, fetchAndRenderData, fetchOnlineStore}