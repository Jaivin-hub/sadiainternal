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

const fetchStores = (url, selectedValue, callback) => {
  const apiUrl = `${url}?countryId=${selectedValue}`
  console.log('apiUrl',apiUrl);
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      try {
        console.log('xhr.responseText',xhr.responseText)
        const data = JSON.parse(xhr.responseText);
        console.log('response data',data)
        console.log(typeof data)



        // for testing

        // const data = [
        //   {
        //     "inStoreId": 1454,
        //     "storeName": "Part Al karma - Qutar",
        //     "storeLogoUrl": "/media/ynkpcyna/logo4.png",
        //     "directionsUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3576.728435524667!2d50.20422314762696!3d26.302902226966665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e85b5820ec93%3A0x60772a7e9355144b!2s5316%20Prince%20Faisal%20Bin%20Fahd%20Road%2C%206079%2C%20Al%20Hizam%20Al%20Akhdar%2C%20Al%20Khobar%2034433%2C%20Saudi%20Arabia!5e0!3m2!1sen!2sin!4v1724152365876!5m2!1sen!2sin",
        //     "cityNmae": "Dubai",
        //     "coordinates": "25.2048, 55.2708"
        //   },
        //   {
        //     "inStoreId": 1456,
        //     "storeName": "Part Al karma - Oman",
        //     "storeLogoUrl": "/media/ojtl2343/logo8.png",
        //     "directionsUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3576.728435524667!2d50.20422314762696!3d26.302902226966665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e49e85b5820ec93%3A0x60772a7e9355144b!2s5316%20Prince%20Faisal%20Bin%20Fahd%20Road%2C%206079%2C%20Al%20Hizam%20Al%20Akhdar%2C%20Al%20Khobar%2034433%2C%20Saudi%20Arabia!5e0!3m2!1sen!2sin!4v1724152365876!5m2!1sen!2sin",
        //     "cityNmae": "Sharjah",
        //     "coordinates": "27.3463, 55.4209"
        //   }
        // ]


        callback(data)

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
  // const xhr = new XMLHttpRequest();
  // xhr.open('GET', url, true);

  // xhr.onload = function () {
  //   if (xhr.status >= 200 && xhr.status < 300) {
  //     try {
  //       const data = xhr.responseText;
  //       callback(data); // Pass data to the callback
  //     } catch (e) {
  //       console.error('Failed to parse JSON for products:', e);
  //       console.error('Response received (not JSON):', xhr.responseText);
  //     }
  //   } else {
  //     console.error('Error fetching products:', xhr.status, xhr.statusText);
  //   }
  // };

  // xhr.onerror = function () {
  //   console.error('Request for products failed', xhr.status, xhr.statusText);
  // };

  // xhr.send();
};


  export { fetchAssets, fetchProducts, fetchStores };
