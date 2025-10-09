/* eslint-disable consistent-return */
const multer = require('multer');
const fs = require('fs');
const path = require("path");

// create public folder
if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public')
}

// create profile folder
if (!fs.existsSync('./public/profile')) {
    fs.mkdirSync('./public/profile')
}

// create icons folder
if (!fs.existsSync('./public/icon')) {
    fs.mkdirSync('./public/icon')
}

// create images folder
if (!fs.existsSync('./public/images')) {
    fs.mkdirSync('./public/images')
}

// create brand folder
if (!fs.existsSync('./public/brand')) {
    fs.mkdirSync('./public/brand')
}


// create manufacturer folder
if (!fs.existsSync('./public/manufacturer')) {
    fs.mkdirSync('./public/manufacturer')
}


// create business folder
if (!fs.existsSync('./public/business')) {
    fs.mkdirSync('./public/business')
}


// create branch folder
if (!fs.existsSync('./public/branch')) {
    fs.mkdirSync('./public/branch')
}


// create warehouse folder
if (!fs.existsSync('./public/warehouse')) {
    fs.mkdirSync('./public/warehouse')
}

// create product blueprint folder
if (!fs.existsSync('./public/productBluePrint')) {
    fs.mkdirSync('./public/productBluePrint')
}

if (!fs.existsSync('./public/customizations')) {
    fs.mkdirSync('./public/customizations')
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


const uploadProfileToS3 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
        }
    }
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

const uploadIconToS3 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024, // 1MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
        }
    }
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
    storage: imagesStorage,
    limits: {
        fileSize: 1024 * 1024,
        files: 5
    },
    fileFilter: imageFilter
});


const uploadImagesToS3 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Max 5 files
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
        }
    }
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

const uploadProductBlueprintToS3 = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 5 // Max 5 files
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only images (jpeg, jpg, png, gif, webp) are allowed'));
        }
    }
});

const uploadCustomizationFileToS3 = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // Increased to 50MB to accommodate larger files
    fileFilter: (req, file, cb) => {
        // Comprehensive list of allowed file extensions
        const filetypes = /jpg|jpeg|png|gif|webp|bmp|tiff|tif|svg|ico|heic|heif|avif|jfif|pjpeg|pjp|apng|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv|md|json|xml|zip|rar|7z|tar|gz|mp4|mov|avi|mkv|wmv|flv|mpeg|mp3|wav|ogg|flac|aac|wma/;
        // Corresponding MIME types for validation
        const mimeTypes = {
            // Images
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'tif': 'image/tiff',
            'svg': 'image/svg+xml',
            'ico': 'image/x-icon',
            'heic': 'image/heic',
            'heif': 'image/heif',
            'avif': 'image/avif',
            'jfif': 'image/jpeg',
            'pjpeg': 'image/jpeg',
            'pjp': 'image/jpeg',
            'apng': 'image/apng',
            // Documents
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'rtf': 'application/rtf',
            'csv': 'text/csv',
            'md': 'text/markdown',
            'json': 'application/json',
            'xml': 'application/xml',
            // Archives
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed',
            'tar': 'application/x-tar',
            'gz': 'application/gzip',
            // Videos
            'mp4': 'video/mp4',
            'mov': 'video/quicktime',
            'avi': 'video/x-msvideo',
            'mkv': 'video/x-matroska',
            'wmv': 'video/x-ms-wmv',
            'flv': 'video/x-flv',
            'mpeg': 'video/mpeg',
            // Audio
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'flac': 'audio/flac',
            'aac': 'audio/aac',
            'wma': 'audio/x-ms-wma'
        };

        const extname = filetypes.test(path.extname(file.originalname).toLowerCase().replace('.', ''));
        const expectedMimeType = mimeTypes[path.extname(file.originalname).toLowerCase().replace('.', '')];
        const mimeTypeValid = expectedMimeType === file.mimetype.toLowerCase();

        if (extname && mimeTypeValid) {
            return cb(null, true);
        } else {
            cb(new Error('Unsupported file type. Allowed types: jpg, jpeg, png, gif, webp, bmp, tiff, tif, svg, ico, heic, heif, avif, jfif, pjpeg, pjp, apng, pdf, doc, docx, xls, xlsx, ppt, pptx, txt, rtf, csv, md, json, xml, zip, rar, 7z, tar, gz, mp4, mov, avi, mkv, wmv, flv, mpeg, mp3, wav, ogg, flac, aac, wma'));
        }
    },
});

// add to cart
// const customoseableDetailstorage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, "./public/customizations"), // Adjust path
//     filename: (req, file, cb) =>
//         cb(null, `${Date.now()}-${file.originalname}`),
// });

// const customoseableDetailstorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, './public/customizations');
//     },
//     filename: async (req, file, cb) => {
//         console.log("file", file);
//         console.log("req",req)

//         cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(' ', '')}`);
//     },
// });

// const uploadCustomiseable = multer({
//     customoseableDetailstorage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     fileFilter: imageFilter,
// });

const imageFilters = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|pdf|webp/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb(new Error("Only images and PDFs are allowed"));
};

// Multer storage configuration
const customizableDetailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/customizations"); // Ensure this folder exists
    },
    filename: (req, file, cb) => {
        console.log("Uploading file:", file); // Debug log
        cb(null, `${Date.now()}_${file.originalname.toLowerCase().replaceAll(" ", "")}`);
    },
});

// Correct multer configuration
const uploadCustomizable = multer({
    storage: customizableDetailStorage, // Use 'storage' key
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: imageFilters,
});


const uploadCustomFormWithS3 = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf', 'text/csv'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only JPEG, PNG, PDF, CSV allowed.'));
        }
        cb(null, true);
    },
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
exports.uploadCustomizable = uploadCustomizable;
exports.uploadIconToS3 = uploadIconToS3;
exports.uploadProductBlueprintToS3 = uploadProductBlueprintToS3;
exports.uploadImagesToS3 = uploadImagesToS3;
exports.uploadProfileToS3 = uploadProfileToS3;
exports.uploadCustomFormWithS3 = uploadCustomFormWithS3;
exports.uploadCustomizationFileToS3 = uploadCustomizationFileToS3;