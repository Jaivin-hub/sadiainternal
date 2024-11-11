const fetchAssets = (url, callback) => {
  
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = JSON.parse(xhr.responseText);
        callback(data); // Pass data to the callback
      } catch (e) {
        console.error('Failed to parse JSON:', e);
        console.error('Response received (not JSON):', xhr.responseText);
      }
    } else {
      console.error('Error fetching data:', xhr.status, xhr.statusText);
    }
  };

  xhr.onerror = function () {
    console.error('Request failed', xhr.status, xhr.statusText);
  };
  
  xhr.send();
};

const fetchProducts = (url, callback) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        const data = xhr.responseText;
        callback(data); // Pass data to the callback
      } catch (e) {
        console.error('Failed to parse JSON for products:', e);
        console.error('Response received (not JSON):', xhr.responseText);
      }
    } else {
      console.error('Error fetching products:', xhr.status, xhr.statusText);
    }
  };

  xhr.onerror = function () {
    console.error('Request for products failed', xhr.status, xhr.statusText);
  };

  xhr.send();
};


  export { fetchAssets, fetchProducts };
