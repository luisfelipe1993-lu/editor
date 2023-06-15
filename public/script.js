const inputFile = document.querySelector("input[type=file]");
const ButtonsFilter = document.querySelectorAll(".filters-content button");
const range = document.querySelector("input[type=range]");
const img = document.querySelector("#display_image_div");
const spnRangeValue = document.getElementById("spnRangeValue");
const btnResetFilters = document.getElementById("btnResetFilters");

let rotate = 0;
let flipY = 1;
let flipX = 1;

let filterActive;

let filters = {
  Brilho: { value: 100, max: 200 },
  Contraste: { value: 100, max: 200 },
  Saturação: { value: 100, max: 200 },
  Cinza: { value: 0, max: 100 },
  Inversão: { value: 0, max: 100 },
};

$("body").on("change", "#browse_image", function (e) {
  var files = e.target.files;
  var done = function (url) {
    $("#display_image_div").html(
      '<img name="display_image_data" id="display_image_data" src="' +
        url +
        '" alt="Uploaded Picture">'
    );
  };

  if (files && files.length > 0) {
    var file = files[0];
    if (URL) {
      done(URL.createObjectURL(file));
    } else if (FileReader) {
      var reader = new FileReader();
      reader.onload = function (e) {
        done(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  ButtonsFilter.forEach((item) => {
    item.onclick = () => {
      document.querySelector(".active").classList.remove("active");

      item.classList.add("active");

      filterActive = item.innerHTML;

      range.max = filters[filterActive].max;
      range.value = filters[filterActive].value;

      spnRangeValue.innerHTML = range.value;
    };
  });

  range.oninput = () => {
    filters[filterActive].value = range.value;
    spnRangeValue.innerHTML = range.value;

    img.style.filter = `
      brightness(${filters["Brilho"].value}%)
      contrast(${filters["Contraste"].value}%)
      saturate(${filters["Saturação"].value}%)
      grayscale(${filters["Cinza"].value}%)
      invert(${filters["Inversão"].value}%)
    `;
  };

  initCropper();
});

btnResetFilters.onclick = () => resetFilters();

init();

function init() {
  rotate = 0;
  flipY = 1;
  flipX = 1;

  filterActive = "Brilho";

  spnRangeValue.innerHTML = 100;
  range.max = 200;
  range.value = 100;

  img.style.transform = "";
  img.style.filter = "";

  document.querySelector(".active").classList.remove("active");
  document.getElementById("filterDefault").classList.add("active");

  initCropper();
}

function initCropper() {
  let cropper;

  if (cropper) {
    cropper.destroy();
  }

  var image = document.getElementById("display_image_data");
  var button = document.getElementById("crop_button");
  var result = document.getElementById("cropped_image_result");
  var croppable = false;
  cropper = new Cropper(image, {
    aspectRatio: 1,
    viewMode: 1,
    ready: function () {
      croppable = true;
    },
  });

  button.onclick = function () {
    if (!croppable) {
      return;
    }

    // Crop
    var croppedCanvas = cropper.getCroppedCanvas();

    // Rotate
    var rotatedCanvas = null;
    if (rotate !== 0) {
      rotatedCanvas = getRotatedCanvas(croppedCanvas, rotate);
    }

    // Round
    var imageToRound = new Image();
    imageToRound.onload = function () {
      var roundedCanvas = getRoundedCanvas(imageToRound);
      // Show
      roundedImage = document.createElement("img");
      roundedImage.src = roundedCanvas.toDataURL();
      result.innerHTML = "";
      result.appendChild(roundedImage);
    };
    imageToRound.src = (rotatedCanvas || croppedCanvas).toDataURL();
  };
}

function resetFilters() {
  filters = {
    Brilho: { value: 100, max: 200 },
    Contraste: { value: 100, max: 200 },
    Saturação: { value: 100, max: 200 },
    Cinza: { value: 0, max: 100 },
    Inversão: { value: 0, max: 100 },
  };

  rotate = 0;
  flipY = 1;
  flipX = 1;

  range.max = filters[filterActive].max;
  range.value = filters[filterActive].value;
  spnRangeValue.innerHTML = range.value;

  if (rotate % 180 === 0) {
    flipY = 1;
  } else {
    flipY = -1;
  }

  img.style.transform = `rotate(${rotate}deg) scale(${flipY}, ${flipX})`;
  img.style.filter = `
    brightness(${filters["Brilho"].value}%)
    contrast(${filters["Contraste"].value}%)
    saturate(${filters["Saturação"].value}%)
    grayscale(${filters["Cinza"].value}%)
    invert(${filters["Inversão"].value}%)
  `;
}

function handleDirection(direction) {
  switch (direction) {
    case "rotateRight":
      rotate += 90;
      break;
    case "rotateLeft":
      rotate -= 90;
      break;
    case "reflectY":
      flipX *= -1;
      break;
    case "reflectX":
      flipY *= -1;
      break;
  }

  img.style.transform = `
    rotate(${rotate}deg)
    scale(${flipX}, ${flipY})
  `;
}

function getRotatedCanvas(image, rotate) {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  var width = image.width;
  var height = image.height;

  canvas.width = height; // Inverte a largura e altura para acomodar a rotação
  canvas.height = width;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotate * Math.PI) / 180);
  ctx.scale(flipX, flipY);
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
  ctx.restore();

  return canvas;
}

button.onclick = function () {
  if (!croppable) {
    return;
  }

  // Crop
  var croppedCanvas = cropper.getCroppedCanvas();

  // Rotate
  var rotatedCanvas = null;
  if (rotate !== 0) {
    rotatedCanvas = getRotatedCanvas(croppedCanvas, rotate);
  } else {
    rotatedCanvas = croppedCanvas;
  }

  // Round
  var imageToRound = new Image();
  imageToRound.onload = function () {
    var roundedCanvas = getRoundedCanvas(imageToRound);
    // Show
    roundedImage = document.createElement("img");
    roundedImage.src = roundedCanvas.toDataURL();
    result.innerHTML = "";
    result.appendChild(roundedImage);
  };
  imageToRound.src = rotatedCanvas.toDataURL();
};

function getRoundedCanvas(image, rotate = 0) {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  var width = image.naturalWidth;
  var height = image.naturalHeight;

  canvas.width = width;
  canvas.height = height;

  context.save();
  context.translate(width / 2, height / 2);
  context.rotate((rotate * Math.PI) / 180);
  context.scale(flipX, flipY);
  context.filter = `
    brightness(${filters["Brilho"].value}%)
    contrast(${filters["Contraste"].value}%)
    saturate(${filters["Saturação"].value}%)
    grayscale(${filters["Cinza"].value}%)
    invert(${filters["Inversão"].value}%)
  `;
  context.imageSmoothingEnabled = true;
  context.drawImage(image, -width / 2, -height / 2, width, height);
  context.restore();

  context.globalCompositeOperation = "destination-in";
  context.beginPath();
  context.arc(
    width / 2,
    height / 2,
    Math.min(width, height) / 2,
    0,
    2 * Math.PI,
    true
  );
  context.fill();

  return canvas;
}


function download() {
  var linkSource = $("#cropped_image_result img").attr("src");
  var fileName = "download.png";
  const downloadLink = document.createElement("a");
  downloadLink.href = linkSource;
  downloadLink.download = fileName;
  downloadLink.click();
}