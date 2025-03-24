/* eslint-disable consistent-return */
const multer = require('multer');
const fs = require('fs')

// create public folder
if(!fs.existsSync('./public')){
    fs.mkdirSync('./public')
}

// create profile folder
if(!fs.existsSync('./public/profile')){
    fs.mkdirSync('./public/profile')
}

// create icons folder
if(!fs.existsSync('./public/icon')){
    fs.mkdirSync('./public/icon')
}

// create images folder
if(!fs.existsSync('./public/images')){
    fs.mkdirSync('./public/images')
}

// create brand folder
if(!fs.existsSync('./public/brand')){
    fs.mkdirSync('./public/brand')
}


// create manufacturer folder
if(!fs.existsSync('./public/manufacturer')){
    fs.mkdirSync('./public/manufacturer')
}


// create business folder
if(!fs.existsSync('./public/business')){
    fs.mkdirSync('./public/business')
}


// create branch folder
if(!fs.existsSync('./public/branch')){
    fs.mkdirSync('./public/branch')
}


// create warehouse folder
if(!fs.existsSync('./public/warehouse')){
    fs.mkdirSync('./public/warehouse')
}

// create product blueprint folder
if(!fs.existsSync('./public/productBluePrint')){
    fs.mkdirSync('./public/productBluePrint')
}


// image filter
const imageFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp)$/)) {
        req.fileValidationError = 'Only images are allowed!';
        return cb(new Error('Only images are allowed!'), false);
    }
    cb(null, true);
};

// video filter
const imageAndVideoFilter = (req, file, cb) => {
    if (!file.originalname.match(
        /\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|mp4|MP4|m4a|M4A|m4b|M4B|f4v|F4V|mov|MOV)$/)) {
        req.fileValidationError = 'Only images and video are allowed!';
        return cb(new Error('Only images and video are allowed!'), false);
    }
    cb(null, true);
};



// upload profile image
const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/profile');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadProfile = multer({
    storage: profileStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});



// upload category and subcategory

const iconStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/icon');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadCategorySubCategoryIcon = multer({
    // storage: multer.memoryStorage(),
    storage: iconStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});


const imagesStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});


const uploadImages = multer({
    storage:  imagesStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 5
    },
    fileFilter: imageFilter
});




// brand upload
const brandStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/brand');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadBrandIcon = multer({
    // storage: multer.memoryStorage(),
    storage: brandStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});



// manufacturer upload
const manufacturerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/manufacturer');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadManufacturerIcon = multer({
    // storage: multer.memoryStorage(),
    storage: manufacturerStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});


// business unit logo upload
const buStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/business');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadBusinesUnitIcon = multer({
    // storage: multer.memoryStorage(),
    storage: buStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});


// branch logo upload
const branchStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/branch');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadBranchIcon = multer({
    // storage: multer.memoryStorage(),
    storage: branchStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});

// warehouse logo upload
const warehousehStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/warehouse');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});

const uploadWarehouseIcon = multer({
    // storage: multer.memoryStorage(),
    storage: warehousehStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: imageFilter
});

const productBlueprintStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/productBluePrint');
    },
    filename: async (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
    },
});


// upload product blueprint
const uploadProductBlueprint = multer({
    storage: productBlueprintStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, 
        files: 5
    },
    fileFilter: imageFilter
});




exports.uploadProfile = uploadProfile;

exports.uploadProfile = uploadProfile;
exports.uploadCategorySubCategoryIcon = uploadCategorySubCategoryIcon;
exports.uploadImages = uploadImages;
exports.uploadBrandIcon = uploadBrandIcon;
exports.uploadManufacturerIcon = uploadManufacturerIcon;
exports.uploadBusinesUnitIcon = uploadBusinesUnitIcon;
exports.uploadBranchIcon = uploadBranchIcon;
exports.uploadWarehouseIcon = uploadWarehouseIcon;
exports.uploadProductBlueprint = uploadProductBlueprint;