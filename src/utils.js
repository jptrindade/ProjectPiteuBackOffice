export function processImageFile(file, self, setUrl = false){
    var blob = new Blob([file]);
    window.URL = window.URL || window.webkitURL;
    var blobURL = window.URL.createObjectURL(blob);
    
    var image = new Image();
    image.src = blobURL;
    
    if (setUrl)
        self.setLocalUrl(blobURL)

    image.onload = async function () {
        var canvas = document.createElement('canvas');    
        var width = image.width;
        var height = image.height;
        var ctx = canvas.getContext("2d");
        ctx.canvas.width  = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height, 0, 0, canvas.width, canvas.height);

        const file = await new Promise((resolve, reject) => ctx.canvas.toBlob((blob) => {
            resolve(new File([blob], "test.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
            }))
        }, 'image/jpeg', 0.6 //value to change image quality
        ));
        self.setLocalFile(file)
    }
}

export function downloadImageFile(url, self){
    
    //let proxy = "https://yacdn.org/proxy/"
    let proxy = "https://api.allorigins.win/raw?url="
    var image = new Image();
    image.src = proxy + url;
    image.crossOrigin = "*";

    self.setLocalUrl(url)

    image.onload = async function () {
        var canvas = document.createElement('canvas');    
        var width = image.width;
        var height = image.height;
        var ctx = canvas.getContext("2d");
        ctx.canvas.width  = width;
        ctx.canvas.height = height;
        ctx.drawImage(image, 0, 0, width, height, 0, 0, canvas.width, canvas.height);
        
        const file = await new Promise((resolve, reject) => ctx.canvas.toBlob((blob) => {
            resolve(new File([blob], "test.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now()
            }))
        }, 'image/jpeg', 0.6 //value to change image quality
        ));
        self.setLocalFile(file)
        
    }
}