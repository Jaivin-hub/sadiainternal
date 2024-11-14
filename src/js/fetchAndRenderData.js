import Mustache from 'mustache';

export default async function fetchAndRenderData(templateName, apiUrl, offset, limit, more) {
    try {
        const response = await fetch(`${apiUrl}?limit=${limit}&offset=${offset}${more}`);
        const data = await response.json();
        console.log('data---->',data)
        // Get the template source
        const template = document.getElementById(templateName).innerHTML;

        // Generate the HTML for all items
        let html = '';
        data.list.forEach(item => {
            html += Mustache.render(template, item);
        });
        return html;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}