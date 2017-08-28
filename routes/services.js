var express = require('express');
var router = express.Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

router.use(fileUpload());

/* GET image listing. */
router.get('/images', function(req, res, next) {
    res.setHeader('Content-Type', 'application/json');

    fs.readFile(path.join(__dirname, '..', 'data', 'images.data.js'), 'utf8', (err, content) => {
        if (err) {
            return res.status(500).send({msg: err});;
        }
        
        res.status(200).send(content);
    });
});

/* Add new image. */
router.post('/images', function(req, res, next) {
    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }

    console.log(req.files.inputFile); // the uploaded file object
    // The name of the input field (i.e. "inputFile") is used to retrieve the uploaded file
    let inputFile = req.files.inputFile;

    // Use the mv() method to place the file somewhere on your server
    let fileDest = path.join(__dirname, '..', 'src', 'images_orig', req.files.inputFile.name);
    inputFile.mv(fileDest, function(err) {
        if (err) {
            return res.status(500).send({msg: err});
        }

        // to prevent override, change file permission to read-only.
        // so that when a same filename came in, .mv will report error.
        fs.chmod(fileDest, '444');

        // Write to data file
        // let imagesData = require("../src/data/images.data.js");
        let dataFilePath = path.join(__dirname, '..', 'data', 'images.data.js');
        fs.readFile(dataFilePath, 'utf8', (err, content) => {
            if (err) {
                throw err;
            }
            console.log(content);
            let imagesData = JSON.parse(content);
            imagesData.push({
                imagePath: '/images_orig/' + req.files.inputFile.name,
                imageDate: req.body.imageDate,
                imageCategory: req.body.imageCategory
            });
            let contentNew = JSON.stringify(imagesData, null, 4);
            fs.writeFile(dataFilePath, contentNew, 'utf8', function (err) {
                if (err) {
                    return res.status(500).send({msg: err});
                }
                return res.send({msg: 'File uploaded!'});
            }); 
        });
        
        
    });
});

router.put('/images', function(req, res, next) {

});

module.exports = router;