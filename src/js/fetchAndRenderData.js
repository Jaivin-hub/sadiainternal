import Mustache from 'mustache';
import productList from '../assets/json/productlist.json';

export default async function fetchAndRenderData(templateName, apiUrl, offset, limit, more) {
    console.log('fetchAndRenderData000',fetchAndRenderData)
    try {
        // const response = await fetch(`${apiUrl}?limit=${limit}&offset=${offset}${more}`);
        // const data = await response.json();
        // console.log('data---->',data)
        // Get the template source
        const template = document.getElementById('productlist-template').innerHTML;
        console.log('productList-----',template)

        // Generate the HTML for all items
        let html = '';
        productList.forEach(item => {
            html += Mustache.render(template, item);
            console.log('html',html)
        });
        return html;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}