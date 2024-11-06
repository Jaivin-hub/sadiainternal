const fetchAssets = () =>{
// Create a new XMLHttpRequest object
//   const xhr = new XMLHttpRequest();
//   xhr.open('GET', 'https://sadialife-dev.azurewebsites.net/Umbraco/api/data/GetOnlineStores?countryId=1288', true);
//   xhr.onload = function () {
//     if (xhr.status >= 200 && xhr.status < 300) {
//       const data = JSON.parse(xhr.responseText);
//       console.log(data);
//     } else {
//       console.error('Error fetching logos:', xhr.status, xhr.statusText);
//     }
//   };
//   xhr.onerror = function () {
//     console.error('Request failed', xhr.status, xhr.statusText);
//   };
//   xhr.send();
    const data = [
      { src: './assets/images/about/logo1.png', class: 'bxImg', alt: 'Logo 1' },
      { src: './assets/images/about/logo2.png', class: 'bxImg', alt: 'Logo 2' },
      { src: './assets/images/about/logo3.png', class: 'bxImg', alt: 'Logo 3' },
      { src: './assets/images/about/logo4.png', class: 'bxImg', alt: 'Logo 4' },
      { src: './assets/images/about/logo5.png', class: 'bxImg', alt: 'Logo 5' },
      { src: './assets/images/about/logo6.png', class: 'bxImg', alt: 'Logo 6' },
      { src: './assets/images/about/logo7.png', class: 'bxImg', alt: 'Logo 7' },
      { src: './assets/images/about/logo8.png', class: 'bxImg', alt: 'Logo 8' },
      { src: './assets/images/about/logo9.png', class: 'bxImg', alt: 'Logo 9' },
      { src: './assets/images/about/logo10.png', class: 'bxImg', alt: 'Logo 10' },
      { src: './assets/images/about/logo11.png', class: 'bxImg', alt: 'Logo 11' },
      { src: './assets/images/about/logo12.png', class: 'bxImg', alt: 'Logo 12' },
    ];
    return data
  }

  export { fetchAssets };
