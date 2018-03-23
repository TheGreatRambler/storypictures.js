# storypictures.js
A javascript library to make pictures with stories (or any string)

## API

```javascript
var ctx = storypictures(data);
```
Data is a object with the following properties:

### img

```javascript
var img = new Image();
img.onload = function() {
  data.img = img;
}
img.src = "test.png";
```
The image parameter can either be a image object or a canvas context.
